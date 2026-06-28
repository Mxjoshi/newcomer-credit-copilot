# Surface and validate risks (Phase 4, task 1)

The brief's first Phase 4 task: list the product's risks, then the fastest and cheapest way to
validate each one. Each risk below names the failure, the validation (cheapest useful test), and
the measured result. The cheap test for almost all of them is the same: run the 24 locked
synthetic profiles in `ground-truth.md` through the full pipeline and inspect the output, plus the
manual rubric pass in `manual-rubric-pass.md`. No new infrastructure is needed.

| # | Risk (what could go wrong) | Cheapest way to validate | Result |
|---|---|---|---|
| R1 | The model invents a fact or a rule that is not in the applicant data or policy (hallucination). | A grounding validator checks every claim against the inputs; measure "invented facts shown" across the 24 cases. | **0/24.** When a first draft has an ungrounded item the validator catches it and the retry runs; if both fail, a deterministic template is shown. Enforced, not only measured. |
| R2 | A wrong approval slips through, the costly error. | Measure the false-approval rate on the locked set (approvals that should have been declines). | **0/24 (0%)**, against the under-10% target. v1 deliberately leans to refer and decline. |
| R3 | The LLM changes the decision (moves a score, a rule, or the verdict). | By architecture the score and verdict are deterministic; the model writes the explanation only. Confirm the verdict never depends on the model. | Verified by design and by the eval: the recommendation is produced by the scorecard and policy check; the model cannot alter it. |
| R4 | The exam is graded by the student (labels tuned to fit the weights). | Lock the 24 ground-truth labels before any scorecard weight or band cut-off exists. | Labels locked 2026-06-11 (decision M5), before weights existed. Phase 3 never edits `ground-truth.md`. |
| R5 | Assessments are too slow for an officer at the desk. | Measure latency per assessment across the set. | avg **8.2s**, max **15.3s** against the under-15s target. One case sits on the tail; it is the top item in `iteration-plan.md`. |
| R6 | Borderline / band boundary cases are misclassified. | Cover every rule boundary in the ground truth; inspect each accuracy mismatch by hand. | The four accuracy misses are band-driven boundary cases, surfaced rather than tuned away, and **none is a false approval** (`manual-rubric-pass.md`). |
| R7 | Over-claiming what the tool does (positioning risk). | Fact-check the positioning against regulation during scope. | Corrected in Phase 1: an explainable, regulator-aligned baseline (rules + alt-data + policy check + explanation), not a claim of legal compliance. |

**Summary.** Every risk has a cheap, repeatable test on synthetic data, and the costly-error risks
(R1 hallucination, R2 false approval, R3 model-moves-the-verdict, R4 eval integrity) are validated
at zero or enforced by design. The one open risk is the latency tail (R5), carried forward as the
first iteration item, not a correctness failure.
