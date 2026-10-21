"""
=============================================================================
FPDAF Phase-II — Exploratory Data Analysis (EDA)
PhysioNet Computing in Cardiology Challenge 2019
=============================================================================
This script reads every .psv patient file from training_setA and training_setB,
computes dataset statistics, analyzes missing values, and generates
distribution plots and heatmaps.

All visualizations are saved to: results/eda/
=============================================================================
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import os
import glob
import json

# -------------------------------------------------------------
# 1. CONFIGURATION & PATHS
# -------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, "datasets", "raw")
SET_A_DIR = os.path.join(RAW_DIR, "training_setA")
SET_B_DIR = os.path.join(RAW_DIR, "training_setB")
RESULTS_DIR = os.path.join(BASE_DIR, "results", "eda")
os.makedirs(RESULTS_DIR, exist_ok=True)

# Plot style
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")
plt.rcParams.update({
    'figure.figsize': (12, 6),
    'font.size': 12,
    'axes.titlesize': 14,
    'axes.labelsize': 12,
    'figure.dpi': 150,
    'savefig.bbox': 'tight',
    'savefig.dpi': 150,
})

# -------------------------------------------------------------
# 2. LOAD ALL PATIENT FILES
# -------------------------------------------------------------

def load_all_patients(data_dir, set_name):
    """Read all .psv files from a directory, return combined DataFrame + per-patient metadata."""
    psv_files = sorted(glob.glob(os.path.join(data_dir, "p*.psv")))
    print(f"  [{set_name}] Found {len(psv_files)} patient files.")

    frames = []
    patient_stats = []

    for i, fpath in enumerate(psv_files):
        pid = os.path.basename(fpath).replace(".psv", "")
        df = pd.read_csv(fpath, sep="|")
        df["PatientID"] = pid
        df["Set"] = set_name

        # Per-patient stats
        icu_stay = len(df)  # Each row = 1 hour
        has_sepsis = int(df["SepsisLabel"].max()) if "SepsisLabel" in df.columns else 0
        patient_stats.append({
            "PatientID": pid,
            "Set": set_name,
            "ICU_Stay_Hours": icu_stay,
            "HasSepsis": has_sepsis,
        })

        frames.append(df)

        if (i + 1) % 5000 == 0:
            print(f"    ... loaded {i+1}/{len(psv_files)} patients")

    combined = pd.concat(frames, ignore_index=True)
    stats_df = pd.DataFrame(patient_stats)
    print(f"  [{set_name}] Total records: {len(combined):,}")
    return combined, stats_df


print("=" * 60)
print("FPDAF Phase-II: Loading PhysioNet 2019 Dataset")
print("=" * 60)

print("\nLoading training_setA...")
df_a, stats_a = load_all_patients(SET_A_DIR, "training_setA")

print("\nLoading training_setB...")
df_b, stats_b = load_all_patients(SET_B_DIR, "training_setB")

# Combine everything
df_all = pd.concat([df_a, df_b], ignore_index=True)
stats_all = pd.concat([stats_a, stats_b], ignore_index=True)

print(f"\n{'=' * 60}")
print(f"COMBINED DATASET LOADED SUCCESSFULLY")
print(f"{'=' * 60}")

# -------------------------------------------------------------
# 3. DATASET STATISTICS
# -------------------------------------------------------------

# Feature columns (exclude metadata)
meta_cols = ["PatientID", "Set"]
feature_cols = [c for c in df_all.columns if c not in meta_cols]
clinical_features = [c for c in feature_cols if c != "SepsisLabel"]

num_patients = len(stats_all)
num_patients_a = len(stats_a)
num_patients_b = len(stats_b)
num_features = len(clinical_features)
num_records = len(df_all)
avg_stay = stats_all["ICU_Stay_Hours"].mean()
max_stay = stats_all["ICU_Stay_Hours"].max()
min_stay = stats_all["ICU_Stay_Hours"].min()
median_stay = stats_all["ICU_Stay_Hours"].median()
sepsis_patients = stats_all["HasSepsis"].sum()
sepsis_rate = (sepsis_patients / num_patients) * 100

print(f"\n{'-' * 60}")
print(f"DATASET STATISTICS")
print(f"{'-' * 60}")
print(f"  Total Patients:          {num_patients:,}")
print(f"    |-- training_setA:     {num_patients_a:,}")
print(f"    \\-- training_setB:     {num_patients_b:,}")
print(f"  Total Features:          {num_features} (+ SepsisLabel target)")
print(f"  Total Records (rows):    {num_records:,}")
print(f"  Average ICU Stay:        {avg_stay:.2f} hours")
print(f"  Maximum ICU Stay:        {max_stay} hours")
print(f"  Minimum ICU Stay:        {min_stay} hours")
print(f"  Median ICU Stay:         {median_stay:.1f} hours")
print(f"  Sepsis-positive:         {sepsis_patients:,} ({sepsis_rate:.2f}%)")
print(f"{'-' * 60}")

# Save statistics to JSON
stats_summary = {
    "total_patients": int(num_patients),
    "training_setA_patients": int(num_patients_a),
    "training_setB_patients": int(num_patients_b),
    "total_features": int(num_features),
    "total_records": int(num_records),
    "avg_icu_stay_hours": round(avg_stay, 2),
    "max_icu_stay_hours": int(max_stay),
    "min_icu_stay_hours": int(min_stay),
    "median_icu_stay_hours": round(float(median_stay), 1),
    "sepsis_positive_patients": int(sepsis_patients),
    "sepsis_rate_percent": round(sepsis_rate, 2),
}
with open(os.path.join(RESULTS_DIR, "dataset_statistics.json"), "w") as f:
    json.dump(stats_summary, f, indent=2)
print("  [Saved] dataset_statistics.json")

# -------------------------------------------------------------
# 4. FEATURE NAMES AND DATA TYPES
# -------------------------------------------------------------

print(f"\n{'-' * 60}")
print(f"FEATURE NAMES & DATA TYPES")
print(f"{'-' * 60}")

feature_info = []
for col in feature_cols:
    dtype = str(df_all[col].dtype)
    non_null = df_all[col].notna().sum()
    feature_info.append({
        "Feature": col,
        "DataType": dtype,
        "Non-Null Count": non_null,
        "Null Count": num_records - non_null,
    })

feature_info_df = pd.DataFrame(feature_info)
print(feature_info_df.to_string(index=False))
feature_info_df.to_csv(os.path.join(RESULTS_DIR, "feature_info.csv"), index=False)
print(f"\n  [Saved] feature_info.csv")

# -------------------------------------------------------------
# 5. MISSING VALUE ANALYSIS
# -------------------------------------------------------------

print(f"\n{'-' * 60}")
print(f"MISSING VALUE ANALYSIS")
print(f"{'-' * 60}")

missing_counts = df_all[feature_cols].isnull().sum()
missing_pct = (missing_counts / num_records) * 100

missing_df = pd.DataFrame({
    "Feature": missing_counts.index,
    "Missing Count": missing_counts.values,
    "Missing %": missing_pct.values,
    "Present %": 100 - missing_pct.values,
}).sort_values("Missing %", ascending=False).reset_index(drop=True)

print(missing_df.to_string(index=False))
missing_df.to_csv(os.path.join(RESULTS_DIR, "missing_values.csv"), index=False)
print(f"\n  [Saved] missing_values.csv")

# -------------------------------------------------------------
# 6. DISTRIBUTION PLOTS — Vital Signs
# -------------------------------------------------------------

print(f"\n{'-' * 60}")
print(f"GENERATING DISTRIBUTION PLOTS")
print(f"{'-' * 60}")

vitals_to_plot = {
    "HR": {"label": "Heart Rate (bpm)", "color": "#e74c3c", "range": (30, 200)},
    "Temp": {"label": "Temperature (deg C)", "color": "#e67e22", "range": (33, 42)},
    "O2Sat": {"label": "SpO2 (%)", "color": "#3498db", "range": (70, 100)},
    "MAP": {"label": "Mean Arterial Pressure (mmHg)", "color": "#2ecc71", "range": (20, 180)},
    "Resp": {"label": "Respiration Rate (breaths/min)", "color": "#9b59b6", "range": (5, 50)},
}

for feat, meta in vitals_to_plot.items():
    data = df_all[feat].dropna()
    if len(data) == 0:
        print(f"  [SKIP] {feat} — no data available")
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

    # Add stats text
    stats_text = (f"Count: {len(data):,}\n"
                  f"Mean: {data.mean():.2f}\n"
                  f"Std: {data.std():.2f}\n"
                  f"Min: {data.min():.1f}\n"
                  f"Max: {data.max():.1f}")
    axes[1].text(1.35, 0.5, stats_text, transform=axes[1].transAxes,
                 fontsize=10, verticalalignment='center',
                 bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

    plt.suptitle(f"PhysioNet 2019 — {meta['label']} Analysis", fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()
    save_path = os.path.join(RESULTS_DIR, f"dist_{feat.lower()}.png")
    plt.savefig(save_path)
    plt.close()
    print(f"  [Saved] dist_{feat.lower()}.png")

# -------------------------------------------------------------
# 7. COMBINED VITAL SIGNS DISTRIBUTION
# -------------------------------------------------------------

fig, axes = plt.subplots(2, 3, figsize=(18, 10))
axes = axes.flatten()

for i, (feat, meta) in enumerate(vitals_to_plot.items()):
    data = df_all[feat].dropna()
    if len(data) == 0:
        continue
    ax = axes[i]
    ax.hist(data, bins=60, range=meta["range"], color=meta["color"],
            alpha=0.75, edgecolor='white', linewidth=0.5)
    ax.set_title(meta["label"], fontweight='bold')
    ax.set_xlabel(meta["label"])
    ax.set_ylabel("Frequency")
    ax.axvline(data.mean(), color='black', linestyle='--', linewidth=1.2,
               label=f"Mean: {data.mean():.1f}")
    ax.legend(fontsize=9)

# Remove empty subplot
axes[5].set_visible(False)

plt.suptitle("PhysioNet 2019 — Vital Signs Distributions (All Patients)",
             fontsize=16, fontweight='bold')
plt.tight_layout()
plt.savefig(os.path.join(RESULTS_DIR, "dist_all_vitals.png"))
plt.close()
print(f"  [Saved] dist_all_vitals.png")

# -------------------------------------------------------------
# 8. ICU STAY DURATION DISTRIBUTION
# -------------------------------------------------------------

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Histogram
axes[0].hist(stats_all["ICU_Stay_Hours"], bins=80, color="#34495e",
             alpha=0.75, edgecolor='white', linewidth=0.5)
axes[0].set_title("ICU Stay Duration Distribution", fontweight='bold')
axes[0].set_xlabel("ICU Stay (hours)")
axes[0].set_ylabel("Number of Patients")
axes[0].axvline(avg_stay, color='red', linestyle='--', linewidth=1.5,
                label=f"Mean: {avg_stay:.1f}h")
axes[0].axvline(median_stay, color='orange', linestyle=':', linewidth=1.5,
                label=f"Median: {median_stay:.1f}h")
axes[0].legend()

# Sepsis vs Non-sepsis
sepsis_stays = stats_all[stats_all["HasSepsis"] == 1]["ICU_Stay_Hours"]
non_sepsis_stays = stats_all[stats_all["HasSepsis"] == 0]["ICU_Stay_Hours"]
axes[1].hist(non_sepsis_stays, bins=80, color="#3498db", alpha=0.6,
             edgecolor='white', label=f"No Sepsis (n={len(non_sepsis_stays):,})")
axes[1].hist(sepsis_stays, bins=80, color="#e74c3c", alpha=0.6,
             edgecolor='white', label=f"Sepsis (n={len(sepsis_stays):,})")
axes[1].set_title("ICU Stay: Sepsis vs Non-Sepsis", fontweight='bold')
axes[1].set_xlabel("ICU Stay (hours)")
axes[1].set_ylabel("Number of Patients")
axes[1].legend()

plt.suptitle("PhysioNet 2019 — ICU Stay Analysis", fontsize=16, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(RESULTS_DIR, "dist_icu_stay.png"))
plt.close()
print(f"  [Saved] dist_icu_stay.png")

# -------------------------------------------------------------
# 9. MISSING VALUE HEATMAP
# -------------------------------------------------------------

print(f"\n{'-' * 60}")
print(f"GENERATING MISSING VALUE HEATMAP")
print(f"{'-' * 60}")

# Feature-level missing percentage heatmap (sorted)
missing_sorted = missing_df.sort_values("Missing %", ascending=True)

fig, ax = plt.subplots(figsize=(10, 14))
colors = ['#e74c3c' if pct > 80 else '#e67e22' if pct > 50 else '#f1c40f' if pct > 20 else '#2ecc71'
          for pct in missing_sorted["Missing %"]]
bars = ax.barh(missing_sorted["Feature"], missing_sorted["Missing %"], color=colors,
               edgecolor='white', linewidth=0.5)
ax.set_xlabel("Missing Values (%)", fontsize=12)
ax.set_title("Missing Value Percentage by Feature\nPhysioNet 2019 Dataset",
             fontsize=14, fontweight='bold')
ax.set_xlim(0, 105)

# Add percentage labels
for bar, pct in zip(bars, missing_sorted["Missing %"]):
    ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2,
            f'{pct:.1f}%', va='center', fontsize=8)

# Legend
from matplotlib.patches import Patch
legend_elements = [
    Patch(facecolor='#2ecc71', label='< 20% missing'),
    Patch(facecolor='#f1c40f', label='20-50% missing'),
    Patch(facecolor='#e67e22', label='50-80% missing'),
    Patch(facecolor='#e74c3c', label='> 80% missing'),
]
ax.legend(handles=legend_elements, loc='lower right', fontsize=9)

plt.tight_layout()
plt.savefig(os.path.join(RESULTS_DIR, "missing_values_heatmap.png"))
plt.close()
print(f"  [Saved] missing_values_heatmap.png")

# Also generate a seaborn-style grid heatmap (sampled patients)
print("  Generating grid heatmap (sampled 200 patients)...")
np.random.seed(42)
sample_ids = np.random.choice(df_all["PatientID"].unique(), size=min(200, num_patients), replace=False)
df_sample = df_all[df_all["PatientID"].isin(sample_ids)].head(5000)

fig, ax = plt.subplots(figsize=(16, 8))
missing_matrix = df_sample[clinical_features].isnull().astype(int)
sns.heatmap(missing_matrix.T, cbar=False, cmap=["#2ecc71", "#e74c3c"],
            xticklabels=False, yticklabels=True, ax=ax)
ax.set_title("Missing Value Pattern (Sample of 200 Patients)\nGreen = Present, Red = Missing",
             fontsize=14, fontweight='bold')
ax.set_xlabel("Records (hourly observations)")
ax.set_ylabel("Features")

plt.tight_layout()
plt.savefig(os.path.join(RESULTS_DIR, "missing_values_grid_heatmap.png"))
plt.close()
print(f"  [Saved] missing_values_grid_heatmap.png")

# -------------------------------------------------------------
# 10. SEPSIS LABEL ANALYSIS
# -------------------------------------------------------------

print(f"\n{'-' * 60}")
print(f"SEPSIS LABEL ANALYSIS")
print(f"{'-' * 60}")

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Patient-level
sepsis_counts = stats_all["HasSepsis"].value_counts()
labels_p = [f"No Sepsis\n({sepsis_counts.get(0, 0):,})", f"Sepsis\n({sepsis_counts.get(1, 0):,})"]
colors_p = ["#3498db", "#e74c3c"]
axes[0].pie(sepsis_counts.sort_index().values, labels=labels_p, colors=colors_p,
            autopct='%1.1f%%', startangle=90, textprops={'fontsize': 11})
axes[0].set_title("Patient-Level Sepsis Distribution", fontweight='bold')

# Record-level
record_sepsis = df_all["SepsisLabel"].value_counts()
labels_r = [f"Non-Sepsis Hours\n({record_sepsis.get(0, 0):,})",
            f"Sepsis Hours\n({record_sepsis.get(1, 0):,})"]
axes[1].pie(record_sepsis.sort_index().values, labels=labels_r, colors=colors_p,
            autopct='%1.2f%%', startangle=90, textprops={'fontsize': 11})
axes[1].set_title("Record-Level Sepsis Distribution", fontweight='bold')

plt.suptitle("PhysioNet 2019 — Sepsis Label Imbalance", fontsize=16, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(RESULTS_DIR, "sepsis_distribution.png"))
plt.close()
print(f"  [Saved] sepsis_distribution.png")

# -------------------------------------------------------------
# 11. SUMMARY
# -------------------------------------------------------------

print(f"\n{'=' * 60}")
print(f"EDA COMPLETE — All outputs saved to: results/eda/")
print(f"{'=' * 60}")
print(f"\nGenerated files:")
for f in sorted(os.listdir(RESULTS_DIR)):
    fpath = os.path.join(RESULTS_DIR, f)
    size_kb = os.path.getsize(fpath) / 1024
    print(f"  📊 {f} ({size_kb:.1f} KB)")
