# Newcomer Credit Decisioning Copilot - Product Definition

Living document. Captures the problem definition and product decisions as we make them.
Last updated: 2026-06-06

---

## Step 1: Problem Definition  [LOCKED]

**Problem statement:**
People who are new to the UAE cannot get personal loans or credit cards, even when they are
financially reliable, because the local credit bureau (AECB) has no history on them. Banks have
no quick, consistent way to assess these applicants, so they either reject good customers or
spend manual effort assessing them case by case.

**Four parts:**
- Who: newcomers / expats with thin or no UAE credit file
- What: cannot get personal loans or credit cards
- Why: no local credit history for the bank to assess
- Cost: banks lose good customers or waste manual effort

**Decisions:**
- D1. Problem owner: the bank (primary user is a loan officer). B2B framing.
- D2. Core output: recommendation + explanation, human makes final call (human-in-the-loop).
- D3. Loan product for v1: personal loan / credit card (one focused product).

---

## Step 2: The User  [LOCKED]

**Primary user, Credit Officer at a UAE digital bank (Wio / Liv style):**
Reviews incoming applications for personal loans and credit cards and decides who gets approved.
When a newcomer with no AECB history arrives, there is no score to rely on, so they reject by
default or manually chase documents and make a judgment call. Slow, inconsistent between
officers, loses good customers. Not technical. Wants a fast, trustworthy second opinion they can
defend to their manager and to compliance.

**Secondary user, the applicant:** the subject of the assessment, NOT an operator of the app in v1.

**Decisions:**
- D4. Bank type: digital bank (modern, app-first, newcomer-focused). AI-native demo.
- D5. Access: internal only, officer enters the applicant's data. One user, one screen.

---

## Step 3: Job To Be Done  [LOCKED]

When a newcomer with no UAE credit history applies for a personal loan or credit card, the
credit officer wants to assess their risk quickly and consistently, so they can approve good
applicants without fear and decline risky ones with a clear, defensible reason.

- Trigger: newcomer applies, no AECB history
- Goal: assess quickly and consistently
- Payoff: confident approvals, defensible declines

Maps to the three capabilities: score gives the assessment, policy check gives consistency,
explanation gives defensibility.

---

## Step 4: Scope (in / out)  [COMPLETE]

### 4a. Core flow  [CONFIRMED]
The minimum spine the app must do for the demo:
1. Officer opens one screen, enters a newcomer applicant's details (employment status, salary,
   job tenure, rent payment history, a few other alternative-data fields).
2. System assesses risk: repay vs default judgment + risk level (e.g. low / medium / high).
3. System checks applicant against a small set of lending policy rules (the RAG part).
4. System outputs a recommendation with clear reasons + a plain-language explanation the officer
   can read and defend.
Note: exact alternative-data field list finalized in Phase 2 (data model). Inputs confirmed as
the right kind (alt-data standing in for missing credit history).

### 4b. Score approach + output  [DECIDED]
- D7. Score approach: RULES + LLM, no trained model. Score from sensible thresholds (salary,
  tenure, rent history) plus LLM reasoning. No data science, no training. Fastest, lowest risk,
  demo cannot fail on stage. Defensible because the logic is explainable.
- D8. Output: APPROVE / DECLINE / REFER. "Refer" = send borderline cases to a human. Realistic
  for lending, handles the "AI is unsure" case, shows mature judgment.

### 4c. "Real but appropriately scoped" (replaces deep/light framing)  [CONFIRMED]

Directive from Monika: this must be REAL, close to what banks actually use, and have impact.
Resolved by a key reframe (NOT a compromise):

- D9. The credit substance stays real and bank-grade. What gets MVP-scoped is engineering
  scaffolding only (no login, no real bank integration, sample data), which is what every MVP cuts.

