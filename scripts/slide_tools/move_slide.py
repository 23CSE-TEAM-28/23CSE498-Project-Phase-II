import re

with open('Review 4/presentation.tex', 'r') as f:
    content = f.read()

# Match the slide 10 to extract
slide_10_pattern = r'(% --- DEDICATED SLIDE 2: 3-HOSPITAL FEDERATED UPDATE LIFECYCLE ---\n\\begin{frame}{Decentralized Model Update Lifecycle \(3-Hospital Loop\)}.*?\\end{frame}\n+)'

slide_10_match = re.search(slide_10_pattern, content, re.DOTALL)
if slide_10_match:
    slide_text = slide_10_match.group(1)
    # Remove from current position
    content = content.replace(slide_text, '')
    
    # Find Future Plan slide
    future_plan_pattern = r'(% --- FUTURE PLAN ---\n\\begin{frame}{Future Plan: Towards 100\\% Implementation}.*?\\end{frame}\n+)'
    future_plan_match = re.search(future_plan_pattern, content, re.DOTALL)
    
    if future_plan_match:
        # Insert slide_text after future plan
        replacement = future_plan_match.group(1) + slide_text
        content = content.replace(future_plan_match.group(1), replacement)
        
        with open('Review 4/presentation.tex', 'w') as f:
            f.write(content)
        print("Successfully moved the slide.")
    else:
        # Try finding without comment
        fp_pattern = r'(\\begin{frame}{Future Plan: Towards 100\\% Implementation}.*?\\end{frame}\n+)'
        fp_match = re.search(fp_pattern, content, re.DOTALL)
        if fp_match:
            replacement = fp_match.group(1) + slide_text
            content = content.replace(fp_match.group(1), replacement)
            with open('Review 4/presentation.tex', 'w') as f:
                f.write(content)
            print("Successfully moved the slide (without comment matching).")
        else:
            print("Failed to find Future Plan slide.")
else:
    print("Failed to find Slide 10.")

