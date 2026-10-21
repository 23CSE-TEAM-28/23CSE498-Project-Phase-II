import os
import sys
import json
import torch
import numpy as np
from torch.utils.data import DataLoader

# Add parent directory to sys.path to enable correct imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from baseline.utils.helpers import set_seed, load_config, setup_logging, get_device
from baseline.datasets.dataset import SepsisDataset
from baseline.models.lstm import CentralizedLSTM
from baseline.evaluation.evaluator import SepsisEvaluator

def main():
    # 1. Setup paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(base_dir, "configs", "config.yaml")
    
    # Load configuration settings
    config = load_config(config_path)
    
    # 2. Setup Logging and Seeds
    log_dir = os.path.join(os.path.dirname(base_dir), config['paths']['log_dir'])
    logger = setup_logging(log_dir, log_filename="test.log")
    
    logger.info("=== Initialize Centralized LSTM Baseline Evaluation ===")
    
    set_seed(config['seed'])
    logger.info(f"Random seed set to: {config['seed']}.")
    
    # 3. Setup Hardware Device
    device = get_device(config['device'])
    logger.info(f"Compute device allocated: {device}")
    
    # 4. Load Test Dataset
    data_dir = os.path.join(os.path.dirname(base_dir), config['paths']['data_dir'])
    test_path = os.path.join(data_dir, "test.pt")
    
    logger.info(f"Loading test dataset from: {test_path}")
    test_dataset = SepsisDataset(test_path)
    logger.info(f"Loaded test split: {len(test_dataset)} samples.")
    
    # 5. Create DataLoader
    batch_size = config['training']['batch_size']
    test_loader = DataLoader(
        test_dataset, 
        batch_size=batch_size, 
        shuffle=False, 
        pin_memory=True if device.type != 'cpu' else False
    )
    
    # 6. Load Best Model Checkpoint
    checkpoint_dir = os.path.join(os.path.dirname(base_dir), config['paths']['checkpoint_dir'])
    best_model_path = os.path.join(checkpoint_dir, "best_model.pt")
    
    if not os.path.exists(best_model_path):
        logger.error(f"Saved model checkpoint not found at: {best_model_path}. Run train.py first.")
        sys.exit(1)
        
    logger.info(f"Loading best model state checkpoint from: {best_model_path}")
    checkpoint = torch.load(best_model_path, map_location=device)
    
    # Initialize Model architecture
    model = CentralizedLSTM(
        input_dim=config['model']['input_dim'],
        hidden_dim=config['model']['hidden_dim'],
        num_layers=config['model']['num_layers'],
        dropout=config['model']['dropout'],
        output_dim=config['model']['output_dim']
    ).to(device)
    
    model.load_state_dict(checkpoint['model_state_dict'])
    logger.info("Model weights successfully loaded.")
    
    # 7. Run Inference Loop
    logger.info("Running model predictions on the test partition...")
    model.eval()
    
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
    
    # 8. Compute Performance Metrics
    results_dir = os.path.join(os.path.dirname(base_dir), config['paths']['results_dir'])
    os.makedirs(results_dir, exist_ok=True)
    
    logger.info("Computing classification performance metrics...")
    metrics = SepsisEvaluator.compute_metrics(all_targets, all_probs)
    
    # Print metrics to console
    logger.info("=== Test Evaluation Metrics ===")
    logger.info(f"  ├── Accuracy:  {metrics['accuracy']*100:.2f}%")
    logger.info(f"  ├── Precision: {metrics['precision']*100:.2f}%")
    logger.info(f"  ├── Recall:    {metrics['recall']*100:.2f}%")
    logger.info(f"  ├── F1 Score:  {metrics['f1_score']:.4f}")
    logger.info(f"  └── AUROC:     {metrics['auroc']:.4f}")
    logger.info("Confusion Matrix:")
    logger.info(f"  ├── True Negatives (TN):  {metrics['confusion_matrix']['tn']}")
    logger.info(f"  ├── False Positives (FP): {metrics['confusion_matrix']['fp']}")
    logger.info(f"  ├── False Negatives (FN): {metrics['confusion_matrix']['fn']}")
    logger.info(f"  └── True Positives (TP):  {metrics['confusion_matrix']['tp']}")
    
    # Save metrics to JSON file
    metrics_save_path = os.path.join(results_dir, "test_metrics.json")
    with open(metrics_save_path, 'w') as f:
        json.dump(metrics, f, indent=4)
    logger.info(f"Saved evaluation metrics JSON file to: {metrics_save_path}")
    
    # 9. Generate Plots
    logger.info("Generating evaluation visualization plots...")
    
    # Plot ROC Curve
    roc_plot_path = os.path.join(results_dir, "roc_curve.png")
    SepsisEvaluator.plot_roc_curve(all_targets, all_probs, roc_plot_path)
    logger.info(f"  [Saved] ROC Curve chart -> {roc_plot_path}")
    
    # Plot Confusion Matrix
    cm_plot_path = os.path.join(results_dir, "confusion_matrix.png")
    SepsisEvaluator.plot_confusion_matrix(all_targets, all_probs, cm_plot_path)
    logger.info(f"  [Saved] Confusion Matrix chart -> {cm_plot_path}")
    
    logger.info("=== Centralized Testing Evaluation Completed Successfully ===")

if __name__ == "__main__":
    main()
