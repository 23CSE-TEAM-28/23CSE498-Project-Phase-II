with open('Review 4/presentation.tex', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "\\begin{frame}{Proactive Drift Adaptation: AD-CUSUM Neural Trigger}" in line:
        skip = True
    elif "\\begin{frame}{Summary of Completed Phase II Works}" in line:
        skip = True
    
    if not skip:
        new_lines.append(line)
        
    if skip and "\\end{frame}" in line:
        skip = False

with open('Review 4/presentation.tex', 'w') as f:
    f.writelines(new_lines)
