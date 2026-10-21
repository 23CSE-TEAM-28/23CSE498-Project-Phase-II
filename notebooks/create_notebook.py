"""
Generate EDA.ipynb notebook programmatically using nbformat.
Run this AFTER eda_analysis.py has completed and saved results.
"""
import nbformat as nbf
import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESULTS_DIR = os.path.join(BASE_DIR, "results", "eda")
NOTEBOOK_PATH = os.path.join(BASE_DIR, "notebooks", "EDA.ipynb")

nb = nbf.v4.new_notebook()
nb.metadata = {
    "kernelspec": {
        "display_name": "Python 3",
        "language": "python",
        "name": "python3"
    },
    "language_info": {
        "name": "python",
        "version": "3.11.0"
    }
}

cells = []

# ── Title ──
cells.append(nbf.v4.new_markdown_cell(
"""# 📊 FPDAF Phase-II: Exploratory Data Analysis (EDA)
## PhysioNet Computing in Cardiology Challenge 2019

**Objective:** Perform comprehensive exploratory analysis of the raw PhysioNet 2019 Sepsis prediction dataset before any preprocessing.

**Dataset:** 40,327 ICU patient records across two hospital systems (training_setA & training_setB), each containing hourly clinical observations with 40 features.

---"""
))

# ── Cell 1: Imports ──
cells.append(nbf.v4.new_markdown_cell("## 1. Setup & Imports"))
cells.append(nbf.v4.new_code_cell(
"""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import glob
import json

# Configuration
BASE_DIR = os.path.dirname(os.getcwd()) if os.path.basename(os.getcwd()) == 'notebooks' else os.getcwd()
RAW_DIR = os.path.join(BASE_DIR, "datasets", "raw")
SET_A_DIR = os.path.join(RAW_DIR, "training_setA")
SET_B_DIR = os.path.join(RAW_DIR, "training_setB")
RESULTS_DIR = os.path.join(BASE_DIR, "results", "eda")
os.makedirs(RESULTS_DIR, exist_ok=True)

# Plot styling
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")
plt.rcParams.update({
    'figure.figsize': (12, 6),
    'font.size': 12,
    'axes.titlesize': 14,
    'axes.labelsize': 12,
    'figure.dpi': 120,
})

print("Setup complete.")
print(f"Dataset directory: {RAW_DIR}")"""
))

# ── Cell 2: Load Data ──
cells.append(nbf.v4.new_markdown_cell(
"""## 2. Load All Patient Files

Each `.psv` (pipe-separated values) file represents one ICU patient stay. We read **every** file from both training sets and combine them into a single DataFrame for analysis."""
))
cells.append(nbf.v4.new_code_cell(
"""def load_all_patients(data_dir, set_name):
    \"\"\"Read all .psv files from a directory, return combined DataFrame + per-patient metadata.\"\"\"
    psv_files = sorted(glob.glob(os.path.join(data_dir, "p*.psv")))
    print(f"[{set_name}] Found {len(psv_files)} patient files.")
    
    frames = []
    patient_stats = []
    
    for i, fpath in enumerate(psv_files):
        pid = os.path.basename(fpath).replace(".psv", "")
        df = pd.read_csv(fpath, sep="|")
        df["PatientID"] = pid
        df["Set"] = set_name
        
        # Per-patient metadata
        icu_stay = len(df)
        has_sepsis = int(df["SepsisLabel"].max()) if "SepsisLabel" in df.columns else 0
        patient_stats.append({
            "PatientID": pid,
            "Set": set_name,
            "ICU_Stay_Hours": icu_stay,
            "HasSepsis": has_sepsis,
        })
        frames.append(df)
        
        if (i + 1) % 5000 == 0:
            print(f"  ... loaded {i+1}/{len(psv_files)}")
    
    combined = pd.concat(frames, ignore_index=True)
    stats_df = pd.DataFrame(patient_stats)
    print(f"[{set_name}] Total records: {len(combined):,}\\n")
    return combined, stats_df

# Load both training sets
print("Loading training_setA...")
df_a, stats_a = load_all_patients(SET_A_DIR, "training_setA")

print("Loading training_setB...")
df_b, stats_b = load_all_patients(SET_B_DIR, "training_setB")

# Combine
df_all = pd.concat([df_a, df_b], ignore_index=True)
stats_all = pd.concat([stats_a, stats_b], ignore_index=True)

print(f"\\n{'='*50}")
print(f"Dataset loaded: {len(df_all):,} total records from {len(stats_all):,} patients")
print(f"{'='*50}")"""
))

