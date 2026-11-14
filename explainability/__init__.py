"""
Explainable AI (XAI) Three-Pillar Package
=========================================
Pillar 1: Temporal Attention Attribution (Multi-Head Self-Attention)
Pillar 2: Integrated Gradients Feature Saliency
Pillar 3: Algorithmic Counterfactual Intervention Recourse
"""

from .temporal_attention import extract_temporal_attention
from .integrated_gradients import compute_integrated_gradients, FEATURE_NAMES
from .counterfactual_recourse import compute_counterfactual_recourse

__all__ = [
    "extract_temporal_attention",
    "compute_integrated_gradients",
    "compute_counterfactual_recourse",
    "FEATURE_NAMES"
]
