import re

with open('Review 4/presentation.tex', 'r') as f:
    content = f.read()

# 1. Reorder slides 3 to 6
novelties = re.search(r'(% --- NEW UPFRONT SLIDE.*?)\\end{frame}', content, re.DOTALL).group(0)
context = re.search(r'(% --- CLINICAL CONTEXT.*?)\\end{frame}', content, re.DOTALL).group(0)
profile = re.search(r'(% --- CLINICAL PROFILE OF SEPSIS.*?)\\end{frame}', content, re.DOTALL).group(0)
stats = re.search(r'(% --- SEPSIS STATS IN INDIA.*?)\\end{frame}', content, re.DOTALL).group(0)

objectives_slide = """% --- RESEARCH OBJECTIVES ---
\\begin{frame}{Research Objectives \& Problem Identification}
    \\begin{block}{Problem Identified}
        \\scriptsize
        Standard Federated Learning fails in clinical settings because of \\textbf{Concept Drift}---patient demographics and vitals vary heavily across different hospitals (Non-IID data), causing static models to degrade.
    \\end{block}
    \\vspace{0.2cm}
    \\textbf{Research Objectives:}
    \\begin{itemize}
        \\scriptsize
        \\item \\textbf{Objective 1:} To develop a privacy-preserving Federated Learning architecture for ICU time-series forecasting.
        \\item \\textbf{Objective 2:} To design an adaptive drift detection mechanism (\\textbf{AD-CUSUM}) that dynamically handles demographic shifts.
        \\item \\textbf{Objective 3:} To provide Clinical Explainability (XAI) using Multi-Head Temporal Attention.
        \\item \\textbf{Objective 4:} To implement a production-ready Clinical Decision Support System (CDSS) workstation.
    \\end{itemize}
\\end{frame}"""

# Remove the old blocks
content = content.replace(novelties, "")
content = content.replace(context, "")
content = content.replace(profile, "")
content = content.replace(stats, "")

# Insert in new order after Review Comments
review_comments = re.search(r'(% --- PREVIOUS REVIEW COMMENTS.*?)\\end{frame}', content, re.DOTALL).group(0)
new_blocks = "\n\n".join([review_comments, objectives_slide, profile, stats, novelties, context])
content = content.replace(review_comments, new_blocks)

# 2. Difference of existing CUSUM and modified CUSUM
cusum_slide = re.search(r'(% --- DEDICATED SLIDE 3: CONCEPT DRIFT.*?)\\end{frame}', content, re.DOTALL).group(0)
new_cusum_slide = cusum_slide.replace("Concept Drift Detection \& AD-CUSUM Architecture", "Concept Drift Detection: Existing CUSUM vs Enhanced AD-CUSUM")
new_cusum_slide = new_cusum_slide.replace(
    "\\begin{block}{What is Concept Drift in Clinical ICUs?}",
    "\\begin{block}{Existing CUSUM (The Problem)}"
)
new_cusum_slide = new_cusum_slide.replace(
    "Patient demographics, seasonal virus surges, changing admission criteria, and evolving clinical guidelines cause hospital data distributions to shift over time, rendering static models inaccurate.",
    "Standard CUSUM process charts fail in deep learning. They trigger constant false positive drift alerts due to high variance and stochastic noise in mini-batch gradient descent."
)
new_cusum_slide = new_cusum_slide.replace(
    "\\begin{block}{Why Classical CUSUM Fails in Deep Learning}",
    "\\begin{block}{Enhanced AD-CUSUM (Our Solution)}"
)
new_cusum_slide = new_cusum_slide.replace(
    "Standard CUSUM process charts trigger constant false positive drift alerts due to high variance in mini-batch stochastic gradient descent loss residuals.",
    "We modified CUSUM to mathematically isolate true demographic drift from batch noise by incorporating Gradient Variance Weighting and Entropy Divergence."
)
content = content.replace(cusum_slide, new_cusum_slide)

# 3. Objective mapping to slides
# Just add footnotetext to a few key slides
content = content.replace("\\begin{frame}{Proposed Framework: FPDAF}", "\\begin{frame}{Proposed Framework: FPDAF}\n    \\let\\thefootnote\\relax\\footnotetext{\\textbf{Maps to:} Objective 1 (Privacy-preserving Architecture)}")
content = content.replace("\\begin{frame}{Proactive Drift Adaptation: AD-CUSUM Neural Trigger}", "\\begin{frame}{Proactive Drift Adaptation: AD-CUSUM Neural Trigger}\n    \\let\\thefootnote\\relax\\footnotetext{\\textbf{Maps to:} Objective 2 (Adaptive Drift Detection)}")
content = content.replace("\\begin{frame}{Interactive Clinician Dashboard UI}", "\\begin{frame}{Interactive Clinician Dashboard UI}\n    \\let\\thefootnote\\relax\\footnotetext{\\textbf{Maps to:} Objective 4 (CDSS Workstation)}")
content = content.replace("\\begin{frame}{Clinician Dashboard Interface (Doctor Portal)}", "\\begin{frame}{Clinician Dashboard Interface (Doctor Portal)}\n    \\let\\thefootnote\\relax\\footnotetext{\\textbf{Maps to:} Objective 3 (Clinical Explainability) \\& Objective 4}")

# 4. Remove "Our new" from slide 15
content = content.replace("Our New FPDAF-v2 Invention:", "Proposed")

# 5. Slide 19 Title change
content = content.replace("{Clinician Dashboard Interface (Admin Portal)}", "{MLOps \\& Telemetry Dashboard (Admin Portal)}")

with open('Review 4/presentation.tex', 'w') as f:
    f.write(content)
