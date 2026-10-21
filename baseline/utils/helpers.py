import os
import random
import logging
import torch
import numpy as np
import yaml

def set_seed(seed: int = 42):
    """
    Sets random seeds for python, numpy, and pytorch to ensure full reproducibility.
    """
    random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    
    # Configure CuDNN backend for deterministic results
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

def load_config(config_path: str) -> dict:
    """
    Loads configuration settings from a YAML file.
    """
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found at: {config_path}")
        
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
        
    return config

def setup_logging(log_dir: str, log_filename: str = "train.log") -> logging.Logger:
    """
    Configures centralized logging system to output to both console and log file.
    """
    os.makedirs(log_dir, exist_ok=True)
    log_filepath = os.path.join(log_dir, log_filename)
    
    # Clear existing handlers
    logger = logging.getLogger("baseline")
    logger.setLevel(logging.INFO)
    logger.handlers = []
    
    # Format
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    
    # File handler
    file_handler = logging.FileHandler(log_filepath, mode='w')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger

def get_device(requested_device: str = "cuda") -> torch.device:
    """
    Selects the optimal hardware device (CUDA, Apple MPS, or CPU fallback).
    """
    if requested_device == "cuda" and torch.cuda.is_available():
        device = torch.device("cuda")
    elif torch.backends.mps.is_available():
        # Apple silicon acceleration fallback
        device = torch.device("mps")
    else:
        device = torch.device("cpu")
        
    return device
