---
name: ship-ticket
description: Pick up a Linear ticket for this repo, implement it, run the three-phase review, open a PR, babysit it to merge, and update Linear. Use when starting work on a ticket, when given a Linear URL or ID, or when asked to "ship", "work", or "pick up" a ticket.
argument-hint: <linear-url-or-ticket-id>
allowed-tools: "*"
---

# Ship a ticket

End-to-end loop: Linear ticket in, merged PR + Done status out. One ticket per session, always. Parallel batch shipping has failed repeatedly (stalls, wrong-repo PRs, board drift); never orchestrate multiple tickets from one session.

## Tools to lean on proactively

- **context7**: always pull current docs before writing code against any library or framework surface, even "well-known" ones. React 19, Tailwind 4, Zod 4, TanStack Router/Query/Form, Hono 4, Drizzle 0.45 all have post-cutoff changes.
- **TypeScript LSP**: use diagnostics/references for every rename and interface change instead of grep-and-hope.
- **Grep MCP** (`searchGitHub`): find real OSS implementations when choosing an approach. Literal code tokens, never concepts.
- **Skills**: `/review-arch`, `/review-minimal`, `/review-style` are the review pipeline; `pnpm seed:qa` + the browse tooling are how you see the product.

## 0. Pull the ticket

The human gives a Linear URL or ticket ID ($ARGUMENTS). Fetch it via the Linear MCP get_issue tool with relations included, so you get `blockedBy` and the `gitBranchName` Linear pre-assigned. If no ticket was provided, ask which one.

## 1. Pickup checks (stop early, loudly)

- **blockedBy must be Done.** An open blocker means stop and tell the human which ticket blocks.
- **AC must be implementable.** No acceptance criteria, or AC that require product decisions, means comment on the ticket asking for refinement and stop.
- **Size check.** Autonomous pickup is for small, well-scoped tickets. If the ticket smells like multi-day architecture work, tell the human it needs an interactive session.
- Post a short machine-authored comment on the ticket: what you are starting, from which session.

## 2. Read the ticket fully

- **Acceptance criteria are the contract.** No scope beyond them. "Functional not perfect": ship the AC, capture improvements as new tickets.
- **Adjacent drift** (stale deps, dead imports) gets flagged in the PR body, never silently fixed.
- **`gitBranchName`**: use Linear's pre-assigned branch name verbatim so the Linear/GitHub integration links the PR.

## 3. Plan when non-trivial

Anything beyond a config flip: enter plan mode, explore, write the plan, get approval via ExitPlanMode. Product-level questions go to the human; engineering decisions are yours, tie-broken by fewer moving parts.

## 4. Worktree, never a branch on the main checkout

`EnterWorktree` with Linear's `gitBranchName` verbatim. All work happens inside the worktree. If you need the dev server, run `pnpm db:migrate:local`, then `pnpm dev --port <derived> --strictPort` and seed with `pnpm seed:qa --base http://localhost:<derived>`. Never start a server on a port that is already serving one.

## 5. Implement strictly to the AC

Follow CLAUDE.md and the rule files in .claude/rules/. Direct edits, no abstraction-for-future-use, library over hand-rolled.

## 6. Verify before committing

```bash
pnpm verify
```

Plus any AC-specific check. If an AC check cannot run in this environment, say so explicitly in the PR test plan. Never claim a check you did not run.

## 7. Granular commits with session ID

Every commit body carries the session ID (`echo $CLAUDE_CODE_SESSION_ID`). Subjects and bullets are a changelog of WHAT changed, never why; the why lives in the ticket and PR body.

```bash
git add <explicit-file-list>   # NEVER git add -A
git commit -m "$(cat <<'EOF'
<type>: <TICKET-ID> <imperative summary>

- <what changed>
- <what changed>

Claude Code session: <session-id>

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

One commit per logical unit. A human reading `git log` should reconstruct the diff from the bullets.

## 8. Push and open a DRAFT PR immediately

Linear does NOT move the ticket to In Progress on branch push; opening a PR does. So push and open a draft PR as soon as the first meaningful commit exists:

```bash
git remote -v   # exactly one remote: origin -> boeschj/when2travel. Anything else: remove it or pass --repo.
git push -u origin <branch>
gh pr create --draft --title "<TICKET-ID>: <imperative summary>" --body "..."
```

## 9. Three-phase review

Run in order, each until its verdict is clean:

1. `/review-arch` — architecture against the plan/AC (review-lead + refine team, max 3 rounds)
2. `/review-minimal` — minimalism/YAGNI pass with OSS validation
3. `/review-style` — lint first, then per-file auditors with three haiku voters per function

Apply findings in this session with new commits (same session-ID format). The PR does not leave draft until `.review/REVIEW-FINDINGS.md` says `APPROVE`.

## 10. Ready the PR

Mark ready for review with the full body:

```
## Summary
- <dense bullets per concern>

Linear: [<TICKET-ID>](<ticket-url>)
Fixes <TICKET-ID>

## Test plan
- [x] pnpm verify — green
- [x] <automated AC checks run>
- [ ] <manual step for the human, if any>

## Deviations from the ticket text
- <or "none">

## Out of scope (flagged for follow-up)
- <adjacent drift noticed, with suggested ticket>
```

`Fixes <TICKET-ID>` makes Linear flip to Done on merge. Set Linear status to In Review. If UI changed, attach before/after screenshots from seeded QA as a PR comment.

## 11. Babysit to merge

Hand off to `/autofix-pr` if available (cloud babysitter for CI failures and review comments), and run `scripts/babysit-pr.sh <pr-number>` as the local fallback loop. Address human review comments with the remediation protocol: fix the instance, sweep the whole PR for the same violation with a haiku agent per file, reply per-thread with the fixing commit SHA, one "Addressed the review" summary, and a "judgment calls (happy to flip any)" section. Merging is the human's; never merge.

## 12. After merge

Confirm via `gh pr view --json state`. Linear flips to Done via the `Fixes` reference; verify, and set it manually if the automation missed. Then run `/audit-transcripts` to drain the learnings queue.

## Things that have bitten previous sessions

- **Stale remotes route PRs to the wrong repo.** Check `git remote -v` before `gh pr create`.
- **`git add -A` sweeps local agent state into commits.** Explicit paths only.
- **Forgetting the session ID** breaks the code-to-reasoning trace. If a commit slipped without it, include both IDs in the next commit body.
- **Marking Done before merge.** Done means on main. In Review while the PR is open.
- **A second dev server on a busy port** corrupts the human's running session. `--strictPort` and check first.
- **Repeating a failed remedy.** If a fix did not work, the diagnosis is wrong; investigate the root cause instead of re-running the ritual.
