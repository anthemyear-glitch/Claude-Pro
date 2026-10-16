#!/usr/bin/env python3
"""Build the infographic tutorial deck (PPTX) for running Download Accelerator."""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
from PIL import Image
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "Tutorial-Download-Accelerator.pptx")
HERO = os.path.join(HERE, "hero.jpg")

# ---------- palette ----------
BG       = RGBColor(0x0B, 0x10, 0x20)
CARD     = RGBColor(0x12, 0x1B, 0x31)
CARD2    = RGBColor(0x17, 0x22, 0x3C)
BORDER   = RGBColor(0x2A, 0x3A, 0x5E)
CYAN     = RGBColor(0x22, 0xD3, 0xEE)
INDIGO   = RGBColor(0x63, 0x66, 0xF1)
GREEN    = RGBColor(0x34, 0xD3, 0x99)
AMBER    = RGBColor(0xFB, 0xBF, 0x24)
RED      = RGBColor(0xF8, 0x71, 0x71)
WHITE    = RGBColor(0xE8, 0xEE, 0xFC)
DIM      = RGBColor(0x93, 0xA1, 0xC0)
FAINT    = RGBColor(0x5D, 0x6C, 0x8E)
TERMBG   = RGBColor(0x0D, 0x11, 0x17)
TERMBRD  = RGBColor(0x30, 0x36, 0x3D)
CODEGRN  = RGBColor(0x7E, 0xE7, 0x87)

HEAD_FONT = "Segoe UI"
BODY_FONT = "Segoe UI"
CODE_FONT = "Consolas"

W, H = Inches(13.333), Inches(7.5)


# ---------- helpers ----------
def solid(shape, color, line_color=None, line_w=Pt(1)):
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    if line_color is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line_color
        shape.line.width = line_w
    shape.shadow.inherit = False
    return shape


def rect(slide, x, y, w, h, color, line_color=None, rounded=True, radius=0.06):
    kind = MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE
    sp = slide.shapes.add_shape(kind, x, y, w, h)
    if rounded:
        try:
            sp.adjustments[0] = radius
        except Exception:
            pass
    return solid(sp, color, line_color)


def gradient_bar(slide, x, y, w, h, c1=CYAN, c2=INDIGO):
    sp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h)
    try:
        sp.adjustments[0] = 0.5
    except Exception:
        pass
    sp.line.fill.background()
    sp.shadow.inherit = False
    sp.fill.gradient()
    stops = sp.fill.gradient_stops
    stops[0].color.rgb = c1
    stops[0].position = 0.0
    stops[1].color.rgb = c2
    stops[1].position = 1.0
    sp.fill.gradient_angle = 0.0
    return sp


def text(slide, x, y, w, h, runs, size=13, color=WHITE, bold=False, font=BODY_FONT,
         align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, line_spacing=1.0, space_after=0):
    """runs: str, or list of paragraphs; each paragraph is str or list of (text, {opts})."""
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Emu(0)
    tf.margin_top = tf.margin_bottom = Emu(0)
    if isinstance(runs, str):
        runs = [runs]
    for i, para in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = line_spacing
        if space_after:
            p.space_after = Pt(space_after)
        if isinstance(para, str):
            para = [(para, {})]
        for t, opts in para:
            r = p.add_run()
            r.text = t
            r.font.name = opts.get("font", font)
            r.font.size = Pt(opts.get("size", size))
            r.font.bold = opts.get("bold", bold)
            r.font.color.rgb = opts.get("color", color)
    return tb


def circle_num(slide, x, y, d, label, fill=INDIGO, fg=WHITE, size=18):
    sp = slide.shapes.add_shape(MSO_SHAPE.OVAL, x, y, d, d)
    solid(sp, fill)
    tf = sp.text_frame
    tf.word_wrap = False
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = label
    r.font.name = HEAD_FONT
    r.font.size = Pt(size)
    r.font.bold = True
    r.font.color.rgb = fg
    return sp


def pill(slide, x, y, w, h, label, fill=RGBColor(0x1B, 0x27, 0x45), fg=CYAN, size=11, bold=True):
    sp = rect(slide, x, y, w, h, fill, rounded=True, radius=0.5)
    tf = sp.text_frame
    tf.word_wrap = False
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = label
    r.font.name = HEAD_FONT
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.color.rgb = fg
    return sp


