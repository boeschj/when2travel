---
paths:
  - "src/**"
---

# React + TanStack rules

- Data flows through `useSuspenseQuery` with keys from `src/lib/queries.ts`; parents own Suspense/ErrorBoundary. Components never check isLoading/isError in the happy path.
- `useEffect` to set state is always a bug. Derive values during render; be extremely conservative with useMemo/useCallback/useRef.
- Route-private components live in the route's `-folder/`; shared primitives in `src/components/ui`; mutations in `src/lib/mutations.ts` following the house shape (token check first, parsed error throw, toast in onError, `void queryClient.invalidateQueries`).
- Extract a component when: it has its own state/handlers, the main render needs scrolling to find, a conditional block passes ~15 lines, or props drill 3+ levels.
- Dates are branded `ISODateString`s from `src/lib/date/types.ts` (`toISODateString`, `parseAPIDate`, `assertISODateString`). Never `new Date(string)` on API data, never hand-format dates (use `src/lib/date/formatter.ts`).
- Style law lives in AGENTS.md. When touching a file, leave it fully conformant.
