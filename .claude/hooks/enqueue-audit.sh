#!/bin/bash
set -uo pipefail

QUEUE_FILE="${CLAUDE_PROJECT_DIR:-.}/.claude/memory/audit-queue.jsonl"
mkdir -p "$(dirname "$QUEUE_FILE")"

python3 -c "
import json, sys
from datetime import datetime, timezone

hook_input = json.load(sys.stdin)
entry = {
    'transcript_path': hook_input.get('transcript_path', ''),
    'cwd': hook_input.get('cwd', ''),
    'ts': datetime.now(timezone.utc).isoformat(),
}
with open('$QUEUE_FILE', 'a') as queue:
    queue.write(json.dumps(entry) + '\n')
" 2>/dev/null

exit 0