# ── Cell 3: Dataset Statistics ──
cells.append(nbf.v4.new_markdown_cell(
"""## 3. Dataset Statistics

Key summary metrics for the entire PhysioNet 2019 dataset."""
))
cells.append(nbf.v4.new_code_cell(
"""# Define column groups
meta_cols = ["PatientID", "Set"]
feature_cols = [c for c in df_all.columns if c not in meta_cols]
clinical_features = [c for c in feature_cols if c != "SepsisLabel"]

# Compute statistics
num_patients = len(stats_all)
num_features = len(clinical_features)
num_records = len(df_all)
avg_stay = stats_all["ICU_Stay_Hours"].mean()
max_stay = stats_all["ICU_Stay_Hours"].max()
min_stay = stats_all["ICU_Stay_Hours"].min()
median_stay = stats_all["ICU_Stay_Hours"].median()
sepsis_patients = stats_all["HasSepsis"].sum()
sepsis_rate = (sepsis_patients / num_patients) * 100

print(f"{'─' * 50}")
print(f"DATASET STATISTICS")
print(f"{'─' * 50}")
print(f"  Total Patients:        {num_patients:,}")
print(f"    ├── training_setA:   {len(stats_a):,}")
print(f"    └── training_setB:   {len(stats_b):,}")
print(f"  Total Features:        {num_features} (+ SepsisLabel)")
print(f"  Total Records:         {num_records:,}")
print(f"  Average ICU Stay:      {avg_stay:.2f} hours")
print(f"  Maximum ICU Stay:      {max_stay} hours")
print(f"  Minimum ICU Stay:      {min_stay} hours")
print(f"  Median ICU Stay:       {median_stay:.1f} hours")
print(f"  Sepsis-positive:       {sepsis_patients:,} ({sepsis_rate:.2f}%)")
print(f"{'─' * 50}")"""
))

# ── Cell 4: Feature Info ──
cells.append(nbf.v4.new_markdown_cell(
"""## 4. Feature Names and Data Types

The PhysioNet 2019 dataset contains **40 clinical features** grouped into:
- **Vital Signs** (8): HR, O2Sat, Temp, SBP, MAP, DBP, Resp, EtCO2
- **Laboratory Values** (26): Blood gas, chemistry, hematology measurements
- **Demographics** (6): Age, Gender, Unit1, Unit2, HospAdmTime, ICULOS"""
))
cells.append(nbf.v4.new_code_cell(
"""# Feature information table
feature_info = []
for col in feature_cols:
    non_null = df_all[col].notna().sum()
    feature_info.append({
        "Feature": col,
        "Data Type": str(df_all[col].dtype),
        "Non-Null": f"{non_null:,}",
        "Null": f"{num_records - non_null:,}",
        "Missing %": f"{((num_records - non_null) / num_records) * 100:.1f}%"
    })

feature_df = pd.DataFrame(feature_info)
feature_df"""
))

# ── Cell 5: Missing Values ──
cells.append(nbf.v4.new_markdown_cell(
"""## 5. Missing Value Analysis

ICU data is inherently sparse — many lab tests are only ordered occasionally. Understanding the missingness pattern is critical before choosing an imputation strategy."""
))
cells.append(nbf.v4.new_code_cell(
"""# Compute missing percentages
missing_counts = df_all[feature_cols].isnull().sum()
missing_pct = (missing_counts / num_records) * 100

missing_df = pd.DataFrame({
    "Feature": missing_counts.index,
    "Missing Count": missing_counts.values,
    "Missing %": missing_pct.values,
}).sort_values("Missing %", ascending=False).reset_index(drop=True)

# Print top 15 most missing features
print("Top 15 features with highest missing rates:\\n")
print(missing_df.head(15).to_string(index=False))
print(f"\\n... and {len(missing_df) - 15} more features")

# Save to CSV
missing_df.to_csv(os.path.join(RESULTS_DIR, "missing_values.csv"), index=False)"""
))

