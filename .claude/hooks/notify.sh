#!/bin/bash
set -uo pipefail

if [ -z "${NTFY_TOPIC:-}" ]; then
  exit 0
fi

MESSAGE=$(python3 -c "
import json, sys
hook_input = json.load(sys.stdin)
kind = hook_input.get('notification_type', 'notification')
detail = hook_input.get('message', '')
print(f'when2travel agent: {kind} {detail}'.strip())
" 2>/dev/null)

curl -s -m 5 -d "${MESSAGE:-when2travel agent needs attention}" "https://ntfy.sh/$NTFY_TOPIC" > /dev/null || true

exit 0
