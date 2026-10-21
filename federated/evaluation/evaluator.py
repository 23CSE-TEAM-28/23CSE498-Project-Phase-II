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

    @staticmethod
    def generate_three_way_comparison_plots(
        y_true: np.ndarray,
        y_probs_fedavg: np.ndarray,
        y_probs_fedprox: np.ndarray,
        centralized_metrics_path: str,
        save_dir: str
    ):
        """
        Generates overlay ROC Curves for Centralized Baseline vs. FedAvg vs. FedProx,
        and plots the FedProx Confusion Matrix.
        """
        os.makedirs(save_dir, exist_ok=True)
        
        # 1. Overlay ROC Curves
        fpr_fedavg, tpr_fedavg, _ = roc_curve(y_true, y_probs_fedavg)
        auroc_fedavg = roc_auc_score(y_true, y_probs_fedavg)
        
        fpr_fedprox, tpr_fedprox, _ = roc_curve(y_true, y_probs_fedprox)
        auroc_fedprox = roc_auc_score(y_true, y_probs_fedprox)
        
        plt.figure(figsize=(8, 7))
        plt.plot(fpr_fedprox, tpr_fedprox, color='#3498db', linewidth=2.5, label=f'FedProx Global Model (AUROC = {auroc_fedprox:.4f})')
        plt.plot(fpr_fedavg, tpr_fedavg, color='#e67e22', linewidth=2.0, linestyle='--', label=f'FedAvg Global Model (AUROC = {auroc_fedavg:.4f})')
        
        # Load Centralized Baseline AUROC
        if os.path.exists(centralized_metrics_path):
            try:
                with open(centralized_metrics_path, 'r') as f:
                    cent_m = json.load(f)
                auroc_cent = cent_m['auroc']
                plt.axhline(0, color='white', label=f"Centralized Baseline (AUROC = {auroc_cent:.4f})")
            except Exception:
                pass
                
        plt.plot([0, 1], [0, 1], color='#7f8c8d', linestyle=':', label='Random Guess')
        plt.title('Comparative ROC Curves: Centralized vs. FedAvg vs. FedProx', fontsize=12, fontweight='bold')
        plt.xlabel('False Positive Rate (FPR)')
        plt.ylabel('True Positive Rate (TPR)')
        plt.legend(loc='lower right')
        plt.grid(True, linestyle=':', alpha=0.6)
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'three_way_roc_curve.png'), dpi=300)
        plt.close()
        
        # 2. FedProx Confusion Matrix Heatmap
        cm_fedprox = confusion_matrix(y_true, (y_probs_fedprox >= 0.5).astype(float))
        plt.figure(figsize=(6, 5))
        sns.heatmap(
            cm_fedprox,
            annot=True,
            fmt='d',
            cmap='Blues',
            cbar=False,
            xticklabels=['Non-Sepsis (0)', 'Sepsis (1)'],
            yticklabels=['Non-Sepsis (0)', 'Sepsis (1)'],
            annot_kws={'size': 14, 'weight': 'bold'}
        )
        plt.title('FedProx Global Model Confusion Matrix', fontsize=12, fontweight='bold', pad=10)
        plt.xlabel('Predicted Label', fontsize=11)
        plt.ylabel('True Label', fontsize=11)
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'fedprox_confusion_matrix.png'), dpi=300)
        plt.close()

    @staticmethod
    def save_three_way_comparison_report(
        fedavg_metrics: dict,
        fedprox_metrics: dict,
        centralized_metrics_path: str,
        save_path: str
    ) -> dict:
        """
        Creates a structured three-way comparison table and saves it as JSON.
        """
        comparison = {
            'metric': ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'AUROC', 'TP', 'FP', 'TN', 'FN'],
            'fedavg': [
                fedavg_metrics['accuracy'],
                fedavg_metrics['precision'],
                fedavg_metrics['recall'],
                fedavg_metrics['f1_score'],
                fedavg_metrics['auroc'],
                fedavg_metrics['confusion_matrix']['tp'],
                fedavg_metrics['confusion_matrix']['fp'],
                fedavg_metrics['confusion_matrix']['tn'],
                fedavg_metrics['confusion_matrix']['fn']
            ],
            'fedprox': [
                fedprox_metrics['accuracy'],
                fedprox_metrics['precision'],
                fedprox_metrics['recall'],
                fedprox_metrics['f1_score'],
                fedprox_metrics['auroc'],
                fedprox_metrics['confusion_matrix']['tp'],
                fedprox_metrics['confusion_matrix']['fp'],
                fedprox_metrics['confusion_matrix']['tn'],
                fedprox_metrics['confusion_matrix']['fn']
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
            except Exception:
                comparison['centralized'] = [None] * 9
        else:
            comparison['centralized'] = [None] * 9
            
        with open(save_path, 'w') as f:
            json.dump(comparison, f, indent=4)
            
        return comparison

    @staticmethod
    def generate_four_way_comparison_plots(
        y_true_global: np.ndarray,
        y_probs_fedavg: np.ndarray,
        y_probs_fedprox: np.ndarray,
        y_probs_ditto_global: np.ndarray,
        y_true_local_concat: np.ndarray,
        y_probs_ditto_pers_concat: np.ndarray,
        centralized_metrics_path: str,
        save_dir: str
    ):
        """
        Generates overlay ROC Curves for Centralized Baseline vs. FedAvg vs. FedProx vs. Ditto (Global & Personalized),
        and plots the Ditto Personalized Confusion Matrix.
        """
        os.makedirs(save_dir, exist_ok=True)
        
        # 1. Compute curves
        fpr_fedavg, tpr_fedavg, _ = roc_curve(y_true_global, y_probs_fedavg)
        auroc_fedavg = roc_auc_score(y_true_global, y_probs_fedavg)
        
        fpr_fedprox, tpr_fedprox, _ = roc_curve(y_true_global, y_probs_fedprox)
        auroc_fedprox = roc_auc_score(y_true_global, y_probs_fedprox)
        
        fpr_ditto_glob, tpr_ditto_glob, _ = roc_curve(y_true_global, y_probs_ditto_global)
        auroc_ditto_glob = roc_auc_score(y_true_global, y_probs_ditto_global)
        
        fpr_ditto_pers, tpr_ditto_pers, _ = roc_curve(y_true_local_concat, y_probs_ditto_pers_concat)
        auroc_ditto_pers = roc_auc_score(y_true_local_concat, y_probs_ditto_pers_concat)
        
        plt.figure(figsize=(9, 8))
        plt.plot(fpr_ditto_pers, tpr_ditto_pers, color='#2ecc71', linewidth=3.0, label=f'Ditto Personalized (AUROC = {auroc_ditto_pers:.4f})')
        plt.plot(fpr_ditto_glob, tpr_ditto_glob, color='#9b59b6', linewidth=2.0, linestyle='-.', label=f'Ditto Global (AUROC = {auroc_ditto_glob:.4f})')
        plt.plot(fpr_fedprox, tpr_fedprox, color='#3498db', linewidth=2.0, linestyle='--', label=f'FedProx Global (AUROC = {auroc_fedprox:.4f})')
        plt.plot(fpr_fedavg, tpr_fedavg, color='#e67e22', linewidth=1.8, linestyle=':', label=f'FedAvg Global (AUROC = {auroc_fedavg:.4f})')
        
        # Load Centralized Baseline AUROC
        if os.path.exists(centralized_metrics_path):
            try:
                with open(centralized_metrics_path, 'r') as f:
                    cent_m = json.load(f)
                auroc_cent = cent_m['auroc']
                plt.axhline(0, color='white', label=f"Centralized Baseline (AUROC = {auroc_cent:.4f})")
            except Exception:
                pass
                
        plt.plot([0, 1], [0, 1], color='#7f8c8d', linestyle=':', label='Random Guess')
        plt.title('Four-Way Comparative ROC Curves: Centralized vs. FL Baselines vs. Ditto', fontsize=12, fontweight='bold')
        plt.xlabel('False Positive Rate (FPR)')
        plt.ylabel('True Positive Rate (TPR)')
        plt.legend(loc='lower right')
        plt.grid(True, linestyle=':', alpha=0.6)
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'four_way_roc_curve.png'), dpi=300)
        plt.close()
        
        # 2. Ditto Personalized Confusion Matrix Heatmap
        cm_ditto = confusion_matrix(y_true_local_concat, (y_probs_ditto_pers_concat >= 0.5).astype(float))
        plt.figure(figsize=(6, 5))
        sns.heatmap(
            cm_ditto,
            annot=True,
            fmt='d',
            cmap='Greens',
            cbar=False,
            xticklabels=['Non-Sepsis (0)', 'Sepsis (1)'],
            yticklabels=['Non-Sepsis (0)', 'Sepsis (1)'],
            annot_kws={'size': 14, 'weight': 'bold'}
        )
        plt.title('Ditto Personalized Model Confusion Matrix', fontsize=12, fontweight='bold', pad=10)
        plt.xlabel('Predicted Label', fontsize=11)
        plt.ylabel('True Label', fontsize=11)
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'ditto_personalized_confusion_matrix.png'), dpi=300)
        plt.close()

    @staticmethod
    def save_four_way_comparison_report(
        fedavg_metrics: dict,
        fedprox_metrics: dict,
        ditto_glob_metrics: dict,
        ditto_pers_metrics: dict,
        centralized_metrics_path: str,
        save_path: str
    ) -> dict:
        """
        Creates a structured four-way comparison table and saves it as JSON.
        """
        comparison = {
            'metric': ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'AUROC', 'TP', 'FP', 'TN', 'FN'],
            'fedavg': [
                fedavg_metrics['accuracy'],
                fedavg_metrics['precision'],
                fedavg_metrics['recall'],
                fedavg_metrics['f1_score'],
                fedavg_metrics['auroc'],
                fedavg_metrics['confusion_matrix']['tp'],
                fedavg_metrics['confusion_matrix']['fp'],
                fedavg_metrics['confusion_matrix']['tn'],
                fedavg_metrics['confusion_matrix']['fn']
            ],
            'fedprox': [
                fedprox_metrics['accuracy'],
                fedprox_metrics['precision'],
                fedprox_metrics['recall'],
                fedprox_metrics['f1_score'],
                fedprox_metrics['auroc'],
                fedprox_metrics['confusion_matrix']['tp'],
                fedprox_metrics['confusion_matrix']['fp'],
                fedprox_metrics['confusion_matrix']['tn'],
                fedprox_metrics['confusion_matrix']['fn']
            ],
            'ditto_global': [
                ditto_glob_metrics['accuracy'],
                ditto_glob_metrics['precision'],
                ditto_glob_metrics['recall'],
                ditto_glob_metrics['f1_score'],
                ditto_glob_metrics['auroc'],
                ditto_glob_metrics['confusion_matrix']['tp'],
                ditto_glob_metrics['confusion_matrix']['fp'],
                ditto_glob_metrics['confusion_matrix']['tn'],
                ditto_glob_metrics['confusion_matrix']['fn']
            ],
            'ditto_personalized': [
                ditto_pers_metrics['accuracy'],
                ditto_pers_metrics['precision'],
                ditto_pers_metrics['recall'],
                ditto_pers_metrics['f1_score'],
                ditto_pers_metrics['auroc'],
                ditto_pers_metrics['confusion_matrix']['tp'],
                ditto_pers_metrics['confusion_matrix']['fp'],
                ditto_pers_metrics['confusion_matrix']['tn'],
                ditto_pers_metrics['confusion_matrix']['fn']
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
            except Exception:
                comparison['centralized'] = [None] * 9
        else:
            comparison['centralized'] = [None] * 9
            
        with open(save_path, 'w') as f:
            json.dump(comparison, f, indent=4)
            
        return comparison

    @staticmethod
    def generate_five_way_comparison_plots(
        y_true_global: np.ndarray,
        y_probs_fedavg: np.ndarray,
        y_probs_fedprox: np.ndarray,
        y_probs_ditto_global: np.ndarray,
        y_probs_ditto_pers_concat: np.ndarray,
        y_probs_fpdaf_global: np.ndarray,
        y_true_local_concat: np.ndarray,
        y_probs_fpdaf_pers_concat: np.ndarray,
        centralized_metrics_path: str,
        save_dir: str
    ):
        """
        Generates overlay ROC Curves for Centralized Baseline vs. FedAvg vs. FedProx vs. Ditto vs. FPDAF,
        and plots the FPDAF Personalized Confusion Matrix.
        """
        os.makedirs(save_dir, exist_ok=True)
        
        # 1. Compute curves
        fpr_fedavg, tpr_fedavg, _ = roc_curve(y_true_global, y_probs_fedavg)
        auroc_fedavg = roc_auc_score(y_true_global, y_probs_fedavg)
        
        fpr_fedprox, tpr_fedprox, _ = roc_curve(y_true_global, y_probs_fedprox)
        auroc_fedprox = roc_auc_score(y_true_global, y_probs_fedprox)
        
        fpr_ditto_glob, tpr_ditto_glob, _ = roc_curve(y_true_global, y_probs_ditto_global)
        auroc_ditto_glob = roc_auc_score(y_true_global, y_probs_ditto_global)
        
        fpr_ditto_pers, tpr_ditto_pers, _ = roc_curve(y_true_local_concat, y_probs_ditto_pers_concat)
        auroc_ditto_pers = roc_auc_score(y_true_local_concat, y_probs_ditto_pers_concat)
        
        fpr_fpdaf_glob, tpr_fpdaf_glob, _ = roc_curve(y_true_global, y_probs_fpdaf_global)
        auroc_fpdaf_glob = roc_auc_score(y_true_global, y_probs_fpdaf_global)
        
        fpr_fpdaf_pers, tpr_fpdaf_pers, _ = roc_curve(y_true_local_concat, y_probs_fpdaf_pers_concat)
        auroc_fpdaf_pers = roc_auc_score(y_true_local_concat, y_probs_fpdaf_pers_concat)
        
        plt.figure(figsize=(10, 9))
        plt.plot(fpr_fpdaf_pers, tpr_fpdaf_pers, color='#e74c3c', linewidth=3.5, label=f'FPDAF Personalized (AUROC = {auroc_fpdaf_pers:.4f})')
        plt.plot(fpr_ditto_pers, tpr_ditto_pers, color='#2ecc71', linewidth=2.5, linestyle='--', label=f'Ditto Personalized (AUROC = {auroc_ditto_pers:.4f})')
        plt.plot(fpr_fpdaf_glob, tpr_fpdaf_glob, color='#9b59b6', linewidth=2.0, linestyle='-.', label=f'FPDAF Global (AUROC = {auroc_fpdaf_glob:.4f})')
        plt.plot(fpr_fedprox, tpr_fedprox, color='#3498db', linewidth=2.0, linestyle=':', label=f'FedProx Global (AUROC = {auroc_fedprox:.4f})')
        plt.plot(fpr_fedavg, tpr_fedavg, color='#e67e22', linewidth=1.8, linestyle=':', label=f'FedAvg Global (AUROC = {auroc_fedavg:.4f})')
        
        # Load Centralized Baseline AUROC
        if os.path.exists(centralized_metrics_path):
            try:
                with open(centralized_metrics_path, 'r') as f:
                    cent_m = json.load(f)
                auroc_cent = cent_m['auroc']
                plt.axhline(0, color='white', label=f"Centralized Baseline (AUROC = {auroc_cent:.4f})")
            except Exception:
                pass
                
        plt.plot([0, 1], [0, 1], color='#7f8c8d', linestyle=':', label='Random Guess')
        plt.title('Five-Way Comparative ROC Curves: proposed FPDAF vs. Baselines', fontsize=12, fontweight='bold')
        plt.xlabel('False Positive Rate (FPR)')
        plt.ylabel('True Positive Rate (TPR)')
        plt.legend(loc='lower right')
        plt.grid(True, linestyle=':', alpha=0.6)
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'five_way_roc_curve.png'), dpi=300)
        plt.close()
        
        # 2. FPDAF Personalized Confusion Matrix Heatmap
        cm_fpdaf = confusion_matrix(y_true_local_concat, (y_probs_fpdaf_pers_concat >= 0.5).astype(float))
        plt.figure(figsize=(6, 5))
        sns.heatmap(
            cm_fpdaf,
            annot=True,
            fmt='d',
            cmap='Reds',
            cbar=False,
            xticklabels=['Non-Sepsis (0)', 'Sepsis (1)'],
            yticklabels=['Non-Sepsis (0)', 'Sepsis (1)'],
            annot_kws={'size': 14, 'weight': 'bold'}
        )
        plt.title('FPDAF Personalized Model Confusion Matrix', fontsize=12, fontweight='bold', pad=10)
        plt.xlabel('Predicted Label', fontsize=11)
        plt.ylabel('True Label', fontsize=11)
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'fpdaf_personalized_confusion_matrix.png'), dpi=300)
        plt.close()

    @staticmethod
    def save_five_way_comparison_report(
        fedavg_metrics: dict,
        fedprox_metrics: dict,
        ditto_glob_metrics: dict,
        ditto_pers_metrics: dict,
        fpdaf_glob_metrics: dict,
        fpdaf_pers_metrics: dict,
        centralized_metrics_path: str,
        save_path: str
    ) -> dict:
        """
        Creates a structured five-way comparison table and saves it as JSON.
        """
        comparison = {
            'metric': ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'AUROC', 'TP', 'FP', 'TN', 'FN'],
            'fedavg': [
                fedavg_metrics['accuracy'],
                fedavg_metrics['precision'],
                fedavg_metrics['recall'],
                fedavg_metrics['f1_score'],
                fedavg_metrics['auroc'],
                fedavg_metrics['confusion_matrix']['tp'],
                fedavg_metrics['confusion_matrix']['fp'],
                fedavg_metrics['confusion_matrix']['tn'],
                fedavg_metrics['confusion_matrix']['fn']
            ],
            'fedprox': [
                fedprox_metrics['accuracy'],
                fedprox_metrics['precision'],
                fedprox_metrics['recall'],
                fedprox_metrics['f1_score'],
                fedprox_metrics['auroc'],
                fedprox_metrics['confusion_matrix']['tp'],
                fedprox_metrics['confusion_matrix']['fp'],
                fedprox_metrics['confusion_matrix']['tn'],
                fedprox_metrics['confusion_matrix']['fn']
            ],
            'ditto_global': [
                ditto_glob_metrics['accuracy'],
                ditto_glob_metrics['precision'],
                ditto_glob_metrics['recall'],
                ditto_glob_metrics['f1_score'],
                ditto_glob_metrics['auroc'],
                ditto_glob_metrics['confusion_matrix']['tp'],
                ditto_glob_metrics['confusion_matrix']['fp'],
                ditto_glob_metrics['confusion_matrix']['tn'],
                ditto_glob_metrics['confusion_matrix']['fn']
            ],
            'ditto_personalized': [
                ditto_pers_metrics['accuracy'],
                ditto_pers_metrics['precision'],
                ditto_pers_metrics['recall'],
                ditto_pers_metrics['f1_score'],
                ditto_pers_metrics['auroc'],
                ditto_pers_metrics['confusion_matrix']['tp'],
                ditto_pers_metrics['confusion_matrix']['fp'],
                ditto_pers_metrics['confusion_matrix']['tn'],
                ditto_pers_metrics['confusion_matrix']['fn']
            ],
            'fpdaf_global': [
                fpdaf_glob_metrics['accuracy'],
                fpdaf_glob_metrics['precision'],
                fpdaf_glob_metrics['recall'],
                fpdaf_glob_metrics['f1_score'],
                fpdaf_glob_metrics['auroc'],
                fpdaf_glob_metrics['confusion_matrix']['tp'],
                fpdaf_glob_metrics['confusion_matrix']['fp'],
                fpdaf_glob_metrics['confusion_matrix']['tn'],
                fpdaf_glob_metrics['confusion_matrix']['fn']
            ],
            'fpdaf_personalized': [
                fpdaf_pers_metrics['accuracy'],
                fpdaf_pers_metrics['precision'],
                fpdaf_pers_metrics['recall'],
                fpdaf_pers_metrics['f1_score'],
                fpdaf_pers_metrics['auroc'],
                fpdaf_pers_metrics['confusion_matrix']['tp'],
                fpdaf_pers_metrics['confusion_matrix']['fp'],
                fpdaf_pers_metrics['confusion_matrix']['tn'],
                fpdaf_pers_metrics['confusion_matrix']['fn']
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
            except Exception:
                comparison['centralized'] = [None] * 9
        else:
            comparison['centralized'] = [None] * 9
            
        with open(save_path, 'w') as f:
            json.dump(comparison, f, indent=4)
            
        return comparison

    @staticmethod
    def plot_cusum_drift_scores(history_path: str, save_dir: str):
        """
        Plots running CUSUM drift scores for each client node across rounds and marks triggers.
        """
        if not os.path.exists(history_path):
            return
            
        with open(history_path, 'r') as f:
            history = json.load(f)
            
        if 'client_cusum_scores' not in history:
            return
            
        plt.figure(figsize=(9, 6))
        colors = ['#1abc9c', '#3498db', '#e67e22']
        
        for i in range(len(history['client_cusum_scores'])):
            scores = history['client_cusum_scores'][i]
            rounds = range(1, len(scores) + 1)
            plt.plot(rounds, scores, color=colors[i], linewidth=2.5, marker='o', label=f'Client {i} (Hospital {i//2})')
            
            # Highlight drift trigger rounds
            triggers = history['client_drift_triggers'][i]
            if len(triggers) > 0:
                trigger_rounds = [t + 1 for t in triggers]
                trigger_scores = [scores[t] for t in triggers]
                plt.scatter(trigger_rounds, trigger_scores, color='red', s=120, zorder=5, marker='x', label=f'Drift Trigger C{i}')
                
        plt.axhline(y=3.0, color='red', linestyle='--', alpha=0.7, label='CUSUM Threshold h=3.0')
        plt.title('Client-Side Running CUSUM Drift Scores across Rounds', fontsize=12, fontweight='bold')
        plt.xlabel('Communication Rounds')
        plt.ylabel('CUSUM Residual Drift Score')
        plt.grid(True, linestyle=':', alpha=0.6)
        plt.legend(loc='upper left')
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'cusum_drift_scores.png'), dpi=300)
        plt.close()

    @staticmethod
    def plot_temporal_attention_heatmaps(attn_weights: np.ndarray, y_true: np.ndarray, save_dir: str):
        """
        Plots average hourly attention profile for Sepsis (positive) vs. Non-Sepsis patients.
        attn_weights shape: (batch_size, sequence_length, 1)
        """
        os.makedirs(save_dir, exist_ok=True)
        # Average across samples
        sepsis_mask = (y_true == 1).flatten()
        non_sepsis_mask = (y_true == 0).flatten()
        
        avg_attn_sepsis = np.mean(attn_weights[sepsis_mask], axis=0).flatten() # (24,)
        avg_attn_non_sepsis = np.mean(attn_weights[non_sepsis_mask], axis=0).flatten() # (24,)
        
        hours = np.arange(1, 25)
        
        plt.figure(figsize=(10, 5))
        plt.plot(hours, avg_attn_sepsis, color='#e74c3c', marker='o', linewidth=2.5, label='Sepsis Alert (Positive)')
        plt.plot(hours, avg_attn_non_sepsis, color='#7f8c8d', marker='s', linewidth=1.8, linestyle='--', label='Normal (Negative)')
        plt.title('Average Temporal Attention Weight Profile over 24-Hour Windows', fontsize=12, fontweight='bold')
        plt.xlabel('ICU Timeline (Hours)')
        plt.ylabel('Temporal Attention Score')
        plt.xticks(hours)
        plt.grid(True, linestyle=':', alpha=0.6)
        plt.legend()
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'temporal_attention_profile.png'), dpi=300)
        plt.close()


