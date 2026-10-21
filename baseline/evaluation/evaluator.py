import os
import json
import numpy as np
import matplotlib
matplotlib.use('Agg') # Safe for headless execution
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

class SepsisEvaluator:
    """
    Computes classification evaluation metrics and generates evaluation plots.
    """
    @staticmethod
    def compute_metrics(y_true: np.ndarray, y_probs: np.ndarray, threshold: float = 0.5) -> dict:
        """
        Computes clinical classification metrics.
        """
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
    def plot_training_curves(history: dict, save_dir: str):
        """
        Plots Loss and Accuracy training/validation curves.
        """
        os.makedirs(save_dir, exist_ok=True)
        epochs = range(1, len(history['train_loss']) + 1)
        
        # 1. Plot Loss
        plt.figure(figsize=(8, 5))
        plt.plot(epochs, history['train_loss'], label='Training Loss', color='#2980b9', linewidth=2)
        plt.plot(epochs, history['val_loss'], label='Validation Loss', color='#e74c3c', linewidth=2, linestyle='--')
        plt.title('Training and Validation Loss', fontsize=12, fontweight='bold')
        plt.xlabel('Epochs')
        plt.ylabel('Loss')
        plt.legend()
        plt.grid(True, linestyle=':', alpha=0.6)
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'loss_curve.png'), dpi=300)
        plt.close()
        
        # 2. Plot Accuracy
        plt.figure(figsize=(8, 5))
        plt.plot(epochs, history['train_acc'], label='Training Accuracy', color='#2980b9', linewidth=2)
        plt.plot(epochs, history['val_acc'], label='Validation Accuracy', color='#e74c3c', linewidth=2, linestyle='--')
        plt.title('Training and Validation Accuracy', fontsize=12, fontweight='bold')
        plt.xlabel('Epochs')
        plt.ylabel('Accuracy')
        plt.legend()
        plt.grid(True, linestyle=':', alpha=0.6)
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'accuracy_curve.png'), dpi=300)
        plt.close()

    @staticmethod
    def plot_roc_curve(y_true: np.ndarray, y_probs: np.ndarray, save_path: str):
        """
        Plots the Receiver Operating Characteristic (ROC) curve.
        """
        fpr, tpr, _ = roc_curve(y_true, y_probs)
        try:
            auroc = roc_auc_score(y_true, y_probs)
        except ValueError:
            auroc = 0.5
            
        plt.figure(figsize=(7, 6))
        plt.plot(fpr, tpr, color='#8e44ad', label=f'LSTM Baseline (AUROC = {auroc:.4f})', linewidth=2.5)
        plt.plot([0, 1], [0, 1], color='#7f8c8d', linestyle='--', label='Random Guess')
        plt.title('Receiver Operating Characteristic (ROC) Curve', fontsize=12, fontweight='bold')
        plt.xlabel('False Positive Rate (FPR)')
        plt.ylabel('True Positive Rate (TPR)')
        plt.legend(loc='lower right')
        plt.grid(True, linestyle=':', alpha=0.6)
        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()

    @staticmethod
    def plot_confusion_matrix(y_true: np.ndarray, y_probs: np.ndarray, save_path: str, threshold: float = 0.5):
        """
        Plots confusion matrix heatmap.
        """
        y_preds = (y_probs >= threshold).astype(float)
        cm = confusion_matrix(y_true, y_preds)
        
        plt.figure(figsize=(6, 5))
        sns.heatmap(
            cm, 
            annot=True, 
            fmt='d', 
            cmap='Blues', 
            cbar=False, 
            xticklabels=['Non-Sepsis (0)', 'Sepsis (1)'], 
            yticklabels=['Non-Sepsis (0)', 'Sepsis (1)'],
            annot_kws={'size': 14, 'weight': 'bold'}
        )
        plt.title('Confusion Matrix', fontsize=12, fontweight='bold', pad=10)
        plt.xlabel('Predicted Label', fontsize=11)
        plt.ylabel('True Label', fontsize=11)
        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()
