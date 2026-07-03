---
name: worker-test-schema-parse-idiom
description: Inline schema.parse(await response.json()) in worker/routes/*.test.ts is an established, sanctioned idiom, not an explaining-variable violation.
metadata:
  type: project
---

`worker/routes/plans.test.ts` and `worker/routes/responses.test.ts` both consistently write
`const created = xxxSchema.parse(await response.json());` as a single line, nesting the
`response.json()` call inside `.parse(...)`. This appears 6+ times in `plans.test.ts` alone
(lines 64, 73, 125, 138, 156, 225) and 3 times in `responses.test.ts` (lines 48, 58, 73).

The only place the file splits it into two lines (`const body: unknown = await response.json();`
then `schema.parse(body)`) is when the raw `body` value is reused a second time later in the
same test (e.g. `expect(body).not.toHaveProperty("editToken")`). That split is driven by variable
reuse, not by an "avoid nested calls" rule.

**Why:** AGENTS.md's "one function call per line, every expression gets a name" rule (the Kent
Beck `foo(bar(x))` antipattern) could naively be read to flag this nesting. But it is the
consistent, repeated convention across both worker test files, and splitting it into two lines
when the parsed value is only used once does not improve readability — it fails the litmus test
in AGENTS.md ("does extracting make the code LESS readable? If so, do not extract for
convention's sake").

**How to apply:** When auditing `worker/routes/*.test.ts` files (or any test file with the same
`app.request` + Zod schema pattern), do not flag `schema.parse(await response.json())` as an
explaining-variable/one-call-per-line violation unless the parsed body is discarded after use in
a way that suggests the nesting is hiding a real bug. This is distinct from nested calls in
non-test application code, which should still be scrutinized normally. See
[[worker-d1-test-conventions]] for related worker test norms if that memory exists.

**Related, also refuted (audited 2026-07-02, `plans.test.ts`):** two more candidate
schema-first findings were raised and refuted by `finding-refuter` in the same audit, worth not
re-raising on future passes of these files:

1. An inline one-off `z.object({ id: z.string(), editToken: z.string() }).parse(...)` (no
   top-level named schema) used exactly once — refuted because the shape is trivial and used
   once; hoisting to a named constant adds ceremony without readability gain.
2. An inline derived schema chained straight into parse, e.g.
   `createdPlanSchema.omit({ editToken: true }).parse(body)`, even though the file's own
   `publicPlanSchema` and the sibling `responses.test.ts`'s `updatedResponseSchema` name the
   _same kind_ of `.omit({ editToken: true })` derivation at the top level. Refuted because
   `publicPlanSchema`/`updatedResponseSchema` are reused or structurally complex (multi-field
   extend), while the inline `.omit()` at the PUT-test call site is a trivial single-field
   removal used once — the "named schema" precedent doesn't generalize to single-use trivial
   derivations.

**General rule this establishes:** in these worker test files, only flag a schema as needing a
top-level name if it is (a) reused across multiple tests/assertions, or (b) structurally
non-trivial (adds/combines multiple fields). A schema — inline object literal or `.omit()`/
`.extend()` derivation — used exactly once for a simple shape passes the readability litmus test
inline and should not be flagged even though it superficially looks inconsistent with named
schemas elsewhere in the same file.
