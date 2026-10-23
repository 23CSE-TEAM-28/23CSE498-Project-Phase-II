"""
Unit Test Suite for External Cohort Pipeline, CSSP Uplink Suppression,
and Clinical Utility Suite (DCA, Thresholds, ECE).
"""

import os
import sys
import unittest
import numpy as np
import pandas as pd
import torch
import torch.nn as nn

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, base_dir)

from federated.evaluation.external_cohort_evaluation import ExternalTabularCohortDataset, FPDAF_40_FEATURES
from federated.evaluation.clinical_utility import find_optimal_thresholds, compute_decision_curve, compute_clinical_metrics
from federated.server.server import FederatedServer, compute_state_dict_bytes
from federated.clients.client import FederatedClient
from federated.models.attention_lstm import PersonalizedAttentionLSTM

class DummyDataset(torch.utils.data.Dataset):
    def __init__(self, n=50):
        self.features = torch.randn(n, 24, 40)
        self.labels = torch.randint(0, 2, (n, 1)).float()
    def __len__(self):
        return len(self.labels)
    def __getitem__(self, idx):
        return self.features[idx], self.labels[idx]

class TestExternalAndCSSP(unittest.TestCase):
    def setUp(self):
        self.device = torch.device('cpu')

    def test_external_dataset_adapter(self):
        """Test ExternalTabularCohortDataset shapes, feature mapping, and causal projection."""
        df_dummy = pd.DataFrame({
            'Heart_Rate': [80.0, 95.0, 110.0],
            'Temperature': [37.0, 38.5, 39.0],
            'BP_Systolic': [120.0, 100.0, 85.0],
            'BP_Diastolic': [80.0, 65.0, 50.0],
            'Respiratory_Rate': [16.0, 22.0, 28.0],
            'Oxygen': [98.0, 95.0, 91.0],
            'WBC_Count': [7.5, 12.0, 18.0],
            'Lactate_mmol_L': [1.2, 2.5, 4.2],
            'Platelet_Count': [250.0, 180.0, 95.0],
            'Sepsis_Flag': [0, 1, 1]
        })
        mapping = {
            'HR': 'Heart_Rate', 'Temp': 'Temperature', 'SBP': 'BP_Systolic',
            'DBP': 'BP_Diastolic', 'Resp': 'Respiratory_Rate', 'O2Sat': 'Oxygen',
            'WBC': 'WBC_Count', 'Lactate': 'Lactate_mmol_L', 'Platelets': 'Platelet_Count'
        }
        ds = ExternalTabularCohortDataset(df_dummy, mapping, target_col='Sepsis_Flag', seq_len=24)
        self.assertEqual(len(ds), 3)
        bx, by = ds[0]
        self.assertEqual(bx.shape, (24, 40))
        self.assertEqual(by.shape, (1,))
        self.assertEqual(by.item(), 0.0)
        self.assertEqual(ds[1][1].item(), 1.0)

    def test_cssp_uplink_suppression_wire_tracking(self):
        """Test that client with skip_global_upload=True contributes zero uplink bytes to the server."""
        model = PersonalizedAttentionLSTM(40, 32, 1, 0.1, 1).to(self.device)
        server = FederatedServer(model, device=self.device)
        ds = DummyDataset(20)
        client = FederatedClient(client_id=0, train_dataset=ds, val_dataset=ds, test_dataset=ds, device=self.device)
        server.register_client(client)
        
        # Round 1: normal upload
        client.skip_global_upload = False
        criterion = nn.BCEWithLogitsLoss()
        server.run_round(0, client_fraction=1.0, criterion=criterion, mu=0.01)
        bytes_r1 = server.communication_stats['total_uplink_bytes']
        self.assertGreater(bytes_r1, 0)
        
        # Round 2: CSSP drift trigger suppresses upload
        client.skip_global_upload = True
        server.run_round(1, client_fraction=1.0, criterion=criterion, mu=0.01)
        bytes_r2 = server.communication_stats['total_uplink_bytes']
        # Uplink bytes should not increase in round 2 for this client
        self.assertEqual(bytes_r2, bytes_r1)

    def test_decision_curve_analysis_bounds(self):
        """Verify Decision Curve Analysis net benefit bounds."""
        y_true = np.array([1]*20 + [0]*80)
        y_probs = np.linspace(0.05, 0.95, 100)
        dca = compute_decision_curve(y_true, y_probs)
        self.assertIn('thresholds', dca)
        self.assertIn('net_benefit_model', dca)
        self.assertEqual(len(dca['thresholds']), len(dca['net_benefit_model']))
        # Treat None net benefit must be strictly 0
        self.assertTrue(all(v == 0.0 for v in dca['net_benefit_none']))

    def test_threshold_optimization_coverage(self):
        """Verify optimal threshold search generates valid operating points."""
        y_true = np.array([1]*30 + [0]*70)
        y_probs = np.random.uniform(0.1, 0.9, size=100)
        res = find_optimal_thresholds(y_true, y_probs)
        self.assertIn('default_0_50', res)
        self.assertIn('youden_optimal', res)
        self.assertIn('target_sens_80', res)
        self.assertGreaterEqual(res['target_sens_80']['sensitivity'], 0.70)

if __name__ == '__main__':
    unittest.main()
