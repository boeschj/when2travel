#!/bin/bash
set -euo pipefail

TICKET_ID="${1:?usage: pickup-ticket.sh <linear-ticket-id-or-url>}"
LOG_DIR=".claude/memory"
RUN_LOG="$LOG_DIR/pickup-runs.jsonl"

mkdir -p "$LOG_DIR"

CHANNEL_ARGS=()
if [ -n "${CLAUDE_CHANNELS:-}" ]; then
  CHANNEL_ARGS=(--channels "$CLAUDE_CHANNELS")
fi

RESULT=$(claude -p "/ship-ticket $TICKET_ID" --output-format json "${CHANNEL_ARGS[@]}")

SESSION_ID=$(printf '%s' "$RESULT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('session_id',''))")
COST=$(printf '%s' "$RESULT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('total_cost_usd',''))")

printf '{"ticket":"%s","session_id":"%s","cost_usd":"%s","ts":"%s"}\n' \
  "$TICKET_ID" "$SESSION_ID" "$COST" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$RUN_LOG"

printf '%s' "$RESULT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('result',''))"
