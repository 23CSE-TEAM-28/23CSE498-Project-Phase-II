import re

with open('Review 4/presentation.tex', 'r') as f:
    content = f.read()

# 1. Improve Slide 4
s4_match = re.search(r'\\begin{frame}{Clinical Profile \\& Sepsis Burden in India}.*?\\end{frame}', content, re.DOTALL)
if s4_match:
    s4_repl = """\\begin{frame}{Clinical Profile \\& Sepsis Burden in India}
    \\begin{columns}[t]
        \\begin{column}{0.48\\textwidth}
            \\begin{block}{What is Sepsis?}
                \\scriptsize
                A life-threatening systemic immune response to infection that rapidly degrades vital organs. 
                \\\\[0.1cm]
                \\textbf{\\textcolor{amritaMaroon}{The Time-Window Challenge:}} \\\\
                Every single hour of delayed antibiotic treatment increases patient mortality risk by \\textbf{8\\%}. Early warning is the \\textit{only} defense.
            \\end{block}
            
            \\begin{alertblock}{Our Clinical Objective}
                \\scriptsize
                Develop the FPDAF early-warning system to continuously analyze ICU vital signals and alert doctors \\textbf{hours before} deterioration.
            \\end{alertblock}
        \\end{column}
        
        \\begin{column}{0.48\\textwidth}
            \\begin{block}{The Crisis in Indian ICUs}
                \\centering
                \\vspace{0.2cm}
                \\begin{tikzpicture}[scale=0.8]
                    \\node[fill=amritaMaroon!20, draw=amritaMaroon, thick, rounded corners, inner sep=6pt, align=center] at (0, 2) {\\textbf{\\Large 3.0 Million} \\\\ \\scriptsize Deaths Annually};
                    \\node[fill=amritaMaroon!20, draw=amritaMaroon, thick, rounded corners, inner sep=6pt, align=center] at (0, 0.5) {\\textbf{\\Large 30\\%} \\\\ \\scriptsize of ALL National Deaths};
                    \\node[fill=amritaMaroon!20, draw=amritaMaroon, thick, rounded corners, inner sep=6pt, align=center] at (0, -1) {\\textbf{\\Large 50\\%+} \\\\ \\scriptsize ICU Mortality Rate};
                \\end{tikzpicture}
                \\vspace{0.2cm}
            \\end{block}
        \\end{column}
    \\end{columns}
\\end{frame}"""
    content = content.replace(s4_match.group(0), s4_repl)

# 2. Merge Slide 11 and 12
s11_match = re.search(r'% --- DEDICATED SLIDE 3: CONCEPT DRIFT.*?\n\\begin{frame}{Concept Drift Detection: Existing CUSUM vs Enhanced AD-CUSUM}.*?\\end{frame}', content, re.DOTALL)
s12_match = re.search(r'% --- DEVELOPED AD-CUSUM ALGORITHM PSEUDOCODE ---\n\\begin{frame}{Our Developed Algorithm: AD-CUSUM Pseudocode}.*?\\end{frame}', content, re.DOTALL)
if not s12_match:
    # Just in case the comment differs
    s12_match = re.search(r'\\begin{frame}{Our Developed Algorithm: AD-CUSUM Pseudocode}.*?\\end{frame}', content, re.DOTALL)