def code_box(slide, x, y, w, h, cmd, comment="", cmd_color=CODEGRN, size=14):
    box = rect(slide, x, y, w, h, TERMBG, TERMBRD, rounded=True, radius=0.12)
    bar = rect(slide, x, y, Inches(0.06), h, CYAN, rounded=False)
    para = [[(cmd, {"font": CODE_FONT, "size": size, "bold": True, "color": cmd_color})]]
    if comment:
        para[0].append(("  " + comment, {"font": CODE_FONT, "size": size - 2.5, "color": FAINT}))
    text(slide, x + Inches(0.22), y, w - Inches(0.32), h, para,
         anchor=MSO_ANCHOR.MIDDLE)
    return box


def terminal_box(slide, x, y, w, h, lines):
    rect(slide, x, y, w, h, TERMBG, TERMBRD, rounded=True, radius=0.09)
    dot_colors = [RED, AMBER, GREEN]
    for i, c in enumerate(dot_colors):
        d = slide.shapes.add_shape(MSO_SHAPE.OVAL, x + Inches(0.18 + i * 0.22), y + Inches(0.16),
                                   Inches(0.11), Inches(0.11))
        solid(d, c)
    paras = []
    for ln, color, bold, fnt in lines:
        paras.append([(ln, {"font": fnt, "size": 13.5, "bold": bold, "color": color})])
    text(slide, x + Inches(0.28), y + Inches(0.42), w - Inches(0.5), h - Inches(0.55),
         paras, line_spacing=1.35)


def bg(slide, deco=True):
    rect(slide, 0, 0, W, H, BG, rounded=False)
    if deco:
        # soft accent glows
        glow1 = slide.shapes.add_shape(MSO_SHAPE.OVAL, W - Inches(3.2), Inches(-1.6),
                                       Inches(4.4), Inches(4.4))
        solid(glow1, RGBColor(0x14, 0x1E, 0x3A))
        glow2 = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(-1.8), H - Inches(2.6),
                                       Inches(3.8), Inches(3.8))
        solid(glow2, RGBColor(0x11, 0x1A, 0x33))


def title_bar(slide, num, title, sub=None):
    pill(slide, Inches(0.55), Inches(0.42), Inches(1.55), Inches(0.42),
         f"BAGIAN {num}", fill=RGBColor(0x1B, 0x27, 0x45), fg=CYAN, size=11)
    text(slide, Inches(0.55), Inches(0.95), Inches(11.6), Inches(0.62),
         title, size=29, bold=True, font=HEAD_FONT, color=WHITE)
    if sub:
        text(slide, Inches(0.57), Inches(1.52), Inches(11.6), Inches(0.4),
             sub, size=13.5, color=DIM)
    gradient_bar(slide, Inches(0.57), Inches(1.47) if not sub else Inches(1.98),
                 Inches(2.1), Inches(0.05))


def footer(slide, page):
    text(slide, Inches(0.55), Inches(7.08), Inches(6.0), Inches(0.3),
         "Download Accelerator · Tutorial Infografis", size=9.5, color=FAINT)
    text(slide, Inches(12.2), Inches(7.08), Inches(0.55), Inches(0.3),
         f"{page:02d}", size=9.5, color=FAINT, align=PP_ALIGN.RIGHT)


# ---------- build ----------
prs = Presentation()
prs.slide_width, prs.slide_height = W, H
blank = prs.slide_layouts[6]

# ============ SLIDE 1 · COVER ============
s = prs.slides.add_slide(blank)
bg(s, deco=False)
glow = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(9.2), Inches(-2.0), Inches(5.2), Inches(5.2))
solid(glow, RGBColor(0x16, 0x21, 0x40))
glow2 = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(-2.0), Inches(4.8), Inches(4.6), Inches(4.6))
solid(glow2, RGBColor(0x12, 0x1B, 0x36))

