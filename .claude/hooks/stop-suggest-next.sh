#!/usr/bin/env bash
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

LATEST_TOPIC=$(ls -d topics/[0-9]*/ 2>/dev/null | sort | tail -n1 | tr -d '/' || true)
if [[ -z "${LATEST_TOPIC}" ]]; then
  echo ""
  echo "💡 No topics yet. Run /start-topic to begin."
  exit 0
fi

if [[ -f "${LATEST_TOPIC}/notes.md" ]] && [[ ! -f "${LATEST_TOPIC}/deck-outline.md" ]]; then
  NOTES_SIZE=$(wc -c < "${LATEST_TOPIC}/notes.md")
  if [[ "${NOTES_SIZE}" -gt 500 ]]; then
    echo ""
    echo "💡 ${LATEST_TOPIC}/notes.md looks filled in. Run /finish-topic when ready."
  fi
fi

TOPIC_NUM=$(basename "${LATEST_TOPIC}" | grep -oE '^[0-9]+')
if [[ -n "${TOPIC_NUM}" ]]; then
  OUT_DIR="output/t${TOPIC_NUM}"
  if [[ -f "${OUT_DIR}/linkedin.md" ]] && [[ ! -f "${OUT_DIR}/.critiqued" ]]; then
    echo ""
    echo "💡 ${OUT_DIR}/linkedin.md drafted but not critiqued. Run /critique."
  fi
fi