# ── Cell 6: Distribution Plots ──
cells.append(nbf.v4.new_markdown_cell(
"""## 6. Vital Signs Distributions

Distribution analysis for the five key vital signs: **Heart Rate, Temperature, SpO2, MAP, and Respiration Rate**.

Each plot shows:
- Histogram with mean/median markers
- Box plot with summary statistics"""
))
cells.append(nbf.v4.new_code_cell(
"""vitals_to_plot = {
    "HR":    {"label": "Heart Rate (bpm)",                   "color": "#e74c3c", "range": (30, 200)},
    "Temp":  {"label": "Temperature (°C)",                   "color": "#e67e22", "range": (33, 42)},
    "O2Sat": {"label": "SpO2 (%)",                           "color": "#3498db", "range": (70, 100)},
    "MAP":   {"label": "Mean Arterial Pressure (mmHg)",      "color": "#2ecc71", "range": (20, 180)},
    "Resp":  {"label": "Respiration Rate (breaths/min)",     "color": "#9b59b6", "range": (5, 50)},
}

for feat, meta in vitals_to_plot.items():
    data = df_all[feat].dropna()
    if len(data) == 0:
        continue

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Histogram
    axes[0].hist(data, bins=80, range=meta["range"], color=meta["color"],
                 alpha=0.75, edgecolor='white', linewidth=0.5)
    axes[0].set_title(f"Distribution of {meta['label']}", fontweight='bold')
    axes[0].set_xlabel(meta["label"])
    axes[0].set_ylabel("Frequency")
    axes[0].axvline(data.mean(), color='black', linestyle='--', linewidth=1.5,
                    label=f"Mean: {data.mean():.1f}")
    axes[0].axvline(data.median(), color='gray', linestyle=':', linewidth=1.5,
                    label=f"Median: {data.median():.1f}")
    axes[0].legend(fontsize=10)

    # Box plot
    bp = axes[1].boxplot(data.values, vert=True, patch_artist=True,
                         widths=0.5, showmeans=True,
                         meanprops=dict(marker='D', markerfacecolor='white', markersize=8))
    bp['boxes'][0].set_facecolor(meta["color"])
    bp['boxes'][0].set_alpha(0.7)
    axes[1].set_title(f"Box Plot of {meta['label']}", fontweight='bold')
    axes[1].set_ylabel(meta["label"])
    axes[1].set_xticklabels([feat])

    stats_text = (f"Count: {len(data):,}\\nMean: {data.mean():.2f}\\n"
                  f"Std: {data.std():.2f}\\nMin: {data.min():.1f}\\nMax: {data.max():.1f}")
    axes[1].text(1.35, 0.5, stats_text, transform=axes[1].transAxes,
                 fontsize=10, verticalalignment='center',
                 bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

    plt.suptitle(f"PhysioNet 2019 — {meta['label']} Analysis", fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig(os.path.join(RESULTS_DIR, f"dist_{feat.lower()}.png"))
    plt.show()
    print()"""
))

# ── Cell 7: Combined Vitals ──
cells.append(nbf.v4.new_markdown_cell("### Combined Vital Signs Overview"))
cells.append(nbf.v4.new_code_cell(
"""fig, axes = plt.subplots(2, 3, figsize=(18, 10))
axes = axes.flatten()

for i, (feat, meta) in enumerate(vitals_to_plot.items()):
    data = df_all[feat].dropna()
    ax = axes[i]
    ax.hist(data, bins=60, range=meta["range"], color=meta["color"],
            alpha=0.75, edgecolor='white', linewidth=0.5)
    ax.set_title(meta["label"], fontweight='bold')
    ax.set_xlabel(meta["label"])
    ax.set_ylabel("Frequency")
    ax.axvline(data.mean(), color='black', linestyle='--', linewidth=1.2,
               label=f"Mean: {data.mean():.1f}")
    ax.legend(fontsize=9)

axes[5].set_visible(False)

plt.suptitle("PhysioNet 2019 — Vital Signs Distributions (All Patients)",
             fontsize=16, fontweight='bold')
plt.tight_layout()
plt.savefig(os.path.join(RESULTS_DIR, "dist_all_vitals.png"))
plt.show()"""
))

