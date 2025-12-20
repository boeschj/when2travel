# CLAUDE.md

# Development Guidelines for Claude

# Core Philosophy

EVERY LINE OF CODE YOU WRITE OR CHANGE IS A LIABILITY. Every single line of production code you write or change must be minimalistic and efficient code. Before writing code, you should ALWAYS look for an opportunity to reuse existing code, or utilize a dependency from the codebase.

I ruthlessly enforce type safety, write declarative, idiomatic code, and follow modern functional programming best practices. This is not a suggestion or a preference. it is the fundamental practice that enables all other principles in this document. All work should be done in small, incremental changes that maintain a working state throughout development.

## Key Principles

- Write Minimal new code: Leverage existing infrastructure and dependencies whenever possible
- Type safety first: Use the strictest type checking available in your language
- Functional patterns: Use pure functions, immutability, composition
- Performance focused: Optimize for both compile/build time and runtime
- Runtime validation: Validate all external data with schemas
- Idiomatic code: Follow language conventions and natural patterns
- Security mindset: Identify security gaps in code and notify the user immediately if you see anything. You should have a security-first mindset when you write your own code

## Performance Philosophy

Optimize for the right things:

- Build/compile time: Fast feedback loops enable rapid development
- Runtime performance: But only when it matters (profile first)
- Developer experience: Code that's easy to understand and modify
- Memory efficiency: Avoid unnecessary allocations and copies

Performance principles:

- Have the user measure before optimizing: Suggest profiling opportunities when you suspect something could have performance implications to identify actual bottlenecks
- Optimize algorithms before micro-optimizations: O(n²) to O(n log n) beats micro-optimizations
- Leverage language idioms: Use the patterns the language/runtime optimizes for
- AVOID PREMATURE OPTIMIZATIONS: Write clear code first, optimize when evidence shows need

# Development Workflow

## Process

1. Explore and understand - Read relevant code, understand existing patterns, don't write yet
2. Plan the approach - Think through the solution and how it fits existing architecture
3. Implement minimally - Write the simplest code that satisfies the requirements
4. Assess refactoring - Be specific about what improvements would add value
5. Commit with clear message - Use conventional commits

Critical workflow principle: If you find yourself writing code without understanding the expected behavior or how it fits the existing system, STOP and clarify requirements first.

## Expectations

When working with my code:

1. Think deeply before making any edits
2. USE EXISTING LIBRARIES AND INFRASTRUCTURE. I cannot overstate this enough. If you find yourself writing a custom useEffect hook for React data fetching, you should stop immediately and search for a dependency that can do this. If one does not exist, you should be searching the web for a new dependency to suggest to the user.
3. Understand the full context of the code and requirements by reading the codebase
4. Think from first principles - don't make assumptions about requirements or implementation
5. Ask clarifying questions when requirements are ambiguous
6. Keep project docs current - update this CLAUDE.md with learnings and discoveries, update existing JSDOC comments, README files, etc. as needed.

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
