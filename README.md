# PlanTheTrip

Group trip coordination without the group-chat chaos: create a plan with a date range, share one link, everyone marks their availability, and a heatmap plus a recommendation engine surface the dates that actually work. No accounts; edit access rides share links.

Live at [justplanthetrip.com](https://justplanthetrip.com).

## Stack

React 19 + TypeScript + Vite 7, TanStack Router/Query/Form, Tailwind 4, Jotai, Zod. API is Hono on Cloudflare Workers with D1 (SQLite) via Drizzle, typed end to end through Hono RPC. Vitest for unit and worker integration tests. pnpm.

## Development

```bash
pnpm install
pnpm db:migrate:local   # once per clone: apply migrations to local D1
pnpm dev                # http://localhost:5173 against local D1
pnpm seed:qa            # named availability scenarios via the real API
pnpm verify             # format + lint + typecheck + tests; run before every commit
```

Prod data is never touched by dev or tests. Deploys: `pnpm deploy` (human only).

## Agentic loop

This repo carries an autonomous ticket-to-merge agent system in `.claude/`: a ticket comes in from Linear, gets built in a worktree, passes a three-phase review (architecture, minimalism, per-function style), and lands as a PR that babysits itself to your approval.

The entry points are skills, invoked in any session:

- `/feature-dev <idea>` - no ticket yet: refine with the agent team, write the Linear ticket, then run the full pipeline
- `/ship-ticket <TICKET-ID>` - existing ticket: worktree, build to AC, three-phase review, draft PR, babysit to merge

Review findings land in `.review/`; learnings drain via `/audit-transcripts`. Merging is always human. Optional wrappers for unattended use: `./scripts/agent` (session with iMessage escalation), `./scripts/pickup-ticket.sh <TICKET-ID>` (headless run with cost logging), `./scripts/babysit-pr.sh <pr>` (CI/comment poller).

### Per-machine setup (once)

1. `pnpm install`, then launch `claude` in the repo once and accept the workspace trust dialog (activates the committed permissions, hooks, and MCP servers).
2. `npm i -g typescript-language-server typescript`
3. Env vars in your shell profile:
   - `LINEAR_API_KEY`: scoped Linear personal API key (issue read/write + comments)
   - `PLANTHETRIP_AGENT_TOKEN`: fine-grained GitHub PAT restricted to this repo (Contents/PRs/Issues read-write, Actions read). Convention: one per repo, named `<REPO>_AGENT_TOKEN`
   - `CONTEXT7_API_KEY`, `FIRECRAWL_API_KEY`
   - `NTFY_TOPIC` (optional): unguessable ntfy.sh topic for phone pushes
4. `pnpm db:migrate:local && pnpm seed:qa` to verify the local stack.

Never run `claude --bare` here (silently disables the in-repo system). Never set `CLAUDE_CODE_SUBAGENT_MODEL` in shells that run it (overrides agent model pins).

### iMessage escalation and overnight runs

One-time: `/plugin install imessage@claude-plugins-official`, grant your terminal Full Disk Access (System Settings, then relaunch the terminal), and OK the Automation prompt on Claude's first reply. Channels only exist in sessions started with the flag; `./scripts/agent` and `CLAUDE_CHANNELS` handle that. Text yourself from any Apple ID device; add no other senders (allowlisted senders can approve permission prompts).

```bash
caffeinate -ims &
tmux new -s agent
export CLAUDE_CHANNELS="plugin:imessage@claude-plugins-official"
./scripts/pickup-ticket.sh <TICKET-ID>
```

Running several sessions at once: each ticket gets its own worktree (the pipeline does this itself); enable the channel flag on only one session so phone messages have a single destination.
