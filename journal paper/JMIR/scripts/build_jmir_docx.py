#!/usr/bin/env python3
"""
Build JMIR Submission-Ready MS Word Document (JMIR_Manuscript.docx)
Strictly adheres to Journal of Medical Internet Research (JMIR) guidelines:
- Single-column IMRD format
- Calibri 11pt, 1.15 line spacing, 6pt after paragraphs
- AMA 11th edition references
- Clean Unicode typography (no raw LaTeX dollar math or syntax)
- Tables with 3-line borders, repeat headers, cantSplit rows, and keep_with_next titles
- Figures with keep_with_next images so captions are never orphaned across pages
- Multi-tier PaperBanana-styled architectural illustration and composite figures
"""

import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

DOC_DIR = "/Users/aksharsakhi/Documents/Files/Code/Project/23CSE498-Project-Phase-II/journal paper/JMIR"
IMG_DIR = os.path.join(DOC_DIR, "images")
OUT_PATH = os.path.join(DOC_DIR, "JMIR_Manuscript.docx")

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    """Set inner cell padding in dxa (1 pt = 20 dxa)"""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_shading(cell, color_hex):
    """Set background color of a cell"""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    tcPr.append(shd)

def set_table_borders(table):
    """Classic 3-line medical journal border style"""
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="12" w:space="0" w:color="333333"/>
            <w:bottom w:val="single" w:sz="12" w:space="0" w:color="333333"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="none"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def make_header_row(row):
    """Set header row properties (repeat on every page, cantSplit, bottom border)"""
    trPr = row._tr.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
    trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
    for cell in row.cells:
        set_cell_shading(cell, "F1F5F9")
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        tcPr = cell._tc.get_or_add_tcPr()
        b_border = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:bottom w:val="single" w:sz="6" w:space="0" w:color="475569"/></w:tcBorders>')
        tcPr.append(b_border)

def make_data_row(row, is_panel_header=False):
    """Set data row properties"""
    trPr = row._tr.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
    for cell in row.cells:
        if is_panel_header:
            set_cell_shading(cell, "F8FAFC")
            set_cell_margins(cell, top=100, bottom=80, left=140, right=140)
        else:
            set_cell_margins(cell, top=80, bottom=80, left=140, right=140)

def add_p(doc, text="", style='Normal', space_before=0, space_after=6, line_spacing=1.15, bold=False, italic=False, color=None, keep_with_next=False, align=WD_ALIGN_PARAGRAPH.LEFT):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    p.paragraph_format.keep_with_next = keep_with_next
    if text:
        run = p.add_run(text)
        run.bold = bold
        run.italic = italic
        run.font.name = 'Calibri'
        run.font.size = Pt(11)
        if color:
            run.font.color.rgb = color
    return p

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    run.font.name = 'Calibri'
    run.font.size = Pt(14)
    run.font.color.rgb = RGBColor(15, 23, 42)
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    run.font.name = 'Calibri'
    run.font.size = Pt(12)
    run.font.color.rgb = RGBColor(30, 41, 59)
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.bold = True
    run.italic = True
    run.font.name = 'Calibri'
    run.font.size = Pt(11)
    run.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_list_item(doc, num_str, title_str, text_str):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.left_indent = Inches(0.3)
    p.paragraph_format.first_line_indent = Inches(-0.3)
    
    r_num = p.add_run(num_str + " ")
    r_num.bold = True
    r_num.font.name = 'Calibri'
    r_num.font.size = Pt(11)
    
    if title_str:
        r_title = p.add_run(title_str + " ")
        r_title.bold = True
        r_title.font.name = 'Calibri'
        r_title.font.size = Pt(11)
        
    r_text = p.add_run(text_str)
    r_text.font.name = 'Calibri'
    r_text.font.size = Pt(11)
    return p

def add_figure(doc, img_rel_path, fig_num, title_str, caption_str, width_in=6.2):
    img_full_path = os.path.join(IMG_DIR, img_rel_path)
    if not os.path.exists(img_full_path):
        print(f"Warning: Image {img_full_path} not found!")
        return None
    
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(12)
    p_img.paragraph_format.space_after = Pt(3)
    p_img.paragraph_format.keep_with_next = True  # NEVER ORPHAN CAPTION!
    
    run_img = p_img.add_run()
    run_img.add_picture(img_full_path, width=Inches(width_in))
    
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(12)
    p_cap.paragraph_format.line_spacing = 1.15
    
    r_fig = p_cap.add_run(f"Figure {fig_num}: ")
    r_fig.bold = True
    r_fig.font.name = 'Calibri'
    r_fig.font.size = Pt(9.5)
    r_fig.font.color.rgb = RGBColor(15, 23, 42)
    
    if title_str:
        r_tit = p_cap.add_run(f"{title_str}. ")
        r_tit.bold = True
        r_tit.italic = True
        r_tit.font.name = 'Calibri'
        r_tit.font.size = Pt(9.5)
        r_tit.font.color.rgb = RGBColor(30, 41, 59)
        
    r_cap = p_cap.add_run(caption_str)
    r_cap.italic = True
    r_cap.font.name = 'Calibri'
    r_cap.font.size = Pt(9.5)
    r_cap.font.color.rgb = RGBColor(71, 85, 105)
    return p_cap

def add_table_title(doc, table_num, title_str):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True  # NEVER ORPHAN TABLE TITLE!
    
    r_num = p.add_run(f"Table {table_num}: ")
    r_num.bold = True
    r_num.font.name = 'Calibri'
    r_num.font.size = Pt(10)
    r_num.font.color.rgb = RGBColor(15, 23, 42)
    
    r_tit = p.add_run(title_str)
    r_tit.bold = True
    r_tit.font.name = 'Calibri'
    r_tit.font.size = Pt(10)
    r_tit.font.color.rgb = RGBColor(30, 41, 59)
    return p

def add_table_note(doc, note_str):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(10)
    p.paragraph_format.line_spacing = 1.1
    run = p.add_run(note_str)
    run.italic = True
    run.font.name = 'Calibri'
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor(100, 116, 139)
    return p

print("Writing build_jmir_docx script...")
