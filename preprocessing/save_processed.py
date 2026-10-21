import os
import sys
import json
import random
import torch
import logging
from typing import List, Dict, Any, Tuple
from tqdm import tqdm

# Add parent directory to sys.path so we can import config and other modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config
from preprocessing.loader import load_hospital_dataset, EXPECTED_COLUMNS
from preprocessing.imputer import ICUDataImputer
from preprocessing.scaler import ICUFeatureScaler
from preprocessing.window_generator import ICUWindowGenerator
from preprocessing.tensor_converter import ICUTensorConverter

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Clinical features are all columns except the target label (SepsisLabel)
CLINICAL_FEATURES = [col for col in EXPECTED_COLUMNS if col != config.LABEL_COLUMN]

def split_patients(
    patients: List[Dict[str, Any]], 
    train_ratio: float = 0.70, 
    val_ratio: float = 0.15,
    seed: int = 42
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Splits patient list into train, validation, and test sets.
    
    Args:
        patients (List[Dict[str, Any]]): List of patient dictionaries.
        train_ratio (float): Ratio of train patients.
        val_ratio (float): Ratio of validation patients.
        seed (int): Random seed for reproducibility.
        
    Returns:
        Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]: splits.
    """
    # Create a copy and shuffle with fixed seed
    patients_copy = list(patients)
    random.seed(seed)
    random.shuffle(patients_copy)
    
    n = len(patients_copy)
    train_idx = int(n * train_ratio)
    val_idx = int(n * (train_ratio + val_ratio))
    
    train_split = patients_copy[:train_idx]
    val_split = patients_copy[train_idx:val_idx]
    test_split = patients_copy[val_idx:]
    
    return train_split, val_split, test_split

def count_class_distribution(patients: List[Dict[str, Any]]) -> Dict[str, int]:
    """Counts number of sepsis-positive and sepsis-negative patients in a list."""
    sepsis_pos = sum(1 for p in patients if p['df'][config.LABEL_COLUMN].max() == 1)
    sepsis_neg = len(patients) - sepsis_pos
    return {'positive': sepsis_pos, 'negative': sepsis_neg}

def main():
    logger.info("=== FPDAF Phase-II Preprocessing Pipeline Initialized ===")
    
    # ─────────────────────────────────────────────────────────────
    # 1. LOAD DATASETS
    # ─────────────────────────────────────────────────────────────
    logger.info("Loading training_setA (Hospital 0)...")
    patients_a = load_hospital_dataset(config.TRAINING_SET_A, hospital_id=0)
    
    logger.info("Loading training_setB (Hospital 1)...")
    patients_b = load_hospital_dataset(config.TRAINING_SET_B, hospital_id=1)
    
    all_patients = patients_a + patients_b
    if not all_patients:
        logger.error("No patient records loaded. Verify raw dataset paths in config.py.")
        sys.exit(1)
        
    logger.info(f"Loaded {len(all_patients)} total patient records.")
    
    # Create patient ID to unique integer index mapping
    patient_id_map = {p['patient_id']: idx for idx, p in enumerate(all_patients)}
    
    # ─────────────────────────────────────────────────────────────
    # 2. PATIENT-LEVEL SPLIT (Stratified by Hospital source)
    # ─────────────────────────────────────────────────────────────
    logger.info("Performing patient-level split (70% Train, 15% Val, 15% Test) stratified by Hospital...")
    
    train_a, val_a, test_a = split_patients(patients_a, seed=42)
    train_b, val_b, test_b = split_patients(patients_b, seed=42)
    
    train_patients = train_a + train_b
    val_patients = val_a + val_b
    test_patients = test_a + test_b
    
    logger.info(f"Splits generated:")
    logger.info(f"  ├── Train:      {len(train_patients)} patients (A: {len(train_a)}, B: {len(train_b)})")
    logger.info(f"  ├── Validation: {len(val_patients)} patients (A: {len(val_a)}, B: {len(val_b)})")
    logger.info(f"  └── Test:       {len(test_patients)} patients (A: {len(test_a)}, B: {len(test_b)})")
    
    # Calculate sepsis statistics
    train_dist = count_class_distribution(train_patients)
    val_dist = count_class_distribution(val_patients)
    test_dist = count_class_distribution(test_patients)
    
    logger.info(f"Sepsis class distribution (Patient-Level):")
    logger.info(f"  ├── Train:      Pos={train_dist['positive']}, Neg={train_dist['negative']}")
    logger.info(f"  ├── Validation: Pos={val_dist['positive']}, Neg={val_dist['negative']}")
    logger.info(f"  └── Test:       Pos={test_dist['positive']}, Neg={test_dist['negative']}")
    
    # ─────────────────────────────────────────────────────────────
    # 3. MISSING VALUE IMPUTATION
    # ─────────────────────────────────────────────────────────────
    logger.info("Imputing missing values (Forward Fill -> Backward Fill -> Zero Padding)...")
    imputer = ICUDataImputer(feature_columns=CLINICAL_FEATURES)
    
    # Impute patient dataframes in place in the list copies
    for p in tqdm(train_patients, desc="Imputing Train"):
        p['df'] = imputer.impute_patient(p['df'])
    for p in tqdm(val_patients, desc="Imputing Validation"):
        p['df'] = imputer.impute_patient(p['df'])
    for p in tqdm(test_patients, desc="Imputing Test"):
        p['df'] = imputer.impute_patient(p['df'])
        
    # ─────────────────────────────────────────────────────────────
    # 4. FEATURE STANDARDIZATION
    # ─────────────────────────────────────────────────────────────
    logger.info("Standardizing clinical features (StandardScaler fit ONLY on Train split)...")
    scaler = ICUFeatureScaler(feature_columns=CLINICAL_FEATURES)
    
    # Fit scaler using train split only
    scaler.fit(train_patients)
    
    # Save the fitted scaler
    scaler_save_path = os.path.join(config.DATASET_PROCESSED_DIR, "scaler.pkl")
    scaler.save(scaler_save_path)
    logger.info(f"Saved fitted scaler to {scaler_save_path}")
    
    # Transform all splits using the fitted scaler
    for p in tqdm(train_patients, desc="Scaling Train"):
        p['df'] = scaler.transform_patient(p['df'])
    for p in tqdm(val_patients, desc="Scaling Validation"):
        p['df'] = scaler.transform_patient(p['df'])
    for p in tqdm(test_patients, desc="Scaling Test"):
        p['df'] = scaler.transform_patient(p['df'])
        
    # ─────────────────────────────────────────────────────────────
    # 5. SLIDING WINDOW GENERATION
    # ─────────────────────────────────────────────────────────────
    logger.info(f"Generating sliding windows (SEQUENCE_LENGTH={config.SEQUENCE_LENGTH})...")
    window_gen = ICUWindowGenerator(
        sequence_length=config.SEQUENCE_LENGTH,
        feature_columns=CLINICAL_FEATURES,
        label_column=config.LABEL_COLUMN
    )
    
    X_train, y_train, pids_train, hids_train = window_gen.generate_all_windows(train_patients, patient_id_map)
    X_val, y_val, pids_val, hids_val = window_gen.generate_all_windows(val_patients, patient_id_map)
    X_test, y_test, pids_test, hids_test = window_gen.generate_all_windows(test_patients, patient_id_map)
    
    logger.info(f"Sliding windows generated:")
    logger.info(f"  ├── Train:      {X_train.shape[0]} windows, shape={X_train.shape}")
    logger.info(f"  ├── Validation: {X_val.shape[0]} windows, shape={X_val.shape}")
    logger.info(f"  └── Test:       {X_test.shape[0]} windows, shape={X_test.shape}")
    
    # Calculate sepsis rate at window-level
    train_sepsis_windows = int(y_train.sum())
    val_sepsis_windows = int(y_val.sum())
    test_sepsis_windows = int(y_test.sum())
    
    logger.info(f"Sepsis class distribution (Window-Level):")
    logger.info(f"  ├── Train:      Pos={train_sepsis_windows} ({train_sepsis_windows/len(y_train)*100:.2f}%)")
    logger.info(f"  ├── Validation: Pos={val_sepsis_windows} ({val_sepsis_windows/len(y_val)*100:.2f}%)")
    logger.info(f"  └── Test:       Pos={test_sepsis_windows} ({test_sepsis_windows/len(y_test)*100:.2f}%)")
    
    # ─────────────────────────────────────────────────────────────
    # 6. PYTORCH TENSOR CONVERSION & SAVE
    # ─────────────────────────────────────────────────────────────
    logger.info("Converting arrays to PyTorch tensors...")
    
    # Convert and wrap
    train_tensors = ICUTensorConverter.to_tensors(X_train, y_train, pids_train, hids_train)
    val_tensors = ICUTensorConverter.to_tensors(X_val, y_val, pids_val, hids_val)
    test_tensors = ICUTensorConverter.to_tensors(X_test, y_test, pids_test, hids_test)
    
    # Save datasets
    os.makedirs(config.DATASET_PROCESSED_DIR, exist_ok=True)
    
    train_dict = {
        'features': train_tensors[0],
        'labels': train_tensors[1],
        'patient_ids': train_tensors[2],
        'hospital_ids': train_tensors[3]
    }
    val_dict = {
        'features': val_tensors[0],
        'labels': val_tensors[1],
        'patient_ids': val_tensors[2],
        'hospital_ids': val_tensors[3]
    }
    test_dict = {
        'features': test_tensors[0],
        'labels': test_tensors[1],
        'patient_ids': test_tensors[2],
        'hospital_ids': test_tensors[3]
    }
    
    torch.save(train_dict, os.path.join(config.DATASET_PROCESSED_DIR, "train.pt"))
    torch.save(val_dict, os.path.join(config.DATASET_PROCESSED_DIR, "validation.pt"))
    torch.save(test_dict, os.path.join(config.DATASET_PROCESSED_DIR, "test.pt"))
    logger.info(f"Saved PyTorch datasets to {config.DATASET_PROCESSED_DIR}")
    
    # ─────────────────────────────────────────────────────────────
    # 7. PREPROCESSING METADATA
    # ─────────────────────────────────────────────────────────────
    metadata = {
        'sequence_length': config.SEQUENCE_LENGTH,
        'feature_columns': CLINICAL_FEATURES,
        'label_column': config.LABEL_COLUMN,
        'splits': {
            'train': {
                'patients': len(train_patients),
                'sepsis_patients_pos': train_dist['positive'],
                'sepsis_patients_neg': train_dist['negative'],
                'windows': X_train.shape[0],
                'sepsis_windows_pos': train_sepsis_windows,
                'sepsis_windows_neg': X_train.shape[0] - train_sepsis_windows
            },
            'validation': {
                'patients': len(val_patients),
                'sepsis_patients_pos': val_dist['positive'],
                'sepsis_patients_neg': val_dist['negative'],
                'windows': X_val.shape[0],
                'sepsis_windows_pos': val_sepsis_windows,
                'sepsis_windows_neg': X_val.shape[0] - val_sepsis_windows
            },
            'test': {
                'patients': len(test_patients),
                'sepsis_patients_pos': test_dist['positive'],
                'sepsis_patients_neg': test_dist['negative'],
                'windows': X_test.shape[0],
                'sepsis_windows_pos': test_sepsis_windows,
                'sepsis_windows_neg': X_test.shape[0] - test_sepsis_windows
            }
        }
    }
    
    metadata_path = os.path.join(config.DATASET_PROCESSED_DIR, "preprocessing_metadata.json")
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=4)
    logger.info(f"Saved preprocessing metadata to {metadata_path}")
    
    logger.info("=== Preprocessing Pipeline Completed Successfully ===")

if __name__ == "__main__":
    main()
