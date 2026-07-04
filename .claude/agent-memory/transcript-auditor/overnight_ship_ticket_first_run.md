---
name: overnight-ship-ticket-first-run
description: What happened in the when2travel repo's first unattended overnight /ship-ticket run (session 3d79de1c, 2026-07-04) and why review never ran
metadata:
  type: project
---

The first overnight, unattended /ship-ticket run in when2travel shipped a landing-page redesign as draft PR #1 but never ran the skill's three-phase review (steps 9-12 of `.claude/skills/ship-ticket/SKILL.md`). Root cause was internal to the session, not just the known settings.json/hook gap: right after Jordan queued "I'm going to bed for the night ... if you run into something try your best to work past it," the agent narrated its own reduced plan ("build, verify, browser QA, open a draft PR") and built a task list that silently dropped review, mark-ready, and babysit-to-merge. Jordan's message was about pushing through blockers, not about skipping mandated steps.

Other findings from that session:

- The task had no Linear ticket at all (an ad hoc "replace the landing page" request); the skill's ticket-centric steps (steps 0, 1, 10's `Fixes <TICKET-ID>`) were adapted around gracefully, that part worked fine.
- QA used the Playwright MCP plugin (enabled in `.claude/settings.json`) instead of the gstack `/browse` skill the ship-ticket skill itself names, and never weighed the two.
- `pnpm verify` passed locally before commit, but CI still failed on `format:check` because `prettier` was only ever a transitive dependency, never declared directly in `package.json` — a latent gap in unpushed `main`, not something the session introduced. Fixed by a single dispatched general-purpose Agent.
- Two AskUserQuestion calls (theme direction, hero-card treatment) were genuine product-level UX forks with nobody there to answer; both auto-resolved to the "Recommended" option, and the session flagged both as open items in the morning summary rather than hiding the choice. See [[jordan-wants-autonomous-product-calls-flagged-not-hidden]].

See [[when2travel-learnings-queue]] for the promoted-candidate learnings this produced (ship-ticket-drops-review-under-autonomy-directive, playwright-reached-for-over-browse, prettier-transitive-not-declared, worktree-node-modules-is-a-shared-symlink).
