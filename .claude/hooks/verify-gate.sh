#!/bin/bash
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}"

DIRTY_SOURCE=$(git status --porcelain -- src worker scripts 2>/dev/null | head -1)
if [ -z "$DIRTY_SOURCE" ]; then
  exit 0
fi

VERIFY_OUTPUT=$(pnpm verify 2>&1)
VERIFY_EXIT=$?

if [ "$VERIFY_EXIT" -ne 0 ]; then
  echo "pnpm verify failed with uncommitted source changes. Fix before ending the turn:" >&2
  echo "$VERIFY_OUTPUT" | tail -20 >&2
  exit 2
fi

exit 0
