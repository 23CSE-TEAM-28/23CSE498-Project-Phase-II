# FPDAF: Scientific Experiment Plan and Methodological Protocol

**Project:** Federated Personalized Drift-Aware Attention Framework (FPDAF)  
**Target Submission:** Top-Tier Q1 Medical AI / Biomedical Informatics Journal  
**Protocol Version:** 2.0 (Rigorous Scientific Standards)  
**Date:** October 2026  

---

## 1. Core Scientific Hypotheses

* **Hypothesis 1 (Demographic & Clinical Non-IID Robustness):** In decentralized ICU networks with marked institutional heterogeneity (e.g., patient age, trauma acuity, laboratory testing frequencies), personalized federated learning with drift-aware adaptation (FPDAF) achieves significantly higher discrimination (AUROC and AUPRC) than static global averaging (FedAvg, FedProx).
* **Hypothesis 2 (Drift Detection Without False Alarms):** Monitoring prediction entropy divergence ($D_{\text{JSD}}$) weighted by gradient variance ($w_{\text{grad}}$) in AD-CUSUM significantly accelerates detection of genuine clinical distribution shifts while suppressing stochastic mini-batch false alarm triggers compared to standard CUSUM.
* **Hypothesis 3 (Communication Decoupling):** Selectively freezing the shared BiLSTM representation backbone upon drift declaration (Client-Side Selective Personalization - CSSP) reduces client-server communication payload by $>30\%$ without compromising local downstream predictive accuracy.
* **Hypothesis 4 (Clinical Early Warning Feasibility):** Multi-head temporal attention generates prodromal risk alerts with an average lead-time $\ge 4.0$ hours prior to clinical sepsis onset ($t_{\text{sepsis}}$), while maintaining an actionable false alarm rate ($\le 0.15$ false alarms per patient-day).

---

## 2. Experimental Benchmark Matrix

All models are evaluated on the exact same patient-level holdout test set (6,050 patients, 102,994 24-hour sliding windows):

| Benchmark Model | Training Paradigm | Personalization Strategy | Drift Adaptation | Communication Profile | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Centralized BiLSTM** | Pooled Central Data | None (Single Global Model) | None | N/A (Non-Federated) | Theoretical upper baseline without data localization constraints. |
| **Local-Only Training** | Isolated Hospital Nodes | 100% Local (Zero Sharing) | None | 0 MB (No Network) | Establishes the lower baseline of small, isolated local models. |
| **FedAvg** | Federated Aggregation | None (Global Average Model) | None | Standard Bi-directional Sync | Standard federated baseline (McMahan et al., 2017). |
| **FedProx ($\mu=0.01$)** | Federated Proximal | None (Global Model + Proximal) | None | Standard Bi-directional Sync | Handles statistical heterogeneity (Li et al., 2020). |
| **FedPer** | Split Federation | Fixed Shared Base, Local Heads | None | Base Only Uplink | Classic split-layer personalized federated learning (Arivazhagan et al., 2019). |
| **Ditto ($\lambda=0.1$)** | Bi-Level Optimization | Local $L_2$ Regularized Head | None | Full Parameter Upload | State-of-the-art personalized FL baseline (Li et al., 2021). |
| **FPDAF-v1 (Baseline)** | Drift-Aware FL | Head Adaptation + CSSP | Standard CUSUM | Selective Freezing | Core drift-aware baseline without dual-phase cross-attention. |
| **FPDAF-v2 (Proposed)** | Drift-Aware Dual-Phase | DDP-ERP (Dual-Phase Attention) | AD-CUSUM (JSD + Grad Var) | CSSP (Measured Byte Profiling) | Full proposed research architecture. |

---

## 3. Algorithmic Ablation Study Plan

To isolate the exact contribution of each algorithmic innovation, seven systematic ablations are conducted under identical seeds and hyperparameters:

