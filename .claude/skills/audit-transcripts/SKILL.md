---
name: audit-transcripts
description: Drain the session-audit queue — spawn the transcript-auditor over queued session transcripts to extract learnings and propose system improvements. Run at the end of a ship-ticket cycle or on demand.
disable-model-invocation: true
---

# Audit session transcripts

## Queue

!`cat .claude/memory/audit-queue.jsonl 2>/dev/null | tail -10 || echo "queue empty"`

## Steps

1. If the queue is empty, stop.
2. Spawn one `transcript-auditor` agent per queued transcript (parallel batch, max 5 per run; leave the rest queued). Each gets its transcript path and the current `.claude/memory/learnings.md`.
3. Apply the auditors' learning appends to `.claude/memory/learnings.md` yourself: increment `hits` on existing keys instead of duplicating, append new blocks verbatim.
4. Collect promotion proposals (unified diffs against CLAUDE.md / AGENTS.md / rules / skills / hooks). Present them to Jordan for approval; never apply them unapproved.
5. Remove processed entries from `.claude/memory/audit-queue.jsonl` (keep unprocessed tail).
6. Commit the learnings file change: `chore: update agent learnings from session audit`.
