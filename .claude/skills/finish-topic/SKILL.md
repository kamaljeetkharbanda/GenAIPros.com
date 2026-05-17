---
name: finish-topic
description: Wrap a topic — read the notes, propose 3 angles, generate deck (18 slides) + LinkedIn post + long-form YouTube script. Use when the user says "finish topic", "wrap topic", "publish this", "topic is done".
---

# /finish-topic

The publishing step. Run when the user's notes are ready. Don't narrate
each step.

## Procedure

1. **Identify the topic.** Default to the most recent `topics/[0-9]+-*/`
   with `status: in_progress`.

2. **Check notes.** Read `notes.md`. If under 500 chars, stop and ask
   the user to write more.

3. **Read the brand guide and design system.** Load `brand/brand-guide.md`,
   `brand/linkedin-style.md`, and `brand/design-config.json` into context.

4. **Dispatch the `angle-finder` subagent.** Pass it the notes and topic
   metadata. It returns 3 distinct angles. Show them. Ask which to use.

5. **Update topic.yaml** with the chosen angle.

6. **Dispatch the `deck-architect` subagent.** Pass it the notes,
   topic.yaml, and chosen angle. It returns a complete `deck-outline.md`
   with 15-20 slides following the deep teaching deck shape:
   - Slide 1: title (dark)
   - Slide 2: definition (what is this thing)
   - Slide 3: taxonomy / where it fits
   - Slides 4-12: specifics (alternating card-grid, comparison-table,
     two-column, step layouts)
   - Slides 13-14: production challenges + named mitigations
   - Slide 15: ecosystem / who's building this (real product names)
   - Slide 16: decision framework
   - Slide 17: takeaways (dark)
   - Slide 18: closing + GenAIPros tie-in (dark)
   The headline_concept gets purple. Other categories get sky/teal/amber.

7. **Write `deck-outline.md`** to `topics/<NN>-<slug>/`.

8. **Build the deck:**
   ```bash
   NODE_PATH="$(npm root -g)" node scripts/build.js topics/<NN>-<slug>
   ```

9. **QA the deck.** Run `bash scripts/qa-render.sh`. Dispatch
   `deck-reviewer` on the rendered JPGs. Fix user-visible defects in
   deck-outline.md (overflow, overlap, leftover placeholder). Re-render.
   One fix cycle.

10. **Draft the LinkedIn post.** Read `brand/linkedin-style.md` carefully.
    Write `output/t<NN>/linkedin.md`:
    - Hook (1 line, contrarian if natural)
    - Reframe (1 short paragraph)
    - 3-4 things that stuck (numbered list)
    - GenAIPros decision (one specific paragraph)
    - Callback line
    - 6-10 hashtags
    - 1000-1500 chars

11. **Draft the long-form YouTube script.** Write `output/t<NN>/youtube.md`:
    - **Title** suggestion (compelling, search-friendly, includes the
      topic + a hook)
    - **Description** suggestion (2-paragraph blurb + timestamps placeholder)
    - **0:00-1:00 — Executive summary** (punchy, the "60-second take")
      Cold open, hook, the 3 things the viewer will walk away with.
      This is reusable as the Short / LinkedIn video clip / intro card.
    - **1:00-end — Deep dive**: Walk through deck content section by
      section. Each section heading marks a chapter. 60-90 sec per section.
      Mark visual cues `[B-roll: <description>]` or `[show slide N]`.
    - **Final 30 seconds — GenAIPros tie-in + CTA.**
    Total length: 5-7 minutes (~750-1050 words spoken).
    Conversational. Read aloud test.

12. **Dispatch `post-critic` and `script-coach`.** Apply top suggestions
    inline. One cycle each.

13. **Mark topic done.** Update `topic.yaml`: `status: done`.

14. **Hand off:**
    - `output/t<NN>/deck.pptx` (18 slides)
    - `output/t<NN>/linkedin.md` (X chars)
    - `output/t<NN>/youtube.md` (~X minutes)
    - Top critic suggestion if any
    - "Review, edit, publish manually."

## Rules

- Never name books, authors, courses.
- GenAIPros tie-in must be SPECIFIC — a real decision or moment.
- Don't loop on minor polish. One QA cycle, one critique cycle, ship.
- The headline_concept gets purple. No other element uses purple.