# ── Cell 8: ICU Stay ──
cells.append(nbf.v4.new_markdown_cell(
"""## 7. ICU Stay Duration Analysis

Understanding the length of ICU stays and how it differs between sepsis-positive and sepsis-negative patients."""
))
cells.append(nbf.v4.new_code_cell(
"""fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Overall distribution
axes[0].hist(stats_all["ICU_Stay_Hours"], bins=80, color="#34495e",
             alpha=0.75, edgecolor='white')
axes[0].set_title("ICU Stay Duration Distribution", fontweight='bold')
axes[0].set_xlabel("ICU Stay (hours)")
axes[0].set_ylabel("Number of Patients")
axes[0].axvline(avg_stay, color='red', linestyle='--', label=f"Mean: {avg_stay:.1f}h")
axes[0].axvline(median_stay, color='orange', linestyle=':', label=f"Median: {median_stay:.1f}h")
axes[0].legend()

# Sepsis vs Non-sepsis
sepsis_stays = stats_all[stats_all["HasSepsis"] == 1]["ICU_Stay_Hours"]
non_sepsis_stays = stats_all[stats_all["HasSepsis"] == 0]["ICU_Stay_Hours"]
axes[1].hist(non_sepsis_stays, bins=80, color="#3498db", alpha=0.6,
             label=f"No Sepsis (n={len(non_sepsis_stays):,})")
axes[1].hist(sepsis_stays, bins=80, color="#e74c3c", alpha=0.6,
             label=f"Sepsis (n={len(sepsis_stays):,})")
axes[1].set_title("ICU Stay: Sepsis vs Non-Sepsis", fontweight='bold')
axes[1].set_xlabel("ICU Stay (hours)")
axes[1].set_ylabel("Number of Patients")
axes[1].legend()

plt.suptitle("PhysioNet 2019 — ICU Stay Analysis", fontsize=16, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(RESULTS_DIR, "dist_icu_stay.png"))
plt.show()"""
))

# ── Cell 9: Missing Heatmap ──
cells.append(nbf.v4.new_markdown_cell(
"""## 8. Missing Value Heatmap

Two views:
1. **Bar chart** — Missing percentage for every feature, color-coded by severity
2. **Grid heatmap** — Visualizing the sparsity pattern across a sample of patients"""
))
cells.append(nbf.v4.new_code_cell(
"""# Bar chart of missing percentages
from matplotlib.patches import Patch

missing_sorted = missing_df.sort_values("Missing %", ascending=True)

fig, ax = plt.subplots(figsize=(10, 14))
colors = ['#e74c3c' if pct > 80 else '#e67e22' if pct > 50 
          else '#f1c40f' if pct > 20 else '#2ecc71'
          for pct in missing_sorted["Missing %"]]
bars = ax.barh(missing_sorted["Feature"], missing_sorted["Missing %"], 
               color=colors, edgecolor='white', linewidth=0.5)
ax.set_xlabel("Missing Values (%)")
ax.set_title("Missing Value Percentage by Feature\\nPhysioNet 2019 Dataset",
             fontsize=14, fontweight='bold')
ax.set_xlim(0, 105)

for bar, pct in zip(bars, missing_sorted["Missing %"]):
    ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2,
            f'{pct:.1f}%', va='center', fontsize=8)

legend_elements = [
    Patch(facecolor='#2ecc71', label='< 20% missing'),
    Patch(facecolor='#f1c40f', label='20-50% missing'),
    Patch(facecolor='#e67e22', label='50-80% missing'),
    Patch(facecolor='#e74c3c', label='> 80% missing'),
]
ax.legend(handles=legend_elements, loc='lower right', fontsize=9)

plt.tight_layout()
plt.savefig(os.path.join(RESULTS_DIR, "missing_values_heatmap.png"))
plt.show()"""
))

