#!/usr/bin/env bash
set -euo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

echo "## GenAIPros.com — Topic-Driven Teaching Engine"
echo ""
echo "**Author:** Kamaljeet S Kharbanda  ·  AI Advisor & Instructor @ AIMLEngineers.com"
echo "**Tagline:** Building GenAIPros"
echo "**Voice anchor:** brand/linkedin-style.md (contrarian, confident, not encyclopedic)"
echo "**Source masking:** Never name books, authors, courses. Frameworks/libs are fine."
echo "**Build-in-public tie:** Every post ends with a GenAIPros.com connection."
echo ""
echo "**Workflow:** /start-topic -> edit notes.md -> /finish-topic -> /critique -> publish."
echo "**Deck depth:** ~18 slides, deep teaching style. Long-form video: 5-7 min."
echo "**Design system:** slate base + sky/teal/amber category colors. Purple is RESERVED for the headline concept."
echo ""

TOPIC_COUNT=$(find topics -maxdepth 1 -type d -name '[0-9]*' 2>/dev/null | wc -l | tr -d ' ')
PUBLISHED_COUNT=$(find output -maxdepth 1 -type d -name 't*' 2>/dev/null | wc -l | tr -d ' ')
echo "**Progress:** ${TOPIC_COUNT} topics started, ${PUBLISHED_COUNT} published."

LATEST_TOPIC=$(ls -d topics/[0-9]*/ 2>/dev/null | sort | tail -n1 | tr -d '/' || true)
if [[ -n "${LATEST_TOPIC}" ]] && [[ -f "${LATEST_TOPIC}/topic.yaml" ]]; then
  STATUS=$(grep -E "^status:" "${LATEST_TOPIC}/topic.yaml" | sed 's/^status: *//' | tr -d ' "')
  if [[ "${STATUS}" == "in_progress" ]]; then
    NAME=$(grep -E "^topic_name:" "${LATEST_TOPIC}/topic.yaml" | sed 's/^topic_name: *//' | tr -d '"')
    echo "**In progress:** ${LATEST_TOPIC} — ${NAME}"
  fi
fi
