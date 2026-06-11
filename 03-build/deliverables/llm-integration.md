# Phase 3 Deliverable: LLM Integration Spec (the explanation layer)

Drafted 2026-06-11 during the Phase 2 review, ahead of the build, because the revised data model
now fixes every shape this spec needs. Phase 3 implements it; wording of the final prompt may be
tuned there, the contract below may not. Follows the brief's worked-example shape: input, then
prompt, then structured output, then how the output is checked.

**The one live LLM use case (the brief's requirement):** writing the explanation. The score, the
policy results, the recommendation, and the counterfactuals are all computed deterministically
before the LLM is called. The model describes the decision; it cannot make or change it.

---

## Input: structured decision data only, never free text

The prompt context is exactly these blocks of structured data, serialized as JSON. Nothing else
ever enters the prompt: no officer free text, no applicant documents, no retrieved web content.

1. **Applicant and Application fields** as entered on Screen 1 (the five scored fields, the
   three policy-only inputs, product, amount, term).
2. **The computed recommendation and risk band** (approve / decline / refer, low / medium / high).
3. **ScoreResult**: all five ScoreFactors (value, threshold, points, rationale) and the total.
4. **PolicyCheckResults**: every rule, pass or fail, with rule_id and the cited rule text.
5. **Counterfactuals**: the deterministic what-would-change lines (present only for decline or
   refer, an empty list for approve).

Keeping free text out of the input is a design control, not a convenience: it means every fact
the model could possibly state has a structured source the validator can check against.

## Prompt: what the model is instructed to do

The instruction, in summary (exact wording finalized in Phase 3 code):

> You are drafting a credit decision explanation for a loan officer at a UAE digital bank. Using
> ONLY the fields, score factors, policy results, and counterfactual lines provided, write:
> 1. One formal paragraph explaining the recommendation, plain language, suitable for the
>    officer to read aloud to a manager or to compliance.
> 2. A short list of reasons, each one a single driver of the outcome.
> Reference only the provided field values and the cited rule text. When you mention a policy
> rule, cite its rule_id and quote its rule_text. Do not introduce any number, name, rule, or
> fact that is not in the provided data. Do not soften or change the recommendation.

Tone per decision U3: plain language, formal structure.

## Output: structured JSON

```json
{
  "explanation": "one formal paragraph, as specified above",
  "reasons": [
    "salary is comfortably above the product minimum",
    "tenure of 3 months is below the 6 months rule 4 requires"
  ]
}
```

The two fields map 1:1 onto Decision.explanation and Decision.reasons in the data model. The
response is requested and parsed as JSON only; anything unparseable counts as a validation
failure below.

---

## Validator: the output is checked before anyone sees it

A deterministic post-check runs on every LLM response (data model, derivation step 7). Two
checks:

1. **Rule grounding:** every rule_id the text cites must exist in the PolicyCheckResults that
   were sent in. A cited rule that was never checked is a failure.
2. **Number grounding:** every number in the explanation and reasons must appear in the inputs
   (applicant, application, counterfactuals) or in the score output (points, totals,
   thresholds). An unmatched number is a failure.

**On failure:** retry once, with the validation failure appended to the prompt so the model can
correct it. If the retry also fails, fall back to a deterministic template explanation assembled
from the ScoreFactors, the failed rules with their cited text, and the counterfactual lines. The
officer never sees ungrounded text; at worst they see a plainer, fully grounded paragraph.

**Logging for Phase 4:** every assessment records the validation result (passed first time,
passed on retry, fell back to template). These logs feed the Phase 4 evals directly: the
hallucination metric (zero invented facts on the locked 24-case set, see the 2026-06-11
amendment in `../../01-scope-and-research/deliverables/03-success-metrics.md`) is both enforced
at runtime and measured after the fact.
