---
name: build-video-script
description: Regenerate the long-form YouTube video script for a topic.
---

# /build-video-script

1. Default to the most recent `topics/[0-9]+-*/`.
2. Read `topic.yaml`, `notes.md`, and the deck-outline.md.
3. Write `output/t<NN>/youtube.md` with:
   - Title suggestion + description suggestion
   - **0:00-1:00** punchy executive summary (the "60-second take")
   - **1:00-end** deep dive, section by section (60-90s per chapter)
     mapped to the deck slides
   - **Final 30 seconds** GenAIPros tie-in + CTA
4. Mark visual cues: `[B-roll: ...]`, `[show slide N]`, `[zoom: ...]`.
5. Dispatch `script-coach`. Apply suggestions.

**Length:** 5-7 minutes (~750-1050 words spoken).
**Voice:** conversational, not slide-reading. Read aloud test for every line.
**Hook test:** the first 60 seconds must work as a standalone clip.
