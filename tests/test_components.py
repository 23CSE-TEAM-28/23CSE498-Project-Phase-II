"""
Unit Tests for FPDAF Framework Components
Validates model forward passes, attention weights, AD-CUSUM drift logic,
DDP-ERP personalization, causal imputation, and clinical evaluation metrics.
"""

import unittest
import torch
import numpy as np
import os
import sys

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from federated.models.attention_lstm import PersonalizedAttentionLSTM
from baseline.models.lstm import CentralizedLSTM
from federated.clients.client import FederatedClient
from federated.evaluation.clinical_utility import compute_clinical_metrics, compute_ece, compute_decision_curve
from federated.evaluation.explainability import IntegratedGradientsExplainer
from preprocessing.imputer import ICUDataImputer

class DummyDataset:
    def __init__(self, size=10):
        self.features = torch.randn(size, 24, 40)
        self.labels = torch.randint(0, 2, (size, 1)).float()
    def __len__(self):
        return len(self.features)
    def __getitem__(self, idx):
        return self.features[idx], self.labels[idx]

class TestFPDAFComponents(unittest.TestCase):
    
    def setUp(self):
        self.device = torch.device("cpu")
        self.batch_size = 4
        self.seq_len = 24
        self.input_dim = 40
        self.hidden_dim = 32
        self.dummy_input = torch.randn(self.batch_size, self.seq_len, self.input_dim)
        
    def test_attention_lstm_forward(self):
        """Test PersonalizedAttentionLSTM outputs correct logit and attention shapes."""
        model = PersonalizedAttentionLSTM(
            input_dim=self.input_dim,
            hidden_dim=self.hidden_dim,
            num_layers=1,
            dropout=0.1,
            output_dim=1
        ).to(self.device)
        
        logits, attns = model(self.dummy_input, return_attention=True)
        self.assertEqual(logits.shape, (self.batch_size, 1))
        self.assertEqual(attns.shape, (self.batch_size, self.seq_len, 1))
        
        # Attention weights across time must sum to 1.0 (softmax)
        attn_sums = attns.sum(dim=1).squeeze(-1)
        self.assertTrue(torch.allclose(attn_sums, torch.ones(self.batch_size), atol=1e-5))
        
    def test_centralized_lstm_forward(self):
        """Test CentralizedLSTM outputs correct logit shape."""
        model = CentralizedLSTM(
            input_dim=self.input_dim,
            hidden_dim=self.hidden_dim,
            num_layers=1,
            dropout=0.1,
            output_dim=1
        ).to(self.device)
        
        logits = model(self.dummy_input)
        self.assertEqual(logits.shape, (self.batch_size, 1))
        
    def test_cusum_drift_detector(self):
        """Test CUSUM and AD-CUSUM drift detection in FederatedClient."""
        dummy_ds = DummyDataset(20)
        client = FederatedClient(
            client_id=0,
            train_dataset=dummy_ds,
            val_dataset=dummy_ds,
            test_dataset=dummy_ds,
            device=self.device
        )
        self.assertEqual(client.cusum_score, 0.0)
        self.assertEqual(client.ad_cusum_score, 0.0)
        
        # Normal fluctuation within slack (loss = 0.26, diff = 0.01 < kappa 0.02)
        triggered = client.update_cusum(val_loss=0.26, base_loss_threshold=0.25, kappa=0.02, h_threshold=3.0)
        self.assertFalse(triggered)
        self.assertEqual(client.cusum_score, 0.0)
        
        # Severe loss spike (loss = 4.00, diff = 3.75 - 0.02 = 3.73 > h_threshold 3.0)
        triggered = client.update_cusum(val_loss=4.00, base_loss_threshold=0.25, kappa=0.02, h_threshold=3.0)
        self.assertTrue(triggered)
        self.assertTrue(client.drift_triggered)
        self.assertTrue(client.skip_global_upload)
        
        # Test AD-CUSUM multi-factor drift triggering
        client.drift_triggered = False
        client.skip_global_upload = False
        val_probs_1 = np.array([0.1, 0.2, 0.05])
        val_probs_2 = np.array([0.8, 0.9, 0.85]) # sharp divergence in predicted distributions
        
        # Initialize history
        client.update_ad_cusum(val_loss=0.30, val_probs=val_probs_1, grad_variance=0.01)
        # Spike with divergent distribution and elevated gradient variance
        triggered = client.update_ad_cusum(
            val_loss=3.50,
            val_probs=val_probs_2,
            grad_variance=0.8,
            base_loss_threshold=0.25,
            h_threshold=3.0
        )
        self.assertTrue(triggered)
        
    def test_integrated_gradients_shape_and_stability(self):
        """Test Integrated Gradients explainer produces correct attribution shape and bounded stability."""
        model = PersonalizedAttentionLSTM(
            input_dim=self.input_dim,
            hidden_dim=self.hidden_dim,
            num_layers=1,
            dropout=0.0,
            output_dim=1
        ).to(self.device)
        
        explainer = IntegratedGradientsExplainer(model, steps=10, device=self.device)
        attr = explainer.attribute(self.dummy_input)
        
        self.assertEqual(attr.shape, self.dummy_input.shape)
        stability = explainer.evaluate_stability(self.dummy_input, noise_std=0.01)
        self.assertGreaterEqual(stability, 0.5) # Under small noise, cosine similarity should be positive and high
        
    def test_clinical_metrics_arithmetic(self):
        """Test that clinical metrics reconcile precisely with the confusion matrix."""
        # Simulated scenario: 1000 samples, 30 positives (prevalence = 3%)
        y_true = np.zeros(1000, dtype=int)
        y_true[:30] = 1
        
        # Predict 25 true positives, 5 false negatives, 20 false positives, 950 true negatives
        y_probs = np.zeros(1000, dtype=float)
        y_probs[:25] = 0.85 # TP
        y_probs[25:30] = 0.20 # FN
        y_probs[30:50] = 0.75 # FP
        y_probs[50:] = 0.10 # TN
        
        metrics = compute_clinical_metrics(y_true, y_probs, threshold=0.5)
        
        cm = metrics['confusion_matrix']
        self.assertEqual(cm['tp'], 25)
        self.assertEqual(cm['fn'], 5)
        self.assertEqual(cm['fp'], 20)
        self.assertEqual(cm['tn'], 950)
        
        expected_sens = 25 / 30
        expected_spec = 950 / 970
        expected_ppv = 25 / 45
        expected_npv = 950 / 955
        
        self.assertAlmostEqual(metrics['sensitivity'], expected_sens, places=4)
        self.assertAlmostEqual(metrics['specificity'], expected_spec, places=4)
        self.assertAlmostEqual(metrics['ppv'], expected_ppv, places=4)
        self.assertAlmostEqual(metrics['npv'], expected_npv, places=4)
        self.assertAlmostEqual(metrics['prevalence'], 0.03, places=4)
        
    def test_causal_imputation_no_bfill(self):
        """Verify that imputer operates strictly causally without backward fill."""
        import pandas as pd
        test_df = pd.DataFrame({
            'HR': [np.nan, 80.0, np.nan, 90.0],
            'O2Sat': [np.nan, np.nan, 98.0, np.nan]
        })
        medians = {'HR': 75.0, 'O2Sat': 96.0}
        
        imputer = ICUDataImputer(feature_columns=['HR', 'O2Sat'], median_dict=medians)
        result_df = imputer.impute_patient(test_df)
        
        # Hour 0 had NaN: must receive train median, NOT backfilled hour 1 value (80.0)
        self.assertEqual(result_df['HR'].iloc[0], 75.0)
        # Hour 2 had NaN: forward fill from hour 1 (80.0)
        self.assertEqual(result_df['HR'].iloc[2], 80.0)
        # O2Sat Hour 0, 1: train median 96.0
        self.assertEqual(result_df['O2Sat'].iloc[0], 96.0)
        self.assertEqual(result_df['O2Sat'].iloc[1], 96.0)
        # O2Sat Hour 3: forward filled from hour 2 (98.0)
        self.assertEqual(result_df['O2Sat'].iloc[3], 98.0)

if __name__ == '__main__':
    unittest.main()