if os.path.exists(HERO):
    iw, ih = Image.open(HERO).size
    pic_w = Inches(6.35)
    pic_h = Emu(int(pic_w * ih / iw))
    px = W - pic_w - Inches(0.0)
    py = Emu(int((H - pic_h) / 2))
    s.shapes.add_picture(HERO, px, py, width=pic_w, height=pic_h)

pill(s, Inches(0.7), Inches(0.72), Inches(2.55), Inches(0.44),
     "⚡  TUTORIAL INFOGRAFIS", fill=RGBColor(0x1B, 0x27, 0x45), fg=CYAN, size=12)
text(s, Inches(0.7), Inches(1.38), Inches(6.6), Inches(1.9),
     [[("Cara Menjalankan", {"size": 37, "bold": True, "color": WHITE})],
      [("Download Accelerator", {"size": 41, "bold": True, "color": CYAN})]],
     font=HEAD_FONT, line_spacing=1.05)
text(s, Inches(0.72), Inches(3.15), Inches(6.1), Inches(0.85),
     "Tutorial lengkap langkah demi langkah untuk menjalankan perintah\npada gambar — dari membuka terminal sampai dashboard siap pakai.",
     size=14, color=DIM, line_spacing=1.3)

terminal_box(s, Inches(0.7), Inches(4.12), Inches(6.05), Inches(1.42), [
    ("$ cd download-accelerator && npm start", CODEGRN, True, CODE_FONT),
    ("  → http://localhost:3000", DIM, False, CODE_FONT),
])

for i, (chip, c) in enumerate([("Node.js ≥ 18", CYAN), ("0 Dependencies", INDIGO),
                               ("Windows · macOS · Linux", GREEN)]):
    pill(s, Inches(0.7) + Inches(i * 2.1), Inches(5.82), Inches(1.95), Inches(0.42),
         chip, fill=RGBColor(0x14, 0x1F, 0x38), fg=c, size=10.5)
text(s, Inches(0.72), Inches(6.55), Inches(6.0), Inches(0.5),
     "Mendukung unduhan multi-segment paralel, pause/resume, dan antrian.",
     size=11, color=FAINT)

# ============ SLIDE 2 · ALUR ============
s = prs.slides.add_slide(blank)
bg(s)
title_bar(s, "1", "Alur Menjalankan Aplikasi", "Empat langkah sederhana — selesai dalam satu menit")

steps = [
    ("1", "Siapkan\nPrasyarat", "Pastikan Node.js ≥ 18\nterpasang di komputer", CYAN),
    ("2", "Masuk\nFolder", "Buka terminal lalu masuk\nke folder download-accelerator", INDIGO),
    ("3", "Jalankan\nPerintah", "Ketik npm start dan\ntunggu server aktif", GREEN),
    ("4", "Buka\nBrowser", "Akses http://localhost:3000\ndan dashboard tampil", AMBER),
]
cw, gap = Inches(2.72), Inches(0.42)
x0 = Inches(0.62)
y0 = Inches(2.35)
for i, (num, t1, t2, c) in enumerate(steps):
    x = x0 + i * (cw + gap)
    rect(s, x, y0, cw, Inches(3.05), CARD, BORDER)
    rect(s, x, y0, cw, Inches(0.09), c, rounded=False)
    circle_num(s, x + Inches(1.06), y0 + Inches(0.38), Inches(0.62), num,
               fill=c, fg=BG if c == AMBER else WHITE, size=20)
    text(s, x + Inches(0.15), y0 + Inches(1.18), cw - Inches(0.3), Inches(0.85),
         t1, size=17, bold=True, font=HEAD_FONT, align=PP_ALIGN.CENTER, line_spacing=1.05)
    text(s, x + Inches(0.15), y0 + Inches(2.02), cw - Inches(0.3), Inches(0.85),
         t2, size=11, color=DIM, align=PP_ALIGN.CENTER, line_spacing=1.25)
    if i < 3:
        ar = s.shapes.add_shape(MSO_SHAPE.CHEVRON, x + cw + Inches(0.06), y0 + Inches(1.28),
                                Inches(0.3), Inches(0.5))
        solid(ar, BORDER)

