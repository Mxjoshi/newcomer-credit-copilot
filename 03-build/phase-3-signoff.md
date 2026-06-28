# Phase 3, Build & AI Integration: Sign-off

The single source of truth for "is Phase 3 done?" Signed off: 2026-06-28, documenting the build
delivered during this phase.
The brief's Phase 3 deliverable, in its own words: *"A working build with at least one live
LLM-powered use case."* This page maps each one to its artifact and validation status.

---

## The deliverable: status

| # | Deliverable (from brief) | Artifact (clean, standalone) | Validated? |
|---|---|---|---|
| 1 | A working build | [`app/`](app/), a Next.js officer console implementing the core flow: applicant intake, rules-based judgmental scorecard, six-rule UAE policy check, then an approve / decline / refer recommendation | Yes. Type-clean, unit tested (`npm test`), the 24-profile harness runs (`npm run harness`), runs locally (`npm run dev`), and is deployed live |
| 2 | At least one live LLM-powered use case | The explanation and decision-reasoning layer: Anthropic / Claude writes the plain-language rationale the officer reads. Spec in `deliverables/llm-integration.md` | Yes. Live model call, grounding-validated, with a deterministic template fallback |

**Ordering respected:** the product was built first, then the LLM wired into the explanation layer,
per the brief.

**Backing material (full reasoning, not graded):** `working/phase-3-plan.md` (build plan and
engineering defaults).

---

## No-ambiguity checks (each potential gap, resolved)

1. **The LLM use case is live, not mocked.** The explanation layer calls the model at runtime
   (Anthropic / Claude) and returns a structured, grounded rationale. The grounding validator
   checks every claim against the inputs; on failure it retries, then falls back to a deterministic
   template, so no ungrounded text reaches the officer.
2. **The model cannot move the decision.** The score and verdict are produced by the deterministic
   scorecard and policy check. The LLM writes the explanation only and has no ability to alter a
   point, a rule, or the recommendation (decision D7).
3. **Scope cuts are scaffolding only.** No login, no real bank integration, synthetic data (D9).
   The credit substance, the scorecard, the six policy rules, and the approve / decline / refer
   output, stays real.
4. **The build matches the locked design.** It implements the Phase 2 data model and UI flow
   unchanged, and runs the 24 locked ground-truth profiles without editing them.

---

## What is explicitly not in Phase 3 (so we don't over-build)

- Running the evals and measuring metrics against the baseline: Phase 4.
- The MVP risk validation and the iteration plan: Phase 4.

---

## Verdict

Phase 3 is complete. The working build exists and runs, and at least one live LLM-powered use case
(the explanation layer) is wired in, grounded, and verifiable. Cleared to start Phase 4 (evaluate
and iterate).
