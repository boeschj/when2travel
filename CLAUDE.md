# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**when2travel** is a trip coordination app that helps groups find the best dates for travel. Users create a plan with a date range, share it with friends, and everyone submits their availability. The app shows a heatmap of overlapping available dates.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4
- **Backend**: Cloudflare Workers with Hono framework
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **State**: Jotai (atomic state with localStorage persistence) + TanStack React Query
- **Forms**: TanStack React Form with Zod validation
- **Routing**: TanStack Router (file-based)
- **API**: Hono RPC client for end-to-end type safety

## Commands

```bash
pnpm verify           # format:check + lint + typecheck + test. Run before every commit.
pnpm dev              # Vite dev server on :5173 against LOCAL D1 (--port <n> --strictPort in worktrees)
pnpm db:migrate:local # Apply Drizzle migrations to local D1 (once per fresh clone/worktree)
pnpm seed:qa          # Seed QA scenarios via the real API (--base for non-default ports)
pnpm test             # Vitest
pnpm build            # TypeScript check + Vite build
pnpm typecheck        # TypeScript compiler check only
pnpm lint             # ESLint
pnpm format           # Prettier format
pnpm deploy           # Build and deploy via Wrangler (human only)
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run Drizzle migrations against PROD (human only)
pnpm db:studio        # Drizzle Studio for prod data inspection (read-only use)
pnpm cf-typegen       # Generate Cloudflare Worker types
```

## Boundaries

**Always**: run `pnpm verify` before committing; write code per AGENTS.md (the style law of this repo); spawned subagents read CLAUDE.md and AGENTS.md; run seeded browser QA before opening a UI-touching PR; commit granularly with subjects that state strictly WHAT changed.

**Ask Jordan first**: new dependencies, schema or migration changes, anything product-level (copy, UX behavior, scope). Engineering decisions are yours; pick the option with fewer moving parts.

**Never**: `wrangler d1 execute --remote` or any write to prod data; `pnpm deploy`/`wrangler deploy`; merge PRs; force-push; edit generated migrations; repeat a debugging remedy that already failed (find the root cause instead); start a dev server on a port that is already serving one.

## Dev Environment

Dev and tests are hermetic: local D1 under `.wrangler/state/`, migrated via `pnpm db:migrate:local`, seeded via `pnpm seed:qa`. Prod data is reachable only through `pnpm db:studio` (read) and `pnpm db:migrate` (human-run migrations). Secrets live in `.dev.vars`/`.env*`, which agents must not read.

## Architecture

### Authentication Model

No user accounts. Token-based access control stored in localStorage via Jotai atoms:

- `planEditTokensAtom` - Map of planId → editToken
- `responseEditTokensAtom` - Map of responseId → editToken

Edit/delete operations require the correct token passed to API endpoints.

### API Layer

Hono workers at `worker/` with routes:

- `/api/plans` - CRUD for travel plans
- `/api/responses` - CRUD for availability responses

Type safety flows from server → client via `hono/client` RPC. No manual API type definitions needed.

### Feature-Based Routing

Components are colocated with their routes using TanStack Router's file-based routing. Private route components use `-` prefix folders:

```
src/routes/
├── __root.tsx              # Root layout with Suspense/ErrorBoundary
├── index.tsx               # Home page
├── -index/                 # Home page components
├── create.tsx              # Create/edit plan form
├── -create/                # Create page components
├── trips.tsx               # User's trips list
├── -trips/                 # Trips page components
├── plan/
│   ├── $planId.tsx         # Plan layout (fetches plan data)
│   ├── $planId.index.tsx   # Results heatmap view
│   ├── $planId.respond.tsx # Submit availability form
│   └── -results/           # Results page components
└── response/
    └── $responseId.tsx     # View/edit response
```

Shared components live in `src/components/`:

- `ui/` - Radix-based primitives (shadcn-style)
- `layout/` - Layout wrappers (FormContainer, FormSection)
- `shared/` - Shared components (AppHeader, NotFound)

### Data Flow

1. Routes fetch data via React Query hooks (`useSuspenseQuery`)
2. Suspense boundaries in parent routes handle loading states
3. Forms use TanStack Form with `useAppForm` wrapper
4. Mutations invalidate queries and update localStorage tokens

### Key Files

- `src/lib/api.ts` - Hono client initialization
- `src/lib/atoms.ts` - Jotai atom definitions
- `src/lib/queries.ts` - React Query hooks
- `src/lib/mutations.ts` - Mutation hooks with token handling
- `src/components/ui/tanstack-form.tsx` - Form component integration
- `worker/db/schema.ts` - Drizzle table definitions

## Component File Splitting Rules

Classify components as:

- **Leaf** - Pure presentation, no hooks. Can stay in parent file.
- **Stateful** - Has useState/useEffect/handlers. Extract to own file.
- **Compositional** - Assembles other components. Usually the main export.

Extract when:

- Component is reused or could be reused elsewhere
- File has multiple Stateful components
- You can't identify the main render without scrolling
- Repeated prop drilling of 3+ props (needs hook or context)
- Inline functions longer than ~5 lines
- Conditional rendering blocks longer than ~15 lines

## PostHog Integration

- Never hallucinate API keys; use values from `.env`
- Store feature flag names in UPPERCASE_WITH_UNDERSCORE enums
- Minimize feature flag usage across files to reduce undefined behavior risk
- Consult existing naming conventions before creating new events/properties

## Code Style

All style rules live in [AGENTS.md](AGENTS.md): naming, function shape, types, component anatomy, comment policy, vocabulary bans, commit format. Path-scoped rules for the worker and React layers live in `.claude/rules/`. Read them before writing code; leave every touched file fully conformant.
