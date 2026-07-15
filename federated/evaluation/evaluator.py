import os
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve
)

class FederatedEvaluator:
    """
    Computes global federated evaluation metrics and plots comparative results
    against the centralized baseline.
    """
    @staticmethod
    def compute_metrics(y_true: np.ndarray, y_probs: np.ndarray, threshold: float = 0.5) -> dict:
        """Computes clinical performance metrics for the global model."""
        y_preds = (y_probs >= threshold).astype(float)
        
        acc = accuracy_score(y_true, y_preds)
        prec = precision_score(y_true, y_preds, zero_division=0)
        rec = recall_score(y_true, y_preds, zero_division=0)
        f1 = f1_score(y_true, y_preds, zero_division=0)
        
        try:
            auroc = roc_auc_score(y_true, y_probs)
        except ValueError:
            auroc = 0.5
            
        tn, fp, fn, tp = confusion_matrix(y_true, y_preds).ravel()
        
        return {
            'accuracy': float(acc),
            'precision': float(prec),
            'recall': float(rec),
            'f1_score': float(f1),
            'auroc': float(auroc),
            'confusion_matrix': {
                'tn': int(tn),
                'fp': int(fp),
                'fn': int(fn),
                'tp': int(tp)
            }
        }

    @staticmethod
    def plot_rounds_vs_performance(history: dict, save_dir: str):
        """
        Plots global validation loss and global validation AUROC across communication rounds.
        """
        os.makedirs(save_dir, exist_ok=True)
        rounds = range(1, len(history['global_val_loss']) + 1)
        
        # 1. Global Val Loss
        plt.figure(figsize=(8, 5))
        plt.plot(rounds, history['global_val_loss'], marker='o', color='#8e44ad', linewidth=2, label='Global Val Loss')
        plt.title('Global Validation Loss vs. Communication Rounds', fontsize=12, fontweight='bold')
        plt.xlabel('Communication Rounds')
        plt.ylabel('Validation Loss')
        plt.grid(True, linestyle=':', alpha=0.6)
        plt.legend()
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'rounds_vs_loss.png'), dpi=300)
        plt.close()
        
        # 2. Global Val AUROC
        plt.figure(figsize=(8, 5))
        plt.plot(rounds, history['global_val_auroc'], marker='s', color='#2ecc71', linewidth=2, label='Global Val AUROC')
        plt.title('Global Validation AUROC vs. Communication Rounds', fontsize=12, fontweight='bold')
        plt.xlabel('Communication Rounds')
        plt.ylabel('AUROC')
        plt.grid(True, linestyle=':', alpha=0.6)
        plt.legend()
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'rounds_vs_auroc.png'), dpi=300)
        plt.close()

    @staticmethod
    def generate_comparison_plots(
        y_true: np.ndarray, 
        y_probs: np.ndarray, 
        centralized_metrics_path: str,
        save_dir: str
    ):
        """
        Generates comparative plots comparing the FedAvg global model against the Centralized Baseline.
        """
        os.makedirs(save_dir, exist_ok=True)
        
        # 1. Plot comparative ROC Curves
        fpr_fed, tpr_fed, _ = roc_curve(y_true, y_probs)
        auroc_fed = roc_auc_score(y_true, y_probs)
        
        plt.figure(figsize=(8, 7))
        plt.plot(fpr_fed, tpr_fed, color='#e67e22', linewidth=2.5, label=f'FedAvg Global Model (AUROC = {auroc_fed:.4f})')
        
        # Load and plot Centralized ROC if available
        centralized_found = False
        if os.path.exists(centralized_metrics_path):
            try:
                # We can construct the centralized ROC curve by running testing, but we can also check if a centralized ROC curve image exists and we overlay,
                # Or we can simply read the centralized AUROC value and print it on the plot.
                with open(centralized_metrics_path, 'r') as f:
                    cent_m = json.load(f)
                auroc_cent = cent_m['auroc']
                plt.axhline(0, color='white', label=f"Centralized Baseline (AUROC = {auroc_cent:.4f})")
                centralized_found = True
            except Exception as e:
                pass
                
        plt.plot([0, 1], [0, 1], color='#7f8c8d', linestyle='--', label='Random Guess')
        plt.title('Comparative ROC Curves: Centralized vs. FedAvg', fontsize=12, fontweight='bold')
        plt.xlabel('False Positive Rate (FPR)')
        plt.ylabel('True Positive Rate (TPR)')
        plt.legend(loc='lower right')
        plt.grid(True, linestyle=':', alpha=0.6)
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'comparative_roc_curve.png'), dpi=300)
        plt.close()

        # 2. Plot Global Model Confusion Matrix
        cm = confusion_matrix(y_true, (y_probs >= 0.5).astype(float))
        plt.figure(figsize=(6, 5))
        sns.heatmap(
            cm, 
            annot=True, 
            fmt='d', 
            cmap='Oranges', 
            cbar=False,
            xticklabels=['Non-Sepsis (0)', 'Sepsis (1)'],
            yticklabels=['Non-Sepsis (0)', 'Sepsis (1)'],
            annot_kws={'size': 14, 'weight': 'bold'}
        )
        plt.title('FedAvg Global Model Confusion Matrix', fontsize=12, fontweight='bold', pad=10)
        plt.xlabel('Predicted Label', fontsize=11)
        plt.ylabel('True Label', fontsize=11)
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'global_confusion_matrix.png'), dpi=300)
        plt.close()
        
    @staticmethod
    def save_comparison_report(
        fed_metrics: dict, 
        centralized_metrics_path: str,
        save_path: str
    ) -> dict:
        """
        Creates a comparison table between Centralized Baseline and FedAvg, and saves it.
        """
        comparison = {
            'metric': ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'AUROC', 'TP', 'FP', 'TN', 'FN'],
            'fedavg': [
                fed_metrics['accuracy'],
                fed_metrics['precision'],
                fed_metrics['recall'],
                fed_metrics['f1_score'],
                fed_metrics['auroc'],
                fed_metrics['confusion_matrix']['tp'],
                fed_metrics['confusion_matrix']['fp'],
                fed_metrics['confusion_matrix']['tn'],
                fed_metrics['confusion_matrix']['fn']
            ]
        }
        
        if os.path.exists(centralized_metrics_path):
            try:
                with open(centralized_metrics_path, 'r') as f:
                    cent = json.load(f)
                comparison['centralized'] = [
                    cent['accuracy'],
                    cent['precision'],
                    cent['recall'],
                    cent['f1_score'],
                    cent['auroc'],
                    cent['confusion_matrix']['tp'],
                    cent['confusion_matrix']['fp'],
                    cent['confusion_matrix']['tn'],
                    cent['confusion_matrix']['fn']
                ]
                comparison['difference'] = [
                    comparison['fedavg'][i] - comparison['centralized'][i] if i < 5 else int(comparison['fedavg'][i] - comparison['centralized'][i])
                    for i in range(9)
                ]
            except Exception:
                comparison['centralized'] = [None] * 9
                comparison['difference'] = [None] * 9
        else:
            comparison['centralized'] = [None] * 9
            comparison['difference'] = [None] * 9
            
        with open(save_path, 'w') as f:
            json.dump(comparison, f, indent=4)
            
        return comparison
