---
paths:
  - "src/**"
---

# React + TanStack rules

## Component anatomy

- Named `export function`, `interface XxxProps` directly above. Default exports only where the router requires them.
- Order inside a file: imports, types, main component, `...WithBoundaries` wrapper, leaf helpers at the bottom. Helper components take inline-typed props.
- Hooks at top, derived values next, JSX last. Never compute values inline in JSX.
- `cn()` for conditional classNames, `cva` + `VariantProps` for variants, compound components with dot notation for complex pieces.
- UI copy lives in `as const` config objects (`heading`, `subheading`, `submitLabel` keys), not inline strings.
- Dispatch with lookup maps keyed by enum members, not switch chains, when rendering per-state views.

- Data flows through `useSuspenseQuery` with keys from `src/lib/queries.ts`; parents own Suspense/ErrorBoundary. Components never check isLoading/isError in the happy path.
- **Banned hooks (hard rule, never a "taste" nit).** `useMemo` and `useCallback` are banned outright — derive values during render; if something seems to "need" memoizing, the component is doing too much, so split it. `useEffect` to set state is always a bug. `useRef` to bypass the render cycle is banned. Any of these appearing in a diff is an automatic must-fix (🔴), never optional and never to be "preserved."
- Route-private components live in the route's `-folder/`; shared primitives in `src/components/ui`; mutations in `src/lib/mutations.ts` following the house shape (token check first, parsed error throw, toast in onError, `void queryClient.invalidateQueries`).
- Extract a component when: it has its own state/handlers, the main render needs scrolling to find, a conditional block passes ~15 lines, or props drill 3+ levels.
- Dates are branded `ISODateString`s from `src/lib/date/types.ts` (`toISODateString`, `parseAPIDate`, `assertISODateString`). Never `new Date(string)` on API data, never hand-format dates (use `src/lib/date/formatter.ts`).
- When touching a file, leave it fully conformant with all rule files.
