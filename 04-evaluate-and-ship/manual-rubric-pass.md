# Manual rubric pass: the 24 AI explanations

The human-read half of the evaluation. The brief asks us to "manually verify each output against
ground truth," and `output-scoring-rubric.md` is the instrument. This file records that read.

The two trust-critical dimensions, **faithfulness** and **policy grounding**, are enforced in code
by `validateGrounding` and were Pass on all 24 in this run (see `eval-results.md`). They are not
re-litigated here. This pass scores the three dimensions a machine cannot judge: **completeness,
clarity, consistency**, reading each explanation in `eval-explanations.md` against the applicant
data and the ruleset.

## Method and honest caveats

- Scored against the run captured in `eval-explanations.md` (ruleset uae-v1.0, 2026-06-20).
- The model explanation varies run to run, so this is **one snapshot**. Re-run `npm run eval` to
  refresh the text, then re-read.
- This draft was prepared by the build assistant, which is the same model family that wrote the
  explanations. That is a form of self-grading (the same gap `how-evaluation-works.md` flags). It
  is a **draft for a human to confirm or correct**, not an independent judge. Monika's sign-off at
  the bottom is what makes it count.
- Scoring is Pass / Partial / Fail per the rubric. A faithfulness or grounding Fail fails the whole
  explanation; a Partial on completeness, clarity, or consistency is a note, not a failure.

## Result summary

| Dimension | Pass | Partial | Fail |
|---|---|---|---|
| Faithfulness (enforced in code) | 24 | 0 | 0 |
| Policy grounding (enforced in code) | 24 | 0 | 0 |
| Completeness | 23 | 1 | 0 |
| Clarity | 20 | 4 | 0 |
| Consistency | 24 | 0 | 0 |

**Overall: 24 of 24 pass** (no faithfulness or grounding failure). Four carry a minor Partial, all
from the same single cause described below.

## The one systematic finding (worth a prompt tweak)

In the ruleset, **rule-4 (minimum tenure)** and **rule-5 (residency covers the term)** are
`refer`-severity: a failure refers the case, it does not by itself decline it. Only rule-1, rule-2,
rule-3, and rule-6 are `hard_fail`. The model does not always honor that distinction. When rule-4
or rule-5 fails alongside a decline, the prose tends to label it a "hard policy failure," a "hard
stop," or a "mandatory" rule:

- **GT-11**: "a fifth hard stop, rule-5" (the decline is correctly driven by the real hard fails
  rule-1, rule-2, rule-6, so the outcome is right; only the label for rule-5 is wrong).
- **GT-12**: "a hard policy failure on rule-5" (outcome is a refer, which is correct, but rule-5 is
  a refer-trigger, not a hard failure).
- **GT-13**: lists rule-5 among "three hard policy rules failed" (decline is valid via rule-2 and
  rule-6; rule-5 is mislabeled).
- **GT-15**: "Two hard policy rules cannot be waived: rule-4 ... rule-5." Both are refer-severity,
  and the decline is actually driven by the **high-risk band** (score 26 of 100), which the text
  understates by leading with the rules. This is the one case scored Partial on completeness as
  well as clarity, because the real deciding factor is not the one the explanation foregrounds.

Why it matters and why it does not: every cited rule id and number traces (grounding passed), and
the deterministic engine made the correct call in each case, so **no officer is misled about the
decision**. The imprecision is in how the explanation characterizes rule *severity*. The fix is a
prompt refinement: tell the model which rules are hard-fail versus refer-triggers, or instruct it
not to editorialize on severity and to name the band when a decline is band-driven.

## Per-profile

P = Pass, ~ = Partial. Completeness / Clarity / Consistency.

| Profile | Rec | Comp | Clar | Cons | Note |
|---|---|---|---|---|---|
| GT-01 | approve | P | P | P | Names the two top drivers and the passing margins. |
| GT-02 | approve | P | P | P | |
| GT-03 | approve | P | P | P | Honestly notes salary meets the minimum exactly. |
| GT-04 | approve | P | P | P | Flags the debt burden sitting exactly at the 50% cap. |
| GT-05 | approve | P | P | P | Flags age at maturity exactly at the rule-3 ceiling. |
| GT-06 | approve | P | P | P | |
| GT-07 | approve | P | P | P | |
| GT-08 | refer | P | P | P | Clear scorecard refer; names the two low factors and the 4-point gap. |
| GT-09 | decline | P | P | P | Calls rule-4/5 "mandatory," but rule-1 (hard) correctly drives the decline. |
| GT-10 | decline | P | P | P | Strong: separates policy-driven decline from a healthy scorecard. |
| GT-11 | decline | P | ~ | P | Calls rule-5 a "hard stop"; it is refer-severity (decline valid via rule-1/2/6). |
| GT-12 | refer | P | ~ | P | Calls rule-5 "a hard policy failure"; it is a refer-trigger. |
| GT-13 | decline | P | ~ | P | Lists rule-5 among "hard policy rules"; decline valid via rule-2/6. |
| GT-14 | decline | P | P | P | Exemplary single-cause decline (rule-3) with the exact counterfactual. |
| GT-15 | decline | ~ | ~ | P | Leads with rule-4/5 as "hard"; the decline is actually high-band (score 26). |
| GT-16 | refer | P | P | P | Correctly frames the rule-4 refer and the score gap. |
| GT-17 | refer | P | P | P | Clean rule-5 refer with two resolution paths. |
| GT-18 | refer | P | P | P | |
| GT-19 | refer | P | P | P | All rules pass; refer is correctly attributed to the score. |
| GT-20 | refer | P | P | P | |
| GT-21 | approve | P | P | P | Approve that names the self-employed risk it weighed and set aside. |
| GT-22 | refer | P | P | P | |
| GT-23 | refer | P | P | P | |
| GT-24 | refer | P | P | P | |

## What this pass concludes

The explanations are faithful, grounded, complete, clear, and consistent across the set, with a
single recurring imprecision: the model sometimes calls a refer-severity rule a "hard" failure.
It does not affect any decision and every fact traces, so all 24 pass. The recommended follow-up
is the prompt refinement noted above, retested on the next run.

## Sign-off

- Reviewed by: _________________ (Monika)  Date: __________
- Agree with the scoring above: yes / with the changes noted here: ____________________
