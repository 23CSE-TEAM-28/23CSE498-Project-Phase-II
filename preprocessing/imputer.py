import pandas as pd
import numpy as np
from typing import List

class ICUDataImputer:
    """
    Implements clinical imputation for ICU time-series data:
    1. Forward Fill (ffill): Propagate last known value forward in time.
    2. Backward Fill (bfill): Fill early missing values with the first recorded value.
    3. Zero Fill (fillna(0)): Fill any remaining NaNs (e.g. if a test was never taken) with 0.
    """
    def __init__(self, feature_columns: List[str]):
        """
        Args:
            feature_columns (List[str]): Columns representing clinical features to impute.
        """
        self.feature_columns = feature_columns

    def impute_patient(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Imputes missing values in a single patient's dataframe.
        Preserves original rows and columns.
        
        Args:
            df (pd.DataFrame): Patient dataframe containing clinical features.
            
        Returns:
            pd.DataFrame: Imputed patient dataframe.
        """
        # Create a copy to prevent in-place modification warnings
        df_imputed = df.copy()
        
        # Select features to impute
        features_df = df_imputed[self.feature_columns]
        
        # 1. Forward Fill
        features_df = features_df.ffill()
        
        # 2. Backward Fill
        features_df = features_df.bfill()
        
        # 3. Zero Padding
        features_df = features_df.fillna(0.0)
        
        # Update columns in place
        df_imputed[self.feature_columns] = features_df
        
        return df_imputed
