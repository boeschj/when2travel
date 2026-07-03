# AGENTS.md

How code is written in this repo. Agents must match this exactly. The bar: a reviewer cannot tell agent code from Jordan's code.

## Commands

```bash
pnpm verify           # format:check + lint + typecheck + test. Run before every commit.
pnpm dev              # Vite dev server on :5173 against LOCAL D1. Use --port <n> --strictPort in worktrees.
pnpm db:migrate:local # Apply drizzle migrations to local D1. Run once per fresh clone/worktree.
pnpm seed:qa          # Seed named QA scenarios via the real API. --base http://localhost:<port> for other ports.
pnpm build            # tsc -b + vite build
pnpm db:studio        # Inspect prod data (read it, never write it)
```

## Stack

React 19 + TypeScript 5.8 + Vite 7, TanStack Router (file-based) / Query / Form, Tailwind 4, Jotai, Zod 4. API: Hono on Cloudflare Workers, D1 (SQLite) via Drizzle, end-to-end types via Hono RPC. Vitest. pnpm always, never npm.

## Naming

- Full words, never abbreviations: `appleHealthkitSourceMethodEnum`, not `hkSourceMethodEnum`. Verbosity pays for itself tenfold.
- Functions are `verbNoun`: `get`/`fetch` retrieve, `calculate`/`compute` derive, `build` constructs config, `format` makes display strings, `validate`/`check`/`is`/`has` return booleans, `parse`/`convert` change shape.
- Booleans read as assertions: `isCreator`, `hasEmptyNames`, `allGuestsNotAttending`.
- Handlers: `handleX` inside components, `onX` as props. Mutation callbacks are `onSuccess`/`onError`.
- Files kebab-case. Hooks in `use-*.ts` returning a flat object of named members: `{ savePlanEditToken, isCreator, removePlanEditToken }`.
- Never use the words "canonical", "gate", or "chrome" anywhere: code, comments, commits, docs. Substitutes: official/reference, guard/check, app shell.
- No em dashes anywhere: code strings, docs, commits, PR text.

## Functions

- Object argument for 3+ parameters, inline-typed.
- Every expression gets a name, one function call per line, return a named variable:

```ts
export function formatDateRangeDisplay(start: string, end: string): string {
  const startDate = assertISODateString(start);
  const endDate = assertISODateString(end);
  const formattedRange = formatRangeDisplay(startDate, endDate, " – ");
  return formattedRange;
}
```

The litmus test: does extracting make the code LESS readable? If so, do not extract for convention's sake. Readability outranks the rule.

- Guard clauses first, happy path at base indentation. Throw at the point of failure with the offending value in the message.
- Under ~30 lines. Compose, never nest past 2 levels.

## Types

- `as const` object + derived type, then reference members. Never standalone string-literal unions, never TS `enum`:

```ts
export const RECOMMENDATION_KIND = {
  PERFECT_MATCH: "perfect-match",
  UNLOCK: "unlock",
} as const;

export type RecommendationKind = (typeof RECOMMENDATION_KIND)[keyof typeof RECOMMENDATION_KIND];
```

- Infer over annotate for variables; annotate function signatures.
- Discriminated unions over optional-field grab bags. Consumers switch on `kind`.
- Zod schema then `z.infer` at every external boundary (API responses included). Schemas named `xxxSchema`.
- Never `any`. Never `as` casting (fix the root cause upstream). Never `@ts-ignore`. `import type` on its own line.

## Components

- Named `export function`, `interface XxxProps` directly above. Default exports only where the router requires them.
- Order inside a file: imports, types, main component, `...WithBoundaries` wrapper, leaf helpers at the bottom. Helper components take inline-typed props.
- Hooks at top, derived values next, JSX last. Never compute values inline in JSX.
- Suspense/ErrorBoundary wrappers own loading and error states; the main render is happy-path only. `useSuspenseQuery`, not isLoading checks.
- `useEffect` for state is always a bug. Derive, don't store. Be extremely conservative with useMemo/useCallback/useRef.
- `cn()` for conditional classNames, `cva` + `VariantProps` for variants, compound components with dot notation for complex pieces.
- UI copy lives in `as const` config objects (`heading`, `subheading`, `submitLabel` keys), not inline strings.
- Dispatch with lookup maps keyed by enum members, not switch chains, when rendering per-state views.

## Ternaries

Simple display-string or variant selection ternaries are fine: `isPending ? "Deleting..." : "Delete"`. Never nested, never controlling JSX structure, never in className strings (use `cn`).

## Comments and docs

- No comments. Code is self-documenting. The only exceptions: intent or constraint impossible to express in code, and JSDoc that adds real IntelliSense value. No JSDoc essays; heavy JSDoc reads as machine-generated.
- Never document implementation details, ticket IDs, or why something does not exist. Link to official docs instead of paraphrasing them. Docs are for humans: short, contractions, 1-3 sentence paragraphs.

## Dependencies and minimalism

- Every line of code is a liability. The standing question: for a single human maintainer, is this code more liability than benefit?
- Library first: dates are date-fns, validation is Zod, forms are TanStack Form. Search for an existing package before writing any utility.
- Delete pass-through wrappers. A wrapper earns its life only by narrowing types or encoding real policy.
- No speculative complexity. Build for the current need; delete dead seams, unused params, "future-proofing".

## Database (Drizzle + D1)

- Conservative column types: smallint-scale integers where the domain is bounded.
- Check constraints on every bounded or non-empty field. Enums (as const + CHECK) over free text.
- No redundant state columns (`isActive` next to `deletedAt` is a smell). Column names consistent across tables.
- Never edit a generated migration. Schema changes require Jordan's sign-off before generating one.

## Data layer

Mutation hooks follow the house shape: token check first line of `mutationFn`, non-ok responses parsed and thrown, `toast.error` in `onError`, `void queryClient.invalidateQueries(...)`. Always `void` floating promises. Query keys via `@lukemorales/query-key-factory` (`planKeys`, `responseKeys`).

## Commits and PRs

- Conventional commits, lowercase imperative, subject strictly WHAT changed: `refactor: absorb date-range-utilities into consumers`.
- Small atomic commits per concern. Review fixes land as follow-up commits referenced by SHA in the reply.
- PR body: `## Summary` (dense bullets), Linear link, `## Test plan` (automated checks pre-checked, manual steps unchecked), `## Deviations from the ticket text`, `## Out of scope (flagged for follow-up)`.
- Review replies: answer every thread individually with the fixing commit SHA, one "Addressed the review" summary, and a "judgment calls (happy to flip any)" section for pushback.
