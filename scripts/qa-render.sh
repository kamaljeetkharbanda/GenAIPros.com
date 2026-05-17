#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PPTX="${1:-}"
if [[ -z "${PPTX}" ]]; then
  PPTX=$(ls -t output/t*/deck.pptx 2>/dev/null | head -n 1 || true)
fi
if [[ -z "${PPTX}" || ! -f "${PPTX}" ]]; then
  echo "qa-render: no .pptx found in output/t*/. Run /finish-topic first." >&2
  exit 1
fi

TOPIC_DIR=$(dirname "${PPTX}")
QA_DIR="${TOPIC_DIR}/qa"
mkdir -p "${QA_DIR}"
rm -f "${QA_DIR}/slide-"*.jpg "${QA_DIR}"/*.pdf

if command -v soffice >/dev/null 2>&1; then
  soffice --headless --convert-to pdf --outdir "${QA_DIR}" "${PPTX}" >/dev/null
else
  echo "qa-render: soffice not found. Install: brew install --cask libreoffice" >&2
  exit 1
fi

PDF=$(ls "${QA_DIR}"/*.pdf | head -n1)

if command -v pdftoppm >/dev/null 2>&1; then
  pdftoppm -jpeg -r 100 "${PDF}" "${QA_DIR}/slide"
else
  echo "qa-render: pdftoppm not found. Install: brew install poppler" >&2
  exit 1
fi

COUNT=$(ls -1 "${QA_DIR}"/slide-*.jpg 2>/dev/null | wc -l | tr -d ' ')
echo "rendered: ${COUNT} slide image(s)"
ls -1 "$PWD"/"${QA_DIR}"/slide-*.jpg
