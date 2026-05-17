---
name: critique
description: Run the post-critic on the latest LinkedIn draft.
---

# /critique

1. Read the latest `output/t<NN>/linkedin.md`.
2. Dispatch `post-critic`. Show verdict + top 3 suggestions.
3. Touch `output/t<NN>/.critiqued`.
