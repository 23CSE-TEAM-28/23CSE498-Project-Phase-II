import numpy as np
import pandas as pd
from typing import List, Tuple, Dict, Any

class ICUWindowGenerator:
    """
    Generates fixed-length sliding windows from patient time-series data.
    """
    def __init__(self, sequence_length: int, feature_columns: List[str], label_column: str):
        """
        Args:
            sequence_length (int): Sliding window size (hours).
            feature_columns (List[str]): Columns representing clinical features.
            label_column (str): Name of the target column (SepsisLabel).
        """
        self.sequence_length = sequence_length
        self.feature_columns = feature_columns
        self.label_column = label_column

    def generate_patient_windows(
        self, 
        df: pd.DataFrame, 
        patient_idx: int, 
        hospital_id: int
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Generates sliding windows for a single patient.
        If ICU stay length T < sequence_length, the features are pre-padded with 0.0.
        
        Args:
            df (pd.DataFrame): Preprocessed patient dataframe.
            patient_idx (int): Integer-encoded patient ID.
            hospital_id (int): Hospital ID of the patient.
            
        Returns:
            Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
                - X_windows: shape (num_windows, sequence_length, num_features)
                - y_labels: shape (num_windows, 1)
                - patient_ids: shape (num_windows,)
                - hospital_ids: shape (num_windows,)
        """
        X = df[self.feature_columns].values
        y = df[self.label_column].values
        T, num_features = X.shape
        
        X_list = []
        y_list = []
        
        if T < self.sequence_length:
            # Pre-pad features with zeros and target labels with 0 (or original initial label)
            pad_len = self.sequence_length - T
            X_padded = np.pad(X, ((pad_len, 0), (0, 0)), mode='constant', constant_values=0.0)
            
            # Target is the sepsis status at the end of the patient's record (y[-1])
            X_list.append(X_padded)
            y_list.append(y[-1])
        else:
            # Generate sliding windows
            num_windows = T - self.sequence_length + 1
            for t in range(num_windows):
                window_x = X[t : t + self.sequence_length, :]
                window_y = y[t + self.sequence_length - 1]  # Target is the label at the end of the window
                
                X_list.append(window_x)
                y_list.append(window_y)
                
        X_windows = np.array(X_list, dtype=np.float32)
        y_labels = np.array(y_list, dtype=np.float32).reshape(-1, 1)
        
        num_generated = len(X_list)
        patient_ids = np.full((num_generated,), patient_idx, dtype=np.int64)
        hospital_ids = np.full((num_generated,), hospital_id, dtype=np.int64)
        
        return X_windows, y_labels, patient_ids, hospital_ids

    def generate_all_windows(
        self, 
        patients_list: List[Dict[str, Any]], 
        patient_id_map: Dict[str, int]
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Generates sliding windows for a list of patient dictionaries.
        
        Args:
            patients_list (List[Dict[str, Any]]): List of patient dictionaries containing dataframe, patient_id, and hospital_id.
            patient_id_map (Dict[str, int]): Mapping from string patient ID to unique integer ID.
            
        Returns:
            Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]: Combined features, labels, patient IDs, and hospital IDs.
        """
        all_X, all_y, all_pids, all_hids = [], [], [], []
        
        for p in patients_list:
            p_idx = patient_id_map[p['patient_id']]
            X_win, y_lbl, pids, hids = self.generate_patient_windows(p['df'], p_idx, p['hospital_id'])
            
            all_X.append(X_win)
            all_y.append(y_lbl)
            all_pids.append(pids)
            all_hids.append(hids)
            
        return (
            np.concatenate(all_X, axis=0),
            np.concatenate(all_y, axis=0),
            np.concatenate(all_pids, axis=0),
            np.concatenate(all_hids, axis=0)
        )
