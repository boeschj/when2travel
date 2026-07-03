# Learnings staging queue

Append-only candidates for promotion into CLAUDE.md, AGENTS.md, rules files, ESLint, or hooks. The transcript-auditor appends and increments `hits`; promotion (hits >= 2 or high confidence) happens through a diff Jordan approves. Seeded from Jordan's Mendpath memory store (transferable entries only).

## no-consulting-jargon

- type: correction
- insight: The words "gate", "canonical", and "chrome" are banned in every context, written or spoken; use words a human would say out loud.
- evidence: Mendpath memory feedback_avoid_consulting_jargon.md; enforced repeatedly in review.
- confidence: high
- hits: 3

## no-documenting-absent-things

- type: correction
- insight: Never write "why we don't have X" sections; absence is its own answer and git history covers the why.
- evidence: Mendpath memory feedback_do_not_document_absent_things.md.
- confidence: high
- hits: 2

## docs-free-of-implementation-details

- type: correction
- insight: CLAUDE.md and READMEs carry no ticket refs, no "when ticket X lands do Y", no deferred-AC notes; those live in Linear or memory.
- evidence: Mendpath memory feedback_claude_md_no_implementation_details.md; "NEVER DOCUMENT IMPLEMENTATION DETAILS" (Mendpath PR #13).
- confidence: high
- hits: 3

## commits-are-changelogs

- type: correction
- insight: Commit and PR bodies are bullets of WHAT changed only; no reasoning, no scoped-out items, no internal process; treat as public.
- evidence: Mendpath memory feedback_commit_messages_changelog_only.md.
- confidence: high
- hits: 2

## useeffect-needs-proof

- type: correction
- insight: useEffect requires docs-level justification; phase/step UIs are separate components dispatched through a lookup map; library over hand-rolled always.
- evidence: Mendpath memory feedback_avoid_useeffect_hand_code_phase_patterns.md; when2travel CLAUDE.md antipatterns.
- confidence: high
- hits: 2

## subagents-inherit-the-ruleset

- type: convention
- insight: Every code-writing delegate reads root CLAUDE.md and AGENTS.md and follows ship-ticket; standards do not transfer by osmosis.
- evidence: Mendpath memory feedback_subagents_must_use_ship_ticket_and_claude_md.md.
- confidence: high
- hits: 2

## date-fns-universally

- type: convention
- insight: date-fns for all date formatting and manipulation; never hand-roll date strings; this repo additionally brands dates as ISODateString via src/lib/date/types.ts.
- evidence: Mendpath memory feedback_use_date_fns_universally.md; when2travel src/lib/date.
- confidence: high
- hits: 2

## refinement-reversals-are-success

- type: convention
- insight: A decision reversed during refinement or review is the system working; only post-implementation misses count as process failures. Do not defend a position to avoid a reversal.
- evidence: Mendpath memory feedback_refinement_reversals_are_success.md.
- confidence: medium
- hits: 1

## dev-d1-was-remote

- type: ci-fix
- insight: The D1 binding once carried remote:true, sending dev-server writes to production and breaking dev on wrangler token expiry; dev and tests must stay on local miniflare state.
- evidence: when2travel session 2026-07-02: three QA plans written to prod; fixed by removing remote:true and adding migrations_dir.
- confidence: high
- hits: 1

## refuter-single-verdict

- type: tooling
- insight: Refuter agents must state exactly one verdict at the end of the reply; a calibration refuter emitted "upheld" then "refuted" in one response and only auditor judgment saved the finding. Fixed in finding-refuter.md.
- evidence: Calibration run 2026-07-03, availability-analysis auditor report.
- confidence: high
- hits: 1

## standard-terms-are-not-abbreviations

- type: convention
- insight: Product-standard terms functioning as words (CTA, URL, API, ID) do not violate the full-words naming rule; renames like personalizedCallToActionLabel fail the readability litmus. Refuters now hold this authority explicitly.
- evidence: Calibration run 2026-07-03, CTA finding killed in lead arbitration.
- confidence: medium
- hits: 1
