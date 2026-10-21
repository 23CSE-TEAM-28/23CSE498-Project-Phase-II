import os
import joblib
import pandas as pd
import numpy as np
from typing import List
from sklearn.preprocessing import StandardScaler

class ICUFeatureScaler:
    """
    Standardizes numerical clinical features using scikit-learn's StandardScaler.
    Ensures SepsisLabel and other metadata are excluded from scaling.
    """
    def __init__(self, feature_columns: List[str]):
        """
        Args:
            feature_columns (List[str]): Numerical clinical feature names to scale.
        """
        self.feature_columns = feature_columns
        self.scaler = StandardScaler()

    def fit(self, patients_list: List[dict]):
        """
        Fits the scaler on all clinical features from a list of patient dictionaries.
        
        Args:
            patients_list (List[dict]): List of loaded patient dictionaries (must be the train split).
        """
        # Collect and concatenate all clinical features across training patients
        all_features = []
        for p in patients_list:
            all_features.append(p['df'][self.feature_columns].values)
            
        if not all_features:
            raise ValueError("No patients data passed to fit the scaler.")
            
        combined_features = np.vstack(all_features)
        
        # Fit scaler
        self.scaler.fit(combined_features)

    def transform_patient(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Transforms clinical features in a patient's dataframe using the fitted scaler.
        
        Args:
            df (pd.DataFrame): Patient dataframe.
            
        Returns:
            pd.DataFrame: Scaled patient dataframe.
        """
        df_scaled = df.copy()
        features = df_scaled[self.feature_columns].values
        scaled_features = self.scaler.transform(features)
        df_scaled[self.feature_columns] = scaled_features
        return df_scaled

    def save(self, save_path: str):
        """Saves the scaler to a file."""
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        joblib.dump(self.scaler, save_path)

    def load(self, load_path: str):
        """Loads a saved scaler from file."""
        self.scaler = joblib.load(load_path)
