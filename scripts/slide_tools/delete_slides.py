import re

with open('Review 4/presentation.tex', 'r') as f:
    content = f.read()

# Remove Slide: Proactive Drift Adaptation
content = re.sub(r'% --- DRIFT \\& AD-CUSUM NEURAL TRIGGER ---\n\\begin{frame}{Proactive Drift Adaptation: AD-CUSUM Neural Trigger}.*?\\end{frame}\n+', '', content, flags=re.DOTALL)

# Remove Slide: Summary of Completed Phase II Works
content = re.sub(r'% --- SUMMARY \\& ROADMAP COMPLIANCE ---\n\\begin{frame}{Summary of Completed Phase II Works}.*?\\end{frame}\n+', '', content, flags=re.DOTALL)

with open('Review 4/presentation.tex', 'w') as f:
    f.write(content)

