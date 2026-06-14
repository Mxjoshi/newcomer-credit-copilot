# Newcomer Credit Copilot: Software Specification

This document specifies the Newcomer Credit Copilot: what it is for, who uses it, how it is
built, the rules it enforces, and the guarantees it must hold. It is the single reference for
building, reviewing, and extending the system. Where v1 is intentionally narrower than a
production system, the boundary is stated.

Version 1.0.

---

## 1. Purpose

A credit officer at a UAE bank needs to decide on loan and credit card applications from people
who are new to the country and have little or no local credit history. The bureau file is thin
or empty, so a standard score is not available. The officer needs a decision that is fast,
conservative, and defensible to a manager or to compliance.

The Newcomer Credit Copilot scores the applicant on alternative data, checks the application
against lending policy, and returns an approve, decline, or refer recommendation with an
explanation grounded in the rules. The human makes the final call. The product is an internal
officer console, not a consumer app; the borrower never sees it.

## 2. Goals and non-goals

Goals:
- Produce a conservative, explainable recommendation for a thin-file newcomer.
- Make every recommendation traceable: every number and rule on screen comes from the inputs or
  the policy, never invented.
- Keep policy as configuration, so a value change or a new market is a config change, not a code
  change.
- Keep a defensibility trail: every decision is stamped with the policy version that produced it,
  and every policy change is recorded with a rationale.

Non-goals (v1):
- No real applicant data. Synthetic data only.
- No accounts, login, or roles enforcement. The two user roles are conceptual.
- No server database. Decisions, versions, and logs live in the browser.
- One product per assessment. English only. Web only.

## 3. Users and roles

- Credit officer: the primary user. Enters an applicant, reads the decision, accepts or overrides,
  works the review queue, reviews the audit log. Not technical.
- Policy or risk owner: maintains the lending rules. Reads the policy, creates and activates
  versions with a rationale, runs what-if impact analysis before a change goes live.

The product does not enforce these roles in v1 (no login). They describe who does what.

## 4. Scope: demo versus production

| Capability | v1 (this build) | v2 (production) |
|---|---|---|
| Applicant data | synthetic only | real, with consent and KYC |
| Storage of decisions, versions, logs | browser localStorage | server database, per-user |
| Policy pack | one file on disk, plus in-memory overrides | versioned store, signed, audited |
| Versioning | parameter versions, browser-stored | full ruleset versions, server-stored, approvals |
| Identity | none | authentication and role-based access |
| Bureau and market | UAE pack, synthetic | live AECB and additional market packs |
| Explanation model | Claude Sonnet, server-side | same, with monitoring and rate limits |

## 5. System architecture

A single Next.js (App Router) application. The browser renders the screens and holds the
session data (cases, versions, logs). The server holds the policy pack, the decision engine, and
the one model call, so the API key and the rules never reach the browser.

```
Browser (client)                         Server (Next.js route handlers)
  screens, nav, localStorage   <----->     /api/decide   deterministic core
  cases, policy versions, logs             /api/assess   core + LLM explanation
                                           /api/ruleset  pack summary
                                           /api/impact   champion vs challenger
                                           /api/policy   full live ruleset
                                                  |
                                                  v
                                   Decision engine (pure TypeScript)
                                   scorecard, rules, combination, counterfactuals
                                                  |
                                   Market pack (config/uae/policy-rules.json)
```

Key boundary: the deterministic decision (score, policy checks, recommendation, counterfactuals)
is computed without the model. The model only writes the prose explanation, from data that is
already decided. The model cannot make or change a decision.

## 6. Domain model

The entities, as built in `src/lib/types.ts`.

- Applicant: the person. Five scored fields (months in UAE, visa type, employment status and job
  tenure, employer category, monthly salary, rent history) plus three policy-only fields (existing
  monthly obligations, age, visa months remaining) that the rules use and the score never sees.
- Application: the request (product, amount, term).
- ScoreFactor: one row of the scorecard (factor name, applicant value, threshold, points 0 to 20,
  rationale).
- ScoreResult: all factors, the total, and the risk band (low, medium, high).
- PolicyRule: one rule (id, title, cited rule_text, source section, condition, severity, check
  function).
- PolicyCheckResult: the outcome of one rule (id, passed, cited_text, finding).
- Decision: what the decision screen renders. Recommendation, risk band, ruleset_version,
  explanation, reasons, counterfactuals, the embedded score and policy results, officer action,
  optional override reason, and the validation outcome of the explanation.
- CaseRecord: a kept decision (id, created_at, applicant, application, decision, status, closed_at).
  Refers start awaiting_review; approve and decline start closed.
