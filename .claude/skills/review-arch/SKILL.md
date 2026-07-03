---
name: review-arch
description: Phase 1 of the three-phase review — architecture. Spawns review-lead (opus) with the branch diff to judge the design against the plan/AC, dispatching the refine team as needed, iterating up to 3 rounds. Invoked explicitly by ship-ticket or the user; not model-invocable.
disable-model-invocation: true
---

# Architecture Review (Phase 1)

Base ref: `$ARGUMENTS` (defaults to `main` when empty).

## Current diff

Changed files:

!`git diff --stat $(git merge-base HEAD ${ARGUMENTS:-main})...HEAD | tail -30`

## Steps

1. `mkdir -p .review` if missing.
2. Write the ticket's acceptance criteria (or the session's plan) to `.review/context.md` so the reviewers see the contract, not just the code.
3. Spawn the `review-lead` agent with: phase `architecture`, the base ref, the changed-file list above, and the path `.review/context.md`.
4. review-lead runs its rounds (max 3) and writes `.review/arch.md` with a verdict: `SOLID` or `CHANGES_REQUIRED` with severity-ranked findings.
5. On `CHANGES_REQUIRED`: apply the architectural changes in this session, commit granularly, then re-invoke this skill. On the third contested round, stop and escalate to Jordan with the disagreement stated plainly.

Do not proceed to /review-minimal until `.review/arch.md` says `SOLID`.
