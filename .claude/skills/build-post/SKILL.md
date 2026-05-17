---
name: build-post
description: Regenerate just the LinkedIn post for a topic.
---

# /build-post

1. Default to the most recent `topics/[0-9]+-*/`.
2. Read `topic.yaml`, `notes.md`, `brand/linkedin-style.md`.
3. Write `output/t<NN>/linkedin.md` following the topic-post shape.
4. Dispatch `post-critic`. Apply real improvements. Skip nitpicks.
5. Show the user the post and critic's verdict.