cells.append(nbf.v4.new_code_cell(
"""# Grid heatmap (sampled patients)
np.random.seed(42)
sample_ids = np.random.choice(df_all["PatientID"].unique(), size=200, replace=False)
df_sample = df_all[df_all["PatientID"].isin(sample_ids)].head(5000)

fig, ax = plt.subplots(figsize=(16, 8))
missing_matrix = df_sample[clinical_features].isnull().astype(int)
sns.heatmap(missing_matrix.T, cbar=False, cmap=["#2ecc71", "#e74c3c"],
            xticklabels=False, yticklabels=True, ax=ax)
ax.set_title("Missing Value Pattern (Sample of 200 Patients)\\nGreen = Present, Red = Missing",
             fontsize=14, fontweight='bold')
ax.set_xlabel("Records (hourly observations)")
ax.set_ylabel("Features")

plt.tight_layout()
plt.savefig(os.path.join(RESULTS_DIR, "missing_values_grid_heatmap.png"))
plt.show()"""
))

# ── Cell 10: Sepsis ──
cells.append(nbf.v4.new_markdown_cell(
"""## 9. Sepsis Label Distribution

Analyzing the class imbalance — a critical factor for model design and loss function selection."""
))
cells.append(nbf.v4.new_code_cell(
"""fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Patient-level
sepsis_counts = stats_all["HasSepsis"].value_counts()
labels_p = [f"No Sepsis\\n({sepsis_counts.get(0, 0):,})", 
            f"Sepsis\\n({sepsis_counts.get(1, 0):,})"]
colors_p = ["#3498db", "#e74c3c"]
axes[0].pie(sepsis_counts.sort_index().values, labels=labels_p, colors=colors_p,
            autopct='%1.1f%%', startangle=90, textprops={'fontsize': 11})
axes[0].set_title("Patient-Level Sepsis Distribution", fontweight='bold')

# Record-level
record_sepsis = df_all["SepsisLabel"].value_counts()
labels_r = [f"Non-Sepsis Hours\\n({record_sepsis.get(0, 0):,})",
            f"Sepsis Hours\\n({record_sepsis.get(1, 0):,})"]
axes[1].pie(record_sepsis.sort_index().values, labels=labels_r, colors=colors_p,
            autopct='%1.2f%%', startangle=90, textprops={'fontsize': 11})
axes[1].set_title("Record-Level Sepsis Distribution", fontweight='bold')

plt.suptitle("PhysioNet 2019 — Sepsis Label Imbalance", fontsize=16, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(RESULTS_DIR, "sepsis_distribution.png"))
plt.show()"""
))

# ── Conclusion ──
cells.append(nbf.v4.new_markdown_cell(
"""---

## 10. Key EDA Findings

### Dataset Scale
- **40,327 patients** across two hospital systems with distinct demographic profiles
- Hourly clinical observations across **40 features**

### Missing Data Patterns
- Lab values (e.g., Bilirubin_direct, TroponinI, Fibrinogen) have **>90% missing** — they are ordered rarely
- Vital signs (HR, O2Sat, Resp) have relatively **low missingness** (~10-15%)
- Demographics (Age, Gender) are **always present**
- Imputation strategy must account for these vastly different missingness levels

### Class Imbalance
- Sepsis is a **rare event** — only ~7-8% of patients develop sepsis
- At the hourly record level, the imbalance is even more extreme
- Will require techniques like class weighting, focal loss, or oversampling

### ICU Stay Duration
- Highly skewed distribution — most stays are short, but some extend significantly
- Sepsis patients tend to have longer ICU stays

### Next Steps (Preprocessing — Phase 2)
1. Feature-aware imputation (forward-fill + domain-specific defaults)
2. Sliding window construction for LSTM input
3. Train/validation/test splitting at the patient level
4. Normalization using StandardScaler fit on training data only

---
*Generated by FPDAF Phase-II EDA Pipeline*"""
))

nb.cells = cells

with open(NOTEBOOK_PATH, 'w', encoding='utf-8') as f:
    nbf.write(nb, f)

print(f"Notebook created: {NOTEBOOK_PATH}")
