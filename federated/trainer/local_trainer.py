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
    Supports standard LSTM, attention-based FPDAF models, proximal regularization (FedProx),
    and client-side selective layer freezing (CSSP) for Ditto/FPDAF personalization.
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
        client_id: int,
        mu: float = 0.0,
        global_state_dict: dict = None,
        dp_clip_norm: float = 0.0,
        dp_noise_multiplier: float = 0.0
    ) -> float:
        """
        Trains the local model on the client's train data loader.
        Supports FedProx proximal regularization and optional Differential Privacy (DP-SGD).
        
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
                
                # Add proximal penalty for FedProx
                if mu > 0.0 and global_state_dict is not None:
                    proximal_term = 0.0
                    for name, param in model.named_parameters():
                        global_param = global_state_dict[name].to(param.device)
                        proximal_term += torch.sum((param - global_param) ** 2)
                    loss = loss + (mu / 2.0) * proximal_term
                
                loss.backward()
                
                # Differential privacy: gradient clipping
                if dp_clip_norm > 0.0:
                    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=dp_clip_norm)
                    
                optimizer.step()
                
                # Differential privacy: calibrated Gaussian noise on parameters
                if dp_noise_multiplier > 0.0 and dp_clip_norm > 0.0:
                    with torch.no_grad():
                        for param in model.parameters():
                            if param.requires_grad:
                                noise = torch.randn_like(param) * (dp_noise_multiplier * dp_clip_norm / np.sqrt(len(train_loader.dataset)))
                                param.add_(noise)
                
                running_loss += loss.item() * features.size(0)
                epoch_samples += targets.size(0)
                
            epoch_loss = running_loss / max(1, epoch_samples)
            total_loss += epoch_loss
            total_samples += 1
            
            logger.debug(f"Client {client_id} | Local Epoch {epoch+1}/{local_epochs} - Loss: {epoch_loss:.4f}")
            
        return total_loss / max(1, total_samples)

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
                
        val_loss = running_loss / max(1, total_samples)
        val_acc = correct_predictions / max(1, total_samples)
        
        return val_loss, val_acc

    def train_ditto(
        self,
        model: nn.Module,
        train_loader: DataLoader,
        criterion: nn.Module,
        optimizer: torch.optim.Optimizer,
        local_epochs: int,
        client_id: int,
        lam: float,
        global_state_dict: dict
    ) -> float:
        """
        Trains the local personalized model (v_k) using the Ditto loss objective:
        L = L_local + (lambda / 2) * || v_k - w^* ||^2
        where w^* is the current frozen global consensus parameters.
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
                base_loss = criterion(logits, targets)
                
                # Compute Ditto regularization penalty against global weights
                reg_loss = 0.0
                if lam > 0.0 and global_state_dict is not None:
                    for name, param in model.named_parameters():
                        if param.requires_grad:
                            g_param = global_state_dict[name].to(param.device)
                            reg_loss += torch.sum((param - g_param) ** 2)
                        
                loss = base_loss + (lam / 2.0) * reg_loss
                
                loss.backward()
                optimizer.step()
                
                running_loss += loss.item() * features.size(0)
                epoch_samples += targets.size(0)
                
            epoch_loss = running_loss / max(1, epoch_samples)
            total_loss += epoch_loss
            total_samples += 1
            
            logger.debug(f"Client {client_id} (Ditto) | Local Personalization Epoch {epoch+1}/{local_epochs} - Loss: {epoch_loss:.4f}")
            
        return total_loss / max(1, total_samples)

    def train_ddp_erp(
        self,
        model: nn.Module,
        train_loader: DataLoader,
        criterion: nn.Module,
        optimizer: torch.optim.Optimizer,
        local_epochs: int,
        client_id: int,
        lam: float = 0.1,
        entropy_weight: float = 0.05,
        global_state_dict: dict = None
    ) -> float:
        """
        Executes Dynamic Dual-Phase Saliency & Entropy-Regularized Personalization (DDP-ERP).
        Objective: L = L_BCE + (lam/2)*||v_k - w^*||^2 - entropy_weight * H(p)
        Penalizes overconfidence under concept drift while anchoring shared representations.
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
                bce_loss = criterion(logits, targets)
                
                # Parameter anchor regularization
                reg_loss = 0.0
                if lam > 0.0 and global_state_dict is not None:
                    for name, param in model.named_parameters():
                        if param.requires_grad:
                            g_param = global_state_dict[name].to(param.device)
                            reg_loss += torch.sum((param - g_param) ** 2)
                            
                # Predictive entropy regularization
                probs = torch.sigmoid(logits)
                eps = 1e-7
                probs_clamped = torch.clamp(probs, eps, 1.0 - eps)
                entropy = -(probs_clamped * torch.log(probs_clamped) + (1.0 - probs_clamped) * torch.log(1.0 - probs_clamped)).mean()
                
                # Combined DDP-ERP loss
                loss = bce_loss + (lam / 2.0) * reg_loss - entropy_weight * entropy
                loss.backward()
                optimizer.step()
                
                running_loss += loss.item() * features.size(0)
                epoch_samples += targets.size(0)
                
            epoch_loss = running_loss / max(1, epoch_samples)
            total_loss += epoch_loss
            total_samples += 1
            
            logger.debug(f"Client {client_id} (DDP-ERP) | Local Personalization Epoch {epoch+1}/{local_epochs} - Loss: {epoch_loss:.4f}")
            
        return total_loss / max(1, total_samples)

