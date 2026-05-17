#!/usr/bin/env bash
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

CMD="${CLAUDE_TOOL_INPUT:-}"
TOPIC_DIR=$(echo "${CMD}" | grep -oE 'topics/[0-9]+-[a-z0-9-]+' | head -n1)
[[ -z "${TOPIC_DIR}" ]] && exit 0

ERRORS=()
[[ ! -d "${TOPIC_DIR}" ]] && ERRORS+=("${TOPIC_DIR} doesn't exist. Run /start-topic first.")
[[ ! -f "${TOPIC_DIR}/topic.yaml" ]] && ERRORS+=("${TOPIC_DIR}/topic.yaml is missing.")
[[ ! -f "${TOPIC_DIR}/deck-outline.md" ]] && ERRORS+=("${TOPIC_DIR}/deck-outline.md is missing. /finish-topic generates this.")

if [[ ${#ERRORS[@]} -gt 0 ]]; then
  echo "Build blocked:" >&2
  for err in "${ERRORS[@]}"; do echo "  - ${err}" >&2; done
  exit 2
fi
exit 0