**CORRECTED after research (the old "ML is impossible" framing was too absolute - see
market-and-domain-research.md):**
Do NOT claim ML cannot be trained on no-history borrowers. Evidence: lenders use a blend; ML on
alt-data is a growing approach; BNPL already does ML decisioning on thin files; AECB+Nova Credit
even imports home-country history so "new to country" != "no history".

**Defensible positioning (use this):** Judgmental scorecard on alternative data + policy checks +
EXPLAINABLE decisions is a transparent, regulator-aligned baseline. We chose it because for a
regulated v1 lending decision, explainability and defensibility matter more than a marginal
accuracy gain, and applicant-level data to validate an ML model is thin. Differentiate on
explainability + alt-data + policy-check, AND on serving applicants NOT covered by Nova Credit.

The standing answer to "why not ML": "ML on alternative data is viable and growing. We chose a
transparent judgmental scorecard + policy-check + explainable-decision approach because for a v1
regulated lending decision, explainability and defensibility matter more than a marginal accuracy
gain, and we have thin applicant-level data to validate an ML model on."

**Showcase part:** the explanation / decision-reasoning layer (real, defensible, compliance-style).
**Real but focused:** scoring logic (real judgmental scorecard), policy grounding (real UAE policy,
focused set), agent (fixed 3-step: score -> check policy -> explain).

### 4d. Cut list (what v1 does NOT do)  [CONFIRMED]
Engineering-scaffolding cuts only. None touch the credit logic. Each is a valid v2 item.
- No real bank / core-banking integration. Sample data only.
- No real applicant personal data. Synthetic profiles only.
- No login, accounts, or user management.
- No saved history / database of past decisions. One assessment per session.
  [UPDATE 2026-06-11, M7: partially superseded. Decisions persist in the browser as CaseRecords
  (review queue + audit log); still no server database in v1. See the decision log.]
- One loan product only (personal loan / credit card).
- English only. No Arabic in v1.
- Web only. No mobile app.
- Officer-only. No applicant-facing screen.

**STEP 4 COMPLETE.** Scope locked: core flow (4a) + score/output decisions (4b, D7/D8) +
real-but-scoped framing (4c, D9) + cut list (4d).

---

## PROJECT RATIONALE (for the pitch + "why this project")  [CONFIRMED]

**Why this project:**
- Solves a real, unsolved UAE problem: credit-invisible newcomers locked out of credit despite
  being reliable. [expat % + AECB context: CONFIRMED, see market-and-domain-research.md]
- Builds on Monika's credit and risk domain depth, a genuine differentiator for this problem.
- A portfolio project in the banking and fintech domain.
- Hits Tier 1 / high complexity: score + RAG + agent + explanation. No preset project even
  requires a scoring step.

**Impact statement (for the pitch):**
Newcomers to the UAE are financially reliable but locked out of credit because the bureau has no
file on them. Banks lose good customers and assess these cases slowly and inconsistently. This
product gives a credit officer a fast, consistent, defensible decision on a thin-file applicant
in minutes, using the alternative-data approach the industry actually relies on. It widens credit
access for newcomers and wins the bank good customers it would otherwise reject.

**Meets the PPT bar (no disqualification):**
- Bring-your-own project: allowed. Qualifies.
- Phase 3 "at least one live LLM use case": explanation layer + policy check. Cleared.
- Phase 4 evals: rules+LLM produces measurable, testable outputs -> real metrics on ~20 samples.
  [UPDATE 2026-06-11: now 24 samples, locked early in 04-evaluate-and-ship/ground-truth.md (M5).]
- Only real risk is timeline/stalling -> the scoping we are doing removes it. Over-building is
  the actual disqualification risk, not under-building.

## Step 5: Success Definition / Model Feasibility  [COMPLETE]

The five feasibility questions every AI model must answer before you commit to it.
(Course: Week 6 MVP feasibility + Week 7 evals.)

**Q1. What's it deciding?  [ANSWERED]**
One binary call: is this newcomer applicant likely to repay, or likely to default.

