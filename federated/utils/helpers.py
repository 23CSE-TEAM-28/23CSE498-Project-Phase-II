import os
import random
import logging
import torch
import numpy as np
import yaml
import joblib

# Set up logging helper
logger = logging.getLogger("federated.utils")

def set_seed(seed: int = 42):
    """Sets random seeds for full reproducibility."""
    random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

def load_config(config_path: str) -> dict:
    """Loads configuration from YAML file."""
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found at: {config_path}")
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    return config

def setup_logging(log_dir: str, log_filename: str = "federated.log") -> logging.Logger:
    """Configures centralized logging system to output to console and file."""
    os.makedirs(log_dir, exist_ok=True)
    log_filepath = os.path.join(log_dir, log_filename)
    
    # Set root logger for federated scope
    root_logger = logging.getLogger("federated")
    root_logger.setLevel(logging.INFO)
    root_logger.handlers = []
    
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    
    # File handler
    file_handler = logging.FileHandler(log_filepath, mode='w')
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)
    
    # Console stream handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    return root_logger

def get_device(requested_device: str = "cuda") -> torch.device:
    """Selects the best available computational hardware device."""
    if requested_device == "cuda" and torch.cuda.is_available():
        return torch.device("cuda")
    elif torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")

def split_non_iid_dataset(
    data_dict: dict, 
    scaler_path: str,
    feature_columns: list,
    age_threshold: float = 60.0
) -> list:
    """
    Partitions a processed dataset dictionary into 3 distinct Non-IID client datasets
    based on age demographics and hospital system source.
    
    Client 0: Hospital 0, patients aged < 60
    Client 1: Hospital 0, patients aged >= 60 (demographic shift)
    Client 2: Hospital 1, all patients (institutional shift)
    
    Args:
        data_dict (dict): Loaded dataset dictionary containing 'features', 'labels', etc.
        scaler_path (str): Path to standard scaler.pkl to extract scale of 'Age' feature.
        feature_columns (list): List of feature names.
        age_threshold (float): Raw Age boundary for splitting.
        
    Returns:
        list: List of 3 client dictionaries containing partitioned Tensors.
    """
    features = data_dict['features']
    labels = data_dict['labels']
    patient_ids = data_dict['patient_ids']
    hospital_ids = data_dict['hospital_ids']
    
    # 1. Unscale Age threshold to filter scaled features
    if not os.path.exists(scaler_path):
        raise FileNotFoundError(f"Scaler pkl not found at: {scaler_path}")
        
    scaler = joblib.load(scaler_path)
    age_idx = feature_columns.index("Age")
    
    age_mean = scaler.mean_[age_idx]
    age_std = scaler.scale_[age_idx]
    
    # Convert threshold age (e.g. 60) to scaled coordinate
    scaled_age_threshold = (age_threshold - age_mean) / age_std
    
    # Extract age values from the last time step of each sequence window
    ages = features[:, -1, age_idx]
    
    # 2. Define conditional masks for each client
    # Client 0: Hospital 0 and age < 60
    mask_0 = (hospital_ids == 0) & (ages < scaled_age_threshold)
    # Client 1: Hospital 0 and age >= 60
    mask_1 = (hospital_ids == 0) & (ages >= scaled_age_threshold)
    # Client 2: Hospital 1 (all ages)
    mask_2 = (hospital_ids == 1)
    
    masks = [mask_0, mask_1, mask_2]
    client_splits = []
    
    for i, mask in enumerate(masks):
        client_splits.append({
            'features': features[mask],
            'labels': labels[mask],
            'patient_ids': patient_ids[mask],
            'hospital_ids': hospital_ids[mask]
        })
        logger.info(
            f"Client {i} split stats: samples={client_splits[-1]['features'].shape[0]}, "
            f"sepsis_rate={float(client_splits[-1]['labels'].sum() / len(client_splits[-1]['labels'])*100):.2f}%"
        )
        
    return client_splits