res = rect(s, Inches(0.62), Inches(5.85), Inches(12.1), Inches(0.78),
           RGBColor(0x0F, 0x2A, 0x24), RGBColor(0x1D, 0x6B, 0x52))
text(s, Inches(1.0), Inches(5.85), Inches(11.4), Inches(0.78),
     [[("✓  Hasil:  ", {"bold": True, "color": GREEN, "size": 15}),
       ("server berjalan, dashboard Download Accelerator terbuka di browser, dan siap menerima URL unduhan.",
        {"color": WHITE, "size": 13.5})]],
     anchor=MSO_ANCHOR.MIDDLE)
footer(s, 2)

# ============ SLIDE 3 · PRASYARAT ============
s = prs.slides.add_slide(blank)
bg(s)
title_bar(s, "2", "Langkah 0 · Siapkan Prasyarat",
          "Tiga hal ini wajib ada sebelum menjalankan perintah pada gambar")

cards = [
    ("Node.js  ≥ 18", "Runtime tempat aplikasi berjalan.\nUnduh versi LTS dari nodejs.org.", "node --version", CYAN),
    ("npm", "Paket bawaan Node.js untuk\nmenjalankan skrip aplikasi.", "npm --version", INDIGO),
    ("Terminal", "CMD / PowerShell (Windows)\natau Terminal (macOS / Linux).", "cd download-accelerator", GREEN),
]
cw = Inches(3.78)
for i, (t, d, cmd, c) in enumerate(cards):
    x = Inches(0.62) + i * (cw + Inches(0.35))
    rect(s, x, Inches(2.35), cw, Inches(2.9), CARD, BORDER)
    rect(s, x, Inches(2.35), cw, Inches(0.09), c, rounded=False)
    circle_num(s, x + Inches(0.28), Inches(2.62), Inches(0.52), str(i + 1), fill=c,
               fg=BG if c == AMBER else WHITE, size=16)
    text(s, x + Inches(0.95), Inches(2.66), cw - Inches(1.1), Inches(0.5),
         t, size=16.5, bold=True, font=HEAD_FONT)
    text(s, x + Inches(0.3), Inches(3.32), cw - Inches(0.55), Inches(0.95),
         d, size=11.5, color=DIM, line_spacing=1.3)
    code_box(s, x + Inches(0.28), Inches(4.32), cw - Inches(0.56), Inches(0.62), cmd, size=11.5)

warn = rect(s, Inches(0.62), Inches(5.62), Inches(12.1), Inches(1.05),
            RGBColor(0x2A, 0x22, 0x0E), RGBColor(0x6B, 0x53, 0x14))
text(s, Inches(1.0), Inches(5.62), Inches(11.4), Inches(1.05),
     [[("⚠  Belum terpasang Node.js?  ", {"bold": True, "color": AMBER, "size": 14})],
      [("Unduh versi LTS di nodejs.org, jalankan installer, lalu buka ulang terminal. "
        "Cek keberhasilan dengan perintah node --version (harus ≥ 18).",
        {"color": WHITE, "size": 12.5})]],
     anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.25)
footer(s, 3)

# ============ SLIDE 4 · LANGKAH 1-2 ============
s = prs.slides.add_slide(blank)
bg(s)
title_bar(s, "3", "Langkah 1 & 2 · Terminal dan Folder",
          "Dua langkah pertama dari perintah pada gambar")

rows = [
    ("1", "Buka Terminal",
     "Windows: tekan Win + R, ketik cmd, lalu Enter.\nmacOS / Linux: buka aplikasi Terminal.",
     [("Win + R  →  ketik \"cmd\"  →  Enter", "  # Windows")], CYAN),
    ("2", "Masuk ke Folder Aplikasi",
     "Arahkan terminal ke folder download-accelerator\n(tempat aplikasi diunduh / di-clone).",
     [("cd download-accelerator", "  # jalankan di folder induknya")], INDIGO),
]
for i, (num, t, d, cmds, c) in enumerate(rows):
    y = Inches(2.32) + i * Inches(2.28)
    rect(s, Inches(0.62), y, Inches(12.1), Inches(1.98), CARD, BORDER)
    circle_num(s, Inches(1.0), y + Inches(0.62), Inches(0.72), num, fill=c,
               fg=BG if c == AMBER else WHITE, size=22)
    text(s, Inches(2.05), y + Inches(0.26), Inches(5.2), Inches(0.5),
         t, size=19, bold=True, font=HEAD_FONT)
    text(s, Inches(2.05), y + Inches(0.82), Inches(5.3), Inches(0.95),
         d, size=12, color=DIM, line_spacing=1.3)
    cmd, cmt = cmds[0]
    code_box(s, Inches(7.55), y + Inches(0.58), Inches(4.85), Inches(0.82), cmd, cmt, size=13)

