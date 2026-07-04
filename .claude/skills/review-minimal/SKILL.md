---
name: review-minimal
description: Phase 2 of the three-phase review — implementation minimalism. Spawns review-lead (opus) to run the YAGNI/liability pass with the refine team, validated against real OSS implementations via the Grep MCP. Requires .review/arch.md to say SOLID. Invoked explicitly; not model-invocable.
disable-model-invocation: true
---

# Implementation Review (Phase 2)

Base ref: `$ARGUMENTS` (defaults to `main` when empty).

## Current diff

!`git diff --stat $(git merge-base HEAD ${ARGUMENTS:-main})...HEAD | tail -30`

## Precondition

!`cat .review/arch.md 2>/dev/null | head -3 || echo "MISSING: run /review-arch first"`

## Steps

1. Spawn the `review-lead` agent with: phase `implementation`, the base ref, and the changed-file list.
2. The lead hunts overengineering with the refine team: rewrote-a-library code, complex-where-simple-works, hacky workarounds vs idioms, dead code, speculative seams, monoliths. Every finding answers: for a single human maintainer, is this more liability than benefit?
3. The lead validates the approach against 3 real OSS implementations (Grep MCP `searchGitHub` with literal code tokens; `gh search code` fallback) and writes `.review/minimal.md`.
4. On `CHANGES_REQUIRED`: apply the fixes in this session (prefer deletion over addition), commit, re-invoke this skill so the same reviewers re-review the fix. Max 3 rounds, then escalate.

Do not proceed to /review-style until `.review/minimal.md` says `SOLID`.
