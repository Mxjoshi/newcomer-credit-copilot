# Iteration plan: from the v1 baseline to v2

The v1 baseline is measured and recorded (`eval-results.md`, `manual-rubric-pass.md`). This is the
prioritized list of what to change next, each item tied to a specific measured gap, with the
cheapest useful version first. Priority is by leverage over effort, not by size.

## The v1 baseline, in one place

| Metric | Target | v1 measured | Met |
|---|---|---|---|
| Decision accuracy | 80%+ | 20/24 (83.3%) | yes |
| False approval rate | under 10% | 0/24 | yes |
| Hallucination (shown) | 0 | 0/24 | yes |
| Policy grounding | 100% | 100% | yes |
| Latency | under 15s | avg 8.2s, max 15.3s | no (tail) |
| Manual rubric pass | 24 pass | 24 pass, 4 minor notes | yes |

Everything is at target except the latency tail. The work below is about making a strong baseline
more trustworthy and broader, not about fixing a broken one.

## P1: do first (cheap, high leverage)

**1. Prompt refinement for rule severity.** The manual rubric pass found the model labels rule-4
and rule-5 (both `refer`-severity) as "hard" failures or "hard stops" in 4 cases (GT-11, GT-12,
GT-13, GT-15), and in GT-15 understates that the decline is band-driven. The decision is always
correct and every fact traces, so this is wording, not safety. Fix: pass the model each rule's
severity and instruct it to name the risk band when a decline is band-driven, and not to call a
refer-trigger "hard." Verify by re-running `npm run eval` and re-reading those four in the next
`eval-explanations.md`. Effort: small. Expected effect: the 4 Partials clear.

**2. Investigate the latency outlier.** Max latency is 15.3s against a 15s target while the average
is 8.2s, so one case carries the miss. Capture which profile and where the time goes (model call vs
retry vs serialization). If it is a single slow model response, the fix may be a tighter max-tokens
or a timeout-and-retry budget. Verify: max latency under 15s on the next run. Effort: small to
medium.

## P2: strengthen the evaluation itself

**3. Independent judge for the explanation.** Today the same pipeline writes and validates the
explanation, so the rubric pass is partly self-graded. Add a separate judge (a different prompt, or
a different model) that scores completeness, clarity, and consistency, and compare its verdicts to
the human read. Verify: judge and human agree on the 24, disagreements reviewed. Effort: medium.

**4. Sample each case more than once.** The decision is deterministic, but the explanation varies
run to run, so n=1 under-tests it. Run each profile 3 to 5 times and measure how often grounding,
the severity-wording issue, and the rubric scores hold. Verify: a stability number per case.
Effort: small (a loop over the existing harness), but it multiplies model cost.

**5. Robustness batch set.** The in-app prompt-injection probe exists and works
(`how-evaluation-works.md`), but the 24-profile accuracy set has no adversarial rows. Add a small
fixed set (injection in the name field, contradictory inputs, out-of-range values) and assert the
decision is unchanged and the validator blocks invented numbers. Verify: the set passes on every
ruleset change. Effort: medium.

## P3: scale and rigor

**6. Grow and balance the test set.** 24 cases give 83.3% accuracy a wide confidence interval
(roughly 65 to 93%). Thin slices are worse: only 2 credit-card and 1 self-employed case. Add cases
to tighten the interval and cover those slices deliberately. Verify: a narrower interval and at
least a handful of cases per slice. Effort: medium (each case needs a locked label).

**7. Second labeler on a subset.** One person wrote the answer key, so a wrong label could look like
a model error. Have a second person independently label a subset and measure agreement. Verify: an
inter-rater agreement number; reconcile any disagreements. Effort: small to medium, needs a second
person.

**8. Per-slice accuracy.** Report accuracy and false-approval rate broken down by product
(personal loan vs credit card) and by visa type, so a subgroup weakness cannot hide inside the
aggregate. Verify: a slice table in `eval-results.md`. Effort: small (the data is already per-row).

**9. Report accuracy as a range.** State 83.3% with its confidence interval rather than as a point,
so the small-sample uncertainty is visible. Effort: trivial.

## Housekeeping before the pitch

**10. Primary-source the cited regulatory facts.** If the deck cites the AECB 3.71M salary figure
or the CBUAE minimum-salary removal, confirm them at the primary source. They currently rest on
solid secondary reporting (`SPEC.md` section 17, and the to-do in this folder's README). Effort:
small.

## Suggested order

P1 (items 1 and 2) first: they are cheap and close the only missed target and the only rubric note.
Then P2 to make the evaluation itself harder to fool. P3 when there is time to grow the set and add
a second labeler. Item 10 is gated by the pitch, not by the build.
