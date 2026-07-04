---
name: review-style
description: Phase 3 of the three-phase review — per-function style. Spawns review-lead (opus), which fans out one style-auditor (sonnet) per changed file; each auditor dispatches three style-voter (haiku) agents per function and draws the consensus; the lead makes the final determination in .review/REVIEW-FINDINGS.md. Requires .review/minimal.md to say SOLID. Invoked explicitly; not model-invocable.
disable-model-invocation: true
---

# Style Review (Phase 3)

Base ref: `$ARGUMENTS` (defaults to `main` when empty).

## Changed source files

!`git diff --name-only $(git merge-base HEAD ${ARGUMENTS:-main})...HEAD -- 'src/**' 'worker/**' 'scripts/**' | grep -v -E '(routeTree.gen|components/ui/)' || echo "no source files changed"`

## Precondition

!`cat .review/minimal.md 2>/dev/null | head -3 || echo "MISSING: run /review-minimal first"`

## Steps

1. Run `pnpm lint` first; anything ESLint catches is fixed before the LLM pass (never send a model to do a linter's job).
2. Spawn the `review-lead` agent with: phase `style` and the changed-file list above. It fans out one `style-auditor` per file; each auditor puts every function to three `style-voter` haiku agents with differently framed prompts and draws the consensus; the lead weighs vote counts against the rule files and the readability litmus test.
3. The lead writes `.review/REVIEW-FINDINGS.md`: `APPROVE` or `CHANGES_REQUIRED` with 🔴/🟡/🟢 findings, each carrying file:line, rule, and exact suggested change.
4. On `CHANGES_REQUIRED`: apply 🔴 and 🟡 findings in this session (🟢 nits at your judgment), commit, re-invoke. Max 3 rounds, then escalate with the open findings listed.

The PR is not opened until `.review/REVIEW-FINDINGS.md` says `APPROVE`.
