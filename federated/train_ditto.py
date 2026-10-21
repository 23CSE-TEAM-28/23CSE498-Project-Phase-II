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
from baseline.models.lstm import CentralizedLSTM

class InMemorySepsisDataset(Dataset):
    """
    Lightweight PyTorch Dataset wrapper for in-memory patient window tensors
    partitioned across federated clients.
    """
    def __init__(self, data_dict: dict):
        self.features = data_dict['features'].float()
        self.labels = data_dict['labels'].float()
        self.patient_ids = data_dict['patient_ids']
        self.hospital_ids = data_dict['hospital_ids']
        
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
    logger = setup_logging(log_dir, log_filename="train_ditto.log")
    
    logger.info("=== Initialize Federated Learning (Ditto) Personalization Training ===")
    
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
    
    # 6. Initialize Global Server and Global Model
    global_model = CentralizedLSTM(
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
        client_train = InMemorySepsisDataset(train_splits[i])
        client_val = InMemorySepsisDataset(val_splits[i])
        client_test = InMemorySepsisDataset(test_splits[i])
        
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
    val_dataset_full = InMemorySepsisDataset(global_val)
    val_loader = DataLoader(val_dataset_full, batch_size=config['local_training']['batch_size'], shuffle=False)
    
    # Calculate global validation loss positive weight balance
    num_neg = (val_dataset_full.labels == 0).sum().item()
    num_pos = (val_dataset_full.labels == 1).sum().item()
    global_pos_weight = torch.tensor([num_neg / num_pos], device=device)
    criterion = nn.BCEWithLogitsLoss(pos_weight=global_pos_weight)
    
    # 9. Execute Federated Training Loop (Rounds) with Ditto regularization
    rounds = config['federated']['rounds']
    client_fraction = config['federated']['client_fraction']
    mu = config['federated']['mu']
    lam = config['federated']['lambda']
    
    logger.info(f"Ditto Personalization running with global consensus mu={mu} and local personalization lambda={lam}")
    
    history = server.fit(
        rounds=rounds,
        client_fraction=client_fraction,
        val_loader=val_loader,
        criterion=criterion,
        mu=mu,
        run_ditto=True,
        lam=lam
    )
    
    # 10. Save client personalized weights checkpoints
    logger.info("Saving client personalized weights checkpoints locally...")
    for client in clients_list:
        pers_weights_path = os.path.join(checkpoint_dir, f"client_{client.client_id}_personalized_model.pt")
        torch.save({
            'client_id': client.client_id,
            'personalized_weights': client.personalized_weights
        }, pers_weights_path)
        logger.info(f"  [Saved] Client {client.client_id} personalized weights -> {pers_weights_path}")
        
    # Generate validation curves for Ditto global consensus
    results_dir = os.path.join(os.path.dirname(base_dir), config['paths']['results_dir'])
    os.makedirs(results_dir, exist_ok=True)
    
    # Save the history to a json file for comparison later
    history_save_path = os.path.join(results_dir, "ditto_history.json")
    with open(history_save_path, 'w') as f:
        json.dump(history, f, indent=4)
        
    logger.info(f"Saved history data to {history_save_path}")
    logger.info("=== Ditto Training Completed Successfully ===")

if __name__ == "__main__":
    main()
