---
name: start-topic
description: Scaffold a new topic folder with sequential numbering. Accepts pre-existing markdown notes (point to a file, paste content inline, or write from scratch). Use when the user says "start a new topic", "new topic", "I have notes on X", "let's work on Y".
---

# /start-topic

## Procedure

1. **Ask the user 3 things (one message):**
   - What's the topic? (free text)
   - The headline concept that gets purple (e.g., "MCP", "A2A", "RAG").
     This is the one the deck makes the case for.
   - Notes source: paste inline / file path / write from scratch?

2. **Determine the next topic number.** Count folders in `topics/`
   matching `[0-9]+-*` (excluding TEMPLATE). Next = count + 1, zero-pad
   to 2 digits.

3. **Generate slug** from topic name. Lowercase, hyphenated, max 40 chars.

4. **Create the folder.** `cp -r topics/TEMPLATE topics/<NN>-<slug>`.

5. **Populate notes.md based on source:**
   - **Paste inline:** write the pasted markdown verbatim to `notes.md`.
   - **File path:** `cp <path> topics/<NN>-<slug>/notes.md`.
   - **From scratch:** leave the template placeholder, tell user to fill in.

6. **Update topic.yaml:**
   - `topic_number: <N>` (no leading zero)
   - `topic_slug: <slug>`
   - `date_started: <YYYY-MM-DD>`
   - `topic_name: <full name>`
   - `headline_concept: <e.g., MCP>`
   - `slide_count: 18` (default — adjust if user asked otherwise)
   - `status: in_progress`

7. **Hand off:** "Folder scaffolded at `topics/<NN>-<slug>/`. Notes loaded.
   When ready, run /finish-topic to generate deck + LinkedIn + YouTube."

## Rules

- Never name books, authors, or courses.
- Don't propose angles yet. The angle is decided after the notes are in.
- If a slug already exists, append `-2`, `-3` etc.