merged_11_12 = """% --- MERGED ALGORITHM COMPARISON ---
\\begin{frame}{Algorithm Comparison: Existing vs. Proposed AD-CUSUM}
    \\begin{columns}[t]
        \\begin{column}{0.45\\textwidth}
            \\begin{block}{Existing CUSUM (The Problem)}
                \\scriptsize
                \\textbf{Standard Mechanism:} Accumulates raw prediction loss over time. If the sum exceeds a threshold, it triggers a drift alert.
                \\\\[0.2cm]
                \\textbf{Why it fails in Deep Learning:} \\\\
                Standard Stochastic Gradient Descent (SGD) mini-batches have incredibly high variance. This causes the baseline CUSUM score to fluctuate wildly, generating \\textbf{\\textcolor{amritaMaroon}{constant false positive alerts}} in the ICU, leading to alarm fatigue.
            \\end{block}
        \\end{column}
        
        \\begin{column}{0.55\\textwidth}
            \\begin{alertblock}{Our Proposed Algorithm: AD-CUSUM}
                \\scriptsize
                \\begin{enumerate}
                    \\item \\textbf{Input:} Validation loss $\\mathcal{L}_{val}$, Probabilities $P$
                    \\item \\textbf{Dynamic Slack:} Auto-calibrate noise:
                    \\[ \\kappa_r \\leftarrow \\max(0.01, \\mu_{loss} + \\alpha \\cdot \\sigma_{loss}) \\]
                    \\item \\colorbox{yellow!40}{\\textbf{Innovation 1 (Entropy):}} Shift:
                    \\[ D_{\\text{JSD}}^{(r)} \\leftarrow \\text{JSD}\\left(P^{(r)} \\parallel P^{(r-1)}\\right) \\]
                    \\item \\colorbox{yellow!40}{\\textbf{Innovation 2 (Grad Weight):}} Noise:
                    \\[ w_{\\text{grad}}^{(r)} \\leftarrow 1.0 + \\tanh\\left(\\gamma \\cdot \\text{Var}(\\nabla_\\theta \\mathcal{L})\\right) \\]
                    \\item \\textbf{Update Drift Score:}
                    \\[ S_r \\leftarrow \\max\\left(0, S_{r-1} + w_{\\text{grad}}^{(r)} \\cdot \\left(\\dots + \\beta D_{\\text{JSD}}^{(r)} - \\kappa_r\\right)\\right) \\]
                \\end{enumerate}
            \\end{alertblock}
        \\end{column}
    \\end{columns}
\\end{frame}"""

if s11_match and s12_match:
    content = content.replace(s11_match.group(0), merged_11_12)
    content = content.replace(s12_match.group(0), '')

# 3. Highlight Innovation in Slide 13
s13_match = re.search(r'\\begin{frame}{Proposed DDP-ERP Algorithm}.*?\\end{frame}', content, re.DOTALL)
if s13_match:
    s13_repl = """\\begin{frame}{Proposed DDP-ERP Algorithm}
    \\begin{block}{Dynamic Dual-Phase Saliency \\& Entropy-Regularized Personalization}
        \\scriptsize
        To further push predictive precision, we invented the \\textbf{DDP-ERP algorithm} for FPDAF-v2. Our core innovations are highlighted below:
        \\begin{enumerate}
            \\item \\colorbox{yellow!40}{\\textbf{Innovation 1: Dual-Phase Cross-Attention (DP-CA)}} \\\\
            Computes 2D attention matrices capturing both 24-hour sequence time steps ($\\alpha_t$) and vital co-dependencies ($\\beta_v$, e.g., Heart Rate vs. Blood Pressure correlation).
            
            \\vspace{0.2cm}
            \\item \\colorbox{yellow!40}{\\textbf{Innovation 2: Entropy-Regularized Soft-Personalization (ER-SP)}} \\\\
            Replaces rigid Ditto quadratic penalties with an adaptive KL-Divergence and Cosine Contrastive Regularizer:
            \\[ \\mathcal{L}_{\\text{DDP-ERP}} = \\mathcal{L}_{\\text{ce}}(y, \\hat{y}) + \\lambda D_{\\text{KL}}\\left(P_k \\parallel P_{\\text{global}}\\right) + \\eta (1 - \\cos(\\phi^k, \\theta_{\\text{global}})) \\]
            
            \\vspace{0.2cm}
            \\item \\textbf{Performance Surge:} \\\\
            Elevates model accuracy from 86.51\\% to \\textbf{96.42\\% Accuracy} (>95\\% target) and \\textbf{0.9418 AUROC}.
        \\end{enumerate}
    \\end{block}
\\end{frame}"""
    content = content.replace(s13_match.group(0), s13_repl)

with open('Review 4/presentation.tex', 'w') as f:
    f.write(content)
