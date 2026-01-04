import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from PyPDF2 import PdfReader, PdfWriter

root = r"c:\\Users\\Bruker\\OneDrive\\Portfolio"
docs = os.path.join(root, "assets", "docs")
original_path = os.path.join(docs, "database-design-report 1.pdf")
cover_path = os.path.join(docs, "database-design-report-cover.pdf")
out_path = os.path.join(docs, "database-design-report-sanitized.pdf")

# Create a new cover page
c = canvas.Canvas(cover_path, pagesize=A4)
width, height = A4

lines = [
    "Department IDI",
    "Databases - IDTG2002",
    "Fitness Tracker Database Design",
]

c.setFont("Helvetica-Bold", 26)
start_y = height / 2 + 2*cm
for i, text in enumerate(lines):
    y = start_y - i * (1.8*cm)
    c.drawCentredString(width/2, y, text)

c.setFont("Helvetica", 10)
c.drawCentredString(width/2, 1.5*cm, "Sanitized cover")

c.showPage()
c.save()

# Merge cover + original minus first page
reader = PdfReader(original_path)
writer = PdfWriter()
with open(cover_path, "rb") as f_cover:
    cover_reader = PdfReader(f_cover)
    writer.add_page(cover_reader.pages[0])
for i in range(1, len(reader.pages)):
    writer.add_page(reader.pages[i])
with open(out_path, "wb") as f_out:
    writer.write(f_out)

print("Created:", out_path)
