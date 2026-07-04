# Conventions

Apply everywhere: code, comments, commits, PRs, docs.

## Vocabulary

- Never use the words "canonical", "gate", or "chrome" in any context. Substitutes: official/reference, guard/check, app shell.
- No em dashes anywhere: code strings, docs, commits, PR text.

## Comments and docs

- No comments. Code is self-documenting. The only exceptions: intent or constraint impossible to express in code, and JSDoc that adds real IntelliSense value. No JSDoc essays; heavy JSDoc reads as machine-generated.
- Never document implementation details, ticket IDs, or why something does not exist. Link to official docs instead of paraphrasing them. Docs are for humans: short, contractions, 1-3 sentence paragraphs.

## Dependencies and minimalism

- Every line of code is a liability. The standing question: for a single human maintainer, is this code more liability than benefit?
- Library first: dates are date-fns, validation is Zod, forms are TanStack Form. Search for an existing package before writing any utility.
- Delete pass-through wrappers. A wrapper earns its life only by narrowing types or encoding real policy.
- No speculative complexity. Build for the current need; delete dead seams, unused params, "future-proofing".

## Commits and PRs

- Conventional commits, lowercase imperative, subject strictly WHAT changed: `refactor: absorb date-range-utilities into consumers`.
- Small atomic commits per concern. Review fixes land as follow-up commits referenced by SHA in the reply.
- PR body: `## Summary` (dense bullets), Linear link, `## Test plan` (automated checks pre-checked, manual steps unchecked), `## Deviations from the ticket text`, `## Out of scope (flagged for follow-up)`.
- Review replies: answer every thread individually with the fixing commit SHA, one "Addressed the review" summary, and a "judgment calls (happy to flip any)" section for pushback.
