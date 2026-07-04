# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactDom from "eslint-plugin-react-dom";
import reactX from "eslint-plugin-react-x";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

## Agentic loop

This repo carries an autonomous ticket-to-merge agent system in `.claude/`: a ticket comes in from Linear, gets built in a worktree, passes a three-phase review (architecture, minimalism, per-function style), and lands as a PR that babysits itself to your approval.

```bash
./scripts/agent                        # interactive session with iMessage escalation
./scripts/pickup-ticket.sh <TICKET-ID> # headless: ticket -> reviewed draft PR
./scripts/babysit-pr.sh <pr-number>    # local CI/review-comment babysitter
```

Inside any session, `/ship-ticket <TICKET-ID>` runs the same pipeline interactively. Review findings land in `.review/`; learnings drain via `/audit-transcripts`. Merging is always human.

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
