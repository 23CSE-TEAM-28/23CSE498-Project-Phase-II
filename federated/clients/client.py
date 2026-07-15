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

    def local_train(self, model: nn.Module, global_state_dict: dict) -> tuple:
        """
        Receives global model weights, performs local training, and returns updated weights.
        
        Args:
            model (nn.Module): Local model container.
            global_state_dict (dict): Current global model parameters.
            
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
            client_id=self.client_id
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
