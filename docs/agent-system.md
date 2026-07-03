# Agent system bootstrap

This repo carries an autonomous ticket-to-merge agent system in `.claude/`. A fresh clone needs one interactive step and two environment variables.

## Per machine (once)

1. `git clone` and `pnpm install`.
2. Launch `claude` interactively once in the repo and accept the workspace trust dialog. This activates the committed permissions, hooks, and `.mcp.json` servers. There is no zero-dialog path; this is the documented floor.
3. `npm i -g typescript-language-server typescript` (the LSP plugin needs the binary on PATH).
4. Environment variables (shell profile):
   - `LINEAR_API_KEY`: a scoped Linear personal API key (issue read/write + comment create).
   - `NTFY_TOPIC` (optional): an unguessable ntfy.sh topic for phone pushes when the agent is blocked.
5. `pnpm db:migrate:local` then `pnpm seed:qa` to verify the local stack end to end.

Never run `claude --bare` in this repo: it silently disables the entire in-repo system. Never set `CLAUDE_CODE_SUBAGENT_MODEL` in CI or shells that run this system: it silently overrides every agent's pinned model.

## Running the loop

```bash
./scripts/pickup-ticket.sh <TICKET-ID>   # headless: ticket -> draft PR -> reviewed PR
./scripts/babysit-pr.sh <pr-number>      # local babysitter: CI, conflicts, review comments
```

Interactive equivalent: `/ship-ticket <TICKET-ID>`. The review pipeline is `/review-arch` then `/review-minimal` then `/review-style`; findings land in `.review/`. Learnings drain via `/audit-transcripts`.

Merging is always human. The agent stops at an approved, green PR and notifies.

## Owner setup (Jordan, once)

- `~/.claude/settings.json`: relax the `gh pr create` ask rule so headless runs do not stall. Keep the `gh pr merge` deny.
- Apply the proposed project permission/hook settings (staged during system build) to `.claude/settings.json`.
- Install the Claude GitHub App on this repo (enables cloud auto-fix and CI on agent-pushed commits).
- Branch protection on `main`: require the CI check and one approval, block direct and force pushes.
- Optional: Telegram channel plugin for two-way phone unblocking; CodeRabbit free tier for independent PR review.
