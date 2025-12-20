# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev              # Start development server (Vite + Cloudflare Workers)
pnpm build            # TypeScript check + Vite build
pnpm lint             # ESLint
pnpm deploy           # Build and deploy to Cloudflare Workers

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio GUI

pnpm cf-typegen       # Regenerate Cloudflare Worker types
```

## Architecture

**Full-stack TypeScript app deployed on Cloudflare Workers with D1 database.**

### Frontend (`/src`)
- **React 19** with **TanStack Router** (file-based routing in `/src/routes/`)
- **TanStack Query** for server state, **TanStack Form** for form handling
- **Shadcn/ui** components in `/src/components/ui/` (Radix primitives + TailwindCSS)
- Type-safe API client in `/src/lib/api.ts` using Hono client with full inference

### Backend (`/worker`)
- **Hono** framework with middleware for CORS, logging, and DB injection
- **Drizzle ORM** with SQLite (Cloudflare D1)
- Schema in `/worker/db/schema.ts`, routes in `/worker/routes/`
- Zod validation schemas in `/worker/lib/schemas.ts`

### Key Patterns
- **No user auth** - access controlled via unguessable UUIDs and edit tokens stored in localStorage
- **Atomic design** in `/src/components/plan/` (atoms → molecules → organisms)
- **End-to-end type safety** - API types inferred from Hono routes, no manual type definitions
- Route params use `$paramName` convention (e.g., `$planId.share.tsx`)

## Path Aliases

- `@/*` → `./src/*`
- `@/ui/*` → `./src/components/ui/*`

## Reference Documentation

Project specs and design references in `/claude-reference/`:
- `mvp-spec.md` - Product specification
- `BRAND-STYLE-GUIDE.md` - Design tokens, colors, typography
