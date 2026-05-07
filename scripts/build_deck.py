"""Build the FTRA strategy deck.

Cinematic dark theme: deep black background, cool off-white body text,
electric-blue accents. 39 slides covering position, ethos,
revenue lines, year-1 realistic numbers, social plan, action plan.
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree


# ----- palette: black + blue -----
BG       = RGBColor(0x0A, 0x0A, 0x0A)   # near-black
PANEL    = RGBColor(0x12, 0x16, 0x1E)   # slightly lifted panel
TEXT     = RGBColor(0xF2, 0xF4, 0xF8)   # cool off-white
MUTED    = RGBColor(0x6B, 0x76, 0x88)   # cool slate
BLUE     = RGBColor(0x3D, 0x8B, 0xFD)   # primary electric blue
BLUE_HOT = RGBColor(0x6F, 0xB3, 0xFF)   # brighter highlight
RULE     = RGBColor(0x15, 0x25, 0x44)   # deep blue divider

# preserve old names so existing usages keep working
GOLD = BLUE
RED  = BLUE_HOT

HEAD_FONT = "Impact"
BODY_FONT = "Helvetica Neue"

SW, SH = Inches(13.333), Inches(7.5)   # 16:9


def set_bg(slide, color=BG):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_rect(slide, x, y, w, h, color, line=False):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    if not line:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = color
    shape.shadow.inherit = False
    return shape


def add_text(slide, x, y, w, h, text, *, font=BODY_FONT, size=18,
             color=TEXT, bold=False, italic=False, align=PP_ALIGN.LEFT,
             anchor=MSO_ANCHOR.TOP, spacing=1.15, letter_spacing=None):
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
            # spc attribute: in 1/100 of a point
            rPr = run._r.get_or_add_rPr()
            rPr.set("spc", str(int(letter_spacing * 100)))
    return tb


def add_bullets(slide, x, y, w, h, items, *, size=18, color=TEXT,
                bullet_color=GOLD, gap=8):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(0)
    tf.margin_top = tf.margin_bottom = Inches(0)
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.line_spacing = 1.25
        p.space_after = Pt(gap)
        # bullet char in gold
        r1 = p.add_run()
        r1.text = "— "
        r1.font.name = BODY_FONT
        r1.font.size = Pt(size)
        r1.font.color.rgb = bullet_color
        r1.font.bold = True
        # body
        r2 = p.add_run()
        r2.text = item
        r2.font.name = BODY_FONT
        r2.font.size = Pt(size)
        r2.font.color.rgb = color
    return tb


def slide_number(slide, n, total):
    add_text(slide, Inches(12.4), Inches(7.05), Inches(0.8), Inches(0.3),
             f"{n:02d} / {total:02d}", size=9, color=MUTED, align=PP_ALIGN.RIGHT,
             letter_spacing=2)


def footer_brand(slide):
    add_text(slide, Inches(0.5), Inches(7.05), Inches(4), Inches(0.3),
             "FTRA  ·  STRATEGIC PLAN  ·  2026",
             size=9, color=MUTED, letter_spacing=2)


def section_label(slide, text, color=GOLD):
    add_text(slide, Inches(0.5), Inches(0.45), Inches(8), Inches(0.3),
             text.upper(), size=10, color=color, bold=True, letter_spacing=4)
    # gold rule
    add_rect(slide, Inches(0.5), Inches(0.85), Inches(0.6), Emu(15000), GOLD)


def head(slide, text, *, size=44, color=TEXT, y=Inches(1.05)):
    add_text(slide, Inches(0.5), y, Inches(12.3), Inches(1.4),
             text.upper(), font=HEAD_FONT, size=size, color=color,
             bold=False, letter_spacing=1, spacing=1.0)


def sub(slide, text, *, y=Inches(2.2), size=16, color=MUTED, italic=False):
    tb = add_text(slide, Inches(0.5), y, Inches(12.3), Inches(0.6),
                  text, size=size, color=color, spacing=1.2)
    if italic:
        for p in tb.text_frame.paragraphs:
            for r in p.runs:
                r.font.italic = True
    return tb


# ----- deck -----
prs = Presentation()
prs.slide_width = SW
prs.slide_height = SH
BLANK = prs.slide_layouts[6]

slides_meta = []   # collected so we can stamp totals last


def new(label):
    s = prs.slides.add_slide(BLANK)
    set_bg(s)
    slides_meta.append(s)
    if label:
        section_label(s, label)
    footer_brand(s)
    return s


# ============== 1. COVER ==============
s = prs.slides.add_slide(BLANK)
set_bg(s)
slides_meta.append(s)

# big gold rule top + bottom
add_rect(s, Inches(0.6), Inches(0.6), Inches(2), Emu(20000), GOLD)
add_rect(s, Inches(10.7), Inches(6.85), Inches(2), Emu(20000), GOLD)

add_text(s, Inches(0.6), Inches(0.85), Inches(8), Inches(0.4),
         "FULL THAI RULES AUSTRALIA",
         size=11, color=GOLD, bold=True, letter_spacing=6)

add_text(s, Inches(0.55), Inches(2.1), Inches(12), Inches(2.0),
         "FTRA",
         font=HEAD_FONT, size=180, color=TEXT, letter_spacing=2, spacing=0.9)

add_text(s, Inches(0.6), Inches(4.9), Inches(12), Inches(0.7),
         "BUILDING THE CANONICAL RECORD",
         font=HEAD_FONT, size=34, color=GOLD, letter_spacing=2)
add_text(s, Inches(0.6), Inches(5.45), Inches(12), Inches(0.7),
         "OF AUSTRALIAN MUAY THAI",
         font=HEAD_FONT, size=34, color=TEXT, letter_spacing=2)

add_text(s, Inches(0.6), Inches(6.85), Inches(8), Inches(0.3),
         "STRATEGY  ·  MONETIZATION  ·  LAUNCH",
         size=10, color=MUTED, letter_spacing=4)
add_text(s, Inches(8.6), Inches(6.85), Inches(4), Inches(0.3),
         "MAY 2026", size=10, color=MUTED, align=PP_ALIGN.RIGHT, letter_spacing=4)


# ============== 2. TODAY ==============
s = new("01  ·  POSITION")
head(s, "Where we actually are", size=42)
sub(s, "An honest read of today, before we plan tomorrow.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "The only Muay Thai ranking platform in Australia.",
    "400–500 active fighters in the dataset across 24 divisions (12 male, 12 female).",
    "Cold-start commercially. Every relationship has been earned individually.",
    "Social momentum is real but unsystematic. No owned audience yet (no email list).",
    "Site rebuild in progress — cinematic redesign, custom React + Vite + Firebase.",
    "We have the position. We don't yet have the machine.",
], size=18)


# ============== 3. MISSION ==============
s = new("02  ·  MISSION")
head(s, "What we're actually building", size=40)
add_text(s, Inches(0.5), Inches(2.4), Inches(12), Inches(4),
         [
             "The canonical record of Australian Muay Thai.",
             "",
             "Not an inventory of advertising space.",
             "Not the loudest gym in town.",
             "",
             "A ranking system fighters trust enough to chase,",
             "promoters trust enough to use,",
             "and sponsors trust enough to back.",
             "",
             "Once the rankings are unquestioned, the business writes itself.",
         ], size=22, color=TEXT, spacing=1.3)


# ============== 4. THE THREE WALLS ==============
s = new("03  ·  ETHOS")
head(s, "What we will never do", size=40, color=RED)
sub(s, "Published, not internal. Sponsors who can't accept this aren't FTRA sponsors.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "No gambling or wagering affiliates. Ever.",
    "No predatory supplements, SARMs, or TRT-adjacent advertisers.",
    "No selling editorial. Rankings are not for sale at any price.",
    "One alcohol / energy-drink partner cap. Never category saturation.",
    "Fighters can always decline a sponsor placement. Never auto-assigned.",
    "Sponsor approval is editorial, not auction. We reserve the right to say no.",
], size=18, bullet_color=RED)


# ============== 5. STRATEGIC FRAME ==============
s = new("04  ·  FRAME")
head(s, "Rankings are currency", size=44)
add_text(s, Inches(0.5), Inches(2.5), Inches(12), Inches(4),
         [
             "The rankings only have monetary value if they're trusted.",
             "Every commercial decision either reinforces or erodes that trust.",
             "",
             "The order of operations matters:",
         ], size=22, color=TEXT, spacing=1.3)
add_bullets(s, Inches(1.0), Inches(5.05), Inches(11), Inches(2), [
    "Build credibility first.",
    "Monetize the credibility second.",
    "Defend the credibility forever.",
], size=20)


# ============== 6. EDITORIAL / COMMERCIAL WALL ==============
s = new("05  ·  GOVERNANCE")
head(s, "How we stay honest", size=40)
sub(s, "The single biggest risk to FTRA is becoming what we set out to replace.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "Rankings methodology published — inputs, weights, refresh cadence, audit log.",
    "Sponsors have zero ranking influence. Ever. Stated in writing, on the site.",
    "Editorial spotlights chosen by FTRA. Not auctioned. Not promoted.",
    "Sponsored placements clearly labelled as such, every time.",
    "Conflict-of-interest policy written down. Reviewed annually.",
    "If we ever rank a sponsored fighter, the disclosure is on the same page.",
], size=18)


# ============== 7. ANCHOR TENANT LOGIC ==============
s = new("06  ·  STRATEGY")
head(s, "One big deal beats fifty small ones", size=36)
sub(s, "$30k+ deals legitimize the platform. Small deals follow them.")
add_text(s, Inches(0.5), Inches(3.0), Inches(12), Inches(0.5),
         "Three real anchor candidates:", size=18, color=GOLD, bold=True)
add_bullets(s, Inches(0.5), Inches(3.7), Inches(12.3), Inches(3), [
    "Combat sports insurer — direct, replacing the old wedge.",
    "A national or international sanctioning body (WBC Muay Thai / WMC / IFMA recognition).",
    "A category-defining sponsor pack (mouthguard, labour hire, gear).",
], size=18)
add_text(s, Inches(0.5), Inches(6.2), Inches(12), Inches(0.5),
         "The first signed anchor unlocks the rest. Chase one. Sign one. Sell from it.",
         size=16, color=GOLD, bold=False)


# ============== 8. REVENUE ARCHITECTURE ==============
s = new("07  ·  REVENUE MAP")
head(s, "The revenue architecture", size=40)

cols = [
    ("ANCHOR / NEAR-TERM", GOLD, [
        "Insurance partnership",
        "Sponsor brokerage & category packs",
        "Promoter sanctioning fees",
    ]),
    ("PRODUCT / MID-TERM", TEXT, [
        "Fighter & stable subscriptions",
        "Event listings + ticketing",
        "Merchandise & storefronts",
        "Fundraiser platform",
    ]),
    ("MOAT / LONG-TERM", RED, [
        "Officials & corner registry",
        "Clean Fighter program",
        "Data licensing & media",
        "International bridge",
    ]),
]

cw = Inches(4.0)
gap = Inches(0.15)
total_w = cw * 3 + gap * 2
start_x = (SW - total_w) / 2
for i, (title, c, items) in enumerate(cols):
    x = start_x + i * (cw + gap)
    add_rect(s, x, Inches(2.4), cw, Inches(0.05), c)
    add_text(s, x, Inches(2.55), cw, Inches(0.4), title,
             size=11, color=c, bold=True, letter_spacing=3)
    add_bullets(s, x, Inches(3.2), cw, Inches(4), items, size=15, gap=10)


# ============== 9. INSURANCE ==============
s = new("08  ·  ANCHOR")
head(s, "Rebuild the insurance line — direct", size=36)
sub(s, "Cut out the old wedge entirely. One phone call replaces what was being skimmed.")
add_text(s, Inches(0.5), Inches(3.0), Inches(12), Inches(0.4),
         "OFFER:", size=11, color=GOLD, bold=True, letter_spacing=4)
add_bullets(s, Inches(0.5), Inches(3.5), Inches(12.3), Inches(2), [
    "Exclusive 'Official Insurance Partner of FTRA Rankings'.",
    "Logo placement on division pages, fighter and gym profile referral links.",
    "Shared lead-flow from gyms and ranked fighters.",
], size=17)
add_text(s, Inches(0.5), Inches(5.6), Inches(12), Inches(0.4),
         "TARGET:", size=11, color=GOLD, bold=True, letter_spacing=4)
add_text(s, Inches(0.5), Inches(6.0), Inches(12), Inches(0.6),
         "$25–60k/yr exclusive  +  $20–80 per qualified gym/fighter lead.",
         size=20, color=TEXT, bold=True)


# ============== 10. SPONSOR BROKERAGE ==============
s = new("09  ·  REVENUE")
head(s, "Sell categories, not people", size=38)
sub(s, "Don't sell logo space — solve a real problem. Be the broker, not the billboard.")
add_text(s, Inches(0.5), Inches(3.0), Inches(12), Inches(0.4),
         "CATEGORY PACKS — one anchor sponsor per category:",
         size=12, color=GOLD, bold=True, letter_spacing=3)
add_bullets(s, Inches(0.5), Inches(3.5), Inches(12.3), Inches(3), [
    "Mouthguard  (SISU / OPRO / Gameday)",
    "Labour hire  ('FTRA Fighter Employment Network' — underexploited, real anchor potential)",
    "Recovery & massage  (stable massage, physios, cryo)",
    "Gear  (FightHQ, Fairtex, Yokkao, Engage AU)",
    "Supplements  (clean only — no SARM-adjacent, no predatory)",
], size=16)
add_text(s, Inches(0.5), Inches(6.4), Inches(12.3), Inches(0.5),
         "Each pack: $8–30k/yr  ·  Individual brokered deals: 15% FTRA cut",
         size=18, color=TEXT, bold=True)


# ============== 11. SANCTIONING FEES ==============
s = new("10  ·  REVENUE")
head(s, "Make fights count", size=44)
sub(s, "Promoters care about FTRA when their fights affect rankings. That's the whole game.")
add_text(s, Inches(0.5), Inches(3.0), Inches(12), Inches(0.4),
         "TIERED SANCTIONING FEE PER EVENT:",
         size=12, color=GOLD, bold=True, letter_spacing=3)
add_bullets(s, Inches(0.5), Inches(3.5), Inches(12.3), Inches(3), [
    "Regional show:  $150–300",
    "State title fight:  $400–800",
    "National title fight:  $1,200–2,500",
    "'FTRA Sanctioned' badge, ranking-points award, integrated ranking-impact reporting.",
], size=17)
add_text(s, Inches(0.5), Inches(6.3), Inches(12), Inches(0.5),
         "Near-100% margin. Recurring. The moat — unsanctioned fights don't move rankings.",
         size=15, color=GOLD, italic=True)


# ============== 12. FIGHTER + STABLE SUBS ==============
s = new("11  ·  REVENUE")
head(s, "The SaaS layer", size=42)
sub(s, "Small market — price modestly, prioritise stickiness over ARPU.")

# two columns
def sub_table(slide, x, y, w, title, rows, accent):
    add_rect(slide, x, y, w, Inches(0.05), accent)
    add_text(slide, x, y + Inches(0.15), w, Inches(0.4), title,
             size=11, color=accent, bold=True, letter_spacing=3)
    add_bullets(slide, x, y + Inches(0.7), w, Inches(3), rows, size=15, gap=8)

sub_table(s, Inches(0.6), Inches(2.9), Inches(6), "FIGHTER", [
    "Free  ·  basic profile",
    "Pro  ·  $49–99/yr  ·  verified badge, banner, footage embeds, sponsor logos, contact form, highlight reel",
], GOLD)

sub_table(s, Inches(6.9), Inches(2.9), Inches(6), "STABLE / GYM", [
    "Free  ·  gym listing",
    "Pro  ·  $39/mo  ·  stable page + fighter management + analytics",
    "Elite  ·  $99/mo  ·  homepage placement + lead capture + email tools",
], RED)


# ============== 13. EVENTS ==============
s = new("12  ·  REVENUE")
head(s, "Own the calendar", size=44)
sub(s, "Every event becomes three revenue touches.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "Free basic listings — every promoter, every event. Calendar gravity, SEO compounding.",
    "Featured slots: $150–500/event  OR  annual promoter pass $2–5k/yr unlimited.",
    "Ticketing affiliate (Humanitix / Eventbrite / Oztix): 2–5% per ticket sold via FTRA.",
    "Layered with sanctioning fees: listing + featured + sanction + ticket cut on a single card.",
], size=17)


# ============== 14. MERCHANDISE ==============
s = new("13  ·  REVENUE")
head(s, "Fighters deserve a store", size=40)
sub(s, "FTRA-branded for the platform, print-on-demand for the fighter.")
add_text(s, Inches(0.5), Inches(3.0), Inches(12), Inches(0.4),
         "FTRA BRANDED:", size=11, color=GOLD, bold=True, letter_spacing=3)
add_bullets(s, Inches(0.5), Inches(3.4), Inches(12), Inches(2), [
    "Contender plaques (#1–3 each division) — keepsakes fighters buy themselves.",
    "Limited drops on title fight nights.",
    "Wall-art editions for fans.",
], size=15)
add_text(s, Inches(0.5), Inches(5.2), Inches(12), Inches(0.4),
         "PER-FIGHTER STOREFRONTS:", size=11, color=GOLD, bold=True, letter_spacing=3)
add_bullets(s, Inches(0.5), Inches(5.6), Inches(12), Inches(2), [
    "Print-on-demand integration (Printful / Printify) — fighter sets price, FTRA takes 15–25%.",
    "One-click to spin up a store from a fighter profile.",
    "Stable Store tier — gyms sell their own gear through FTRA infrastructure.",
], size=15)


# ============== 15. FUNDRAISER ==============
s = new("14  ·  REVENUE")
head(s, "Verified fundraisers. No middleman.", size=34, color=GOLD)
sub(s, "The single most ethos-aligned revenue line. Real value to fighters; real defensibility for FTRA.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "Verified fighter fundraisers — 'ranked #4 bantamweight, raising $8k for IFMA Worlds.'",
    "Higher trust than GoFundMe because FTRA verifies the fighter, the event, the cause.",
    "Use cases: Thailand camps, World championships, post-injury medical, equipment for amateurs entering pro.",
    "Revenue: corporate underwriter sponsors the platform itself ('Powered by [X]') + 3% admin fee.",
    "Optional: monthly matching by an anchor sponsor on featured campaigns.",
], size=16)
add_text(s, Inches(0.5), Inches(6.6), Inches(12), Inches(0.4),
         "Compliance: NSW + VIC fundraising registration before launch.",
         size=13, color=RED, italic=True)


# ============== 16. OFFICIALS + CLEAN FIGHTER ==============
s = new("15  ·  MOAT")
head(s, "Become the credibility layer", size=38)
sub(s, "Two products. Both make every other revenue line easier to sell.")

sub_table(s, Inches(0.6), Inches(2.9), Inches(6), "OFFICIALS REGISTRY", [
    "Registered, rated database of judges, refs, corners.",
    "Light accreditation / training pathway.",
    "Promoters and commissions both pay for access.",
    "Reduces insurance claims — the insurer cares about this.",
], GOLD)

sub_table(s, Inches(6.9), Inches(2.9), Inches(6), "CLEAN FIGHTER PROGRAM", [
    "Anti-doping verification for title contenders.",
    "Partner with ASADA or private testing service.",
    "Verified badge on profile.",
    "Sponsorable category — gear, supplements, insurers.",
], RED)


# ============== 17. COACHING MARKETPLACE ==============
s = new("16  ·  REVENUE")
head(s, "Put fighter income first", size=40)
sub(s, "Same ethos as sponsor brokerage — FTRA helps fighters earn, doesn't extract.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "Ranked fighters offer paid private sessions between camps.",
    "Fighter sets the price; FTRA takes 10–15% brokerage.",
    "Builds platform stickiness for mid-career fighters who aren't sponsorship targets.",
    "Listings ranked by recency + rating, not paid placement.",
], size=18)


# ============== 18. INTERNATIONAL BRIDGE ==============
s = new("17  ·  REVENUE")
head(s, "The Thailand corridor", size=42)
sub(s, "AU → Thailand. Thailand → AU. AU → ONE / Glory / IFMA.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "Visa support letters for Thai fighters travelling to AU cards.",
    "Record-of-fights verification for international bookings.",
    "Ranking interoperability with WBC Muay Thai, WMC, IFMA.",
    "Promoter directories on both sides — paid access for serious bookers.",
    "Charge promoters for verified bookings; charge fighters a small fee for documentation.",
], size=17)


# ============== 19. DATA LICENSING ==============
s = new("18  ·  MOAT")
head(s, "Sell the feed", size=44)
sub(s, "We're already maintaining the only AU dataset. License it.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "State combat sports authorities (CSA NSW, VIC PCSAA, QLD OLGR) — $5–25k/yr each.",
    "National federations and international bodies.",
    "Broadcast media (Fox Sports, Stan Sport, Main Event combat content) — fighter records, head-to-heads, ranking feeds.",
    "Combat sports media outlets — data API, embed widgets.",
], size=17)


# ============== 20. FIGHT PICKS ==============
s = new("19  ·  ENGAGEMENT")
head(s, "Fight picks. Not gambling.", size=40)
sub(s, "Predictions for prizes. No money wagered. No odds. No gambling affiliates — ever.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "Free predictions game for AU cards.",
    "Title sponsor for the game ('[Brand] Fight Picks').",
    "Email capture — turn one-time visitors into a weekly audience.",
    "In-kind gear prizes from category sponsors. Zero cash cost to FTRA.",
    "Engagement compounds the value of every other revenue line above.",
], size=17)


# ============== 21. SURFACING BEYOND TOP 5 ==============
s = new("20  ·  EDITORIAL")
head(s, "The whole roster, or nothing", size=38)
sub(s, "This is what makes the monetization defensible. The ethos in product form.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "Rising Contender — weekly spotlight on fighters ranked #6–15.",
    "Regional Fighter of the Month — NSW / QLD / VIC / WA / SA.",
    "Path to the Title — narrative tracking of climbers across months.",
    "Debut Tracker — every amateur-to-pro transition gets a one-time spotlight.",
    "Stable Spotlights — small gyms with one or two ranked fighters, not just the big names.",
    "Underdog of the Month — reader-nominated, editorially selected.",
], size=16)


# ============== 22. WOMEN + JUNIOR LANE ==============
s = new("21  ·  GROWTH")
head(s, "The sponsor pool unlock", size=42, color=GOLD)
sub(s, "The single biggest unlocked TAM in the strategy.")
add_text(s, Inches(0.5), Inches(2.9), Inches(12.3), Inches(2),
         [
             "Sponsors who won't touch base combat sports WILL sponsor:",
             "  ·  Women's combat sports",
             "  ·  Junior pathways (under-18 amateur)",
             "  ·  Participation and safety initiatives",
         ], size=18, color=TEXT, spacing=1.4)
add_text(s, Inches(0.5), Inches(5.4), Inches(12.3), Inches(0.5),
         "Same platform. Different sponsor pool: banks, super funds, telcos, government, mainstream insurers.",
         size=16, color=GOLD, bold=True)
add_text(s, Inches(0.5), Inches(6.3), Inches(12.3), Inches(0.5),
         "Action: dedicated women's rankings homepage section + junior amateur tracker as a separate launch product.",
         size=15, color=MUTED, italic=True)


# ============== 23. HALL OF FAME ==============
s = new("22  ·  BRAND DEPTH")
head(s, "Build the history nobody else will", size=34)
sub(s, "AU Muay Thai has weak historical archives. We fix that — and the alumni network compounds.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "Hall of Fame inductions — annual, sponsored ceremony.",
    "'Greatest of all time' lists by division — community-nominated, editorially curated.",
    "Retired fighter profiles — the coaches, gym owners, and promoters of tomorrow.",
    "Alumni network compounds B2B reach: every retired fighter is a future customer.",
    "Brand depth play. Lower direct revenue, high credibility yield.",
], size=17)


# ============== 24. YEAR 1 REALISTIC ==============
s = new("23  ·  NUMBERS")
head(s, "Year 1 — realistic", size=44)
sub(s, "Based on the 400–500 fighter base, cold-start sales reality, and one signed anchor.")

rows = [
    ("Insurance anchor",                        "$25 – 60k"),
    ("2–4 category sponsor packs",              "$25 – 80k"),
    ("Promoter sanctioning fees",               "$10 – 25k"),
    ("Fighter Pro subs (50–100 conversions)",   "$3 – 10k"),
    ("Stable subs (15–25 paid)",                "$7 – 18k"),
    ("Event featured listings + ticketing",     "$5 – 15k"),
    ("Merchandise / storefronts (year-1 thin)", "$2 – 8k"),
    ("Fundraiser admin fees",                   "$1 – 5k"),
]
y0 = Inches(2.9)
row_h = Inches(0.42)
for i, (k, v) in enumerate(rows):
    yy = y0 + row_h * i
    add_text(s, Inches(0.6), yy, Inches(8.5), row_h, k, size=15, color=TEXT)
    add_text(s, Inches(9.5), yy, Inches(3.3), row_h, v, size=15, color=GOLD,
             align=PP_ALIGN.RIGHT, bold=True)
add_rect(s, Inches(0.6), y0 + row_h * len(rows) + Inches(0.1),
         Inches(12.2), Emu(15000), GOLD)
add_text(s, Inches(0.6), y0 + row_h * len(rows) + Inches(0.25),
         Inches(8.5), Inches(0.5), "TOTAL — YEAR 1", size=14, color=TEXT,
         bold=True, letter_spacing=3)
add_text(s, Inches(9.5), y0 + row_h * len(rows) + Inches(0.25),
         Inches(3.3), Inches(0.5), "$80 – 220k", size=18, color=GOLD,
         align=PP_ALIGN.RIGHT, bold=True)


# ============== 25. YEAR 2-3 ==============
s = new("24  ·  TRAJECTORY")
head(s, "Year 2 – 3 — when the flywheel catches", size=30)
add_text(s, Inches(0.5), Inches(2.7), Inches(12), Inches(0.4),
         "YEAR 2  ·  $250 – 600k", size=14, color=GOLD, bold=True, letter_spacing=3)
add_bullets(s, Inches(0.5), Inches(3.2), Inches(12.3), Inches(2), [
    "Anchor tenants in (insurance + 1 federation deal).",
    "6–10 category packs running.",
    "Officials registry launched.",
    "Women's / junior lane attracting non-combat-sports sponsors.",
], size=15)
add_text(s, Inches(0.5), Inches(5.0), Inches(12), Inches(0.4),
         "YEAR 3  ·  $600k – 1.5M", size=14, color=RED, bold=True, letter_spacing=3)
add_bullets(s, Inches(0.5), Inches(5.5), Inches(12.3), Inches(2), [
    "International bridge generating cross-border volume.",
    "Data licensing to broadcasters and commissions.",
    "Coaching marketplace at scale.",
    "Fundraiser platform a mature product line.",
    "Hall of Fame events as secondary revenue.",
], size=15)


# ============== 26. SOCIAL — PRINCIPLES ==============
s = new("25  ·  SOCIAL")
head(s, "Fighters are the distribution", size=40)
sub(s, "The platform's organic reach is whatever fighters choose to share. Engineer accordingly.")
add_text(s, Inches(0.5), Inches(3.0), Inches(12), Inches(0.4),
         "THREE PRINCIPLES:", size=11, color=GOLD, bold=True, letter_spacing=3)
add_bullets(s, Inches(0.5), Inches(3.5), Inches(12.3), Inches(2.5), [
    "Fighters reshare to their followers — that's reach FTRA can't buy.",
    "Every post must surface a real person, not a slogan.",
    "Predictable cadence beats sporadic volume. The beat is itself a brand asset.",
], size=17)
add_text(s, Inches(0.5), Inches(6.2), Inches(12.3), Inches(0.5),
         "Platform priority:  Instagram (primary)  ·  TikTok (growth)  ·  Facebook (promoters / parents)  ·  YouTube Shorts (cross-post)  ·  LinkedIn (sponsors, low effort).  Skip X / Twitter.",
         size=12, color=MUTED, italic=True)


# ============== 27. PRE-LAUNCH ==============
s = new("26  ·  SOCIAL")
head(s, "Pre-launch — 6 weeks out", size=38)
sub(s, "Build anticipation. Build the email list. Make the launch a moment, not a soft drift.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "Daily countdown spotlights — 30–45 days, one fighter per day. Rotate across divisions, regions, rankings #1–#15.",
    "Pre-launch landing page with single-field email capture: 'Be first to see your ranking.'",
    "Behind-the-scenes design teasers — 5-second cinematic clips. No full reveal.",
    "Hand-picked DM previews to 30 stables and promoters 1–2 weeks before public launch.",
    "Two AU combat-sports podcasts booked for launch week.",
    "All countdown posts queued; founder time on sales, not graphic design.",
], size=15)


# ============== 28. LAUNCH WEEK ==============
s = new("27  ·  SOCIAL")
head(s, "Launch week — one hour, one moment", size=34)
sub(s, "Single coordinated drop. The cinematic redesign supports a real moment — use it.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "60–90 second launch video at the top of the hour.",
    "Pre-staged personalised ranking cards for every ranked fighter — they download and post.",
    "Pre-staged stable kits — every stable with a ranked fighter gets celebratory assets.",
    "Press kit out to AU combat-sports media + 2 podcast appearances same week.",
    "Email blast to the pre-launch list at the moment of go-live.",
    "Most important asset to build before launch: the personalised share-pack generator.",
], size=15)


# ============== 29. SUSTAINING CADENCE ==============
s = new("28  ·  SOCIAL")
head(s, "Sustaining weekly cadence", size=40)
sub(s, "A rhythm you can hold for 52 weeks. Each beat feeds the next.")

beats = [
    ("MON", "Rankings movement", "Who climbed, who dropped, why."),
    ("WED", "Fighter spotlight", "Rotating divisions. Deliberately not always #1s."),
    ("FRI", "Card preview",     "All ranked fighters fighting the weekend."),
    ("SAT", "Live updates",     "Ranking implications as fights happen."),
    ("SUN", "The Wrap",         "Results, ranking shifts, weekly email."),
]
y0 = Inches(2.9)
row_h = Inches(0.65)
for i, (d, t, body) in enumerate(beats):
    yy = y0 + row_h * i
    add_text(s, Inches(0.6), yy, Inches(1.4), row_h, d, size=20, color=GOLD,
             bold=True, letter_spacing=3, anchor=MSO_ANCHOR.MIDDLE)
    add_text(s, Inches(2.2), yy, Inches(3.5), row_h, t, size=18, color=TEXT,
             bold=True, anchor=MSO_ANCHOR.MIDDLE)
    add_text(s, Inches(5.9), yy, Inches(7), row_h, body, size=14, color=MUTED,
             anchor=MSO_ANCHOR.MIDDLE)


# ============== 30. FIGHTER-AS-DISTRIBUTION ==============
s = new("29  ·  SOCIAL")
head(s, "The growth mechanic", size=44)
sub(s, "The single most important system to build. Higher leverage than any paid campaign.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "Auto-generated personalised ranking cards triggered on every rank change.",
    "One-tap share to IG / TikTok / FB. Pre-filled caption. No friction.",
    "Ranked fighter posts → reaches their followers → drives traffic → drives sponsor pitch numbers.",
    "Habit-forming via monthly 'ranking shift' cards — anyone who moved.",
    "Make sharing the path of least resistance. Defaults beat instructions.",
], size=17)


# ============== 31. EMAIL OWNERSHIP ==============
s = new("30  ·  SOCIAL")
head(s, "Own the audience or lose it", size=38)
sub(s, "SEO can change. Algorithms can change. Email doesn't.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "Pre-launch email capture — single field, single value prop.",
    "'The Wrap' — Sunday weekly newsletter. Rankings + fights + one editorial piece.",
    "Card-week alerts — subscribers fighting on a card get a notification.",
    "Sponsor-friendly opt-in for partner offers. Permission, never spam.",
], size=17)
add_text(s, Inches(0.5), Inches(6.4), Inches(12.3), Inches(0.5),
         "Goal:  5,000 emails by end of Year 1.  15,000 by end of Year 2.",
         size=18, color=GOLD, bold=True)


# ============== 32. CONTENT TEMPLATES ==============
s = new("31  ·  SOCIAL")
head(s, "Build these before launch", size=42)
sub(s, "Founder time on sales, not on graphic design. Outsource template polish.")
items_a = [
    "Ranking card (per fighter)",
    "Fighter spotlight template",
    "Card preview template",
    "Result + ranking-shift template",
    "Stable spotlight template",
]
items_b = [
    "Sponsor announcement template",
    "Launch video (60–90s)",
    "Press kit PDF",
    "Email newsletter template",
    "Pre-launch landing page",
]
add_bullets(s, Inches(0.6), Inches(2.9), Inches(6), Inches(4), items_a, size=15)
add_bullets(s, Inches(6.9), Inches(2.9), Inches(6), Inches(4), items_b, size=15)


# ============== 33. KPIs ==============
s = new("32  ·  METRICS")
head(s, "What to actually track", size=42)
sub(s, "Owned reach + revenue indicators. Skip the vanity numbers.")
add_bullets(s, Inches(0.5), Inches(3.0), Inches(12.3), Inches(4), [
    "Email subscribers — the only fully-owned audience number.",
    "Fighter / stable reshare rate — proxy for distribution working.",
    "Referral traffic from social → division pages.",
    "Site visit → email signup conversion rate.",
    "Sponsor outreach response rate — sales is the bottleneck.",
    "Promoter sanctioning fee uptake (events sanctioned / quarter).",
    "Number of active brokered sponsor deals.",
], size=16)


# ============== 34. 90-DAY ACTION ==============
s = new("33  ·  EXECUTION")
head(s, "The first 90 days", size=44)

phases = [
    ("DAYS 1 – 30  ·  FOUNDATION", GOLD, [
        "Finish website rebuild. Publish ethos guardrails page.",
        "Build all content templates + share-pack generator.",
        "Pre-launch landing page + email capture live.",
        "Press kit drafted. 30+ daily countdown spotlights queued.",
    ]),
    ("DAYS 31 – 60  ·  LAUNCH",    TEXT, [
        "Launch week executes. Sunday Wrap newsletter starts week 1.",
        "Sales push: 3 insurance conversations, 5 category-sponsor conversations, 5 promoter sanctioning conversations.",
        "Two podcast appearances. One AU combat-sports media feature.",
    ]),
    ("DAYS 61 – 90  ·  CONVERT",   RED, [
        "Close 1 anchor (insurance OR federation).",
        "Close 2 category sponsor packs.",
        "Sign 5 promoters to sanctioning fee structure.",
        "Officials registry MVP scoped. Women's / junior pitch deck drafted.",
    ]),
]
y = Inches(2.4)
for title, c, items in phases:
    add_rect(s, Inches(0.5), y, Inches(0.06), Inches(1.4), c)
    add_text(s, Inches(0.75), y, Inches(12), Inches(0.4), title,
             size=12, color=c, bold=True, letter_spacing=3)
    tb = add_bullets(s, Inches(0.75), y + Inches(0.45), Inches(12), Inches(1.6),
                     items, size=13, gap=4)
    y += Inches(1.6)


# ============== 35. 12 MONTH ==============
s = new("34  ·  EXECUTION")
head(s, "The 12-month roadmap", size=40)

quarters = [
    ("Q1", "LAUNCH",       "Website live. First anchor signed. 2 category packs closed. Sunday Wrap going weekly."),
    ("Q2", "CREDIBILITY",  "Officials registry MVP. Clean Fighter pilot. First international bridge case."),
    ("Q3", "EXPAND",       "Women's / junior lane launches with dedicated sponsor pool. Fundraiser platform live."),
    ("Q4", "COMPOUND",     "Hall of Fame ceremony (sponsored). Year-2 renewals locked in. First data-licensing conversation (state authority)."),
]
y0 = Inches(2.7)
row_h = Inches(0.95)
for i, (q, t, body) in enumerate(quarters):
    yy = y0 + row_h * i
    add_text(s, Inches(0.6), yy, Inches(1.2), row_h, q, font=HEAD_FONT,
             size=44, color=GOLD, anchor=MSO_ANCHOR.MIDDLE)
    add_text(s, Inches(2.0), yy, Inches(2.8), row_h, t, size=16,
             color=TEXT, bold=True, letter_spacing=3, anchor=MSO_ANCHOR.MIDDLE)
    add_text(s, Inches(5.0), yy, Inches(8), row_h, body, size=14,
             color=MUTED, anchor=MSO_ANCHOR.MIDDLE)


# ============== 36. RISKS ==============
s = new("35  ·  RISK")
head(s, "What can go wrong — and the hedge", size=34)
risks = [
    ("Founder-as-everything",                      "Outsource graphic design + admin first."),
    ("Cold sales is slow",                         "Anchor tenant focus, not breadth. One signed deal teaches you what works."),
    ("Fighter reshare rate may be low",            "Habit-forming auto-share. Make sharing the default."),
    ("Insurance market is thin in AU",             "Don't bet the business on a single insurer."),
    ("Regulatory complexity (fundraisers, doping)", "Legal review per state before launch."),
    ("SEO / algorithm dependence",                 "Email list is the hedge. Build it from day one."),
]
y0 = Inches(2.7)
row_h = Inches(0.55)
for i, (r, m) in enumerate(risks):
    yy = y0 + row_h * i
    add_text(s, Inches(0.6), yy, Inches(5.5), row_h, r, size=14, color=RED,
             bold=True, anchor=MSO_ANCHOR.MIDDLE)
    add_text(s, Inches(6.2), yy, Inches(6.6), row_h, m, size=14, color=TEXT,
             anchor=MSO_ANCHOR.MIDDLE)


# ============== 37. WHAT'S NEEDED ==============
s = new("36  ·  RESOURCES")
head(s, "Honestly, what it takes", size=42)
add_bullets(s, Inches(0.5), Inches(2.7), Inches(12.3), Inches(4.5), [
    "$5–10k upfront for templates, video, landing page, brand polish — or unpaid founder time equivalent.",
    "1 part-time content / community freelancer  ·  ~$1–2k/mo.",
    "Founder time:  60% sales  ·  25% community  ·  15% product oversight.",
    "Legal review:  $2–4k one-time for fundraiser + sanctioning + anti-doping compliance.",
    "Tools: email (Beehiiv / Substack / ConvertKit), POD (Printful), payments (Stripe), analytics (Plausible / GA).",
    "One signed anchor in 90 days = the threshold to know it's working.",
], size=16)


# ============== 38. THE VISION ==============
s = new("37  ·  VISION")
head(s, "Year 3 — what this becomes", size=38)
add_text(s, Inches(0.5), Inches(2.7), Inches(12), Inches(4.5),
         [
             "The canonical record of Australian Muay Thai.",
             "",
             "The verification layer for every promoter, fighter,",
             "gym, sponsor, and federation in the country.",
             "",
             "The default destination for anyone serious about the sport.",
             "",
             "A platform fighters trust enough to chase —",
             "and that pays them when they do.",
         ], size=22, color=TEXT, spacing=1.3)


# ============== 39. CLOSING ==============
s = prs.slides.add_slide(BLANK)
set_bg(s)
slides_meta.append(s)
add_rect(s, Inches(0.6), Inches(0.6), Inches(2), Emu(20000), GOLD)
add_rect(s, Inches(10.7), Inches(6.85), Inches(2), Emu(20000), GOLD)

add_text(s, Inches(0.6), Inches(2.4), Inches(12.3), Inches(1.2),
         "WE BUILD THE MACHINE.",
         font=HEAD_FONT, size=72, color=TEXT, letter_spacing=1)

add_text(s, Inches(0.6), Inches(4.0), Inches(12.3), Inches(0.8),
         "Not the loudest. Not the most aggressive.",
         size=22, color=MUTED, italic=False)
add_text(s, Inches(0.6), Inches(4.55), Inches(12.3), Inches(0.8),
         "The most trusted.",
         size=22, color=GOLD, bold=True)
add_text(s, Inches(0.6), Inches(5.6), Inches(12.3), Inches(0.8),
         "Then we sell access to that trust — without ever compromising it.",
         size=18, color=TEXT)

add_text(s, Inches(0.6), Inches(7.05), Inches(12.3), Inches(0.3),
         "FTRA  ·  FULL THAI RULES AUSTRALIA",
         size=10, color=MUTED, letter_spacing=4)


# ----- stamp slide numbers (skipping cover [0] and closer [-1]) -----
total = len(slides_meta)
for idx, sl in enumerate(slides_meta):
    if idx == 0 or idx == total - 1:
        continue
    slide_number(sl, idx, total - 2)


out = "/Users/alexcashmore/Documents/FTRA/FTRA_Strategy_Deck.pptx"
prs.save(out)
print(f"Saved: {out}")
print(f"Slides: {total}")
