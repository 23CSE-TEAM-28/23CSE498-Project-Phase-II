import torch
from typing import Tuple, Dict, Any

class ICUTensorConverter:
    """
    Converts preprocessed NumPy arrays into PyTorch Tensors.
    """
    @staticmethod
    def to_tensors(
        X: Any,
        y: Any,
        patient_ids: Any,
        hospital_ids: Any
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Converts inputs to PyTorch Tensors.
        
        Args:
            X (np.ndarray): Clinical features of shape (N, seq_len, num_features).
            y (np.ndarray): Labels of shape (N, 1).
            patient_ids (np.ndarray): Patient indices of shape (N,).
            hospital_ids (np.ndarray): Hospital indices of shape (N,).
            
        Returns:
            Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]: PyTorch tensors.
        """
        import numpy as np
        
        # Convert features to FloatTensor
        X_tensor = torch.tensor(X, dtype=torch.float32)
        
        # Convert labels to FloatTensor (BCE loss standard in PyTorch expects float target)
        y_tensor = torch.tensor(y, dtype=torch.float32)
        
        # Convert patient IDs and hospital IDs to LongTensor
        pids_tensor = torch.tensor(patient_ids, dtype=torch.long)
        hids_tensor = torch.tensor(hospital_ids, dtype=torch.long)
        
        return X_tensor, y_tensor, pids_tensor, hids_tensor

    @staticmethod
    def to_dataset(
        X: torch.Tensor,
        y: torch.Tensor,
        pids: torch.Tensor,
        hids: torch.Tensor
    ) -> torch.utils.data.TensorDataset:
        """
        Wraps tensors in a PyTorch TensorDataset.
        """
        return torch.utils.data.TensorDataset(X, y, pids, hids)