- PolicyVersion: a saved ruleset version (label, parent, created_at, rationale, parameters,
  is_base).
- PolicyLogEntry: one what-if run on the impact screen (changes, resulting counts, moved count).

Traceability is structural: a Decision physically contains the score and policy results it rests
on, so the explanation can be checked against them line by line.

## 7. The market pack

Policy is configuration. Everything market-specific lives in `config/uae/policy-rules.json` (the
live, editable pack) with `policy-rules.v1.0.json` next to it as the locked reference. A new
market is a new pack folder, not a code change.

A pack contains:
- Identity: market, market_name, ruleset_version, currency, regulator, bureau.
- parameters: product_min_salary (per product), flat_annual_rate, dbr_cap, amount_salary_multiple,
  max_age_at_maturity, min_tenure_months, personal_loan_max_term_months. Each carries a note.
- band_cutoffs: low and high score thresholds, with the rationale.
- rules: an array. Each rule has rule_id, enabled, title, rule_text, source_section, condition,
  severity (hard_fail or refer). Numbers in rule_text and condition are written as placeholders
  (for example {dbr_cap_pct}) and rendered from the parameters at load time, so the cited sentence
  can never disagree with the enforced number.
- scorecard.factors: an array. Each factor has factor_id, enabled, factor_name, a rationale, and
  the tier tables or category maps that map applicant values to points.

The engine keeps only semantics. Rule check functions (`src/lib/policy.ts`) and factor compute
functions (`src/lib/scorecard.ts`) live in code, keyed by id. A pack may only enable a rule or
factor the engine has an implementation for; a pack that enables an unknown one refuses to load,
so there are no silent skips. Rule and factor counts are pack-driven: the screens render one
element per enabled rule and one per enabled factor.

`src/lib/ruleset.ts` validates and builds a typed Ruleset from raw pack JSON. A malformed pack
throws rather than half-loading.

## 8. Decision engine

Deterministic, in `src/lib/scorecard.ts`, `src/lib/policy.ts`, and `src/lib/decision.ts`.

1. Score: each enabled factor produces a ScoreFactor (0 to 20). The five v1 factors are salary
   headroom, employment and tenure, employer category, settledness (months in UAE plus a
   long-term visa bonus), and rent history. The total maps to a band via band_cutoffs (low if
   total >= low cut-off, high if total < high cut-off, otherwise medium).
2. Policy check: every enabled rule runs, producing a PolicyCheckResult with the cited rule text
   and a one-line finding.
3. Combine: any failed hard_fail rule means decline. Otherwise the band maps high to decline,
   medium to refer, low to approve, unless a refer-severity rule failed, which downgrades the
   approve to refer. A refer-severity failure never upgrades a decline (conservative by design).
4. Counterfactuals: for a decline or refer, deterministic lines computing the smallest input
   change that would cross each failed threshold. Never written by the model.

The three policy-only applicant fields feed the rules only and never move the score.

## 9. AI explanation layer

In `src/lib/explain.ts`, implementing the integration spec. One model call per assessment,
Claude Sonnet (`claude-sonnet-4-6`), pinned to an exact version for repeatability.

- Input: only the structured decision data (applicant and application fields, the recommendation
  and band, the score factors, the policy results with cited text, the counterfactuals),
  serialized as JSON. No free text, no documents, no web content.
- Instruction: write one formal paragraph and a short list of reasons, using only the provided
  fields and cited rule text, citing rule ids, inventing nothing, never softening the
  recommendation.
- Output: structured JSON (explanation, reasons), enforced by the structured-output format.

Grounding validator (`src/lib/validator.ts`), deterministic, runs on every response:
- Rule grounding: every rule the text cites must exist in the policy results that were sent in.
- Number grounding: every number in the text must appear in the inputs or the score output
  (formatted variants understood, for example commas and percent display).

Failure handling:
- On a grounding failure: retry once with the issues appended to the prompt.
- If the retry also fails, or the response is not valid JSON: fall back to a deterministic template
  explanation, assembled from the score factors, the failed rules with their cited text, and the
  counterfactuals. The template always passes the validator.
- If no API key is configured: skip the model and use the template (the app runs fully offline,
  and upgrades to model prose the moment a key is present).
- If the model call fails outright (key present, call errors): the route returns an error and the
  UI says plainly that nothing was decided. The system never invents a result to cover an error.

Every decision records its validation outcome (passed, passed_on_retry, fell_back_to_template),
which feeds the Phase 4 hallucination metric.

## 10. Policy versioning

