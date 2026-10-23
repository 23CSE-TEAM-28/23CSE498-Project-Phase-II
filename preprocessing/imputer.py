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
    def __init__(self, feature_columns: List[str], median_dict: dict = None):
        """
        Args:
            feature_columns (List[str]): Columns representing clinical features to impute.
            median_dict (dict, optional): Population median values computed on the train set.
        """
        self.feature_columns = feature_columns
        self.median_dict = median_dict or {}

    def impute_patient(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Imputes missing values in a single patient's dataframe without temporal leakage:
        1. Forward Fill (ffill): Propagate last known value forward in time.
        2. Population Baseline Fill: Fill early values prior to first observation with training medians (or 0.0).
        Backward filling (bfill) is strictly avoided to prevent future-to-past leakage.
        """
        df_imputed = df.copy()
        features_df = df_imputed[self.feature_columns].copy()
        
        # 1. Forward Fill (strictly causal)
        features_df = features_df.ffill()
        
        # 2. Baseline Fill using training medians (if provided) or zero
        if self.median_dict:
            features_df = features_df.fillna(value=self.median_dict)
            
        # 3. Zero Fill any remaining NaNs
        features_df = features_df.fillna(0.0)
        
        df_imputed[self.feature_columns] = features_df
        return df_imputed
