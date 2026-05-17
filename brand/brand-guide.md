# Design System & Brand Guide

Loaded into every session by the SessionStart hook. These rules apply to
every artifact this project produces.

## Voice

- **Contrarian and confident**, not encyclopedic.
- Take a position. Where the conventional view is wrong, say so plainly.
- Where there's genuine nuance, name it. Avoid hedging words ("perhaps,"
  "may," "could potentially") unless the uncertainty is real.
- Active voice. Concrete claims over abstract ones.
- No exclamation points except in code.
- No em dashes. Sentence breaks instead.
- Treat the reader as a peer, not a student.

## Source masking — strict

**Never name books, authors, publishers, or paid courses.**

Acceptable: "From my notes" / "Working through X" / "Spent today on Y"
Forbidden: "In Chapter X of [Book]" / "According to [Author]" / "The
course covers"

Frameworks and libraries are fair game (LangChain, vLLM, FastAPI,
pgvector, GCP docs).

## The build-in-public through-line

Every LinkedIn post and closing slide ends with one line tying the topic
to a real decision on **GenAIPros.com**.

Examples:
- "On GenAIPros, this is why I picked MCP for tool integration."
- "Lives in DECISIONS.md as #18."

## Visual rules

### Color discipline

The palette has five accent colors. Use them as follows:

- **Sky** (`#0284C7`) — category 1 / baseline / "what you already know"
- **Teal** (`#0D9488`) — category 2 / supporting concept
- **Amber** (`#D97706`) — category 3 / alternative / warning
- **Purple** (`#7C3AED`) — RESERVED for the headline concept the deck is
  introducing. Use sparingly. If a deck is about MCP, only MCP gets
  purple. If about agents, agents get purple.
- **Slate** (navy/grey shades) — structural: text, borders, backgrounds

Each accent has a soft companion (~10% tint) used for card fills:
- skySoft (`#E0F2FE`)
- tealSoft (`#CCFBF1`)
- amberSoft (`#FEF3C7`)
- purpleSoft (`#F3E8FF`)

### Slide architecture

Every content slide has the same skeleton:

- **Title bar** at top-left (y=0.55 area): 32pt bold heading + 15pt
  italic subtitle in slate600. No decorative underlines. No centered
  titles. No all-caps in titles.
- **Content area** between y=1.85 and y=6.85.
- **Footer** at y=7.0-7.4: author signature on left (italic Georgia,
  slate700 on light / white on dark), page number "N / TOTAL" right.
- **Tagline strip** below the author name: "AI Advisor & Instructor @
  AIMLEngineers.com · Building GenAIPros" in slate400, 10pt.

Title slide and key-takeaways slide are exceptions: dark slate900
background, white text, 60pt title, 14pt all-caps eyebrow with 6pt
letter-spacing.

### Building blocks

- **Rounded-rectangle cards** with rectRadius: 0.08, slate50 fill, thin
  slate200 border, optional colored top strip (0.10" tall) for category
- **Icon discs** — colored circle with white icon. 0.5" small (inline),
  0.85" large (card header)
- **Comparison tables** — dark slate900 header with white text,
  alternating row fills (white / slate50), thin slate200 borders
- **Insight bands** — dark slate900 strip at slide bottom (y~6.4-6.85)
  with lightbulb icon and one-line italic takeaway
- **Chips and pills** — rounded rectangles with accent fill + white text
- **Decision trees / process diagrams** — rounded rectangles + arrowed
  lines, no imported libraries

### Forbidden

- Shadows, gradients, 3D effects, drop-shadows
- Decorative flourishes
- Centered body text (center titles only on dark slides)
- Cream / beige / warm-neutral backgrounds
- More than 3 font families (heading, body, mono — signature uses Georgia
  but only in the footer image area)
- Text overflowing its container

Visual weight comes from typography, color contrast, and whitespace.

## Content philosophy

The deck teaches. Every slide answers one specific question.

Open with **definition**. Follow with **taxonomy** (how does it relate to
what I already know?). Build through specifics. Close with **decision
framework** and **key takeaways**.

15-20 slides is the right size. Fewer feels thin. More loses the
through-line.

Each card on a multi-card slide has the same internal structure: heading,
short body paragraph, one-line takeaway or example. Parallel structure.

Always include a "production challenges" or "common pitfalls" slide.
Always include an "ecosystem map" slide for any topic with competing
vendors. Group offerings by what they do, not by who makes them. Use
real product names.

## Author footer (every slide)

- Name: **Kamaljeet S Kharbanda**
- Title: **AI Advisor & Instructor @ AIMLEngineers.com**
- Tagline: **Building GenAIPros**

Plain text in the footer, no PNG rasterization. Italic Georgia for the
name, regular Calibri for the title line.