In `src/lib/policyVersions.ts`. The locked v1.0 is the immutable base. Changing a policy value
creates a new version (uae-v1.1, v1.2, ...) with a mandatory rationale, parent, and timestamp.

- The active version drives every assessment: its parameters are sent as overrides to the engine
  routes, which merge them into the pack in memory and relabel the ruleset, so a decision made
  under v1.1 uses the v1.1 values and is stamped uae-v1.1.
- Any version can be made active (rollback to base, or forward to a draft).
- The diff against the parent shows exactly which values changed.
- Decisions are stamped with the version that produced them, so any past decision can be
  reconstructed against the exact policy of the day.

In v1 versions are browser-stored and cover the four editable parameters. v2 would version the
full pack, server-side, with approvals.

## 11. Persistence

- Cases: localStorage, key `newcomer-credit-copilot.cases.v1`. The review queue is the cases with
  status awaiting_review; the audit log is all cases.
- Policy versions: localStorage, plus an active-version pointer.
- Policy change log: localStorage, the what-if runs on the impact screen.
- The locked ground truth (24 profiles) lives in `04-evaluate-and-ship/ground-truth.md`, mirrored
  in `src/lib/groundTruth.ts` for the harness and the impact view. The markdown is the source of
  truth and is never edited by the build.

## 12. API contracts

All routes are server-side. They read the live pack from disk on every request, so a pack edit
takes effect on the next request without a restart.

- POST /api/decide. Body: { applicant, application, overrides? }. Returns { decision } from the
  deterministic core only (no model). Used by the assessment screen for steps 1 and 2, and as a
  fast path.
- POST /api/assess. Body: { applicant, application, overrides? }. Runs the core then the
  explanation layer. Returns { decision } with explanation, reasons, and validation_outcome, or an
  error with status 502 if the model call fails outright.
- GET /api/ruleset. Returns the pack summary: identity, counts, form limits, and the four editable
  parameters (used to seed the base version).
- GET /api/impact. Optional query overrides (dbr_cap, amount_salary_multiple, max_age_at_maturity,
  min_tenure_months) merged in memory. Runs the 24 locked profiles through champion (status quo,
  decline all) and challenger (this product), returns the counts, the accuracy, and per-profile
  rows. No model calls.
- GET /api/policy. Returns the full live ruleset for the Policy view: identity, parameters with
  notes, band cut-offs, rules with rendered cited text, and the scorecard factors with tiers.

overrides shape: { params?: { ...editable parameters }, ruleset_version?: string }. Only the four
documented parameters are overridable; anything else is ignored, so the routes cannot be coaxed
into changing rule logic.

## 13. User interface

Layout: a persistent left navigation rail and a persistent top bar showing the current screen's
name, with the work area on the right.

- Rail: brand, an Overview link, an Assess group (New assessment, Review queue with a count, Audit
  log), a Govern group (Policy, Versions, Policy impact), and the active ruleset at the bottom.
- Top bar: the current screen name and a one-line description, plus the active ruleset version.

Screens:
- Overview: the landing. What the console does, a Start an assessment action, the three-step
  flow, and a card per capability.
- New assessment: the intake form. The five scored applicant fields, the three policy inputs in
  their own labelled group, and the application block. A dropdown loads one of six sample
  scenarios (two of each outcome). Validation runs before anything is sent, including the
  personal loan term cap from the pack.
- Assessment in progress: the visible three-step agent (score, policy check, explain). A summary
  of what was submitted sits on top. A slow notice past 10 seconds. A plain failure state with
  retry, never a fabricated result.
- Decision: the verdict banner and risk level, the why paragraph, the scorecard with a points bar
  per factor, every policy check with its citation, the counterfactuals, and the accept or
  override action. After an action, a confirmation links to the audit log.
- Review queue: refers awaiting a human. Open one to see its full decision and close it.
- Audit log: every assessment and the officer action, read only.
- Policy: the live ruleset, read only.
- Versions: create, activate, and roll back versions, each with a rationale and a diff.
- Policy impact: champion vs challenger on the 24 profiles, with a live what-if (a debt burden
  slider and three more parameters), a change-confirmation strip, moved-row flags, and a change
  log.

## 14. Non-functional requirements

Success metrics (defined in Phase 1, measured in Phase 4 on the locked 24-profile set):

| Metric | Target | Status |
|---|---|---|
| Decision accuracy | 80% or higher | met in the deterministic harness (20 of 24, 83.3%) |
| False approval rate | under 10% | met (0) |
| Refer rate | a function of review capacity, stated | reported (about 42% on the locked set) |
| Hallucination | zero invented facts across the 24-case set | engineered by the validator, to be measured with a key |
| Policy grounding | 100% traceable | engineered by the validator |
| Latency | under 15 seconds per assessment | generous by design, to be measured |

