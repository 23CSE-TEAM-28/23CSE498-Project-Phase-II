# Contributing to FPDAF

Welcome to the **Federated Personalized Drift-Aware Attention Framework (FPDAF)** repository! As a collaborative B.Tech Final Year Project, we use structured development guidelines to maintain a clean codebase.

---

## 🌿 Branching Strategy
We follow a Git Flow branching model:
* **`main`**: Production-ready branch. Only updated via approved Pull Requests. Always stable.
* **`develop`**: Integration branch for new features and testing.
* **Feature Branches (`feature/feature-name`)**: Created for individual feature development (e.g. `feature/fedper-personalized-heads`, `feature/shap-explainability`).
  * Branch from: `develop`
  * Merge back to: `develop`

---

## 💻 Local Development Workflow
1. **Pull the latest updates**:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit often**: Keep commits focused and logically grouped.
4. **Run Preprocessing Audits**: Before submitting changes to preprocessing or evaluation modules, verify correctness:
   ```bash
   python evaluation/preprocessing_audit.py
   ```
5. **Push and create a Pull Request**:
   ```bash
   git push origin feature/your-feature-name
   ```

---

## 🎨 Code Style and Guidelines
* **Python Compliance**: Follow PEP 8 guidelines. Use 4 spaces for indentation.
* **Docstrings**: Document all new modules, classes, and functions using Google-style docstrings:
  ```python
  def build_sliding_window(df: pd.DataFrame, window_size: int = 24) -> np.ndarray:
      """
      Generates sequence-aligned sliding windows from patient dataframe.
      
      Args:
          df (pd.DataFrame): Imputed and scaled patient data.
          window_size (int): Temporal window length in hours.
          
      Returns:
          np.ndarray: Reshaped sliding window matrices.
      """
  ```
* **Git Commit Rules**: Write clear, descriptive, imperatively styled commit messages (e.g. `Implement attention layer weights aggregation`, not `added attention layers`).
