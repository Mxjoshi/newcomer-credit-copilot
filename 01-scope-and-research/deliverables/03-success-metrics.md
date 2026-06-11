# Deliverable 3: Measurable Definition of Success

**Phase 1, Scope & Research.** Status: Locked. Last verified: 2026-06-09.
Format follows the brief's worked example: each line is a named metric with a measurable target.

> **Scope note (honest):** in Phase 1 these targets are defined so they can be measured later. They
> are not measured yet. Running the benchmark and computing the baseline is Phase 4. All Group A
> (credit-quality) metrics will be measured on synthetic sample data, stated plainly. Targets are
> starting points and will be tightened after the Phase 4 baseline.

---

## Group A: is the decision good? (credit quality)

| Metric | Definition | Target |
|---|---|---|
| **Decision accuracy** | % of recommendations matching the correct outcome in the labelled sample set | 80% or higher |
| **False-approval rate** | % of applicants approved who should have been declined (the costly error) | Under 10% (strictest bar) |
| **Refer rate** | % of cases routed to "refer" (borderline, sent to a human) | A function of the bank's manual-review capacity, stated as an assumption, not a fixed number (see below) |

**Why false approval is the strictest target.** A wrong approval loses the whole loan. A wrong
decline loses only the profit margin. The two costs are not equal, so for a v1 newcomer model with no
track record we lean conservative and aim to avoid bad loans. The under-10% false-approval bar is the
direct consequence of that error stance, and it is the number we would defend first to compliance.

**Why refer rate is a capacity function, not a fixed number.** Every referral costs human review
time, so the right refer rate is however many manual reviews the underwriting team can actually staff,
not a universal target. For the demo we state the assumption (for example, "assume capacity for about
15% of applications") rather than claim a hard number. This shows the product lives inside a real
operational constraint.

## Group B: is the AI output trustworthy? (LLM quality)

| Metric | Definition | Target |
|---|---|---|
| **Explanation faithfulness / hallucination** | The explanation cites only facts present in the applicant data and policy | Hallucination under 2% (zero invented facts across the sample set) |
| **Policy grounding** | Every cited rule is traceable to the real policy document | 100% traceable |
| **Latency** | Time to produce a decision | Under 15 seconds per assessment |

Latency is deliberately generous. An officer reviewing an application can wait a few seconds, so speed
is not critical, which also lowers build cost and risk.

---

## Decision to metric traceability (why these and not others)

| Product decision | Metric it drives |
|---|---|
| Avoid bad loans (conservative error stance) | False-approval rate under 10%, the strictest bar |
| Human in the loop (approve, decline, refer) | Refer rate tied to review capacity |
| Explainable, defensible decisions (our differentiator) | Hallucination under 2% and policy grounding 100% |
| Speed not critical (officer can wait) | Latency under 15s (generous) |

This traceability is deliberate. An evaluator should be able to draw a line from each product decision
to the metric that proves it.

## What success looks like, in one line
The tool is right often enough (80% or higher) and rarely wrong in the costly way (under 10% false
approval), while every explanation is faithful and policy-grounded and returned in under 15 seconds,
measured on synthetic data and stated honestly.

---

*Underlying feasibility analysis (the five model-feasibility questions) and the full decision log:
`../working/product-definition.md`, Step 5.*

---

## Amendment (2026-06-11), appended; the locked text above is unchanged

The Phase 2 review locked a 24-case ground-truth set
(`../../04-evaluate-and-ship/ground-truth.md`). With n = 24, a single invented fact is already
4.2 percent, so "hallucination under 2 percent" can only pass at zero. The target is therefore
restated operationally: **zero invented facts across the locked 24-case set**. Same bar as
before, honest arithmetic for the sample size we actually have.

Grounding is also enforced at runtime by a deterministic validator (every cited rule and number
checked against the inputs; retry once, then a template fallback), so this metric is engineered
into the product, not only measured after the fact.
