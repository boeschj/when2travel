---
name: jordan-wants-autonomous-product-calls-flagged-not-hidden
description: Jordan's reaction when an unattended session auto-picked a product/UX decision (landing page green) confirms flagging beats asking or hiding
metadata:
  type: feedback
---

When an overnight, unattended session hit a genuine product-level UX fork (which green to use on a redesigned landing page) with nobody there to answer, it auto-resolved the AskUserQuestion timeout to the recommended option, then called it out as an open item in the morning summary ("still your call") rather than silently shipping it as final. Jordan's actual reaction the next morning was curious, not annoyed: "I wasn't expecting to see this green color, is there a reason you chose to go that way (e.g. legibility, UX) or was this an oversight?"

**Why:** this suggests the right pattern for unattended product-level forks is not to block the whole run waiting for an answer (CLAUDE.md's "ask Jordan first" for product-level things assumes someone is there to ask), but to make a reasoned, defensible call, be honest about the tradeoff when asked, and surface it explicitly as still-open in the handoff summary instead of treating the autonomous pick as final.

**How to apply:** when auditing sessions that ran unattended, do not flag an autonomous product/UX decision as a violation of "ask Jordan first" if it was (a) reasoned, (b) explicitly surfaced as open/reversible in the final summary, and (c) not silently buried. Do flag it if the summary presents an autonomous product call as settled/final with no callout.

See [[overnight-ship-ticket-first-run]].