tip = rect(s, Inches(0.62), Inches(6.05), Inches(12.1), Inches(0.62),
           RGBColor(0x14, 0x1F, 0x38), BORDER)
text(s, Inches(1.0), Inches(6.05), Inches(11.4), Inches(0.62),
     [[("💡 Tips:  ", {"bold": True, "color": CYAN, "size": 12.5}),
       ("ketik cd lalu spasi, kemudian seret folder download-accelerator ke jendela terminal — "
        "path-nya tertempel otomatis. Tekan Enter.", {"color": DIM, "size": 12})]],
     anchor=MSO_ANCHOR.MIDDLE)
footer(s, 4)

# ============ SLIDE 5 · LANGKAH 3-4 ============
s = prs.slides.add_slide(blank)
bg(s)
title_bar(s, "4", "Langkah 3 & 4 · Jalankan dan Buka Browser",
          "Dua langkah terakhir — server aktif, dashboard siap")

rows = [
    ("3", "Jalankan Perintah Utama",
     "Perintah inti pada gambar. Tunggu sampai muncul pesan\n\"⚡ Download Accelerator running…\"",
     "npm start", "  # atau: node start.js", GREEN),
    ("4", "Buka Dashboard di Browser",
     "Server tetap berjalan selama terminal terbuka.\nTekan Ctrl + C di terminal untuk menghentikan server.",
     "http://localhost:3000", "  # buka di browser favorit", AMBER),
]
for i, (num, t, d, cmd, cmt, c) in enumerate(rows):
    y = Inches(2.32) + i * Inches(1.72)
    rect(s, Inches(0.62), y, Inches(12.1), Inches(1.44), CARD, BORDER)
    circle_num(s, Inches(1.0), y + Inches(0.36), Inches(0.72), num, fill=c,
               fg=BG if c == AMBER else WHITE, size=22)
    text(s, Inches(2.05), y + Inches(0.16), Inches(5.3), Inches(0.45),
         t, size=17.5, bold=True, font=HEAD_FONT)
    text(s, Inches(2.05), y + Inches(0.64), Inches(5.35), Inches(0.75),
         d, size=11, color=DIM, line_spacing=1.25)
    code_box(s, Inches(7.55), y + Inches(0.31), Inches(4.85), Inches(0.82), cmd, cmt, size=13)

text(s, Inches(0.62), Inches(5.86), Inches(12.1), Inches(0.35),
     "Contoh pesan sukses di terminal:", size=12, color=DIM)
terminal_box(s, Inches(0.62), Inches(6.18), Inches(12.1), Inches(0.84), [
    ("⚡ Download Accelerator running at http://0.0.0.0:3000", CODEGRN, True, CODE_FONT),
    ("   Downloads folder: .../download-accelerator/downloads", DIM, False, CODE_FONT),
])
footer(s, 5)

# ============ SLIDE 6 · CARA PAKAI ============
s = prs.slides.add_slide(blank)
bg(s)
title_bar(s, "5", "Cara Pakai Dashboard", "Setelah browser terbuka di http://localhost:3000")

