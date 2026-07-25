#!/usr/bin/env bash
# Shared script called by git hooks (post-merge, post-commit).
# Detects whether the just-finished git operation touched any file under
# skills/ or agents/. If yes, runs the resource-index generators with --auto
# so newly-added skills/agents/bindings are marked 🟢 新加 and listed in
# the bottom 新增清单 automatically.
#
# This script is safe to call from any git hook — if nothing relevant changed,
# it exits 0 quickly without doing anything.

set -e

REPO="$(git rev-parse --show-toplevel 2>/dev/null || echo "$(cd "$(dirname "$0")/../.." && pwd)")"
cd "$REPO" || exit 0

# Detect what just changed:
#   post-commit: files in HEAD
#   post-merge: files changed in the merge (HEAD vs previous HEAD@{1})
CHANGED_FILES=""
if [ -n "$1" ]; then
  CHANGED_FILES="$1"
elif git rev-parse HEAD@{1} >/dev/null 2>&1; then
  CHANGED_FILES="$(git diff-tree --no-commit-id --name-only -r HEAD@{1}..HEAD 2>/dev/null || true)"
else
  CHANGED_FILES="$(git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null || true)"
fi

# Filter to skills/ and agents/ paths
RELEVANT="$(echo "$CHANGED_FILES" | grep -E '^(skills|agents)/' || true)"

if [ -z "$RELEVANT" ]; then
  exit 0
fi

# Run both generators with --auto (uses state file to know what's new)
node "$REPO/scripts/generate-skills-readme.js" --auto >/dev/null 2>&1 || true
node "$REPO/scripts/generate-agents-readme.js" --auto >/dev/null 2>&1 || true

echo "[post-git-resource-index] auto-regenerated SKILLS.md + AGENTS.md (touched: $(echo "$RELEVANT" | tr '\n' ' '))" >&2
exit 0