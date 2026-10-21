import os
import sys
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

# Add parent directory to sys.path to enable correct imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from baseline.utils.helpers import set_seed, load_config, setup_logging, get_device
from baseline.datasets.dataset import SepsisDataset
from baseline.models.lstm import CentralizedLSTM
from baseline.trainer.trainer import CentralizedTrainer
from baseline.evaluation.evaluator import SepsisEvaluator

def main():
    # 1. Setup paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(base_dir, "configs", "config.yaml")
    
    # Load configuration settings
    config = load_config(config_path)
    
    # 2. Setup Logging and Seeds
    log_dir = os.path.join(os.path.dirname(base_dir), config['paths']['log_dir'])
    logger = setup_logging(log_dir, log_filename="train.log")
    
    logger.info("=== Initialize Centralized LSTM Baseline Training ===")
    
    set_seed(config['seed'])
    logger.info(f"Random seed set to: {config['seed']} for full reproducibility.")
    
    # 3. Setup Hardware Device
    device = get_device(config['device'])
    logger.info(f"Targeting compute device: {device}")
    
    # 4. Load Datasets
    data_dir = os.path.join(os.path.dirname(base_dir), config['paths']['data_dir'])
    train_path = os.path.join(data_dir, "train.pt")
    val_path = os.path.join(data_dir, "validation.pt")
    
    logger.info(f"Loading training dataset from: {train_path}")
    train_dataset = SepsisDataset(train_path)
    logger.info(f"Loaded training split: {len(train_dataset)} windows.")
    
    logger.info(f"Loading validation dataset from: {val_path}")
    val_dataset = SepsisDataset(val_path)
    logger.info(f"Loaded validation split: {len(val_dataset)} windows.")
    
    # 5. Create DataLoaders
    batch_size = config['training']['batch_size']
    train_loader = DataLoader(
        train_dataset, 
        batch_size=batch_size, 
        shuffle=True, 
        pin_memory=True if device.type != 'cpu' else False
    )
    val_loader = DataLoader(
        val_dataset, 
        batch_size=batch_size, 
        shuffle=False, 
        pin_memory=True if device.type != 'cpu' else False
    )
    
    # 6. Initialize Model
    model = CentralizedLSTM(
        input_dim=config['model']['input_dim'],
        hidden_dim=config['model']['hidden_dim'],
        num_layers=config['model']['num_layers'],
        dropout=config['model']['dropout'],
        output_dim=config['model']['output_dim']
    ).to(device)
    logger.info(f"Initialized Centralized LSTM Model:\n{model}")
    
    # 7. Compute Dynamic Class Imbalance Weights for Loss Function
    # In Sepsis prediction, positive labels are typically ~2.5% of total windows.
    # We penalize positive class errors proportionally to counter imbalance.
    num_neg = (train_dataset.labels == 0).sum().item()
    num_pos = (train_dataset.labels == 1).sum().item()
    pos_weight_value = num_neg / num_pos
    logger.info(f"Dataset imbalance summary:")
    logger.info(f"  ├── Negative samples: {int(num_neg)}")
    logger.info(f"  ├── Positive samples: {int(num_pos)}")
    logger.info(f"  └── Dynamic Positive Weight (pos_weight): {pos_weight_value:.4f}")
    
    pos_weight = torch.tensor([pos_weight_value], device=device)
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)
    
    # 8. Setup Optimizer and LR Scheduler
    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=config['training']['learning_rate'],
        weight_decay=config['training']['weight_decay']
    )
    
    scheduler = torch.optim.lr_scheduler.StepLR(
        optimizer,
        step_size=config['training']['scheduler_step'],
        gamma=config['training']['scheduler_gamma']
    )
    
    # 9. Instantiate Trainer
    checkpoint_dir = os.path.join(os.path.dirname(base_dir), config['paths']['checkpoint_dir'])
    results_dir = os.path.join(os.path.dirname(base_dir), config['paths']['results_dir'])
    
    trainer = CentralizedTrainer(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        criterion=criterion,
        optimizer=optimizer,
        scheduler=scheduler,
        device=device,
        epochs=config['training']['epochs'],
        patience=config['training']['patience'],
        checkpoint_dir=checkpoint_dir,
        results_dir=results_dir
    )
    
    # 10. Run Fit / Training loop
    history = trainer.fit()
    
    # 11. Plot and save training loss & accuracy curves
    logger.info("Generating and saving training loss & accuracy charts...")
    SepsisEvaluator.plot_training_curves(history, results_dir)
    logger.info(f"All training metrics charts saved to: {results_dir}")
    logger.info("=== Centralized Training Execution Completed ===")

if __name__ == "__main__":
    main()
