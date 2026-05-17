---
name: build-deck
description: Rebuild just the deck for a topic. Use when the user edited topic.yaml or deck-outline.md and wants to re-render.
---

# /build-deck

1. Default to the most recent `topics/[0-9]+-*/` folder, or use the user's argument.
2. Run `NODE_PATH="$(npm root -g)" node scripts/build.js topics/<NN>-<slug>`
3. Run `bash scripts/qa-render.sh`
4. Dispatch `deck-reviewer` on the JPGs. Fix issues. One cycle. Stop.
