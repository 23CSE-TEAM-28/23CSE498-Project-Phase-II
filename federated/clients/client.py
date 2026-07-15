import logging
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from federated.trainer.local_trainer import LocalTrainer

# Logger setup
logger = logging.getLogger("federated.client")

class FederatedClient:
    """
    Represents a decentralized hospital node in the federated learning framework.
    Manages local patient data splits, local training, and validation epochs.
    """
    def __init__(
        self,
        client_id: int,
        train_dataset,
        val_dataset,
        test_dataset,
        device: torch.device,
        batch_size: int = 128,
        lr: float = 0.001,
        weight_decay: float = 0.0001,
        local_epochs: int = 2
    ):
        self.client_id = client_id
        self.device = device
        self.local_epochs = local_epochs
        self.lr = lr
        self.weight_decay = weight_decay
        self.batch_size = batch_size
        
        self.train_dataset = train_dataset
        self.val_dataset = val_dataset
        self.test_dataset = test_dataset
        
        self.num_samples = len(train_dataset)
        
        # Initialize DataLoaders
        self.train_loader = DataLoader(self.train_dataset, batch_size=batch_size, shuffle=True)
        self.val_loader = DataLoader(self.val_dataset, batch_size=batch_size, shuffle=False)
        self.test_loader = DataLoader(self.test_dataset, batch_size=batch_size, shuffle=False)
        
        # Persisted client-specific personalized parameters for Ditto
        self.personalized_weights = None
        
        # CUSUM drift detection variables for FPDAF
        self.cusum_score = 0.0
        self.cusum_history = []
        self.drift_triggered = False
        self.skip_global_upload = False
        
        # Calculate dynamic class weight from local targets to counter severe sepsis imbalance
        num_neg = (self.train_dataset.labels == 0).sum().item()
        num_pos = (self.train_dataset.labels == 1).sum().item()
        
        # Fallback if a client has zero positive class windows (highly unlikely in our split)
        if num_pos == 0:
            pos_weight_value = 1.0
        else:
            pos_weight_value = num_neg / num_pos
            
        self.pos_weight = torch.tensor([pos_weight_value], device=self.device)
        self.criterion = nn.BCEWithLogitsLoss(pos_weight=self.pos_weight)
        
        # Local Trainer instance
        self.trainer = LocalTrainer(self.device)
        logger.info(
            f"Client {self.client_id} registered. "
            f"Train samples: {self.num_samples}, "
            f"Local pos_weight: {pos_weight_value:.4f}"
        )

    def local_train(self, model: nn.Module, global_state_dict: dict, mu: float = 0.0) -> tuple:
        """
        Receives global model weights, performs local training (with FedProx if mu > 0), and returns updated weights.
        
        Args:
            model (nn.Module): Local model container.
            global_state_dict (dict): Current global model parameters.
            mu (float): Proximal constraint coefficient for FedProx.
            
        Returns:
            Tuple[dict, int, float, float]:
                - updated_state_dict: Local model weights after optimization.
                - num_samples: Number of training samples (weight for FedAvg aggregation).
                - val_loss: Local validation loss after epoch runs.
                - val_acc: Local validation accuracy.
        """
        # 1. Update local model with global parameters
        model.load_state_dict(global_state_dict)
        
        # 2. Setup local optimizer
        optimizer = torch.optim.Adam(
            model.parameters(),
            lr=self.lr,
            weight_decay=self.weight_decay
        )
        
        # 3. Perform local training rounds
        train_loss = self.trainer.train(
            model=model,
            train_loader=self.train_loader,
            criterion=self.criterion,
            optimizer=optimizer,
            local_epochs=self.local_epochs,
            client_id=self.client_id,
            mu=mu,
            global_state_dict=global_state_dict
        )
        
        # 4. Evaluate updated model locally on validation set
        val_loss, val_acc = self.trainer.validate(
            model=model,
            val_loader=self.val_loader,
            criterion=self.criterion
        )
        
        # Retrieve trained parameters
        local_parameters = {k: v.cpu() for k, v in model.state_dict().items()}
        
        return local_parameters, self.num_samples, val_loss, val_acc

    def local_personalize(
        self, 
        model: nn.Module, 
        global_state_dict: dict, 
        lam: float = 0.1,
        freeze_backbone: bool = False,
        custom_epochs: int = None
    ) -> tuple:
        """
        Loads the persistent client-specific personalized parameters (v_k), optimizes them
        locally regularized by global consensus weights (w^*) under Ditto/FPDAF, and returns validation metrics.
        Optionally freezes the feature extractor backbone to perform head-only adaptation under concept drift.
        """
        # 1. Initialize local personalized parameters if not already present
        if self.personalized_weights is None:
            self.personalized_weights = {k: v.clone() for k, v in global_state_dict.items()}
            
        # 2. Load persistent personalized state
        model.load_state_dict(self.personalized_weights)
        
        # 3. Handle backbone freezing if requested under CUSUM drift adaptation
        if freeze_backbone:
            logger.info(f"  [CSSP Active] Freezing LSTM feature extractor backbone on Client {self.client_id} for head-only personalization.")
            for name, param in model.named_parameters():
                if "lstm" in name or "attention_query" in name:
                    param.requires_grad = False
                else:
                    param.requires_grad = True
            
            # Setup optimizer exclusively for head parameters
            optimizer = torch.optim.Adam(
                filter(lambda p: p.requires_grad, model.parameters()),
                lr=self.lr,
                weight_decay=self.weight_decay
            )
        else:
            # Standard Ditto optimization (all layers active)
            for param in model.parameters():
                param.requires_grad = True
            optimizer = torch.optim.Adam(
                model.parameters(),
                lr=self.lr,
                weight_decay=self.weight_decay
            )
            
        # 4. Perform local personalization epochs regularized against global weights
        epochs_to_run = custom_epochs if custom_epochs is not None else self.local_epochs
        self.trainer.train_ditto(
            model=model,
            train_loader=self.train_loader,
            criterion=self.criterion,
            optimizer=optimizer,
            local_epochs=epochs_to_run,
            client_id=self.client_id,
            lam=lam,
            global_state_dict=global_state_dict
        )
        
        # 5. Evaluate personalized model locally on validation split
        val_loss, val_acc = self.trainer.validate(
            model=model,
            val_loader=self.val_loader,
            criterion=self.criterion
        )
        
        # 6. Save persistent personalized weights locally
        self.personalized_weights = {k: v.cpu().clone() for k, v in model.state_dict().items()}
        
        # 7. Reset requires_grad for all parameters before returning
        for param in model.parameters():
            param.requires_grad = True
            
        return val_loss, val_acc

    def update_cusum(self, val_loss: float, base_loss_threshold: float = 0.25, kappa: float = 0.02, h_threshold: float = 3.0) -> bool:
        """
        Updates the CUSUM drift detection score using local validation loss.
        If the score exceeds h_threshold, flags concept drift.
        """
        val_diff = val_loss - base_loss_threshold
        self.cusum_score = max(0.0, self.cusum_score + val_diff - kappa)
        self.cusum_history.append(self.cusum_score)
        
        if self.cusum_score > h_threshold:
            self.drift_triggered = True
            self.skip_global_upload = True
            logger.warning(f"  [DRIFT TRIGGERED] Client {self.client_id} CUSUM score {self.cusum_score:.4f} exceeded threshold {h_threshold}. Resetting score and enabling selective personalization (CSSP).")
            self.cusum_score = 0.0  # reset CUSUM score upon trigger
            return True
        return False
