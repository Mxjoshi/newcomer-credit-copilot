# Eval Deliverable Rubric: the Phase 4 bar

A self-assessment scorecard for the Phase 4 evaluation work. The criteria come straight from the
capstone brief (`00-reference/capstone-brief-notes.md`): the Phase 4 deliverable is "an MVP, an
evals benchmark, and a first set of metrics measured against the baseline," and the brief's eval
method is "run ~20 diverse inputs, manually verify each against ground truth, compute metrics,
compare to targets, iterate."

Three levels per criterion: **Below bar** (missing or weak), **Meets bar** (the brief is
satisfied), **Exceeds** (clearly above what is asked). The last column is where this project
currently lands, with the evidence.

---

## Criteria

### A. Ground-truth quality
The labeled set is diverse, covers the boundaries, and was labeled honestly.

| Level | What it looks like |
|---|---|
| Below bar | Few inputs, no boundary cases, or labels written after the system was tuned. |
| Meets bar | ~20 diverse labeled inputs covering the main outcomes. |
| Exceeds | More than asked, every rule boundary deliberately covered, labels locked before any weights exist, with the protocol documented. |

**This project: Exceeds.** 24 profiles (8/8/8), every rule boundary has a named row (the checklist
in `ground-truth.md`), labels locked 2026-06-11 before any scorecard weight, protocol written at
the top of the file. Evidence: `ground-truth.md`.

### B. Benchmark exists and is repeatable
There is an automated way to run the whole set and produce the numbers again after a change.

| Level | What it looks like |
|---|---|
| Below bar | Numbers computed by hand once, not reproducible. |
| Meets bar | A script or process that runs the set and outputs metrics. |
| Exceeds | One command runs the full real pipeline (decision plus live model) and writes a dated results file. |

**This project: Exceeds.** `npm run eval` runs all 24 through the real decision core and the live
model explanation and writes `eval-results.md`. Evidence: `03-build/app/scripts/eval.ts`.

### C. Metrics measured against targets
Every target defined in Phase 1 is measured, and the result is compared to the target.

| Level | What it looks like |
|---|---|
| Below bar | Metrics mentioned but not measured, or no targets to compare against. |
| Meets bar | Each Phase 1 target measured and shown as met / not met. |
| Exceeds | Both decision-quality and AI-output metrics measured, met/not-met per target, plus per-profile detail. |

**This project: Exceeds.** Group A (accuracy 83.3% vs 80%, false approval 0% vs under 10%) and
Group B (hallucination 0/24, grounding 100%, latency avg 8.3s / max 15.3s vs 15s) all measured with
a met/not-met column and a per-profile table. Evidence: `eval-results.md`,
`01-scope-and-research/deliverables/03-success-metrics.md`.

### D. Manual verification of outputs
The brief asks specifically for manual verification of each output, not only an automatic check.

| Level | What it looks like |
|---|---|
| Below bar | No verification, or only an automatic pass with no human read. |
| Meets bar | Each output read against ground truth and recorded. |
| Exceeds | Human read against a written scoring rubric, plus an automated grounding check that enforces the trust-critical dimensions in code. |

**This project: Exceeds.** The automated validator enforces faithfulness and grounding
(`validateGrounding`), `output-scoring-rubric.md` defines the manual read, and `manual-rubric-pass.md`
records the completed human read of all 24 explanations on completeness, clarity, and consistency
(24 pass, with one recurring wording note surfaced for a prompt fix). Evidence: `manual-rubric-pass.md`,
`eval-explanations.md`.

### E. Honesty about misses
Failures and mismatches are surfaced and explained, not hidden or tuned away.

| Level | What it looks like |
|---|---|
| Below bar | Only the good numbers shown; mismatches edited out. |
| Meets bar | Misses reported. |
| Exceeds | Misses reported with rationale, and a deliberate decision not to tune the answer key. |

**This project: Exceeds.** The four decision mismatches (GT-08, GT-12, GT-16, GT-21) are listed and
explained as surfaced-not-hidden boundary cases (decision M5); none is a false approval. The latency
miss (max 15.3s) is reported honestly. Evidence: `eval-results.md`.

### F. Iteration evidence
A v1 baseline exists and the path to improve it is clear.

| Level | What it looks like |
|---|---|
| Below bar | A single run with no sense of what to change. |
| Meets bar | A baseline plus a stated next step. |
| Exceeds | Baseline plus specific, prioritized changes tied to the measured gaps. |

**This project: Exceeds.** Baseline is set and `iteration-plan.md` lists the next actions, each tied
to a measured gap and prioritized by leverage (P1: the rule-severity prompt fix and the latency
outlier; P2: independent judge, repeat sampling, robustness batch; P3: grow and slice the set,
second labeler). Evidence: `iteration-plan.md`.

---

## Summary

| Criterion | Bar | Where this project lands |
|---|---|---|
| A. Ground-truth quality | Meets | Exceeds |
| B. Benchmark repeatable | Meets | Exceeds |
| C. Metrics vs targets | Meets | Exceeds |
| D. Manual verification | Meets | Exceeds |
| E. Honesty about misses | Meets | Exceeds |
| F. Iteration evidence | Meets | Exceeds |

Every criterion now Exceeds the bar. The manual rubric pass (D) is recorded in `manual-rubric-pass.md`
and the iteration plan (F) in `iteration-plan.md`. Phase 4 is fully locked.
