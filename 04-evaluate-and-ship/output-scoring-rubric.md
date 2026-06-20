# Output Scoring Rubric: AI Explanations

How each model-written explanation is scored during the eval. This is the manual-verification
instrument the brief asks for ("manually verify each output against ground truth"). It runs on the
24 explanations produced for the locked profiles in `ground-truth.md`.

Two things are being judged, and they are kept separate:
- the **decision** (approve / decline / refer) is scored by exact match against the ground-truth
  label, no rubric needed, just yes/no.
- the **explanation text** is judged on the five dimensions below, because text quality is not a
  single yes/no.

A profile's explanation **passes overall** only if every dimension is Pass. A single Fail on
faithfulness or grounding fails the whole explanation, because those are the trust-critical ones.

---

## The five dimensions

### 1. Faithfulness (no invented facts)
Every fact stated about the applicant (salary, tenure, obligations, visa, amount, term) appears in
the applicant data. Nothing is invented, rounded into a different number, or assumed.

| Level | Meaning |
|---|---|
| Pass | Every applicant fact in the text is present in the input data, unchanged. |
| Partial | All facts are real but one is imprecise (a number paraphrased loosely, no new fact). |
| Fail | Any fact is invented, altered, or not present in the input. |

### 2. Policy grounding (every rule and number traceable)
Every rule cited and every threshold mentioned traces to the real ruleset. No rule is invented and
no cut-off is misquoted.

| Level | Meaning |
|---|---|
| Pass | Every rule and threshold cited matches the ruleset exactly and is relevant to this case. |
| Partial | Rules are correct but one threshold is stated vaguely (right rule, fuzzy number). |
| Fail | A rule is invented, a threshold is wrong, or a cited rule does not apply to this case. |

### 3. Completeness (covers the deciding factors)
The explanation names the factor(s) that actually drove the decision. For a decline or refer, the
binding rule or risk signal is stated. For an approve, the explanation does not have to list every
passing rule, but must not omit a material risk.

| Level | Meaning |
|---|---|
| Pass | The deciding factor is stated; no material factor is omitted. |
| Partial | The deciding factor is present but a secondary relevant factor is missing. |
| Fail | The actual reason for the decision is not stated, or a material factor is omitted. |

### 4. Clarity (an officer can act on it)
Plain, specific language. A credit officer reading it knows why the decision was made and what,
if anything, a human reviewer should check next.

| Level | Meaning |
|---|---|
| Pass | Clear, specific, no jargon that obscures the reason; a refer states what to verify. |
| Partial | Understandable but vague or padded in places. |
| Fail | Confusing, generic, or could apply to any applicant. |

### 5. Decision consistency (text agrees with the call)
The explanation supports the same outcome the system reached. It does not argue for approve while
the decision is decline, and it does not hedge in a way that contradicts the recommendation.

| Level | Meaning |
|---|---|
| Pass | The text and the recommendation point to the same outcome. |
| Partial | Mostly consistent but contains a sentence that muddies the call. |
| Fail | The text implies a different outcome than the recommendation. |

---

## How to apply it

1. Open the eval run output (or the app on each profile) and read the explanation next to the
   applicant data and the ruleset.
2. Score the five dimensions. Record the lowest as the overall result for that profile.
3. Faithfulness or grounding Fail = explanation fails, regardless of the others.
4. Log any Partial or Fail in `eval-results.md` with the profile id and one line on why. A clean
   run is 24 Pass.

## Relationship to the automated validator

The app already runs a deterministic `validateGrounding` check that enforces dimensions 1 and 2
(faithfulness and grounding) before any text reaches the officer: ungrounded drafts are retried,
and a failed retry falls back to a template. So those two dimensions are **enforced in code**, not
only scored here.

This rubric still matters because the validator cannot judge dimensions 3, 4, and 5 (completeness,
clarity, consistency). Those need a human read. The validator stops bad facts from shipping; the
rubric confirms the explanation is actually useful. Run both.

## Scope and honesty

Scored on 24 synthetic profiles, stated as synthetic. The set is engineered for boundary coverage
(8 approve / 8 decline / 8 refer), not as a claim about real-world outcome rates.
