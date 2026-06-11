# Phase 3 Plan: Build and AI Integration

Working document, not a deliverable. Created 2026-06-11 at the start of Phase 3.
Purpose: confirm what Phase 3 must produce, fix the build order, and log the engineering
defaults so Monika can override any of them.

---

## 1. Pre-flight: are Phases 1 and 2 actually done?

Yes. `../../01-scope-and-research/phase-1-signoff.md` (2026-06-09) and
`../../02-design/phase-2-signoff.md` (2026-06-11). The design fixes every shape the build needs:
entities, rules with severities, combination logic, counterfactuals, validator, three screens
plus impact view, and the locked 24-case ground truth with its labeling constants.

## 2. What Phase 3 must produce (the brief's words)

*"A working build with at least one live LLM-powered use case."* Our one live LLM use case is
the explanation layer, specified in `../deliverables/llm-integration.md`. Everything else is
deterministic by design (D7, M6).

## 3. The build order (one chunk at a time, deterministic core first)

| Chunk | What gets built | Done when |
|---|---|---|
| 1 | Project scaffold: app skeleton, types for the 6 entities, the locked constants in one config file | App runs locally, types compile |
| 2 | Deterministic core: scorecard (5 factors, weights with documented rationale), policy engine (7 rules), combination logic, counterfactual generator | Unit tests pass; logic matches the data model exactly |
| 3 | Self-check harness: run the 24 ground-truth profiles through the core (this is the impact view's challenger run and the Phase 4 eval plumbing) | All hard-fail and refer-rule outcomes match; band-driven rows reported, not tuned to |
| 4 | LLM explanation layer plus grounding validator, per the spec | Validator catches a seeded ungrounded explanation; template fallback renders |
| 5 | UI: Screen 1 (intake plus policy inputs), Screen 2 (live 3 steps), Screen 3 (decision hero plus counterfactuals plus impact view tab), review queue and audit log (M7, browser-stored CaseRecords) | The three worked examples from the UI flow render correctly; a refer lands in the queue and survives a page reload |
| 6 | Deploy plus README run instructions | Public URL works end to end on a sample profile |

**Weight-tuning guardrail (M5):** scorecard weights and band cut-offs are set from documented
domain rationale per factor, never adjusted to make ground-truth rows pass. The chunk 3 harness
reports mismatches; fixing a mismatch by changing a weight requires a written rationale that
stands on its own without referencing the ground truth.

## 4. Engineering defaults (Monika can override any, decisions queue pattern)

| # | Decision | Default adopted | Why |
|---|---|---|---|
| B1 | Stack | Next.js (React) single app, API route for the LLM call, no database | One deployable artifact, matches the no-persistence cut list |
| B2 | Deployment | Vercel free tier | One-command deploy, public URL for the demo and the brief's "deployed MVP" |
| B3 | LLM | Anthropic API, Claude Sonnet (model id pinned in code) | Brief allows Anthropic; quality for a formal paragraph at low cost; latency well under 15s |
| B4 | Constants | Adopt the ground-truth labeling constants verbatim (PRODUCT_MIN_SALARY 8,000 / 5,000, FLAT_ANNUAL_RATE 0.08, AMOUNT_SALARY_MULTIPLE 20, DBR cap 0.50) | M5 locked them with the labels; changing one breaks the boundary cases |
| B5 | CaseRecord storage (M7) | Browser localStorage in v1, no server database | Identical on screen to a database-backed queue, zero infrastructure and demo risk; the entity is shaped to become a real table in v2 |

API key handling: ANTHROPIC_API_KEY via environment variable only, `.env` is gitignored, never
committed, never logged.

## 5. Scope guard (standing rule 4)

No login, no database, no saved history, no second product, no Arabic, no mobile, no
applicant-facing anything. The cut list from Phase 1 is final for v1.
