import os
import torch
from torch.utils.data import Dataset

class SepsisDataset(Dataset):
    """
    PyTorch Dataset wrapper for preprocessed PhysioNet 2019 time-series sliding windows.
    Loads patient features and binary targets (SepsisLabel).
    """
    def __init__(self, data_path: str):
        """
        Args:
            data_path (str): Path to the saved PyTorch .pt dataset split.
        """
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Processed dataset file not found at: {data_path}")
            
        # Load processed dictionary containing features, labels, patient_ids, hospital_ids
        data_dict = torch.load(data_path)
        
        self.features = data_dict['features']
        self.labels = data_dict['labels']
        self.patient_ids = data_dict['patient_ids']
        self.hospital_ids = data_dict['hospital_ids']
        
        # Explicit type conversions to ensure compatibility
        self.features = self.features.float()
        self.labels = self.labels.float()  # Required float type for BCEWithLogitsLoss
        
    def __len__(self) -> int:
        """Returns the total number of sliding window samples in the split."""
        return self.features.shape[0]
        
    def __getitem__(self, idx: int):
        """
        Retrieves a single time-series window and its binary label.
        
        Args:
            idx (int): Sample index.
            
        Returns:
            Tuple[torch.Tensor, torch.Tensor]: (features_tensor, label_tensor)
                - features_tensor: shape (sequence_length, num_features)
                - label_tensor: shape (1,)
        """
        return self.features[idx], self.labels[idx]
