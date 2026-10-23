"""
Explainability Module for FPDAF
Provides PyTorch native Integrated Gradients (IG), Attention Analysis,
Feature Attribution Ranking, and Attribution Stability Evaluation.
"""

import os
import torch
import torch.nn as nn
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

class IntegratedGradientsExplainer:
    """
    Computes Integrated Gradients for time-series models with PyTorch.
    Path-integral: IG_i(x) = (x_i - x'_i) * integral_0^1 [ dF(x' + alpha*(x - x')) / dx_i ] d_alpha
    Approximated via Riemann summation over m interpolation steps.
    """
    def __init__(self, model: nn.Module, baseline: torch.Tensor = None, steps: int = 50, device: torch.device = None):
        self.model = model
        self.steps = steps
        self.device = device or next(model.parameters()).device
        self.model.to(self.device)
        self.baseline = baseline
        
    def attribute(self, inputs: torch.Tensor, target_class: int = 1) -> torch.Tensor:
        """
        Computes attributions for inputs of shape (batch_size, seq_len, num_features).
        Returns attribution tensor of identical shape (batch_size, seq_len, num_features).
        """
        self.model.eval()
        inputs = inputs.to(self.device)
        batch_size, seq_len, num_features = inputs.shape
        
        if self.baseline is None:
            baseline = torch.zeros_like(inputs, device=self.device)
        else:
            baseline = self.baseline.to(self.device)
            if baseline.shape != inputs.shape:
                baseline = baseline.expand_as(inputs)
                
        # Generate interpolated inputs: shape (steps, batch_size, seq_len, num_features)
        alphas = torch.linspace(0.0, 1.0, self.steps, device=self.device)
        
        total_gradients = torch.zeros_like(inputs, device=self.device)
        
        for alpha in alphas:
            interpolated = baseline + alpha * (inputs - baseline)
            interpolated.requires_grad_(True)
            
            # Forward pass through model
            if hasattr(self.model, "attention_query"):
                logits, _ = self.model(interpolated, return_attention=True)
            else:
                logits = self.model(interpolated)
                
            probs = torch.sigmoid(logits)
            
            # Gradients with respect to interpolated inputs
            grads = torch.autograd.grad(
                outputs=probs.sum(),
                inputs=interpolated,
                retain_graph=False,
                create_graph=False
            )[0]
            
            total_gradients += grads
            
        avg_gradients = total_gradients / self.steps
        attributions = (inputs - baseline) * avg_gradients
        return attributions.detach()

    def evaluate_stability(self, inputs: torch.Tensor, noise_std: float = 0.05) -> float:
        """
        Evaluates feature attribution stability under input perturbation:
        Cosine similarity between IG(x) and IG(x + eps), where eps ~ N(0, noise_std^2).
        """
        orig_attr = self.attribute(inputs)
        orig_flat = orig_attr.view(orig_attr.shape[0], -1)
        
        noise = torch.randn_like(inputs) * noise_std
        perturbed_inputs = inputs + noise
        pert_attr = self.attribute(perturbed_inputs)
        pert_flat = pert_attr.view(pert_attr.shape[0], -1)
        
        # Cosine similarity
        cos = nn.CosineSimilarity(dim=1)
        sim = cos(orig_flat, pert_flat)
        return float(sim.mean().cpu().item())

def compute_global_feature_importance(
    model: nn.Module,
    data_loader: torch.utils.data.DataLoader,
    feature_names: list,
    device: torch.device,
    max_batches: int = 10,
    steps: int = 30
) -> dict:
    """
    Computes dataset-level global feature importance via Integrated Gradients.
    Aggregates absolute attributions across time steps and sample batches.
    """
    explainer = IntegratedGradientsExplainer(model, steps=steps, device=device)
    
    feature_importances = np.zeros(len(feature_names))
    total_samples = 0
    
    batch_count = 0
    for features, targets in data_loader:
        if batch_count >= max_batches:
            break
            
        features = features.to(device)
        attr = explainer.attribute(features) # (B, 24, 40)
        
        # Sum absolute attribution across the 24 time steps
        time_aggregated = torch.sum(torch.abs(attr), dim=1) # (B, 40)
        batch_sum = torch.sum(time_aggregated, dim=0).cpu().numpy()
        
        feature_importances += batch_sum
        total_samples += features.shape[0]
        batch_count += 1
        
    if total_samples > 0:
        feature_importances /= total_samples
        
    # Rank features
    sorted_indices = np.argsort(feature_importances)[::-1]
    ranked_features = [
        {
            'rank': int(r + 1),
            'feature': feature_names[idx],
            'importance_score': float(feature_importances[idx])
        }
        for r, idx in enumerate(sorted_indices)
    ]
    
    return {
        'ranked_features': ranked_features,
        'feature_names': feature_names,
        'importance_scores': feature_importances.tolist()
    }

def plot_feature_importance(
    ranked_results: dict,
    save_path: str,
    top_n: int = 15
):
    """
    Generates horizontal bar plot of top-N clinical features based on Integrated Gradients.
    """
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    top_items = ranked_results['ranked_features'][:top_n]
    names = [item['feature'] for item in top_items][::-1]
    scores = [item['importance_score'] for item in top_items][::-1]
    
    plt.figure(figsize=(9, 7))
    bars = plt.barh(range(len(names)), scores, color='#2980b9', edgecolor='#1b4f72', height=0.65)
    plt.yticks(range(len(names)), names, fontsize=10)
    plt.xlabel('Mean Absolute Integrated Gradients Attribution Score', fontsize=11)
    plt.title(f'Top {top_n} Sepsis Physiological Predictors (Integrated Gradients)', fontsize=12, fontweight='bold')
    plt.grid(axis='x', linestyle=':', alpha=0.7)
    
    for bar in bars:
        w = bar.get_width()
        plt.text(w + 0.0005, bar.get_y() + bar.get_height()/2, f'{w:.4f}', ha='left', va='center', fontsize=9)
        
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
