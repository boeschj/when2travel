# Learnings staging queue

Append-only candidates for promotion into CLAUDE.md, rules files, ESLint, or hooks. The transcript-auditor appends and increments `hits`; promotion (hits >= 2 or high confidence) happens through a diff Jordan approves. Seeded from Jordan's Mendpath memory store (transferable entries only).

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

## voter-single-verdict

- type: tooling
- insight: Leaf review agents must state exactly one verdict at the end of the reply; a calibration agent emitted two contradictory verdicts in one response and only auditor judgment saved the finding. Carried into style-voter.md as the single-vote contract.
- evidence: Calibration run 2026-07-03, availability-analysis auditor report.
- confidence: high
- hits: 1

## standard-terms-are-not-abbreviations

- type: convention
- insight: Product-standard terms functioning as words (CTA, URL, API, ID) do not violate the full-words naming rule; renames like personalizedCallToActionLabel fail the readability litmus. Voters hold this authority explicitly.
- evidence: Calibration run 2026-07-03, CTA finding killed in lead arbitration.
- confidence: medium
- hits: 1

## tosorted-not-in-lib

- type: tooling
- insight: Array.prototype.toSorted types as error under the shared tsconfig lib target; the spread-then-sort form is the available immutable idiom and sonarjs accepts it. Review findings against copy-then-sort are refuted by environment.
- evidence: Calibration follow-up 2026-07-03, 8 no-unsafe-\* errors on toSorted in recommendation-rules.ts.
- confidence: high
- hits: 1

## pool-workers-config-subpath-gone

- type: tooling
- insight: @cloudflare/vitest-pool-workers 0.18 exports cloudflareTest, readD1Migrations, and D1Migration from the package ROOT; the /config subpath in official docs examples no longer exists. Also worker-configuration.d.ts goes stale silently; rerun pnpm cf-typegen after wrangler.jsonc changes.
- evidence: when2travel Phase 7 2026-07-03, esbuild "Missing ./config specifier" + empty Cloudflare.Env until cf-typegen.
- confidence: high
- hits: 1

## parallel-batch-mixed-sync-async

- type: tooling
- insight: A parallel subagent batch can return mixed sync/async results even with run_in_background false on each; leads must wait for completion notifications instead of polling for done-marker files (a guessed .done path burned a full timeout). Encoded in review-lead.md.
- evidence: Real-wiring review run 2026-07-03, plans.test.ts auditor launched detached, exit 143 poll loop.
- confidence: high
- hits: 1

## ship-ticket-drops-review-under-autonomy-directive

- type: convention
- insight: When told to run unattended overnight, the agent narrated its own reduced plan ("build, verify, browser QA, open a draft PR") and built a 7-item task list that silently omitted the loaded ship-ticket skill's steps 9-12 (three-phase review, mark-ready, babysit, after-merge); zero Skill-tool calls to /review-arch, /review-minimal, or /review-style happened all session, and the PR stayed in draft with no review ever run.
- evidence: session 3d79de1c-04b6-46af-aab1-4c319b4a2eb1 line 246, in response to the user's queued "just a heads up - I'm going to bed for the night. I won't be here so if you run into something try your best to work past it": "Got it — sleep well. I'll run this fully autonomously: build the whole landing, verify, do desktop + mobile browser QA, and open a **draft** PR (I won't merge). If I hit a wall I'll work around it and document it clearly for you in the morning. No more questions." TaskCreate calls (lines 250-262) list only 7 tasks, none mentioning review.
- confidence: high
- hits: 1

## playwright-reached-for-over-browse

- type: convention
- insight: For browser QA the session went straight to the enabled Playwright MCP plugin ("Loading the Playwright tools for automated QA") and never invoked or even considered the gstack /browse skill that the ship-ticket skill text itself names ("`pnpm seed:qa` + the browse tooling are how you see the product") and that the user's global CLAUDE.md mandates for web browsing.
- evidence: session 3d79de1c-04b6-46af-aab1-4c319b4a2eb1 line 556 text "Loading the Playwright tools for automated QA," followed by ToolSearch for mcp**plugin_playwright_playwright**\* tool names (line 557) and browser_navigate/browser_take_screenshot calls; zero mentions of "browse" or "gstack" anywhere near QA in the transcript.
- confidence: high
- hits: 1

## prettier-transitive-not-declared

- type: ci-fix
- insight: CI's `pnpm install --frozen-lockfile` does not expose the `prettier` binary because prettier is resolved only as a transitive/peer of prettier-plugin-tailwindcss, @ianvs/prettier-plugin-sort-imports, @boeschj/prettier-config, and eslint-config-prettier, never as a root devDependency; `pnpm verify` then dies at `format:check` with `prettier: not found`. It passes locally only because node_modules already has it. Fix: add `"prettier": "3.7.4"` to devDependencies and run `pnpm install --lockfile-only` (never plain `pnpm add`/`pnpm install` inside a worktree whose node_modules is symlinked to the main checkout).
- evidence: session 3d79de1c-04b6-46af-aab1-4c319b4a2eb1 line 780 CI log "prettier: not found"; line 793 dispatched-agent prompt with the fix; line 814 result "build pass 1m20s" after commit e92c9d9 "build: declare prettier as a direct devDependency so CI can run format:check". This gap is in unpushed main, not just the PR branch.
- confidence: high
- hits: 1

## worktree-node-modules-is-a-shared-symlink

- type: tooling
- insight: A worktree's node_modules is a symlink into the main checkout's node_modules, shared with Jordan's running session and any others; writing to it (`pnpm add`, plain `pnpm install`) can corrupt every concurrent session. Any dependency-file change made inside a worktree must go through `pnpm install --lockfile-only`, which touches only package.json/pnpm-lock.yaml.
- evidence: session 3d79de1c-04b6-46af-aab1-4c319b4a2eb1 line 793, agent prompt "CRITICAL HAZARD ... node_modules in this worktree is a SYMLINK to the main checkout's node_modules ... Do NOT run plain `pnpm add ...` or `pnpm install`... ONLY update package.json + pnpm-lock.yaml, using a lockfile-only install."
- confidence: high
- hits: 1
