"""FTRA strategy deck — short cut. 11 slides. Fighter-to-fighter tone.

Black + electric-blue palette. Same look as the long deck, ruthlessly trimmed.
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR


# ----- palette: black + blue -----
BG       = RGBColor(0x0A, 0x0A, 0x0A)
TEXT     = RGBColor(0xF2, 0xF4, 0xF8)
MUTED    = RGBColor(0x6B, 0x76, 0x88)
BLUE     = RGBColor(0x3D, 0x8B, 0xFD)
BLUE_HOT = RGBColor(0x6F, 0xB3, 0xFF)

HEAD_FONT = "Impact"
BODY_FONT = "Helvetica Neue"

SW, SH = Inches(13.333), Inches(7.5)


def set_bg(slide, color=BG):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_rect(slide, x, y, w, h, color):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()
    shape.shadow.inherit = False
    return shape


def add_text(slide, x, y, w, h, text, *, font=BODY_FONT, size=18,
             color=TEXT, bold=False, italic=False, align=PP_ALIGN.LEFT,
             anchor=MSO_ANCHOR.TOP, spacing=1.2, letter_spacing=None):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(0)
    tf.margin_top = tf.margin_bottom = Inches(0)
    tf.vertical_anchor = anchor
    lines = text if isinstance(text, list) else [text]
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = spacing
        run = p.add_run()
        run.text = line
        run.font.name = font
        run.font.size = Pt(size)
        run.font.color.rgb = color
        run.font.bold = bold
        run.font.italic = italic
        if letter_spacing is not None:
            rPr = run._r.get_or_add_rPr()
            rPr.set("spc", str(int(letter_spacing * 100)))
    return tb


def add_bullets(slide, x, y, w, h, items, *, size=20, color=TEXT,
                bullet_color=BLUE, gap=10):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(0)
    tf.margin_top = tf.margin_bottom = Inches(0)
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.line_spacing = 1.3
        p.space_after = Pt(gap)
        r1 = p.add_run()
        r1.text = "— "
        r1.font.name = BODY_FONT
        r1.font.size = Pt(size)
        r1.font.color.rgb = bullet_color
        r1.font.bold = True
        r2 = p.add_run()
        r2.text = item
        r2.font.name = BODY_FONT
        r2.font.size = Pt(size)
        r2.font.color.rgb = color
    return tb


def section_label(slide, n, total, label):
    add_text(slide, Inches(0.5), Inches(0.45), Inches(8), Inches(0.3),
             f"{n:02d} / {total:02d}   ·   {label.upper()}",
             size=10, color=BLUE, bold=True, letter_spacing=4)
    add_rect(slide, Inches(0.5), Inches(0.85), Inches(0.6), Emu(15000), BLUE)


def footer(slide):
    add_text(slide, Inches(0.5), Inches(7.05), Inches(12.3), Inches(0.3),
             "FTRA  ·  THE PLAN",
             size=10, color=MUTED, letter_spacing=4)


def head(slide, text, *, size=46, color=TEXT, y=Inches(1.05)):
    add_text(slide, Inches(0.5), y, Inches(12.3), Inches(1.4),
             text.upper(), font=HEAD_FONT, size=size, color=color,
             letter_spacing=1, spacing=1.0)


def sub(slide, text, *, y=Inches(2.25), size=18, color=MUTED):
    add_text(slide, Inches(0.5), y, Inches(12.3), Inches(0.6),
             text, size=size, color=color, italic=True, spacing=1.2)


prs = Presentation()
prs.slide_width = SW
prs.slide_height = SH
BLANK = prs.slide_layouts[6]


def new(n, total, label):
    s = prs.slides.add_slide(BLANK)
    set_bg(s)
    section_label(s, n, total, label)
    footer(s)
    return s


TOTAL = 11

# ============== 1. COVER ==============
s = prs.slides.add_slide(BLANK)
set_bg(s)
add_rect(s, Inches(0.6), Inches(0.6), Inches(2), Emu(20000), BLUE)
add_rect(s, Inches(10.7), Inches(6.85), Inches(2), Emu(20000), BLUE)

add_text(s, Inches(0.6), Inches(0.85), Inches(8), Inches(0.4),
         "FULL THAI RULES AUSTRALIA",
         size=11, color=BLUE, bold=True, letter_spacing=6)

add_text(s, Inches(0.55), Inches(2.4), Inches(12), Inches(2.0),
         "FTRA",
         font=HEAD_FONT, size=200, color=TEXT, letter_spacing=2, spacing=0.9)

add_text(s, Inches(0.6), Inches(5.4), Inches(12), Inches(0.8),
         "THE PLAN",
         font=HEAD_FONT, size=44, color=BLUE, letter_spacing=4)

add_text(s, Inches(0.6), Inches(6.85), Inches(8), Inches(0.3),
         "11 SLIDES  ·  THE WHOLE BUSINESS",
         size=10, color=MUTED, letter_spacing=4)


# ============== 2. WHERE WE ARE ==============
s = new(1, TOTAL, "Position")
head(s, "Where we are")
add_bullets(s, Inches(0.5), Inches(2.7), Inches(12.3), Inches(4.5), [
    "The only Muay Thai rankings platform in Australia.",
    "400–500 active fighters in the dataset. 24 divisions.",
    "Cold-start commercially. Real momentum on social.",
    "Site rebuild in flight — cinematic redesign incoming.",
    "We have the position. We don't yet have the machine.",
], size=22, gap=14)


# ============== 3. ETHOS ==============
s = new(2, TOTAL, "Ethos")
head(s, "The line we don't cross", color=BLUE_HOT)
sub(s, "Published. Not internal. Sponsors who can't accept this aren't FTRA sponsors.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "No gambling.",
    "No SARMs or predatory supplements.",
    "No selling the rankings. They are not for sale.",
    "One alcohol or energy-drink partner. Never saturation.",
    "Fighters can always decline a sponsor placement.",
], size=24, bullet_color=BLUE_HOT, gap=14)


# ============== 4. HOW WE MAKE MONEY ==============
s = new(3, TOTAL, "Revenue")
head(s, "How we make money")
sub(s, "Five lines. The rest comes later.")
add_bullets(s, Inches(0.5), Inches(2.95), Inches(12.3), Inches(4), [
    "Sponsor category packs  ·  mouthguard, labour hire, recovery, gear.",
    "Promoter sanctioning fees  ·  fights only count if FTRA stamps them.",
    "Insurance partnership  ·  direct, no middleman.",
    "Fighter & stable subscriptions  ·  Pro tiers, $49–99 fighter, $39–99/mo stable.",
    "Events, merch, fundraisers  ·  layered on top, recurring.",
], size=21, gap=14)


# ============== 5. YEAR 1 NUMBERS ==============
s = new(4, TOTAL, "Year 1")
head(s, "Year 1 — realistic")
sub(s, "Built off 400–500 fighters and one signed anchor.")

rows = [
    ("Insurance anchor",                            "$25 – 60k"),
    ("Sponsor category packs (2–4)",                "$25 – 80k"),
    ("Promoter sanctioning fees",                   "$10 – 25k"),
    ("Subs + events + merch + fundraisers",         "$20 – 55k"),
]
y0 = Inches(3.2)
row_h = Inches(0.55)
for i, (k, v) in enumerate(rows):
    yy = y0 + row_h * i
    add_text(s, Inches(0.6), yy, Inches(8.5), row_h, k, size=20, color=TEXT,
             anchor=MSO_ANCHOR.MIDDLE)
    add_text(s, Inches(9.2), yy, Inches(3.6), row_h, v, size=20, color=BLUE,
             align=PP_ALIGN.RIGHT, bold=True, anchor=MSO_ANCHOR.MIDDLE)
add_rect(s, Inches(0.6), y0 + row_h * len(rows) + Inches(0.15),
         Inches(12.2), Emu(15000), BLUE)
add_text(s, Inches(0.6), y0 + row_h * len(rows) + Inches(0.35),
         Inches(8.5), Inches(0.5), "TOTAL", size=16, color=TEXT,
         bold=True, letter_spacing=4, anchor=MSO_ANCHOR.MIDDLE)
add_text(s, Inches(9.2), y0 + row_h * len(rows) + Inches(0.35),
         Inches(3.6), Inches(0.5), "$80 – 220k", size=24, color=BLUE,
         align=PP_ALIGN.RIGHT, bold=True, anchor=MSO_ANCHOR.MIDDLE)
add_text(s, Inches(0.5), Inches(6.6), Inches(12.3), Inches(0.5),
         "The first signed anchor unlocks everything else.",
         size=16, color=BLUE_HOT, italic=True)


# ============== 6. SOCIAL PLAY ==============
s = new(5, TOTAL, "Social")
head(s, "Fighters are the distribution", size=42)
sub(s, "We make the cards. Fighters share them. Reach we can't buy.")

beats = [
    ("MON", "Rankings move"),
    ("WED", "Fighter spotlight"),
    ("FRI", "Card preview"),
    ("SAT", "Live updates"),
    ("SUN", "The wrap + weekly email"),
]
y0 = Inches(3.0)
row_h = Inches(0.7)
for i, (d, t) in enumerate(beats):
    yy = y0 + row_h * i
    add_text(s, Inches(1.5), yy, Inches(2), row_h, d, size=22, color=BLUE,
             bold=True, letter_spacing=4, anchor=MSO_ANCHOR.MIDDLE)
    add_text(s, Inches(4.0), yy, Inches(8), row_h, t, size=20, color=TEXT,
             anchor=MSO_ANCHOR.MIDDLE)


# ============== 7. THE LAUNCH ==============
s = new(6, TOTAL, "Launch")
head(s, "The launch")
sub(s, "One moment, not a slow drift.")
add_bullets(s, Inches(0.5), Inches(2.95), Inches(12.3), Inches(4), [
    "6 weeks pre-launch:  daily fighter spotlights + email capture page.",
    "One-hour drop with a 60–90s launch video.",
    "Personalised ranking cards pre-built for every ranked fighter to share.",
    "Press kit out + 2 AU combat-sports podcasts booked launch week.",
    "Email blast to the pre-launch list at go-live.",
], size=21, gap=14)


# ============== 8. 90 DAYS ==============
s = new(7, TOTAL, "90 Days")
head(s, "First 90 days")

phases = [
    ("DAYS 1 – 30",  "FOUNDATION", BLUE,
     "Site live. Templates + share-pack ready. Pre-launch list growing. Press kit drafted."),
    ("DAYS 31 – 60", "LAUNCH",     TEXT,
     "Launch week ships. Sunday Wrap newsletter starts. Sales push: 3 insurance, 5 sponsor, 5 promoter conversations."),
    ("DAYS 61 – 90", "CONVERT",    BLUE_HOT,
     "Close 1 anchor. Close 2 sponsor packs. Sign 5 promoters to sanctioning. Officials registry scoped."),
]
y0 = Inches(2.6)
row_h = Inches(1.4)
for i, (label, phase, c, body) in enumerate(phases):
    yy = y0 + row_h * i
    add_rect(s, Inches(0.5), yy, Inches(0.06), Inches(1.2), c)
    add_text(s, Inches(0.75), yy, Inches(3), Inches(0.4), label,
             size=12, color=c, bold=True, letter_spacing=3)
    add_text(s, Inches(0.75), yy + Inches(0.4), Inches(4), Inches(0.5), phase,
             font=HEAD_FONT, size=24, color=TEXT, letter_spacing=2)
    add_text(s, Inches(5.2), yy + Inches(0.05), Inches(7.8), Inches(1.3), body,
             size=15, color=MUTED, anchor=MSO_ANCHOR.MIDDLE)


# ============== 9. THE YEAR ==============
s = new(8, TOTAL, "12 Months")
head(s, "The year ahead")

quarters = [
    ("Q1", "LAUNCH",      "Site live. First anchor signed. 2 sponsor packs closed."),
    ("Q2", "CREDIBILITY", "Officials registry + Clean Fighter pilot. First international booking."),
    ("Q3", "EXPAND",      "Women's + junior lane launches — banks, super, telcos as sponsors."),
    ("Q4", "COMPOUND",    "Hall of Fame ceremony. Year-2 renewals locked. First data-licensing convo."),
]
y0 = Inches(2.7)
row_h = Inches(0.95)
for i, (q, t, body) in enumerate(quarters):
    yy = y0 + row_h * i
    add_text(s, Inches(0.6), yy, Inches(1.2), row_h, q, font=HEAD_FONT,
             size=44, color=BLUE, anchor=MSO_ANCHOR.MIDDLE)
    add_text(s, Inches(2.0), yy, Inches(2.8), row_h, t, size=15,
             color=TEXT, bold=True, letter_spacing=3, anchor=MSO_ANCHOR.MIDDLE)
    add_text(s, Inches(5.0), yy, Inches(8), row_h, body, size=14,
             color=MUTED, anchor=MSO_ANCHOR.MIDDLE)


# ============== 10. WHAT WE BOTH BRING ==============
s = new(9, TOTAL, "Roles")
head(s, "What we both bring")

# YOU column
add_text(s, Inches(0.6), Inches(2.6), Inches(6), Inches(0.4),
         "YOU", size=14, color=BLUE, bold=True, letter_spacing=4)
add_rect(s, Inches(0.6), Inches(3.0), Inches(0.5), Emu(15000), BLUE)
add_bullets(s, Inches(0.6), Inches(3.25), Inches(6), Inches(4), [
    "Fighter relationships.",
    "Credibility — you've lived it.",
    "Demo + spotlight content.",
    "Gym and stable network.",
], size=17, gap=10)

# ME column
add_text(s, Inches(7.0), Inches(2.6), Inches(6), Inches(0.4),
         "ME", size=14, color=BLUE_HOT, bold=True, letter_spacing=4)
add_rect(s, Inches(7.0), Inches(3.0), Inches(0.5), Emu(15000), BLUE_HOT)
add_bullets(s, Inches(7.0), Inches(3.25), Inches(6), Inches(4), [
    "Platform + product.",
    "Sales + sponsor outreach.",
    "Partnerships and ops.",
    "Brand and editorial.",
], size=17, gap=10, bullet_color=BLUE_HOT)

add_text(s, Inches(0.6), Inches(6.5), Inches(12.3), Inches(0.5),
         "Together: the canonical record of Australian Muay Thai.",
         size=16, color=TEXT, italic=True, align=PP_ALIGN.CENTER)


# ============== 11. CLOSER ==============
s = prs.slides.add_slide(BLANK)
set_bg(s)
add_rect(s, Inches(0.6), Inches(0.6), Inches(2), Emu(20000), BLUE)
add_rect(s, Inches(10.7), Inches(6.85), Inches(2), Emu(20000), BLUE)

add_text(s, Inches(0.6), Inches(2.6), Inches(12.3), Inches(1.2),
         "MOST TRUSTED.",
         font=HEAD_FONT, size=80, color=TEXT, letter_spacing=1)
add_text(s, Inches(0.6), Inches(3.85), Inches(12.3), Inches(1.0),
         "NOT THE LOUDEST.",
         font=HEAD_FONT, size=60, color=BLUE, letter_spacing=1)
add_text(s, Inches(0.6), Inches(5.4), Inches(12.3), Inches(0.8),
         "Then we sell access to that trust — without compromising it.",
         size=18, color=MUTED, italic=True)
add_text(s, Inches(0.6), Inches(7.05), Inches(12.3), Inches(0.3),
         "FTRA  ·  FULL THAI RULES AUSTRALIA",
         size=10, color=MUTED, letter_spacing=4)


out = "/Users/alexcashmore/Documents/FTRA/FTRA_Plan_Short.pptx"
prs.save(out)
print(f"Saved: {out}")
