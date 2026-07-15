import logging
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from tqdm import tqdm
import numpy as np

# Logger setup
logger = logging.getLogger("federated.trainer")

class LocalTrainer:
    """
    Handles local client model training and validation per communication round.
    """
    def __init__(self, device: torch.device):
        self.device = device

    def train(
        self,
        model: nn.Module,
        train_loader: DataLoader,
        criterion: nn.Module,
        optimizer: torch.optim.Optimizer,
        local_epochs: int,
        client_id: int
    ) -> float:
        """
        Trains the local model on the client's train data loader.
        
        Returns:
            float: Average local training loss over local epochs.
        """
        model.train()
        total_loss = 0.0
        total_samples = 0
        
        for epoch in range(local_epochs):
            running_loss = 0.0
            epoch_samples = 0
            
            for features, targets in train_loader:
                features = features.to(self.device)
                targets = targets.to(self.device)
                
                optimizer.zero_grad()
                logits = model(features)
                loss = criterion(logits, targets)
                
                loss.backward()
                optimizer.step()
                
                running_loss += loss.item() * features.size(0)
                epoch_samples += targets.size(0)
                
            epoch_loss = running_loss / epoch_samples
            total_loss += epoch_loss
            total_samples += 1
            
            # Log local progress under DEBUG level to prevent console clutter
            logger.debug(f"Client {client_id} | Local Epoch {epoch+1}/{local_epochs} - Loss: {epoch_loss:.4f}")
            
        return total_loss / total_samples

    def validate(
        self,
        model: nn.Module,
        val_loader: DataLoader,
        criterion: nn.Module
    ) -> tuple:
        """
        Evaluates the local model on the client's validation data loader.
        
        Returns:
            Tuple[float, float]: val_loss, val_accuracy.
        """
        model.eval()
        running_loss = 0.0
        correct_predictions = 0
        total_samples = 0
        
        with torch.no_grad():
            for features, targets in val_loader:
                features = features.to(self.device)
                targets = targets.to(self.device)
                
                logits = model(features)
                loss = criterion(logits, targets)
                
                running_loss += loss.item() * features.size(0)
                
                probs = torch.sigmoid(logits)
                preds = (probs >= 0.5).float()
                
                correct_predictions += (preds == targets).sum().item()
                total_samples += targets.size(0)
                
        val_loss = running_loss / total_samples
        val_acc = correct_predictions / total_samples
        
        return val_loss, val_acc
