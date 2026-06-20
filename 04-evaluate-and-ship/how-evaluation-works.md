# How the evaluation works (demo prep)

The one document to read before the demo. It explains what an evaluation is, walks one applicant
through it using this app's real output, shows what was measured, and lists what a rigorous
evaluator would check next, with our coverage marked honestly. The last section is the anticipated
demo Q&A.

---

## What an evaluation is, in one line

An evaluation answers one question: **how good is the system, measured against answers we already
trust?** It is not a single test. It is five parts working together.

| Part | Plain meaning | Where it lives |
|---|---|---|
| 1. Test set | The exam questions: a fixed set of inputs | `ground-truth.md`, 24 profiles |
| 2. Answer key | The right answer per input, decided by a human, locked before tuning | the `expected_outcome` + `rationale` columns |
| 3. System under test | The thing being graded | decision engine + LLM explanation pipeline |
| 4. Scoring | Compare each output to its answer | two flavors, below |
| 5. Metrics + comparison | Roll scores into numbers, compare to pre-set targets | `eval.ts` -> `eval-results.md` |

The single most important discipline: the answer key was **locked on 2026-06-11, before any
scorecard weight existed.** That ordering is what makes the result trustworthy. The exam was
written before the student could see it.

## Scoring has two flavors (this is where the rubric fits)

The system produces two kinds of output, scored differently:

- **The decision** (approve / decline / refer) has one right answer. Scoring is equality: does it
  match the label, yes or no. **No rubric needed.**
- **The explanation** (free text) has no single correct version. "Is it good?" is a judgment, so
  we use a **rubric** (`output-scoring-rubric.md`) to score it the same way every time:
  faithfulness, grounding, completeness, clarity, consistency.

So the rubric is the ruler for the subjective half. It is one tool inside the evaluation, not the
evaluation itself.

## One applicant, end to end (real output)

**GT-08, Maria Santos.** Label: approve. This is the most instructive case because the system
disagrees with the label.

1. **Input:** SME employer, salary AED 9,500, asks for AED 20,000 over 12 months.
2. **Answer key:** approve (modest ask, clean record).
3. **System output (live):** REFER, score 66 of 100, just under the 70-point low-risk cutoff.
   Explanation: all six rules pass, debt burden a comfortable 18.9 percent, but salary and SME
   employer each score only 8 of 20, holding the total below 70.
4. **Scoring:**
   - Decision: `refer != approve`, so this counts as one of the 4 accuracy misses.
   - Explanation against the rubric: every number traces (66/100, 18.9 percent, 8/20), no invented
     fact, the deciding factor is named, an officer knows what to check. **Explanation passes.**
5. **What it tells us:** the "miss" is a conservative refer of a thin-but-clean profile, not a
   false approval. The gap between "did not match the label" and "did something wrong" is exactly
   what an evaluation is meant to surface. We report it, we do not tune it away (decision M5).

## What we measured (current baseline)

From `eval-results.md`, ruleset uae-v1.0, 24 profiles through the real pipeline:

| Group | Metric | Target | Measured | Met |
|---|---|---|---|---|
| A | Decision accuracy | 80%+ | 20/24 (83.3%) | yes |
| A | False approval rate | under 10% | 0/24 (0%) | yes |
| B | Hallucination (invented facts shown) | 0 | 0/24 | yes |
| B | Policy grounding (traceable) | 100% | 100% | yes |
| B | Latency | under 15s | avg 8.3s, max 15.3s | no (tail) |

The four decision misses (GT-08, GT-12, GT-16, GT-21) are boundary cases; none is a false
approval. Faithfulness and grounding are not only measured, they are **enforced in code**: the
validator rejects ungrounded drafts, retries, and falls back to a template, so no ungrounded text
can reach the officer.

## What a rigorous evaluator checks next (our coverage, honest)

A frozen-labeled-set accuracy run is the core. A full evaluation has more layers. Here is the
checklist and where we stand.

| Layer | What it asks | Our status |
|---|---|---|
| Test-set size | Is 24 enough? | Partial. 83.3% has a wide interval (~65-93%). Report accuracy as a range. |
| Thin slices | Are all subgroups tested? | Gap. Only 2 credit-card and 1 self-employed case. |
| Single labeler | Could a wrong label look like a model error? | Gap. One labeler, no second-rater agreement. |
| Grounding meaning | Does "100% grounded" mean correct? | Note. Grounding = traceable, not necessarily the right number to cite. |
| Self-grading | Does the system grade its own explanation? | Gap. Same pipeline generates and validates. An independent judge is stronger. |
| Sampling | Is one run per case enough? | Gap. The decision is deterministic; the explanation varies run to run, so n=1 under-tests it. |
| Robustness | What about bad or hostile input? | Covered in-app, batch set pending. A one-click prompt-injection probe (the "Try a prompt-injection attack" button on the intake screen) loads an applicant whose name field hides an instruction to approve and to report a fake salary; live, the decision stays decline and the validator blocks the fake number (outcome: passed_on_retry, so the guardrail visibly fires). The 24-profile accuracy set still has no adversarial rows; a batch robustness set is future work. |
| Slices / fairness | Does accuracy hold per subgroup? | Gap. No per-product or per-visa breakdown yet. |
| Latency tail | Does the slowest case meet the SLA? | Gap. Max 15.3s breached the 15s target once. |
| Process | Targets pre-set, set frozen, limits documented? | Strong. All done in Phase 1 and here. |

## Anticipated demo Q&A

**"How did you evaluate this?"**
A frozen set of 24 human-labeled profiles, labels locked before any weights existed, run through
the real pipeline. We measure decision accuracy and false-approval rate for the credit call, and
hallucination, grounding, and latency for the AI explanation, against targets we set in Phase 1.

**"Your accuracy is only 83 percent. Isn't that low?"**
The four misses are all boundary cases and none is a false approval, which is the costly error.
Three are conservative refers of borderline profiles. We chose not to tune the model against the
answer key, so a miss is information about a hard case, not a bug we hid.

**"How do you know the AI explanation isn't making things up?"**
Two ways. We measure it (0 invented facts across 24), and we enforce it: a validator checks every
explanation against the source data and rules, retries an ungrounded draft, and falls back to a
template if needed. No ungrounded text reaches the officer.

**"What happens with bad or malicious input?"**
The LLM only explains; it never makes the decision. We tested an injection in the applicant name
field telling the system to approve and to fake the salary. The system still declined and used the
real salary. The decision logic is deterministic and the validator blocks invented numbers.

**"What are the limitations?"**
Stated plainly: 24 cases is a small set, the data is synthetic, some subgroups (credit cards,
self-employed) are thinly covered, one labeler wrote the key, and the explanation varies run to
run so a single sample under-tests it. The robustness suite and slice breakdown are the next work.

**"What would you do with more time?"**
Independent judge for the explanations, a larger and more balanced set, per-subgroup accuracy, and
a standing robustness suite run on every ruleset change.
