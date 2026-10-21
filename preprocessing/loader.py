import os
import glob
import pandas as pd
import numpy as np
import logging
from typing import List, Dict, Any, Optional, Tuple
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Expected 41 columns in PhysioNet 2019 dataset
EXPECTED_COLUMNS = [
    'HR', 'O2Sat', 'Temp', 'SBP', 'MAP', 'DBP', 'Resp', 'EtCO2',
    'BaseExcess', 'HCO3', 'FiO2', 'pH', 'PaCO2', 'SaO2', 'AST', 'BUN',
    'Alkalinephos', 'Calcium', 'Chloride', 'Creatinine', 'Bilirubin_direct',
    'Glucose', 'Lactate', 'Magnesium', 'Phosphate', 'Potassium',
    'Bilirubin_total', 'TroponinI', 'Hct', 'Hgb', 'PTT', 'WBC',
    'Fibrinogen', 'Platelets', 'Age', 'Gender', 'Unit1', 'Unit2',
    'HospAdmTime', 'ICULOS', 'SepsisLabel'
]

def load_single_patient(file_path: str, hospital_id: int) -> Optional[Dict[str, Any]]:
    """
    Loads a single patient's PSV file and validates its schema.
    
    Args:
        file_path (str): Absolute path to the patient file.
        hospital_id (int): ID representing the hospital source (e.g. 0 for Set A, 1 for Set B).
        
    Returns:
        Optional[Dict[str, Any]]: Dictionary containing raw dataframe, patient_id, 
                                  and hospital_id if valid. Returns None if invalid or corrupt.
    """
    try:
        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            logger.warning(f"File empty or missing: {file_path}")
            return None
        
        # Read PSV file
        df = pd.read_csv(file_path, sep='|')
        
        # Validate columns
        missing_cols = [col for col in EXPECTED_COLUMNS if col not in df.columns]
        if missing_cols:
            logger.warning(f"File {file_path} is missing required columns: {missing_cols}")
            return None
            
        patient_id = os.path.basename(file_path).replace('.psv', '')
        
        return {
            'df': df[EXPECTED_COLUMNS],  # Ensure exact columns and ordering
            'patient_id': patient_id,
            'hospital_id': hospital_id
        }
        
    except Exception as e:
        logger.error(f"Error reading file {file_path}: {str(e)}")
        return None

def load_hospital_dataset(
    data_dir: str, 
    hospital_id: int, 
    max_workers: int = 8
) -> List[Dict[str, Any]]:
    """
    Loads all patient PSV files in a given hospital directory.
    Uses ThreadPoolExecutor to speed up directory loading on Windows.
    
    Args:
        data_dir (str): Directory containing patient .psv files.
        hospital_id (int): Hospital ID assigned to these patients.
        max_workers (int): Number of worker threads for parallel file loading.
        
    Returns:
        List[Dict[str, Any]]: List of valid patient dictionaries.
    """
    if not os.path.isdir(data_dir):
        logger.error(f"Directory not found: {data_dir}")
        return []
        
    # Discover all files in the directory and filter strictly
    all_files = glob.glob(os.path.join(data_dir, "*"))
    file_paths = []
    for fpath in all_files:
        fname = os.path.basename(fpath)
        # Strict validation: must be a file, end with .psv, not start with '.' (covers macOS metadata),
        # and start with 'p' (matches PhysioNet patient file convention)
        if os.path.isfile(fpath) and fname.endswith(".psv") and not fname.startswith(".") and fname.startswith("p"):
            file_paths.append(fpath)
            
    file_paths = sorted(file_paths)
    logger.info(f"Scanning {data_dir} - Found {len(file_paths)} valid patient files.")
    
    valid_patients = []
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        futures = {
            executor.submit(load_single_patient, fpath, hospital_id): fpath 
            for fpath in file_paths
        }
        
        # Process results with progress bar
        for future in tqdm(as_completed(futures), total=len(file_paths), desc=f"Loading Hospital {hospital_id}"):
            res = future.result()
            if res is not None:
                valid_patients.append(res)
                
    logger.info(f"Successfully loaded {len(valid_patients)} / {len(file_paths)} patient files.")
    return valid_patients
