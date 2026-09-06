#!/usr/bin/env bash
# Sync GitHub labels from .github/labels.json.
# Usage: gh auth login && bash .github/labels.sh

set -euo pipefail

REPO="montesgp/digital-catalog"
LABELS_FILE=".github/labels.json"

command -v gh >/dev/null 2>&1 || { echo "error: gh CLI is required." >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "error: jq is required." >&2; exit 1; }
gh repo view "$REPO" >/dev/null 2>&1 || { echo "error: cannot access $REPO." >&2; exit 1; }

jq -c '.[]' "$LABELS_FILE" | while read -r label; do
  name=$(jq -r '.name' <<< "$label")
  color=$(jq -r '.color' <<< "$label")
  description=$(jq -r '.description' <<< "$label")
  gh label create "$name" --repo "$REPO" --color "$color" --description "$description" --force
done

echo "Labels synchronized."
