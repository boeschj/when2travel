---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Code patterns

The bar: a reviewer cannot tell agent code from Jordan's code.

## Naming

- Full words, never abbreviations: `appleHealthkitSourceMethodEnum`, not `hkSourceMethodEnum`. Verbosity pays for itself tenfold. Product-standard terms functioning as words (CTA, URL, API, ID) are fine.
- Functions are `verbNoun`: `get`/`fetch` retrieve, `calculate`/`compute` derive, `build` constructs config, `format` makes display strings, `validate`/`check`/`is`/`has` return booleans, `parse`/`convert` change shape.
- Booleans read as assertions and deliver actual booleans: `isCreator`, `hasEmptyNames`, `allGuestsNotAttending`.
- Handlers: `handleX` inside components, `onX` as props. Mutation callbacks are `onSuccess`/`onError`.
- Files kebab-case. Hooks in `use-*.ts` returning a flat object of named members: `{ savePlanEditToken, isCreator, removePlanEditToken }`.

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

## Ternaries

Simple display-string or variant selection ternaries are fine: `isPending ? "Deleting..." : "Delete"`. Never nested, never controlling JSX structure, never in className strings (use `cn`).