1. **Ablation 1 (Abl-NoAttn):** FPDAF without attention (standard BiLSTM backbone with mean pooling).
2. **Ablation 2 (Abl-NoDrift):** FPDAF without drift monitoring (AD-CUSUM disabled; continuous fixed federated rounds).
3. **Ablation 3 (Abl-StdCUSUM):** FPDAF with standard loss-residual CUSUM instead of AD-CUSUM ($D_{\text{JSD}} = 0, w_{\text{grad}} = 1.0$).
4. **Ablation 4 (Abl-NoPers):** FPDAF without personalization (all layers aggregated globally without localized adaptation).
5. **Ablation 5 (Abl-NoCSSP):** FPDAF without CSSP (shared backbone is not frozen; full model uploaded during drift).
6. **Ablation 6 (Abl-DP):** FPDAF with Differential Privacy (DP-FedAvg with Rényi differential privacy at $\epsilon = 4.0, \delta = 10^{-5}$) to evaluate the privacy-utility tradeoff.
7. **Ablation 7 (Full-FPDAF):** The complete integrated framework.

---

## 4. Evaluation Metrics Protocol

### 4.1 Discrimination Metrics
* **AUROC:** Area Under the Receiver Operating Characteristic Curve (threshold-independent discrimination).
* **AUPRC:** Area Under the Precision-Recall Curve (primary metric for severe class imbalance, baseline $= 0.0258$).
* **Sensitivity / Recall:** $\text{TPR} = \frac{\text{TP}}{\text{TP} + \text{FN}}$ at calibrated clinical operating point $\tau = 0.50$ and $\tau = 0.65$.
* **Specificity:** $\text{TNR} = \frac{\text{TN}}{\text{TN} + \text{FP}}$.
* **Positive Predictive Value (PPV) / Precision:** $\frac{\text{TP}}{\text{TP} + \text{FP}}$.
* **Negative Predictive Value (NPV):** $\frac{\text{TN}}{\text{TN} + \text{FN}}$.
* **F1 Score:** Harmonic mean of Precision and Recall.
* **Balanced Accuracy:** $\frac{\text{Sensitivity} + \text{Specificity}}{2}$.

### 4.2 Reliability & Calibration Metrics
* **Expected Calibration Error (ECE):** Partitioning predictions into $M=10$ confidence bins and weighting $| \text{acc}(B_m) - \text{conf}(B_m) |$.
* **Brier Score:** Mean squared prediction error $\frac{1}{N} \sum_{i=1}^N (\hat{p}_i - y_i)^2$.
* **Reliability Diagrams:** Visual calibration curves plotting predicted probability vs. observed frequency.

### 4.3 Clinical Early Warning & Utility Metrics
* **Early Warning Lead Time ($\Delta t$):** For each sepsis-positive test encounter, identify clinical onset $t_{\text{sepsis}}$ and the timestamp of the first true positive alert $t_{\text{alert}}$ where $\hat{p}(t) \ge \tau$:
  $$\Delta t = t_{\text{sepsis}} - t_{\text{alert}} \quad (\text{hours})$$
* **False Alert Frequency:** Number of false-positive alarms per patient-day of ICU monitoring:
  $$\text{FAR} = \frac{\text{Total False Alerts}}{\text{Total Non-Sepsis Monitored Hours} / 24}$$
* **Decision Curve Analysis (DCA):** Net Benefit across decision threshold probabilities $p_t \in [0.05, 0.50]$.

### 4.4 Communication Profiling Protocol
* **Physical Serialization Profiling:** Implement `CommunicationTracker` in the server/client loop.
* Track total parameters, active trainable parameters, uplink bytes, and downlink bytes per round using `torch.save` buffer serialization to reflect true wire payload.
* Calculate:
  $$\text{Bandwidth Reduction} = \left( 1 - \frac{\text{Total Bytes}_{\text{FPDAF}}}{\text{Total Bytes}_{\text{Ditto}}} \right) \times 100\%$$

---

## 5. Statistical Rigor Protocol

* **Random Seeds:** Experiments are executed across multiple random seeds (`seed: 42`, `seed: 101`, `seed: 2026`).
* **Bootstrap Confidence Intervals:** 95% confidence intervals are computed via $B=1,000$ patient-level bootstrap iterations on the test cohort.
* **Paired Statistical Testing:**
  * Delong's test for comparing AUROC curves against baselines.
  * Paired Wilcoxon signed-rank test across bootstrap resamples for AUPRC and Lead Time.
  * Bonferroni-Holm correction for multi-hypothesis comparison.
