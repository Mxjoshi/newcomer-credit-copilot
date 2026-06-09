# Deliverable 3 — Measurable Definition of Success

**Phase 1 · Scope & Research** · Status: LOCKED · Last verified: 2026-06-09
Format follows the brief's worked example: each line is a **named metric + a measurable target**.

> **Scope note (honest):** In Phase 1 these targets are *defined so they can be measured later*. They
> are **not measured yet** — running the benchmark and computing the baseline is Phase 4. All Group A
> (credit-quality) metrics will be measured on **synthetic sample data**, stated plainly. Targets are
> starting points and will be tightened after the Phase 4 baseline.

---

## Group A — Is the *decision* good? (credit-quality)

| Metric | Definition | Target |
|---|---|---|
| **Decision accuracy** | % of recommendations matching the correct outcome in the labelled sample set | **≥ 80%** |
| **False-approval rate** | % of applicants approved who should have been declined — the costly error | **< 10%** (strictest bar) |
| **Refer rate** | % of cases routed to "refer" (borderline → human) | **A function of the bank's manual-review capacity**, stated as an assumption, not a fixed quality number (see below) |

**Why false-approval is the strictest target.** A wrong approval loses the *whole loan*; a wrong
decline loses only the *profit margin*. The two costs are not equal, so for a v1 newcomer model with
no track record we lean conservative — **avoid bad loans**. The < 10% false-approval bar is the direct,
visible consequence of that error stance, and it's the number we'd defend first to compliance.

**Why refer rate is a capacity function, not a fixed number.** Every referral costs human review time,
so the "right" refer rate is however many manual reviews the underwriting team can actually staff —
not a universal target. For the demo we state the assumption explicitly (e.g. "assume capacity for
~15% of applications") rather than claim a hard number. This shows the product lives inside a real
operational constraint.

## Group B — Is the *AI output* trustworthy? (LLM-quality)

| Metric | Definition | Target |
|---|---|---|
| **Explanation faithfulness / hallucination** | The explanation cites only facts present in the applicant data + policy | **Hallucination < 2%** (0 invented facts across the sample set) |
| **Policy grounding** | Every cited rule is traceable to the real policy document | **100% traceable** |
| **Latency** | Time to produce a decision | **< 15s** per assessment |

Latency is deliberately generous: an officer reviewing an application can wait a few seconds, so speed
is not critical — which also lowers build cost and risk.

---

## Decision → metric traceability (why these and not others)

| Product decision | Metric it drives |
|---|---|
| **Avoid bad loans** (conservative error stance) | False-approval rate < 10% — the strictest bar |
| **Human-in-the-loop** (approve / decline / **refer**) | Refer rate tied to review capacity |
| **Explainable, defensible decisions** (our differentiator) | Hallucination < 2% + policy grounding 100% |
| **Speed not critical** (officer can wait) | Latency < 15s (generous) |

This traceability is deliberate: a sharp evaluator should be able to draw a line from each product
decision to the metric that proves it.

## What success looks like, in one line
The tool is right often enough (**≥ 80%**) *and* rarely wrong in the costly way (**< 10%
false-approval**), while every explanation is **faithful and policy-grounded** and returned in
**under 15 seconds** — measured on synthetic data, stated honestly.

---

*Underlying feasibility analysis (the five model-feasibility questions) and the full decision log:
`../working/product-definition.md`, Step 5.*