Guarantees:
- The system never invents a result. Ungrounded explanation text never reaches the officer.
- Every number and rule on screen traces to the inputs or the policy.
- A change to a policy value can never make a cited sentence disagree with the enforced number.
- The locked ground truth is never edited by the build; the evals are graded against it unchanged.

## 15. Evaluation

The 24 locked synthetic profiles cover every rule boundary and all three outcomes (8 approve, 8
decline, 8 refer), written and locked before any scoring code existed so the model cannot grade
its own exam. A harness runs them through the deterministic core and reports matches and
mismatches (currently 20 of 24, with four mismatches surfaced rather than tuned away). The impact
view runs the same 24 as champion vs challenger and is the metrics-versus-baseline deliverable
made visible. Group B metrics (hallucination, grounding, latency) require model runs with a key
over the 24 profiles, with each explanation verified by hand.

## 16. Security and data

- No real personal data in v1. Synthetic profiles only.
- The API key is server-side, in `.env.local`, never sent to the browser.
- The pack routes only accept the four documented numeric overrides, so a request cannot change
  rule logic.
- No authentication in v1; production requires it before any real data.

## 17. Assumptions and open items

- Several UAE-standard values (debt burden 50%, 20 times salary, age 65 at maturity) rest on
  solid secondary sources and are flagged for primary-sourcing before the pitch cites them.
- The product minimum salaries and the flat rate used for the installment estimate are stated
  product assumptions.
- The refer rate on the locked set is high relative to a typical review-capacity assumption; this
  is the conservative error stance doing its job and should be stated honestly.

## 18. Future work (v2)

- Analyst overrides captured as feedback signals for rule tuning.
- Full ruleset versioning, server-side, with an approval workflow.
- A second market pack (for example a Saudi pack with SIMAH and SAMA) to prove a market is a pack.
- Real bureau integration and authentication.
- An optional in-app assistant to answer officer questions about a decision or the policy.

---

## Appendix A: Repository layout

The repository is organised by capstone phase at the top level, with the application under
`03-build/app`.

```
AI-Capstone/
  00-reference/             the course brief
  01-scope-and-research/    Phase 1 deliverables (problem, competitors, metrics)
  02-design/                Phase 2 deliverables (UI flow, data model)
  03-build/                 Phase 3 build
    app/                    the Next.js application (below)
  04-evaluate-and-ship/     Phase 4 (ground truth, pitch notes, user journey)
  SPEC.md                   this specification
  README.md
```

The application:

```
03-build/app/
  config/uae/
    policy-rules.json        the live, editable market pack
    policy-rules.v1.0.json   the locked v1.0 reference
  src/
    app/
      page.tsx               the shell: left rail, top bar, screen routing
      layout.tsx, globals.css
      api/
        decide/route.ts      deterministic core only
        assess/route.ts      core plus the LLM explanation
        ruleset/route.ts     pack summary
        impact/route.ts      champion vs challenger, with what-if overrides
        policy/route.ts      the full live ruleset, read only
    components/
      WelcomeView.tsx         the overview landing
      IntakeForm.tsx          Screen 1, intake
      AssessmentProgress.tsx  Screen 2, the visible three steps
      DecisionView.tsx        Screen 3, the decision
      ImpactView.tsx          champion vs challenger and the what-if
      PolicyView.tsx          the live ruleset, read only
      VersionsView.tsx        policy versions
      CaseList.tsx            review queue and audit log
      Brand.tsx, summary.ts   the mark, and the shared summary type
    lib/
      types.ts                the entity shapes
      constants.ts            app constants (model id, storage keys, timeouts)
      ruleset.ts              builds and validates a market pack
      packValidate.ts         shared pack validation helpers
      policy.ts               rule check semantics, keyed by rule_id
      scorecard.ts            factor compute semantics, keyed by factor_id
      decision.ts             combination logic and counterfactuals
      explain.ts              the LLM explanation layer
      validator.ts            the deterministic grounding validator
      livePack.ts             server-side pack loader, with overrides
      cases.ts                CaseRecord storage (review queue, audit log)
      policyVersions.ts       the policy version store
      policyLog.ts            the what-if change log
      samples.ts              the six sample scenarios
      groundTruth.ts          the 24 locked profiles (mirror of the markdown)
  tests/
    core.test.ts             the deterministic core and the market pack
    explain.test.ts          the explanation layer and the grounding validator
    samples.test.ts          asserts each sample lands on its labelled outcome
  scripts/
    harness.ts               runs the 24 profiles through the core
```
