# Phase 4: Evaluate & Iterate (ship MVP). Complete

**Brief deliverable:** *"An MVP, an evals benchmark, and a first set of metrics measured against the
baseline."*

**Status (2026-06-21):** Phase complete. MVP built and running, the benchmark runs the full
pipeline (`npm run eval`), v1 metrics are measured against the Phase 1 targets in `eval-results.md`,
the manual rubric pass of the 24 explanations is recorded in `manual-rubric-pass.md`, and the
prioritized iteration plan is in `iteration-plan.md`. All six criteria in `eval-deliverable-rubric.md`
now Exceed the bar.

## Tasks
1. **Surface and validate risks:** list product risks, then the fastest and cheapest way to test each
   one.
2. **Define and build the MVP:** scope the smallest product that tests the key risks (STAR format),
   then build it.
3. **Set up evals and measure:** build the evals benchmark, run v1 on the 24 locked synthetic
   profiles in `ground-truth.md`, manually verify each output, compute the metrics, and compare
   to the Phase 1 targets (the brief asks for about 20 diverse inputs; we lock 24).

## The ground truth already lives here (locked early, on purpose)

`ground-truth.md` holds the 24 labeled profiles (8 approve, 8 decline, 8 refer, every rule
boundary covered). It was written and locked on 2026-06-11, during the Phase 2 review, BEFORE
any scorecard weight or band cut-off exists (decision M5). The early lock is deliberate: if the
labels were written after the weights, the exam would be graded by the student. Phase 3 must
never edit that file; Phase 4 measures against it unchanged. The Screen 3 impact view
(champion vs challenger) runs on the same 24 rows.

## The metrics to measure (defined in Phase 1, measured here)
- Group A (credit): decision accuracy 80% or higher, false approval under 10%, refer rate vs review
  capacity.
- Group B (AI output): hallucination under 2%, policy grounding 100%, latency under 15s.
- See `../01-scope-and-research/deliverables/03-success-metrics.md`.

## Also lives here
- **Pitch films:** two 90-second walkthroughs on synthetic data, each as an MP4 plus the interactive
  HTML source. `Credit Copilot - Product Film` covers the deterministic guarantee and the v1 eval
  results; `Newcomer Credit Copilot Pitch Film` covers the problem and one live approve decision.
  The root `README.md` links both at the top.
- **Presentation / pitch:** the final demo script and slides (the capstone is ship plus present).
- **Optional brand name for the pitch (decided 2026-06-11):** the repo and product keep the
  functional name "newcomer-credit-copilot"; a brandable product name (Wio / Liv style) may be
  layered on for the pitch deck only. If we do it, pick the word with a native Arabic speaker so
  it means what we intend. Cosmetic, zero build impact, decide during pitch prep.
- **Pre-presentation fact to-do:** if the deck cites the AECB 3.71M salary figure or the CBUAE
  minimum-salary removal, primary-source them (both currently rest on solid secondary reporting).

> Phase 3 build is done; this phase is complete (see Status above).

## The MVP, in STAR format
The brief asks for the smallest product that tests the key risks, framed in STAR (Situation, Task,
Action, Result).
- **Situation:** a UAE bank must decide on a thin-file newcomer who has no AECB record. The call is
  high-stakes and a wrong approval is the costly error.
- **Task:** give a credit officer a fast, consistent, defensible approve / decline / refer
  recommendation with a rationale they can stand behind, without a wrong approval slipping through.
- **Action:** the smallest product that tests this. A deterministic judgmental scorecard plus a
  six-rule UAE policy check produce the score and the verdict; an LLM writes the plain-language
  explanation only and cannot move a point, a rule, or the recommendation. Engineering scaffolding
  was cut (no login, no bank integration, synthetic data); the credit substance stays real (D9).
- **Result:** measured on the 24 locked profiles: 83.3% decision accuracy, 0% false approvals,
  0/24 invented facts shown, 100% policy grounding (see `eval-results.md`).

The risks this MVP tests, and how each was validated, are in `risks-and-validation.md`.