**Q2. What does a wrong answer cost? (the big one)  [DECIDED]**
Two ways to be wrong:
- False approval: approve someone who defaults. Bank loses the loan amount (large).
- False decline: decline someone who would have repaid. Bank loses the profit margin (smaller).
The two costs are not equal: a bad approval loses the whole loan, a missed customer loses only
the margin.
- D6. Error stance: AVOID BAD LOANS (conservative). For a v1 newcomer model with no track
  record, lean conservative: rather decline a few good applicants than approve a defaulter.
  Strongest lending-credibility story, easiest to defend to compliance.

**Q3. How often is it right? (checked against Q2)  [TARGET NOW, MEASURE LATER]**
Accuracy alone is not the bar. The bar is: right often enough AND rarely wrong in the costly
way (false approvals). Real numbers measured later on sample data. See 04-evaluate-and-ship.

**Q4. Can we actually run it?  [ANSWERED]**
Yes, buildable with available tools (built with Claude Code as the engineering pair). Speed is NOT critical: an officer
reviewing an application can wait a few seconds, so no expensive low-latency infrastructure
needed. Lowers cost and build risk.

**Q5. Is it worth the money?  [PARKED -> 04-evaluate-and-ship]**
Final go/no-go gate. Value (good loans won, officer time saved) vs cost (build + run). Needs real
evaluation numbers first. Answered honestly near the presentation.

### Success Metrics (written in the course's threshold format)  [LOCKED]
Each = named metric + measurable target. Two groups. All Group A measured on SYNTHETIC sample
data (stated plainly). Targets are starting points; tighten after Phase 4 baseline.

**Group A - Is the decision good? (credit-quality)**
- Decision accuracy: % of recommendations matching the correct outcome in the sample set. Target: 80%+.
- False approval rate: % approved who should have been declined (the costly error, per D6). Target: <10%. (Strictest bar, directly from D6.)
- Refer rate: % of cases routed to "refer". Target is a FUNCTION OF THE BANK'S MANUAL-REVIEW
  CAPACITY, not a fixed quality number. Every referral costs human review time, so the right rate
  = however many manual reviews the underwriting team can staff. For the demo, state the assumption
  explicitly (e.g. "assume capacity for ~15% of applications") rather than a hard target. [Monika's
  catch: the number depends on bank capacity. Stronger answer - shows the product lives inside an
  operational constraint. Good presentation point.]

**Group B - Is the AI output trustworthy? (LLM-quality, mirrors brief's example)**
- Explanation faithfulness / hallucination: explanation cites only facts present in applicant data + policy. Target: hallucination <2% (0 invented facts in sample set). [UPDATE 2026-06-11: restated as zero invented facts on the locked 24-case set; with n=24 anything above zero already exceeds 2%. Dated amendment in deliverables/03-success-metrics.md.]
- Policy grounding: cited rules traceable to the real policy document. Target: 100% traceable.
- Latency: time to produce a decision. Target: <15s per assessment. (Generous - speed not critical, per Q4.)

Note: false-approval being the strictest target is the visible consequence of D6. Decision ->
metric traceability is deliberate (what a sharp evaluator looks for).

**STEP 5 COMPLETE.**

## Step 6: Key Product Decisions  [superseded - decisions D1-D9 captured inline above + in MEMORY.md decision log]

---

## Open items to verify (per accuracy standard)  [RESOLVED 2026-06-07/09]
- AECB credit score range → CONFIRMED 300-900. (market-and-domain-research.md)
- UAE expat population percentage → CONFIRMED ~88% (88.5% 2024). (market-and-domain-research.md)
- List of active UAE lenders / digital banks / BNPL → CONFIRMED via Top-5 competitor research.
All three are now sourced. Remaining peripheral unverified items + their Phase-1 disposition live in
market-and-domain-research.md (none are load-bearing for Phase 1).
