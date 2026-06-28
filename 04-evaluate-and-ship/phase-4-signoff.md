# Phase 4, Evaluate & Iterate: Sign-off

The single source of truth for "is Phase 4 done?" Signed off: 2026-06-28, documenting the MVP,
evals, and measured metrics delivered during this phase.
The brief's Phase 4 deliverable, in its own words: *"An MVP, an evals benchmark, and a first set of
metrics measured against the baseline."* Tasks: surface and validate risks, define and build the
MVP (STAR format), set up evals and measure. This page maps each one to its artifact and validation
status.

---

## The deliverable: status

| # | Deliverable (from brief) | Artifact (clean, standalone) | Validated? |
|---|---|---|---|
| 1 | An MVP | The working app (`../03-build/app/`), framed in STAR in `README.md` ("The MVP, in STAR format") | Yes. Runs the full intake -> score -> policy check -> recommendation flow on synthetic data; deployed live |
| 2 | An evals benchmark | `ground-truth.md` (24 profiles, 8 approve / 8 decline / 8 refer, every rule boundary, labels locked 2026-06-11 before any weight) plus the repeatable harness (`npm run eval`) | Yes. Repeatable, and the labels were locked before the scorecard existed (decision M5) |
| 3 | First set of metrics vs baseline | `eval-results.md` (measured vs the Phase 1 targets), `manual-rubric-pass.md` (24 explanations checked by hand), `iteration-plan.md` (v1 -> v2, each item tied to a measured gap) | Yes. v1 baseline measured and recorded |

**Risks surfaced and validated:** `risks-and-validation.md` lists each product risk, the cheapest
test, and the result. **MVP in STAR:** `README.md`.

**Self-assessment:** all six criteria in `eval-deliverable-rubric.md` rate "Exceeds the bar."

---

## The measured v1 baseline (against the Phase 1 targets)

| Metric | Target | Measured | Met |
|---|---|---|---|
| Decision accuracy | 80% or higher | 20/24 (83.3%) | yes |
| False approval rate | under 10% | 0/24 (0.0%) | yes |
| Hallucination (invented facts shown) | 0 across the set | 0/24 | yes |
| Policy grounding | 100% | 100% (24/24 grounded on first attempt) | yes |
| Latency | under 15s per assessment | avg 8.2s, max 15.3s | no (tail) |
| Manual rubric pass | 24 pass | 24 pass, 4 minor notes | yes |

Everything is at target except the latency tail, which is the top item in the iteration plan. The
four accuracy misses are band-driven boundary cases surfaced rather than tuned away, and none is a
false approval.

---

## No-ambiguity checks (each potential gap, resolved)

1. **The benchmark is honest.** The 24 labels were locked on 2026-06-11, before any scorecard
   weight or band cut-off existed (M5), so the exam cannot be graded by the student. Phase 4
   measured against the file unchanged.
2. **Metrics are measured, not asserted.** `eval-results.md` records the run on all 24 profiles
   through the full pipeline, and `manual-rubric-pass.md` records a by-hand check of every
   explanation.
3. **The brief's "~20 diverse inputs" is met and exceeded.** 24 profiles spanning all three
   outcomes and every rule boundary.
4. **The costly errors are controlled.** Hallucination shown and false approval are both zero on
   the set; the grounding metric is enforced (validator plus retry plus template), not only
   reported.

---

## Verdict

Phase 4 is complete. The MVP exists and runs, the evals benchmark is repeatable and honestly
constructed, and the first set of metrics is measured against the Phase 1 baseline with the gaps
named and prioritized. All four phase deliverables of the capstone are now complete.
