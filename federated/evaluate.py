import os
import sys
import json
import torch
import numpy as np
from torch.utils.data import Dataset, DataLoader

# Add parent directory to sys.path to enable correct imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from federated.utils.helpers import set_seed, load_config, setup_logging, get_device
from federated.evaluation.evaluator import FederatedEvaluator
from baseline.models.lstm import CentralizedLSTM

class InMemorySepsisDataset(Dataset):
    """Simple in-memory PyTorch Dataset wrapper."""
    def __init__(self, data_dict: dict):
        self.features = data_dict['features'].float()
        self.labels = data_dict['labels'].float()
        
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
    logger = setup_logging(log_dir, log_filename="evaluate.log")
    
    logger.info("=== Initialize Federated Global Model Evaluation ===")
    
    set_seed(config['seed'])
    logger.info(f"Random seed set to: {config['seed']}.")
    
    # 3. Setup Computational Device
    device = get_device(config['device'])
    logger.info(f"Compute device allocated: {device}")
    
    # 4. Load Global Test Dataset
    data_dir = os.path.join(os.path.dirname(base_dir), config['paths']['data_dir'])
    test_path = os.path.join(data_dir, "test.pt")
    
    logger.info(f"Loading global test dataset from: {test_path}")
    global_test = torch.load(test_path)
    test_dataset = InMemorySepsisDataset(global_test)
    logger.info(f"Loaded test dataset: {len(test_dataset)} samples.")
    
    # 5. Create DataLoader
    batch_size = config['local_training']['batch_size']
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    # 6. Load Best Global Model weights
    checkpoint_dir = os.path.join(os.path.dirname(base_dir), config['paths']['checkpoint_dir'])
    best_model_path = os.path.join(checkpoint_dir, "best_global_model.pt")
    
    if not os.path.exists(best_model_path):
        logger.error(f"Best global model checkpoint not found at: {best_model_path}. Run train_fedavg.py first.")
        sys.exit(1)
        
    logger.info(f"Loading best global model checkpoint: {best_model_path}")
    checkpoint = torch.load(best_model_path, map_location=device)
    
    model = CentralizedLSTM(
        input_dim=config['model']['input_dim'],
        hidden_dim=config['model']['hidden_dim'],
        num_layers=config['model']['num_layers'],
        dropout=config['model']['dropout'],
        output_dim=config['model']['output_dim']
    ).to(device)
    
    model.load_state_dict(checkpoint['model_state_dict'])
    logger.info("Model weights loaded successfully.")
    
    # 7. Run Inference Loop
    model.eval()
    logger.info("Running global model inference on test dataset...")
    
    all_targets = []
    all_probs = []
    
    with torch.no_grad():
        for features, targets in test_loader:
            features = features.to(device)
            logits = model(features)
            probs = torch.sigmoid(logits)
            
            all_targets.extend(targets.numpy())
            all_probs.extend(probs.cpu().numpy())
            
    all_targets = np.array(all_targets)
    all_probs = np.array(all_probs)
    
    # 8. Compute and Save Performance Metrics
    results_dir = os.path.join(os.path.dirname(base_dir), config['paths']['results_dir'])
    os.makedirs(results_dir, exist_ok=True)
    
    fed_metrics = FederatedEvaluator.compute_metrics(all_targets, all_probs)
    
    metrics_save_path = os.path.join(results_dir, "test_metrics.json")
    with open(metrics_save_path, 'w') as f:
        json.dump(fed_metrics, f, indent=4)
    logger.info(f"Saved global evaluation metrics JSON to: {metrics_save_path}")
    
    # 9. Load Centralized Metrics and Generate Comparison
    cent_results_dir = os.path.join(os.path.dirname(base_dir), config['paths']['centralized_results_dir'])
    centralized_metrics_path = os.path.join(cent_results_dir, "test_metrics.json")
    
    # Save comparison report JSON
    comparison_save_path = os.path.join(results_dir, "baseline_comparison.json")
    comparison = FederatedEvaluator.save_comparison_report(
        fed_metrics=fed_metrics,
        centralized_metrics_path=centralized_metrics_path,
        save_path=comparison_save_path
    )
    logger.info(f"Saved baseline comparison metrics JSON to: {comparison_save_path}")
    
    # Generate comparative plots (Comparative ROC & Confusion Matrix)
    FederatedEvaluator.generate_comparison_plots(
        y_true=all_targets,
        y_probs=all_probs,
        centralized_metrics_path=centralized_metrics_path,
        save_dir=results_dir
    )
    logger.info(f"Comparative evaluation charts saved in results folder: {results_dir}")
    
    # Log comparative metrics to console
    logger.info("=== Comparative Test Performance Summary ===")
    logger.info("  Metric             |   Centralized   |     FedAvg      |   Difference   ")
    logger.info("  -------------------|-----------------|-----------------|----------------")
    
    metrics_list = ['accuracy', 'precision', 'recall', 'f1_score', 'auroc']
    for m in metrics_list:
        val_cent = comparison['centralized'][metrics_list.index(m)]
        val_fed = comparison['fedavg'][metrics_list.index(m)]
        val_diff = comparison['difference'][metrics_list.index(m)]
        
        str_cent = f"{val_cent*100:.2f}%" if m != 'f1_score' and m != 'auroc' else f"{val_cent:.4f}"
        str_fed = f"{val_fed*100:.2f}%" if m != 'f1_score' and m != 'auroc' else f"{val_fed:.4f}"
        str_diff = f"{val_diff*100:+.2f}%" if m != 'f1_score' and m != 'auroc' else f"{val_diff:+.4f}"
        
        logger.info(f"  {m.capitalize():18s} | {str_cent:15s} | {str_fed:15s} | {str_diff:14s}")
        
    logger.info("=== Federated Testing Evaluation Completed Successfully ===")

if __name__ == "__main__":
    main()
