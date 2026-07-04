---
name: feature-dev
description: Take a feature idea with no ticket through the full lifecycle - refine it with the agent team, write it as a proper Linear ticket, then hand off to ship-ticket for build, review, PR, and merge. Use when the human describes a feature, improvement, or fix that has no ticket yet, or asks to "build", "add", or "develop" something.
argument-hint: <feature description>
allowed-tools: "*"
---

# Feature dev: idea to merged PR

The full lifecycle when no ticket exists yet: refine → ticket → `/ship-ticket`. One feature per session. The same law as ship-ticket applies: unattended does not mean unrefined or unreviewed, and your task list must contain one task per stage below plus every ship-ticket stage, before work starts.

## 1. Refinability check

Read the idea ($ARGUMENTS). If it needs product decisions to be implementable (scope, UX behavior, copy, priorities), ask the human now, while they are here. Engineering unknowns are yours to resolve in refinement. An idea too vague to write acceptance criteria for stops here with specific questions, not guesses.

## 2. Refinement with the agent team

Spawn the refine team in ONE parallel batch, each with the idea, the relevant code paths you scouted, and one focused question set:

- `refine-principal-backend` when API/schema/data/auth is touched
- `refine-staff-frontend` when UI/state/routing is touched
- `refine-senior-fullstack` always (minimalism: what is the smallest real version?)
- `refine-senior-product` always (edge cases, copy, what the user actually experiences)
- `refine-intern-contrarian` always (attack the premise and the first approach)
- `refine-intern-cutting-edge` when a newer primitive might collapse the work

Synthesize by agreement, not vote-counting: where seniors disagree, say so. Fact-check every load-bearing claim with `refine-verifier` fan-out (one narrow lookup each). Present the synthesis to the human: recommendation first, then the genuine decisions (product-level only; engineering calls are yours, tie-broken by fewer moving parts). No effort estimates, ever.

## 3. Write the ticket

Create the Linear issue via the Linear MCP with pm-ticket discipline:

- Title: imperative, outcome-shaped.
- "What" as a user story; the persona is a product user for user-facing work, "an engineer building PlanTheTrip" for infra.
- Acceptance criteria are product-shaped: each one checkable by using the product, not by reading code. Rewrite any AC that fails that test.
- No implementation prescriptions; the refinement synthesis goes in a "Refinement notes" section (decisions made, approaches rejected and why, verified constraints).
- Set blockedBy relations if the work depends on open tickets.

Confirm the created ticket ID and its `gitBranchName` back to the human before proceeding.

## 4. Hand off to ship-ticket

Invoke `/ship-ticket <TICKET-ID>` via the Skill tool - an actual invocation, not a paraphrase of its steps. It owns everything from worktree to merge: build strictly to the AC you just wrote, the three-phase review, draft PR, babysit, Linear flips. If this session lacks the context budget to finish the build well, stop after step 3 and tell the human the ticket is ready for a fresh `/ship-ticket <TICKET-ID>` session instead of doing a degraded job.

## Things that have bitten previous sessions

- **Skipping refinement because the idea "seems clear."** The refine team exists because first approaches feel right and are not. A five-minute parallel batch is cheaper than a rewritten PR.
- **Writing AC that describe the implementation.** "Uses a lookup map" is not an acceptance criterion; "the results page shows X when Y" is.
- **Narrating the handoff instead of invoking it.** An overnight session once read a skill's steps and executed a smaller plan from memory. Skills are invoked with the Skill tool, and the task list is written before the build starts.