uses = [
    ("Tempel URL", "Salin alamat file (http/https)\nke kolom paling atas.", CYAN),
    ("Pilih Segments", "Jumlah koneksi paralel.\n8 adalah pilihan terbaik.", INDIGO),
    ("Klik Download", "Unduhan masuk antrian\ndan langsung berjalan.", GREEN),
    ("Pantau Progress", "Lihat kecepatan, ETA,\ndan strip tiap segmen.", AMBER),
    ("Pause / Resume", "Jeda kapan saja —\nlanjut dari posisi terakhir.", RGBColor(0xF4, 0x72, 0xB6)),
    ("Simpan File", "Saat selesai, klik\n\"Save file\" pada kartu.", CYAN),
]
cw, ch = Inches(3.78), Inches(1.92)
for i, (t, d, c) in enumerate(uses):
    col, row = i % 3, i // 3
    x = Inches(0.62) + col * (cw + Inches(0.35))
    y = Inches(2.3) + row * (ch + Inches(0.33))
    rect(s, x, y, cw, ch, CARD, BORDER)
    circle_num(s, x + Inches(0.26), y + Inches(0.28), Inches(0.5), str(i + 1), fill=c,
               fg=BG if c == AMBER else WHITE, size=15)
    text(s, x + Inches(0.92), y + Inches(0.32), cw - Inches(1.1), Inches(0.45),
         t, size=15, bold=True, font=HEAD_FONT)
    text(s, x + Inches(0.3), y + Inches(1.0), cw - Inches(0.55), Inches(0.8),
         d, size=11, color=DIM, line_spacing=1.25)

pill(s, Inches(0.62), Inches(6.42), Inches(12.1), Inches(0.52),
     "Selesai!  File tersimpan otomatis di folder  download-accelerator/downloads/",
     fill=RGBColor(0x0F, 0x2A, 0x24), fg=GREEN, size=13)
footer(s, 6)

# ============ SLIDE 7 · FITUR ============
s = prs.slides.add_slide(blank)
bg(s)
title_bar(s, "6", "Fitur Utama", "Kenapa unduhan bisa lebih cepat dan aman")

feats = [
    ("Multi-Segment Paralel", "File dipecah hingga 16 koneksi\nRange yang berjalan bersamaan.", CYAN),
    ("Pause / Resume Presisi", "Melanjutkan dari byte terakhir,\nbahkan setelah komputer restart.", INDIGO),
    ("Antrian Cerdas", "Atur jumlah unduhan bersamaan\n(maks 3 secara default).", GREEN),
    ("Statistik Live", "Kecepatan total & per-segnen,\nETA, dan grafik sparkline.", AMBER),
    ("Fallback Otomatis", "Server tanpa fitur Range akan\nturun ke satu koneksi.", RGBColor(0xF4, 0x72, 0xB6)),
    ("Crash-safe & Aman", "State tersimpan di disk, file .part\ndi-rename secara atomik.", RGBColor(0x60, 0xA5, 0xFA)),
]
for i, (t, d, c) in enumerate(feats):
    col, row = i % 3, i // 3
    x = Inches(0.62) + col * (cw + Inches(0.35))
    y = Inches(2.3) + row * (ch + Inches(0.33))
    rect(s, x, y, cw, ch, CARD, BORDER)
    rect(s, x, y, Inches(0.09), ch, c, rounded=False)
    text(s, x + Inches(0.32), y + Inches(0.3), cw - Inches(0.55), Inches(0.5),
         t, size=14.5, bold=True, font=HEAD_FONT, color=c)
    text(s, x + Inches(0.32), y + Inches(0.92), cw - Inches(0.55), Inches(0.85),
         d, size=11, color=DIM, line_spacing=1.25)

pill(s, Inches(0.62), Inches(6.42), Inches(12.1), Inches(0.52),
     "Uji performa aplikasi kapan saja dengan perintah  npm test  (23 tes otomatis)",
     fill=RGBColor(0x14, 0x1F, 0x38), fg=CYAN, size=12.5)
footer(s, 7)

# ============ SLIDE 8 · TROUBLESHOOTING ============
s = prs.slides.add_slide(blank)
bg(s)
title_bar(s, "7", "Tips & Pemecahan Masalah", "Masalah umum dan solusi cepatnya")

