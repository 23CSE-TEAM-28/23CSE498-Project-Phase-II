import os
import sys
import json
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

# Add parent directory to sys.path to enable correct imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from federated.utils.helpers import set_seed, load_config, setup_logging, get_device, split_non_iid_dataset
from federated.clients.client import FederatedClient
from federated.server.server import FederatedServer
from federated.models.attention_lstm import PersonalizedAttentionLSTM

class InMemorySepsisDataset(Dataset):
    """
    Lightweight PyTorch Dataset wrapper for in-memory patient window tensors
    partitioned across federated clients.
    """
    def __init__(self, data_dict: dict, max_samples: int = None):
        features = data_dict['features'].float()
        labels = data_dict['labels'].float()
        patient_ids = data_dict['patient_ids']
        hospital_ids = data_dict['hospital_ids']
        
        if max_samples is not None and features.shape[0] > max_samples:
            features = features[:max_samples]
            labels = labels[:max_samples]
            patient_ids = patient_ids[:max_samples]
            hospital_ids = hospital_ids[:max_samples]
            
        self.features = features
        self.labels = labels
        self.patient_ids = patient_ids
        self.hospital_ids = hospital_ids
        
    def __len__(self) -> int:
        return self.features.shape[0]
        
    def __getitem__(self, idx: int):
        return self.features[idx], self.labels[idx]

