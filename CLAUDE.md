# GenAIPros.com — Topic-Driven Teaching Engine

A topic-driven content engine. I study a topic, drop raw notes into the
folder, run `/finish-topic`, and get three artifacts: a deep teaching
deck, a LinkedIn post draft, and a long-form YouTube script.

**No fixed plan. No fixed cadence.** Publish when you have something worth
saying.

## Who I am

**Kamaljeet S Kharbanda** — AI Advisor & Instructor @ AIMLEngineers.com.
I'm building `GenAIPros.com` (end-to-end content aggregation + RAG
platform on GCP) in public, one topic at a time.

Audience: technical practitioners and enterprise decision-makers. Tone is
**contrarian and confident**, not encyclopedic. Take a position. Where the
conventional view is wrong, say so plainly and explain why. Where there's
genuine nuance, name it.

## Source masking — strict

I'm reading books and courses as private inputs. **Never name books,
authors, publishers, or courses in any output.**

Acceptable: "Working through X this week" / "From my notes" / "Spent
today on Y"
Forbidden: "In Chapter 3 of <Book>" / "According to <Author>" / "The
book says" / "The course covers"

Frameworks and libraries are fair game.

## The GenAIPros tie-in (always-on)

Every post and closing slide ends with one specific line connecting the
topic to a real decision or moment on **GenAIPros.com**. Without it the
post reads as generic teaching.

## Hard rules

1. All visual decisions come from `brand/design-config.json`. Never
   hard-code colors or fonts.
2. Deliverables for `/finish-topic` are three files in `output/t<NN>/`:
   - `deck.pptx`
   - `linkedin.md`
   - `youtube.md`
3. Visual QA on every deck. One fix cycle, then stop.
4. Never modify `brand/` without explicit ask.
5. Never name source books, authors, publishers, or courses.
6. Every post ends with a GenAIPros tie-in.
7. Every slide has the author footer: name + title + tagline.
8. **One topic = one session = one set of artifacts.**

## Workflow

```
1. /start-topic                  -> ask: topic name, source notes (file path or paste)
                                    creates topics/<NN>-<slug>/ with notes.md
2. (optional) edit notes.md      -> if you want to refine before generating
3. /finish-topic                 -> generates deck + LinkedIn + YouTube
4. /critique                     -> voice check on the post
5. Review, edit, publish manually
```

## Slash commands

| Command | What it does |
|---|---|
| `/start-topic` | Scaffolds a topic folder. Accepts existing notes.md content. |
| `/finish-topic` | Generates deck + LinkedIn post + long-form YouTube script |
| `/build-deck` | Just rebuild the deck |
| `/build-post` | Just regenerate the LinkedIn post |
| `/build-video-script` | Just regenerate the YouTube script |
| `/critique` | Run post-critic on the current draft |

## Subagents

| Agent | Role |
|---|---|
| `angle-finder` | Proposes 3 angles for the LinkedIn post |
| `deck-architect` | Designs the 15-20 slide structure from notes |
| `deck-reviewer` | Visually inspects rendered slides |
| `post-critic` | Reviews LinkedIn drafts against the voice anchor |
| `script-coach` | Reviews YouTube scripts for spoken flow |

## Build pipeline

```bash
NODE_PATH="$(npm root -g)" node scripts/build.js topics/<NN>-<slug>
bash scripts/qa-render.sh
```

## Deck shape — deep teaching

18 slides typical. Following the design philosophy:

1. **Title slide** (dark) — eyebrow, oversized title, subtitle
2. **Definition slide** — what is this thing? (icon-disc + one-paragraph
   answer)
3. **Taxonomy / where it fits** — comparison to what audience already
   knows
4-12. **Specifics** — concepts, mechanics, examples, alternating
   layouts (cards, comparison tables, decision trees)
13-14. **Production challenges + named mitigations**
15. **Ecosystem / who's building this** (real product names)
16. **Decision framework**
17. **Key takeaways** (dark, oversized)
18. **Closing + GenAIPros tie-in**

Vary layouts. Don't make 5 step slides in a row.

## Video shape — long-form

**Target length:** 5-7 minutes.

Structure:
- **0-60s:** punchy executive summary. Hook + the 3 things the viewer
  will walk away with. This is what's reused as the YouTube Short / video
  intro / LinkedIn video clip.
- **60s-end:** deep dive. Walk through the deck content conversationally.
  Each section is 60-90 seconds. Include code or diagrams as B-roll cues.
- **Final 30s:** GenAIPros tie-in + CTA.

## pptxgenjs gotchas

- Inches, absolute positioning.
- PptxGenJS mutates option objects — return fresh objects from helpers.
- Default font: Calibri body, Calibri Bold headings, Courier New for code.