qa = [
    ("Port 3000 sudah dipakai aplikasi lain?",
     "Jalankan di port lain, misalnya 3001 (Windows: set PORT=3001):", "PORT=3001 npm start", "  # ganti port sesuai kebutuhan", RED),
    ("Ingin memastikan semuanya normal?",
     "Jalankan suite tes bawaan (23 pemeriksaan otomatis):", "npm test", "  # cek integritas & semua fitur", GREEN),
    ("Di mana file hasil unduhan tersimpan?",
     "Buka folder ini di dalam aplikasi:", "cd download-accelerator/downloads", "  # atau klik \"Save file\"", CYAN),
    ("Error: \"node: command not found\"?",
     "Node.js belum terpasang. Instal LTS dari nodejs.org lalu cek:", "node --version", "  # pastikan versi ≥ 18", AMBER),
]
qw = Inches(5.95)
qh = Inches(1.98)
for i, (q, a, cmd, cmt, c) in enumerate(qa):
    col, row = i % 2, i // 2
    x = Inches(0.62) + col * (qw + Inches(0.3))
    y = Inches(2.32) + row * (qh + Inches(0.3))
    rect(s, x, y, qw, qh, CARD, BORDER)
    rect(s, x, y, Inches(0.09), qh, c, rounded=False)
    text(s, x + Inches(0.32), y + Inches(0.18), qw - Inches(0.55), Inches(0.55),
         q, size=13.5, bold=True, font=HEAD_FONT, color=WHITE, line_spacing=1.1)
    text(s, x + Inches(0.32), y + Inches(0.72), qw - Inches(0.55), Inches(0.32),
         a, size=10.5, color=DIM)
    code_box(s, x + Inches(0.32), y + Inches(1.12), qw - Inches(0.62), Inches(0.66),
             cmd, cmt, size=11)

footer(s, 8)

# ============ SLIDE 9 · CHEAT SHEET ============
s = prs.slides.add_slide(blank)
bg(s, deco=False)
glow = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(-2.2), Inches(-2.2), Inches(5.4), Inches(5.4))
solid(glow, RGBColor(0x15, 0x20, 0x3E))
glow2 = s.shapes.add_shape(MSO_SHAPE.OVAL, W - Inches(3.0), H - Inches(3.0), Inches(4.6), Inches(4.6))
solid(glow2, RGBColor(0x12, 0x1B, 0x36))

pill(s, Inches(4.86), Inches(0.85), Inches(3.6), Inches(0.5),
     "⚡  CHEAT SHEET", fill=RGBColor(0x1B, 0x27, 0x45), fg=CYAN, size=13)
text(s, Inches(1.2), Inches(1.55), Inches(10.93), Inches(0.7),
     "Semua Perintah dalam Satu Layar", size=30, bold=True, font=HEAD_FONT,
     align=PP_ALIGN.CENTER)
text(s, Inches(1.2), Inches(2.18), Inches(10.93), Inches(0.45),
     "Salin-tempel berurutan dari atas ke bawah — selesai.", size=13.5,
     color=DIM, align=PP_ALIGN.CENTER)

terminal_box(s, Inches(2.55), Inches(2.85), Inches(8.23), Inches(2.75), [
    ("# 1 · masuk ke folder aplikasi", FAINT, False, CODE_FONT),
    ("$ cd download-accelerator", CODEGRN, True, CODE_FONT),
    ("", DIM, False, CODE_FONT),
    ("# 2 · jalankan server", FAINT, False, CODE_FONT),
    ("$ npm start", CODEGRN, True, CODE_FONT),
    ("", DIM, False, CODE_FONT),
    ("# 3 · buka dashboard di browser", FAINT, False, CODE_FONT),
    ("  http://localhost:3000", CYAN, True, CODE_FONT),
])

pill(s, Inches(2.55), Inches(5.85), Inches(8.23), Inches(0.56),
     "Tekan Ctrl + C di terminal untuk menghentikan server",
     fill=RGBColor(0x2A, 0x22, 0x0E), fg=AMBER, size=12.5)
text(s, Inches(1.2), Inches(6.62), Inches(10.93), Inches(0.5),
     "Selamat mengunduh dengan kecepatan penuh! ⚡",
     size=15, bold=True, color=CYAN, align=PP_ALIGN.CENTER, font=HEAD_FONT)

prs.save(OUT)
print(f"Saved: {OUT}")
print(f"Slides: {len(prs.slides.__iter__.__self__._sldIdLst)}")
