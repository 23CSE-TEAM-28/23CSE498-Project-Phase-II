import os
import random
import logging
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.metrics import roc_auc_score
import numpy as np

# Logger setup
logger = logging.getLogger("federated.server")

class FederatedServer:
    """
    Manages global model states, handles client registration, aggregates local parameters
    via the FedAvg algorithm, and evaluates global performance.
    """
    def __init__(
        self,
        global_model: nn.Module,
        device: torch.device,
        patience: int = 5,
        checkpoint_dir: str = "federated/checkpoints"
    ):
        self.global_model = global_model
        self.device = device
        self.patience = patience
        self.checkpoint_dir = checkpoint_dir
        
        self.clients = []
        self.best_val_auroc = 0.0
        self.patience_counter = 0
        
        # Verify checkpoint directory exists
        os.makedirs(self.checkpoint_dir, exist_ok=True)
        
        # History metrics
        self.history = {
            'global_val_loss': [],
            'global_val_acc': [],
            'global_val_auroc': [],
            'client_val_losses': [],  # Records local client performance
            'client_val_accs': [],
            'client_pers_losses': [], # Ditto client personalized losses
            'client_pers_accs': []    # Ditto client personalized accuracies
        }

    def register_client(self, client):
        """Registers a simulated client representing a clinical center."""
        self.clients.append(client)
        logger.info(f"Registered client {client.client_id} to Federated Server.")

    def broadcast_global_model(self) -> dict:
        """Returns the current state dictionary of the global model."""
        return {k: v.cpu().clone() for k, v in self.global_model.state_dict().items()}

    def aggregate_parameters(self, local_updates: list) -> dict:
        """
        Implements the Federated Averaging (FedAvg) algorithm.
        Computes a weighted average of local model weights based on client sample counts:
        
        W_global = sum( (n_k / N) * W_k )
        
        Args:
            local_updates (list): List of tuples (client_state_dict, num_samples)
            
        Returns:
            dict: Aggregated global state dictionary.
        """
        # Calculate N (total number of local samples across participating clients)
        total_samples = sum(num_samples for _, num_samples in local_updates)
        
        first_state_dict = local_updates[0][0]
        aggregated_state_dict = {}
        
        # Iterate over each parameter layer key
        for key in first_state_dict.keys():
            # Initialize weighted sum of local parameters
            weighted_param = torch.zeros_like(first_state_dict[key], dtype=torch.float32)
            
            for client_state_dict, num_samples in local_updates:
                # Add local client parameter scaled by (n_k)
                weighted_param += client_state_dict[key].to(torch.float32) * num_samples
                
            # Divide by total samples N to get the weighted average
            aggregated_state_dict[key] = (weighted_param / total_samples).to(first_state_dict[key].dtype)
            
        return aggregated_state_dict

    def update_global_model(self, aggregated_state_dict: dict):
        """Loads aggregated parameters back into the global model container."""
        self.global_model.load_state_dict(
            {k: v.to(self.device) for k, v in aggregated_state_dict.items()}
        )

    def evaluate_global(self, val_loader: DataLoader, criterion: nn.Module) -> tuple:
        """
        Evaluates the global model on the global combined validation dataset.
        
        Returns:
            Tuple[float, float, float]: val_loss, val_accuracy, val_auroc.
        """
        self.global_model.eval()
        running_loss = 0.0
        correct_predictions = 0
        total_samples = 0
        
        all_targets = []
        all_probs = []
        
        with torch.no_grad():
            for features, targets in val_loader:
                features = features.to(self.device)
                targets = targets.to(self.device)
                
                logits = self.global_model(features)
                loss = criterion(logits, targets)
                
                running_loss += loss.item() * features.size(0)
                
                probs = torch.sigmoid(logits)
                preds = (probs >= 0.5).float()
                
                correct_predictions += (preds == targets).sum().item()
                total_samples += targets.size(0)
                
                all_targets.extend(targets.cpu().numpy())
                all_probs.extend(probs.cpu().numpy())
                
        val_loss = running_loss / total_samples
        val_acc = correct_predictions / total_samples
        
        # Calculate AUROC
        all_targets = np.array(all_targets)
        all_probs = np.array(all_probs)
        try:
            val_auroc = roc_auc_score(all_targets, all_probs)
        except ValueError:
            val_auroc = 0.5
            
        return val_loss, val_acc, val_auroc

    def run_round(
        self,
        round_idx: int,
        client_fraction: float,
        criterion: nn.Module,
        mu: float = 0.0,
        run_ditto: bool = False,
        lam: float = 0.1
    ) -> tuple:
        """
        Executes a single communication round:
        1. Broadcasts global model to participants.
        2. Clients perform local epochs training (with FedProx proximal regularization if mu > 0).
        3. Clients perform local personalization (if run_ditto is True).
        4. Aggregates global updates and updates server global model.
        """
        logger.info(f"--- Starting Communication Round {round_idx+1} ---")
        
        # Select client subset
        num_to_select = max(1, int(len(self.clients) * client_fraction))
        selected_clients = random.sample(self.clients, num_to_select)
        logger.info(f"Selected {len(selected_clients)} / {len(self.clients)} clients for this round.")
        
        local_updates = []
        client_val_losses = {}
        client_val_accs = {}
        client_pers_losses = {}
        client_pers_accs = {}
        
        # 1. Local Training on Clients
        global_state_dict = self.broadcast_global_model()
        
        for client in selected_clients:
            # Check if CSSP drift bypass is active
            if getattr(client, "skip_global_upload", False):
                logger.info(f"  [Drift CSSP Active] Client {client.client_id} is bypassing consensus training to perform local personalization adaptation.")
                if run_ditto:
                    logger.info(f"Local personalization on client {client.client_id}...")
                    pers_model = self.global_model.__class__(
                        **{k: getattr(self.global_model, k, v) for k, v in [
                            ('hidden_dim', 64), ('num_layers', 2)
                        ]}
                    ).to(self.device)
                    # Retrieve custom training settings
                    c_epochs = getattr(client, "custom_pers_epochs", 5)
                    p_loss, p_acc = client.local_personalize(
                        pers_model, 
                        global_state_dict, 
                        lam,
                        freeze_backbone=True,
                        custom_epochs=c_epochs
                    )
                    client_pers_losses[client.client_id] = p_loss
                    client_pers_accs[client.client_id] = p_acc
                    logger.info(f"  ├── Client {client.client_id} personalized update (CSSP). Val Loss: {p_loss:.4f}, Val Acc: {p_acc*100:.2f}%")
                    # Reset skip flag after run completes
                    client.skip_global_upload = False
                continue

            logger.info(f"Local training on client {client.client_id}...")
            # Instantiate client local model (which is a clone shell)
            local_model = self.global_model.__class__(
                # Initialize dynamically using same architecture
                **{k: getattr(self.global_model, k, v) for k, v in [
                    ('hidden_dim', 64), ('num_layers', 2)
                ]}
            ).to(self.device)
            
            # Execute local epochs for global model consensus update
            updated_params, num_samples, val_loss, val_acc = client.local_train(local_model, global_state_dict, mu)
            
            local_updates.append((updated_params, num_samples))
            client_val_losses[client.client_id] = val_loss
            client_val_accs[client.client_id] = val_acc
            logger.info(f"  ├── Client {client.client_id} finished training. Val Loss: {val_loss:.4f}, Val Acc: {val_acc*100:.2f}%")
            
            # Run local personalization if running Ditto
            if run_ditto:
                logger.info(f"Local personalization on client {client.client_id}...")
                pers_model = self.global_model.__class__(
                    **{k: getattr(self.global_model, k, v) for k, v in [
                        ('hidden_dim', 64), ('num_layers', 2)
                    ]}
                ).to(self.device)
                p_loss, p_acc = client.local_personalize(pers_model, global_state_dict, lam)
                client_pers_losses[client.client_id] = p_loss
                client_pers_accs[client.client_id] = p_acc
                logger.info(f"  ├── Client {client.client_id} personalized update. Val Loss: {p_loss:.4f}, Val Acc: {p_acc*100:.2f}%")
            
        # 2. Server Parameter Aggregation
        if len(local_updates) > 0:
            logger.info(f"Aggregating parameters from {len(local_updates)} active clients via FedAvg...")
            aggregated_weights = self.aggregate_parameters(local_updates)
            # 3. Global Model Update
            self.update_global_model(aggregated_weights)
            logger.info(f"Global model successfully updated.")
        else:
            logger.info("No active consensus updates in this round. Global model remains unchanged.")
        
        return client_val_losses, client_val_accs, client_pers_losses, client_pers_accs

    def fit(
        self,
        rounds: int,
        client_fraction: float,
        val_loader: DataLoader,
        criterion: nn.Module,
        mu: float = 0.0,
        run_ditto: bool = False,
        lam: float = 0.1
    ) -> dict:
        """
        Orchestrates full federated training across multiple rounds.
        """
        if hasattr(self.global_model, "attention_query"):
            model_filename = "best_fpdaf_global_model.pt"
        elif run_ditto:
            model_filename = "best_ditto_global_model.pt"
        else:
            model_filename = "best_fedprox_model.pt" if mu > 0.0 else "best_global_model.pt"
            
        best_model_path = os.path.join(self.checkpoint_dir, model_filename)
        logger.info(f"Best model path configured as: {best_model_path}")
        
        for r in range(rounds):
            # Run local training and aggregation round
            client_losses, client_accs, client_p_losses, client_p_accs = self.run_round(
                r, client_fraction, criterion, mu, run_ditto, lam
            )
            
            # Evaluate updated global model on validation partition
            val_loss, val_acc, val_auroc = self.evaluate_global(val_loader, criterion)
            
            logger.info(
                f"Round {r+1:02d}/{rounds:02d} Complete | "
                f"Global Val Loss: {val_loss:.4f} - Global Val Acc: {val_acc*100:.2f}% - Global Val AUROC: {val_auroc:.4f}"
            )
            
            # Save historical stats
            self.history['global_val_loss'].append(val_loss)
            self.history['global_val_acc'].append(val_acc)
            self.history['global_val_auroc'].append(val_auroc)
            self.history['client_val_losses'].append(client_losses)
            self.history['client_val_accs'].append(client_accs)
            
            if run_ditto:
                self.history['client_pers_losses'].append(client_p_losses)
                self.history['client_pers_accs'].append(client_p_accs)
                # Compute client-averaged personalization metrics
                avg_p_loss = sum(client_p_losses.values()) / len(client_p_losses)
                avg_p_acc = sum(client_p_accs.values()) / len(client_p_accs)
                logger.info(f"  [Personalization Status] Avg Local Val Loss: {avg_p_loss:.4f} - Avg Local Val Acc: {avg_p_acc*100:.2f}%")
            
            # Save round checkpoint
            round_ckpt_path = os.path.join(self.checkpoint_dir, f"global_model_round_{r+1}.pt")
            torch.save({
                'round': r,
                'model_state_dict': self.global_model.state_dict(),
                'global_val_auroc': val_auroc,
                'history': self.history
            }, round_ckpt_path)
            logger.info(f"  [Saved] Round checkpoint -> {round_ckpt_path}")
            
            # Early stopping check based on global validation AUROC
            if val_auroc > self.best_val_auroc:
                self.best_val_auroc = val_auroc
                self.patience_counter = 0
                logger.info(f"  [New Best Global Model] Global AUROC improved to {val_auroc:.4f}. Saving state...")
                torch.save({
                    'round': r,
                    'model_state_dict': self.global_model.state_dict(),
                    'global_val_auroc': val_auroc,
                    'history': self.history
                }, best_model_path)
            else:
                self.patience_counter += 1
                logger.info(f"  [No Improvement] Patience counter at {self.patience_counter}/{self.patience}")
                
            if self.patience_counter >= self.patience:
                logger.info(f"Federated early stopping triggered at round {r+1}. Aggregation finished.")
                break
                
        return self.history
