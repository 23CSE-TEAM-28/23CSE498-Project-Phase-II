# Project Configuration
# 23CSE498 - Project Phase II
# FPDAF: Federated Personalized Drift-Aware Attention Framework

import os

# ===== Paths =====
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Dataset paths
DATASET_RAW_DIR = os.path.join(BASE_DIR, "datasets", "raw")
DATASET_PROCESSED_DIR = os.path.join(BASE_DIR, "datasets", "processed")
TRAINING_SET_A = os.path.join(DATASET_RAW_DIR, "training_setA")
TRAINING_SET_B = os.path.join(DATASET_RAW_DIR, "training_setB")

# Output paths
RESULTS_DIR = os.path.join(BASE_DIR, "results")
MODEL_SAVE_DIR = os.path.join(BASE_DIR, "models", "checkpoints")

# ===== Data Parameters =====
SEQUENCE_LENGTH = 24          # Sliding window size (hours)
NUM_FEATURES = 40             # PhysioNet 2019 feature columns (excluding SepsisLabel)
LABEL_COLUMN = "SepsisLabel"

# ===== Federated Learning Parameters =====
NUM_HOSPITALS = 3             # Number of simulated federated clients
FED_ROUNDS = 10               # Number of federated communication rounds
LOCAL_EPOCHS = 2              # Local training epochs per round

# ===== Model Parameters =====
HIDDEN_DIM = 64               # LSTM hidden dimension
ATTENTION_HEADS = 4           # Number of attention heads
LEARNING_RATE = 0.001
BATCH_SIZE = 32
DROPOUT = 0.3

# ===== CUSUM Drift Detection =====
CUSUM_THRESHOLD = 5.0         # CUSUM alarm threshold
CUSUM_DRIFT_MEAN = 0.5        # Expected drift magnitude
