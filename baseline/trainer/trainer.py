import os
import time
import logging
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from tqdm import tqdm
import numpy as np
from sklearn.metrics import roc_auc_score

# Set up logging for trainer
logger = logging.getLogger("baseline.trainer")

class CentralizedTrainer:
    """
    Orchestrates training, validation, early stopping, scheduling, and model checkpoints.
    """
    def __init__(
        self,
        model: nn.Module,
        train_loader: DataLoader,
        val_loader: DataLoader,
        criterion: nn.Module,
        optimizer: torch.optim.Optimizer,
        scheduler: torch.optim.lr_scheduler._LRScheduler,
        device: torch.device,
        epochs: int = 50,
        patience: int = 8,
        checkpoint_dir: str = "baseline/checkpoints",
        results_dir: str = "baseline/results"
    ):
        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.criterion = criterion
        self.optimizer = optimizer
        self.scheduler = scheduler
        self.device = device
        self.epochs = epochs
        self.patience = patience
        self.checkpoint_dir = checkpoint_dir
        self.results_dir = results_dir
        
        # Verify paths exist
        os.makedirs(self.checkpoint_dir, exist_ok=True)
        os.makedirs(self.results_dir, exist_ok=True)
        
        # State indicators
        self.best_val_auroc = 0.0
        self.patience_counter = 0
        self.history = {
            'train_loss': [],
            'train_acc': [],
            'train_auroc': [],
            'val_loss': [],
            'val_acc': [],
            'val_auroc': []
        }

    def train_epoch(self, epoch: int) -> tuple:
        """Runs a single training epoch."""
        self.model.train()
        running_loss = 0.0
        correct_predictions = 0
        total_samples = 0
        
        all_targets = []
        all_probs = []
        
        progress_bar = tqdm(self.train_loader, desc=f"Epoch {epoch+1}/{self.epochs} [Train]")
        
        for features, targets in progress_bar:
            features = features.to(self.device)
            targets = targets.to(self.device)
            
            # Forward pass
            self.optimizer.zero_grad()
            logits = self.model(features)
            loss = self.criterion(logits, targets)
            
            # Backward pass & Optimize
            loss.backward()
            self.optimizer.step()
            
            # Record metrics
            running_loss += loss.item() * features.size(0)
            
            # Convert logits to probabilities and predictions
            probs = torch.sigmoid(logits)
            preds = (probs >= 0.5).float()
            
            correct_predictions += (preds == targets).sum().item()
            total_samples += targets.size(0)
            
            all_targets.extend(targets.cpu().numpy())
            all_probs.extend(probs.detach().cpu().numpy())
            
            # Update tqdm progress bar
            current_loss = running_loss / total_samples
            current_acc = correct_predictions / total_samples
            progress_bar.set_postfix(loss=f"{current_loss:.4f}", acc=f"{current_acc:.4f}")
            
        epoch_loss = running_loss / total_samples
        epoch_acc = correct_predictions / total_samples
        
        # Calculate AUROC
        all_targets = np.array(all_targets)
        all_probs = np.array(all_probs)
        try:
            epoch_auroc = roc_auc_score(all_targets, all_probs)
        except ValueError:
            epoch_auroc = 0.5  # Fallback if only one class is present in batch (unlikely)
            
        return epoch_loss, epoch_acc, epoch_auroc

    def validate(self) -> tuple:
        """Evaluates the model on validation set."""
        self.model.eval()
        running_loss = 0.0
        correct_predictions = 0
        total_samples = 0
        
        all_targets = []
        all_probs = []
        
        with torch.no_grad():
            for features, targets in self.val_loader:
                features = features.to(self.device)
                targets = targets.to(self.device)
                
                logits = self.model(features)
                loss = self.criterion(logits, targets)
                
                running_loss += loss.item() * features.size(0)
                
                probs = torch.sigmoid(logits)
                preds = (probs >= 0.5).float()
                
                correct_predictions += (preds == targets).sum().item()
                total_samples += targets.size(0)
                
                all_targets.extend(targets.cpu().numpy())
                all_probs.extend(probs.cpu().numpy())
                
        epoch_loss = running_loss / total_samples
        epoch_acc = correct_predictions / total_samples
        
        # Calculate AUROC
        all_targets = np.array(all_targets)
        all_probs = np.array(all_probs)
        try:
            epoch_auroc = roc_auc_score(all_targets, all_probs)
        except ValueError:
            epoch_auroc = 0.5
            
        return epoch_loss, epoch_acc, epoch_auroc

    def fit(self):
        """Executes full training loop with validation checks."""
        logger.info(f"Starting centralized training for {self.epochs} epochs...")
        logger.info(f"Targeting device: {self.device}")
        
        best_model_path = os.path.join(self.checkpoint_dir, "best_model.pt")
        latest_model_path = os.path.join(self.checkpoint_dir, "latest_model.pt")
        
        for epoch in range(self.epochs):
            start_time = time.time()
            
            # Run train/validation phases
            train_loss, train_acc, train_auroc = self.train_epoch(epoch)
            val_loss, val_acc, val_auroc = self.validate()
            
            # Step scheduler
            if self.scheduler:
                self.scheduler.step()
                
            elapsed_time = time.time() - start_time
            
            # Log epoch outcomes
            logger.info(
                f"Epoch {epoch+1:02d}/{self.epochs:02d} | "
                f"Train Loss: {train_loss:.4f} - Train Acc: {train_acc*100:.2f}% - Train AUROC: {train_auroc:.4f} | "
                f"Val Loss: {val_loss:.4f} - Val Acc: {val_acc*100:.2f}% - Val AUROC: {val_auroc:.4f} | "
                f"Time: {elapsed_time:.1f}s"
            )
            
            # Record history
            self.history['train_loss'].append(train_loss)
            self.history['train_acc'].append(train_acc)
            self.history['train_auroc'].append(train_auroc)
            self.history['val_loss'].append(val_loss)
            self.history['val_acc'].append(val_acc)
            self.history['val_auroc'].append(val_auroc)
            
            # Save latest checkpoint
            torch.save({
                'epoch': epoch,
                'model_state_dict': self.model.state_dict(),
                'optimizer_state_dict': self.optimizer.state_dict(),
                'history': self.history
            }, latest_model_path)
            
            # Early stopping and best model saving based on val AUROC
            if val_auroc > self.best_val_auroc:
                self.best_val_auroc = val_auroc
                self.patience_counter = 0
                logger.info(f"  [New Best Model] Validation AUROC improved to {val_auroc:.4f}. Saving state...")
                torch.save({
                    'epoch': epoch,
                    'model_state_dict': self.model.state_dict(),
                    'optimizer_state_dict': self.optimizer.state_dict(),
                    'val_auroc': val_auroc,
                    'history': self.history
                }, best_model_path)
            else:
                self.patience_counter += 1
                logger.info(f"  [No Improvement] Patience counter at {self.patience_counter}/{self.patience}")
                
            if self.patience_counter >= self.patience:
                logger.info(f"Early stopping triggered after {epoch+1} epochs. Training complete.")
                break
                
        # Save training curves metadata
        history_path = os.path.join(self.results_dir, "training_history.json")
        import json
        with open(history_path, 'w') as f:
            json.dump(self.history, f, indent=4)
        logger.info(f"Saved training history to {history_path}")
        logger.info("Centralized training finished.")
        return self.history
