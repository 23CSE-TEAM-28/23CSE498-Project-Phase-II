import re

with open('Review 4/presentation.tex', 'r') as f:
    content = f.read()

# 1. Merge Slide 4 (Clinical Profile) and Slide 5 (Sepsis Burden)
profile_match = re.search(r'% --- CLINICAL PROFILE OF SEPSIS ---\n\\begin{frame}{Clinical Profile of ICU Sepsis}.*?\\end{frame}', content, re.DOTALL)
burden_match = re.search(r'% --- SEPSIS STATS IN INDIA ---\n\\begin{frame}{Sepsis Burden \\& Impact in India}.*?\\end{frame}', content, re.DOTALL)

if profile_match and burden_match:
    merged_slide = """% --- MERGED CLINICAL PROFILE & BURDEN ---
\\begin{frame}{Clinical Profile \\& Sepsis Burden in India}
    \\begin{columns}[t]
        \\begin{column}{0.5\\textwidth}
            \\begin{block}{What Sepsis is \\& Why it's Dangerous}
                \\scriptsize
                Sepsis is a systemic immune response to infection that rapidly progresses to Septic Shock. Every hour of delayed treatment increases mortality risk by \\textbf{8\\%}. Early warning is the only way to save lives.
            \\end{block}
        \\end{column}
        \\begin{column}{0.5\\textwidth}
            \\begin{block}{National Burden in India}
                \\scriptsize
                \\begin{itemize}
                    \\item \\textbf{2.9 to 3.0 Million Deaths} annually (\\textbf{30\\%} of all deaths in India).
                    \\item \\textbf{34\\% to 50\\%+} Mortality Rate in severe ICU sepsis cases.
                \\end{itemize}
            \\end{block}
        \\end{column}
    \\end{columns}
    
    \\begin{alertblock}{Clinical Significance \\& Research Objective}
        \\scriptsize
        By continuously analyzing ICU vital signals, our FPDAF early-warning system alerts doctors hours before deterioration, directly tackling the high mortality rates in Indian ICUs.
    \\end{alertblock}
\\end{frame}"""
    # Replace both with the merged slide
    # We replace profile_match with merged_slide, and burden_match with empty string
    content = content.replace(profile_match.group(0), merged_slide)
    content = content.replace(burden_match.group(0), "")

# 2. Delete "Core Scientific & Technical Novelties" (Redundant with Slide 6)
novelties_match = re.search(r'% --- DEDICATED SLIDE: OUR NOVELTY ---\n\\begin{frame}{Core Scientific \\& Technical Novelties}.*?\\end{frame}', content, re.DOTALL)
if novelties_match:
    content = content.replace(novelties_match.group(0), "")

# 3. Delete "Proactive Drift Adaptation: AD-CUSUM Neural Trigger" (Redundant with Slide 13 & 15)
trigger_match = re.search(r'% --- DRIFT \\& AD-CUSUM NEURAL TRIGGER ---\n\\begin{frame}{Proactive Drift Adaptation: AD-CUSUM Neural Trigger}.*?\\end{frame}', content, re.DOTALL)
if trigger_match:
    content = content.replace(trigger_match.group(0), "")

# 4. Delete "Interactive Clinician Dashboard UI" (Redundant with Doctor/Admin Portal slides)
ui_match = re.search(r'% --- CLINICAL DASHBOARD INTERFACE ---\n\\begin{frame}{Interactive Clinician Dashboard UI}.*?\\end{frame}', content, re.DOTALL)
if ui_match:
    content = content.replace(ui_match.group(0), "")

# 5. Delete "Summary of Completed Phase II Works" (Redundant with "Phase II Completed Goals" on Slide 7)
summary_match = re.search(r'% --- SUMMARY \\& ROADMAP COMPLIANCE ---\n\\begin{frame}{Summary of Completed Phase II Works}.*?\\end{frame}', content, re.DOTALL)
if summary_match:
    content = content.replace(summary_match.group(0), "")

# Clean up any triple blank lines
content = re.sub(r'\n{4,}', '\n\n', content)

with open('Review 4/presentation.tex', 'w') as f:
    f.write(content)

