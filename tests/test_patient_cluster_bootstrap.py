"""
Unit tests for Genuine Patient-Level Cluster Bootstrap and Sample Count Reconciliation.
"""

import os
import sys
import json
import unittest
import numpy as np
import torch

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from federated.evaluation.patient_cluster_bootstrap import (
    patient_level_cluster_bootstrap,
    paired_patient_cluster_bootstrap
)
from federated.experiments.run_master_experiments import StratifiedSepsisDataset
from federated.utils.helpers import set_seed, load_config, split_non_iid_dataset

class TestPatientClusterBootstrap(unittest.TestCase):

    def setUp(self):
        set_seed(42)
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.data_dir = os.path.join(self.base_dir, "datasets", "processed")
        
    def test_bootstrap_logic_and_clustering(self):
        """Verifies that patient clusters preserve all windows and handle repeat sampling."""
        # 10 patients, each having 3 windows
        patient_ids = np.repeat(np.arange(10), 3)
        # 2 patients positive, 8 negative
        y_true = np.zeros(30, dtype=int)
        y_true[patient_ids == 0] = 1
        y_true[patient_ids == 1] = 1
        
        # Simulated probabilities
        y_probs = np.linspace(0.1, 0.9, 30)
        
        res = patient_level_cluster_bootstrap(
            patient_ids=patient_ids,
            y_true=y_true,
            y_probs=y_probs,
            B=100,
            seed=42
        )
        
        self.assertEqual(res["unique_patients_M"], 10)
        self.assertEqual(res["sample_size_windows"], 30)
        self.assertEqual(res["n_pos_windows"], 6)
        self.assertEqual(res["n_neg_windows"], 24)
        self.assertGreaterEqual(res["ci_95"][0], 0.0)
        self.assertLessEqual(res["ci_95"][1], 1.0)
        self.assertLessEqual(res["ci_95"][0], res["ci_95"][1])

    def test_bootstrap_reproducibility(self):
        """Verifies that the random seed guarantees exact bit-for-bit reproducibility."""
        rng = np.random.RandomState(123)
        patient_ids = rng.choice(50, size=200)
        y_true = (rng.rand(200) < 0.2).astype(int)
        y_probs = rng.rand(200)
        
        res1 = patient_level_cluster_bootstrap(patient_ids, y_true, y_probs, B=100, seed=42)
        res2 = patient_level_cluster_bootstrap(patient_ids, y_true, y_probs, B=100, seed=42)
        
        self.assertEqual(res1["ci_95"], res2["ci_95"])
        self.assertEqual(res1["standard_error"], res2["standard_error"])

    def test_single_class_replicate_handling(self):
        """Verifies that single-class replicates are handled without crashing."""
        # Cohort where positive cases are very rare so single-class draws could happen
        patient_ids = np.repeat(np.arange(20), 2)
        y_true = np.zeros(40, dtype=int)
        y_true[patient_ids == 0] = 1 # Only patient 0 is positive
        y_probs = np.random.RandomState(42).rand(40)
        
        res = patient_level_cluster_bootstrap(patient_ids, y_true, y_probs, B=50, seed=42)
        self.assertEqual(res["replicates_computed"], 50)
        self.assertIn("single_class_replicates_discarded", res)

    def test_paired_bootstrap_comparison(self):
        """Verifies paired comparison correctly detects significant differences."""
        rng = np.random.RandomState(42)
        patient_ids = np.repeat(np.arange(100), 5) # 500 windows, 100 patients
        y_true = np.zeros(500, dtype=int)
        pos_patients = rng.choice(100, size=15, replace=False)
        for p in pos_patients:
            y_true[patient_ids == p] = 1
            
        # Model A is strong
        y_probs_A = np.clip(y_true * 0.7 + rng.normal(0, 0.2, 500), 0, 1)
        # Model B is weak
        y_probs_B = rng.rand(500)
        
        paired = paired_patient_cluster_bootstrap(
            patient_ids, y_true, y_probs_A, y_probs_B,
            name_A="Strong", name_B="Weak", B=100, seed=42
        )
        
        self.assertGreater(paired["point_delta"], 0.2)
        self.assertGreater(paired["delta_95ci"][0], 0.0)
        self.assertTrue(paired["statistically_significant_at_05"])

    def test_15k_global_pooled_sample_reconciliation(self):
        """Reconciles exact window, positive, negative, and patient counts for global pooled test set."""
        test_path = os.path.join(self.data_dir, "test.pt")
        if not os.path.exists(test_path):
            self.skipTest("datasets/processed/test.pt not available")
            
        global_test = torch.load(test_path, map_location="cpu")
        ds_global = StratifiedSepsisDataset(global_test, max_samples=15000, seed=42)
        
        y = ds_global.labels.numpy().flatten()
        pids = ds_global.patient_ids.numpy().flatten() if hasattr(ds_global.patient_ids, 'numpy') else np.array(ds_global.patient_ids)
        
        # Window counts
        self.assertEqual(len(y), 15000)
        self.assertEqual(int(np.sum(y == 1)), 387)
        self.assertEqual(int(np.sum(y == 0)), 14613)
        self.assertAlmostEqual(np.mean(y), 0.0258, places=4)
        
        # Patient counts
        pos_pids = set(pids[y == 1])
        neg_pids = set(pids[y == 0])
        both_pids = pos_pids.intersection(neg_pids)
        all_pids = set(pids)
        
        self.assertEqual(len(all_pids), 4207)
        self.assertEqual(len(pos_pids), 236)
        self.assertEqual(len(neg_pids), 4144)
        self.assertEqual(len(both_pids), 173)
        self.assertEqual(len(pos_pids) + len(neg_pids) - len(both_pids), 4207)

    def test_15k_federated_client_sample_reconciliation(self):
        """Reconciles exact window, positive, negative, and patient counts for federated client test sets."""
        test_path = os.path.join(self.data_dir, "test.pt")
        meta_path = os.path.join(self.data_dir, "preprocessing_metadata.json")
        scaler_path = os.path.join(self.data_dir, "scaler.pkl")
        
        if not (os.path.exists(test_path) and os.path.exists(meta_path) and os.path.exists(scaler_path)):
            self.skipTest("Processed dataset files not available")
            
        global_test = torch.load(test_path, map_location="cpu")
        with open(meta_path, 'r') as f:
            meta = json.load(f)
            
        test_splits = split_non_iid_dataset(global_test, scaler_path, meta['feature_columns'])
        
        fed_y = []
        fed_pids = []
        client_stats = []
        for cid in range(3):
            c_ds = StratifiedSepsisDataset(test_splits[cid], max_samples=5000, seed=42)
            cy = c_ds.labels.numpy().flatten()
            cpids = c_ds.patient_ids.numpy().flatten() if hasattr(c_ds.patient_ids, 'numpy') else np.array(c_ds.patient_ids)
            fed_y.extend(cy)
            fed_pids.extend(cpids)
            client_stats.append({
                "cid": cid,
                "n": len(cy),
                "pos": int(np.sum(cy == 1)),
                "neg": int(np.sum(cy == 0)),
                "patients": len(set(cpids))
            })
            
        fed_y = np.array(fed_y)
        fed_pids = np.array(fed_pids)
        
        # Verify per-client breakdown
        self.assertEqual(client_stats[0], {"cid": 0, "n": 5000, "pos": 144, "neg": 4856, "patients": 925})
        self.assertEqual(client_stats[1], {"cid": 1, "n": 5000, "pos": 163, "neg": 4837, "patients": 1343})
        self.assertEqual(client_stats[2], {"cid": 2, "n": 5000, "pos": 101, "neg": 4899, "patients": 1859})
        
        # Verify aggregated federated sample
        self.assertEqual(len(fed_y), 15000)
        self.assertEqual(int(np.sum(fed_y == 1)), 408)
        self.assertEqual(int(np.sum(fed_y == 0)), 14592)
        self.assertAlmostEqual(np.mean(fed_y), 0.0272, places=4)
        
        # Patient counts
        pos_pids = set(fed_pids[fed_y == 1])
        neg_pids = set(fed_pids[fed_y == 0])
        both_pids = pos_pids.intersection(neg_pids)
        all_pids = set(fed_pids)
        
        self.assertEqual(len(all_pids), 4127)
        self.assertEqual(len(pos_pids), 231)
        self.assertEqual(len(neg_pids), 4062)
        self.assertEqual(len(both_pids), 166)
        self.assertEqual(len(pos_pids) + len(neg_pids) - len(both_pids), 4127)

    def test_data_alignment_mismatched_lengths(self):
        """Verifies that mismatched array lengths raise ValueError in bootstrap functions."""
        pids = np.array([1, 1, 2, 2])
        y_true = np.array([0, 1, 0, 1])
        y_probs_short = np.array([0.2, 0.8, 0.3]) # length 3 != 4
        y_probs = np.array([0.2, 0.8, 0.3, 0.7])
        
        with self.assertRaises(ValueError):
            patient_level_cluster_bootstrap(pids, y_true, y_probs_short, B=50)
            
        with self.assertRaises(ValueError):
            paired_patient_cluster_bootstrap(pids, y_true, y_probs, y_probs_short, B=50)

    def test_degenerate_single_class_ground_truth(self):
        """Verifies that all-negative or all-positive ground truth raises ValueError."""
        pids = np.array([1, 1, 2, 2])
        y_all_zero = np.array([0, 0, 0, 0])
        y_probs = np.array([0.1, 0.2, 0.3, 0.4])
        
        with self.assertRaises(ValueError):
            patient_level_cluster_bootstrap(pids, y_all_zero, y_probs, B=50)
            
        with self.assertRaises(ValueError):
            paired_patient_cluster_bootstrap(pids, y_all_zero, y_probs, y_probs, B=50)

    def test_paired_bootstrap_identical_predictions(self):
        """Verifies that comparing a model against itself yields point_delta = 0 and p_value = 1.0."""
        rng = np.random.RandomState(42)
        pids = np.repeat(np.arange(30), 4)
        y_true = (rng.rand(120) < 0.25).astype(int)
        y_probs = rng.rand(120)
        
        paired = paired_patient_cluster_bootstrap(
            pids, y_true, y_probs, y_probs,
            name_A="Model_Self", name_B="Model_Self",
            B=100, seed=42
        )
        self.assertEqual(paired["point_delta"], 0.0)
        self.assertEqual(paired["empirical_p_value"], 1.0)
        self.assertFalse(paired["statistically_significant_at_05"])
        self.assertEqual(paired["delta_95ci"], [0.0, 0.0])

    def test_saved_predictions_artifact_integrity(self):
        """Verifies that benchmark_predictions.pt exists, has all models, and valid probabilities."""
        pred_path = os.path.join(self.base_dir, "federated", "results", "benchmark_predictions.pt")
        if not os.path.exists(pred_path):
            self.skipTest("benchmark_predictions.pt not found")
            
        preds = torch.load(pred_path, map_location="cpu", weights_only=False)
        expected_models = [
            "Centralized", "Local-Only", "FedAvg", "FedProx", "Ditto", "FPDAF-v1", "FPDAF-v2 (Proposed)"
        ]
        for m in expected_models:
            self.assertIn(m, preds, f"Missing model {m} in benchmark_predictions.pt")
            d = preds[m]
            yt = np.array(d["y_true"])
            yp = np.array(d["y_probs"])
            pids = np.array(d["patient_ids"])
            
            self.assertEqual(len(yt), 15000, f"Model {m} does not have 15,000 predictions")
            self.assertEqual(len(yp), 15000)
            self.assertEqual(len(pids), 15000)
            self.assertTrue(np.all((yp >= 0.0) & (yp <= 1.0)), f"Model {m} probabilities out of bounds [0, 1]")
            self.assertIn(int(yt.sum()), [387, 408], f"Model {m} positive count unexpected: {yt.sum()}")

if __name__ == "__main__":
    unittest.main()