def main():
    # 1. Setup paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(base_dir, "configs", "config.yaml")
    
    # Load configuration settings
    config = load_config(config_path)
    
    # 2. Setup Logging and Seeds
    log_dir = os.path.join(os.path.dirname(base_dir), config['paths']['log_dir'])
    logger = setup_logging(log_dir, log_filename="train_fpdaf.log")
    
    logger.info("=== Initialize Federated Personalized Drift-Aware Attention Framework (FPDAF) Training ===")
    
    set_seed(config['seed'])
    logger.info(f"Random seed set to: {config['seed']}.")
    
    # 3. Setup Hardware Device
    device = get_device(config['device'])
    logger.info(f"Compute device allocated: {device}")
    
    # 4. Load Global Processed Datasets
    data_dir = os.path.join(os.path.dirname(base_dir), config['paths']['data_dir'])
    train_path = os.path.join(data_dir, "train.pt")
    val_path = os.path.join(data_dir, "validation.pt")
    test_path = os.path.join(data_dir, "test.pt")
    
    logger.info("Loading global preprocessed splits...")
    global_train = torch.load(train_path)
    global_val = torch.load(val_path)
    global_test = torch.load(test_path)
    
    # 5. Generate Non-IID Client Splits
    scaler_path = os.path.join(data_dir, "scaler.pkl")
    metadata_path = os.path.join(data_dir, "preprocessing_metadata.json")
    with open(metadata_path, 'r') as f:
        meta_json = json.load(f)
    feature_columns = meta_json['feature_columns']
    
    logger.info("Partitioning global dataset into Non-IID client splits...")
    train_splits = split_non_iid_dataset(global_train, scaler_path, feature_columns)
    val_splits = split_non_iid_dataset(global_val, scaler_path, feature_columns)
    test_splits = split_non_iid_dataset(global_test, scaler_path, feature_columns)
    
    # 6. Initialize Global Server and Personalized Attention LSTM
    global_model = PersonalizedAttentionLSTM(
        input_dim=config['model']['input_dim'],
        hidden_dim=config['model']['hidden_dim'],
        num_layers=config['model']['num_layers'],
        dropout=config['model']['dropout'],
        output_dim=config['model']['output_dim']
    ).to(device)
    
    checkpoint_dir = os.path.join(os.path.dirname(base_dir), config['paths']['checkpoint_dir'])
    server = FederatedServer(
        global_model=global_model,
        device=device,
        patience=config['local_training']['patience'],
        checkpoint_dir=checkpoint_dir
    )
    
    # 7. Create and Register Clients
    clients_list = []
    for i in range(config['federated']['num_clients']):
        client_train = InMemorySepsisDataset(train_splits[i], max_samples=500)
        client_val = InMemorySepsisDataset(val_splits[i], max_samples=200)
        client_test = InMemorySepsisDataset(test_splits[i], max_samples=200)
        
        client = FederatedClient(
            client_id=i,
            train_dataset=client_train,
            val_dataset=client_val,
            test_dataset=client_test,
            device=device,
            batch_size=config['local_training']['batch_size'],
            lr=config['local_training']['learning_rate'],
            weight_decay=config['local_training']['weight_decay'],
            local_epochs=config['local_training']['epochs']
        )
        server.register_client(client)
        clients_list.append(client)
        
    # 8. Setup Global Combined Validation DataLoader & Loss function
    val_dataset_full = InMemorySepsisDataset(global_val, max_samples=200)
    val_loader = DataLoader(val_dataset_full, batch_size=config['local_training']['batch_size'], shuffle=False)
    
    # Calculate global validation loss positive weight balance
    num_neg = (val_dataset_full.labels == 0).sum().item()
    num_pos = (val_dataset_full.labels == 1).sum().item()
    global_pos_weight = torch.tensor([num_neg / num_pos], device=device)
    criterion = nn.BCEWithLogitsLoss(pos_weight=global_pos_weight)
    
    # CUSUM drift detection settings
    mu_0 = config['fpdaf']['mu_0']
    kappa = config['fpdaf']['kappa']
    h_threshold = config['fpdaf']['h_threshold']
    local_pers_epochs = config['fpdaf']['local_pers_epochs']
    
    # 9. Execute Federated training rounds
    rounds = config['federated']['rounds']
    client_fraction = config['federated']['client_fraction']
    mu = config['federated']['mu']
    lam = config['federated']['lambda']
    
    logger.info(f"FPDAF running: global consensus mu={mu}, Ditto regularization lambda={lam}")
    logger.info(f"FPDAF CUSUM drift limits: mu_0={mu_0}, slack kappa={kappa}, threshold h={h_threshold}")
    
    # Custom fit loop to monitor CUSUM validation updates round-by-round
    history = {
        'global_val_loss': [],
        'global_val_acc': [],
        'global_val_auroc': [],
        'client_val_losses': [],
        'client_val_accs': [],
        'client_pers_losses': [],
        'client_pers_accs': [],
        'client_cusum_scores': [[] for _ in range(len(clients_list))],
        'client_drift_triggers': [[] for _ in range(len(clients_list))]
    }
    
    best_val_auroc = 0.0
    patience_counter = 0
    patience = config['local_training']['patience']
    
    for r in range(rounds):
        # Fit communication round
        client_losses, client_accs, client_p_losses, client_p_accs = server.run_round(
            round_idx=r,
            client_fraction=client_fraction,
            criterion=criterion,
            mu=mu,
            run_ditto=True,
            lam=lam
        )
        
        # Evaluate global consensus model
        val_loss, val_acc, val_auroc = server.evaluate_global(val_loader, criterion)
        logger.info(
            f"Round {r+1:02d}/{rounds:02d} Complete | "
            f"Global Val Loss: {val_loss:.4f} - Global Val Acc: {val_acc*100:.2f}% - Global Val AUROC: {val_auroc:.4f}"
        )
        
        # Monitor CUSUM residuals for each client based on their personalized validation loss
        for client_id, p_loss in client_p_losses.items():
            client = clients_list[client_id]
            drift_occurred = client.update_cusum(p_loss, base_loss_threshold=mu_0, kappa=kappa, h_threshold=h_threshold)
            
            history['client_cusum_scores'][client_id].append(client.cusum_score)
            if drift_occurred:
                history['client_drift_triggers'][client_id].append(r)
                client.custom_pers_epochs = local_pers_epochs
            else:
                client.custom_pers_epochs = None
                
        # Record stats
        history['global_val_loss'].append(val_loss)
        history['global_val_acc'].append(val_acc)
        history['global_val_auroc'].append(val_auroc)
        history['client_val_losses'].append(client_losses)
        history['client_val_accs'].append(client_accs)
        history['client_pers_losses'].append(client_p_losses)
        history['client_pers_accs'].append(client_p_accs)
        
        # Save checkpoints
        round_ckpt = os.path.join(checkpoint_dir, f"fpdaf_global_round_{r+1}.pt")
        torch.save({
            'round': r,
            'model_state_dict': server.global_model.state_dict(),
            'global_val_auroc': val_auroc,
            'history': history
        }, round_ckpt)
        
        if val_auroc > best_val_auroc:
            best_val_auroc = val_auroc
            patience_counter = 0
            best_path = os.path.join(checkpoint_dir, "best_fpdaf_global_model.pt")
            logger.info(f"  [New Best FPDAF consensus model] Val AUROC: {val_auroc:.4f}. Saving state...")
            torch.save({
                'round': r,
                'model_state_dict': server.global_model.state_dict(),
                'global_val_auroc': val_auroc
            }, best_path)
        else:
            patience_counter += 1
            logger.info(f"  [No Improvement] Patience at {patience_counter}/{patience}")
            
        if patience_counter >= patience:
            logger.info(f"FPDAF early stopping triggered at round {r+1}.")
            break
            
    # 10. Save final client personalized checkpoints
    for client in clients_list:
        pers_path = os.path.join(checkpoint_dir, f"client_{client.client_id}_fpdaf_personalized_model.pt")
        torch.save({
            'client_id': client.client_id,
            'personalized_weights': client.personalized_weights,
            'cusum_history': client.cusum_history
        }, pers_path)
        logger.info(f"  [Saved] Client {client.client_id} personalized weights -> {pers_path}")
        
    results_dir = os.path.join(os.path.dirname(base_dir), config['paths']['results_dir'])
    os.makedirs(results_dir, exist_ok=True)
    
    # Save training history JSON
    history_path = os.path.join(results_dir, "fpdaf_history.json")
    with open(history_path, 'w') as f:
        json.dump(history, f, indent=4)
        
    logger.info(f"Saved training history to {history_path}")
    logger.info("=== FPDAF Training Completed Successfully ===")

if __name__ == "__main__":
    main()
