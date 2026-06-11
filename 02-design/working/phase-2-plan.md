# Phase 2 Plan and Brainstorm

Working document, not a deliverable. Created 2026-06-10 at the start of Phase 2.
Purpose: confirm what Phase 2 must produce, brainstorm the design space, and mark the product
decisions Monika needs to make before the deliverables get written.

---

## 1. Pre-flight: is Phase 1 actually done?

Yes. `01-scope-and-research/phase-1-signoff.md` (signed 2026-06-09) confirms all three brief
deliverables exist as clean, locked, fact-verified documents:
1. Problem statement (one problem, rests on 3 confirmed facts)
2. Competitor notes (top 5 plus appendix, every fact re-verified)
3. Measurable success metrics (threshold format, matches the brief's worked example)

Nothing from Phase 1 is open. Cleared to design.

---

## 2. What Phase 2 must produce (the list)

Brief deliverable, in its own words: *"An end-to-end UI flow (review milestone) and a first-pass
data model."* Note the order: UI flow first, data model follows from it. Note also "review
milestone": the UI flow gets shown and reviewed, so it must be presentable on its own.

The two graded artifacts, to be created in `02-design/deliverables/`:
1. `01-ui-flow.md`: the full officer journey, screen by screen.
2. `02-data-model.md`: first-pass entities and relationships behind those screens.

"First-pass" is the brief's own word: this can change in Phase 3 when we build. Do not gold-plate.

---

## 3. UI flow brainstorm

### 3a. What the flow must cover (fixed by Phase 1 decisions)

One user (credit officer, not technical, per D1/D5), one journey, no login, no saved history
(cut list). The spine is already locked in product-definition Step 4a:

1. Officer enters a newcomer applicant's details on one screen.
2. System scores risk (rules + LLM judgmental scorecard, D7).
3. System checks the applicant against a small set of policy rules (the RAG part).
4. System outputs APPROVE / DECLINE / REFER (D8) with reasons and a plain-language explanation.

The showcase is the explanation and decision-reasoning layer (D9, and the Phase 2 README repeats
it). So the decision screen is the hero screen. Design effort goes there, not into the form.

### 3b. Candidate flow shapes (pick one)

**Option A, single page that grows.** Form at top, officer hits "Assess", results render below on
the same page. Pro: simplest to build, zero navigation. Con: the decision (our showcase) shares a
page with a form, demos less cleanly, long scroll.

**Option B, three screens: Intake, then Assessment-in-progress, then Decision. [RECOMMENDED]**
- Screen 1, Intake: the applicant form plus a "load sample applicant" shortcut for the demo.
- Screen 2, Assessment in progress: shows the agent's three steps live as they run
  (Score, then Policy check, then Explain). Each step ticks done with a one-line result.
- Screen 3, Decision: the hero. Big APPROVE / DECLINE / REFER verdict, then the full reasoning.
Pro: the progress screen makes the 3-step agent visible (great demo moment, builds trust, shows
the architecture without slides), and the decision gets a clean dedicated screen. Con: slightly
more build than A, but it is the same components split across routes.

**Option C, dashboard with a case queue.** Rejected without further thought: the cut list says no
saved history and one assessment per session, so there is nothing to put in a queue. Listed here
only so we remember why it is out.

Recommendation: Option B. It is barely more work than A and it turns our two differentiators
(visible reasoning steps, defensible explanation) into things the eye can see.

### 3c. The hero screen (Decision) contents, brainstorm

Ordered by what the officer needs first:
1. **Verdict banner:** APPROVE / DECLINE / REFER plus risk level (low / medium / high). Color-coded.
2. **Why, in one paragraph:** the plain-language explanation, written so the officer can read it
   aloud to a manager or to compliance. This is the showcase artifact.
3. **Scorecard breakdown:** each factor (salary, tenure, rent history, etc.), the applicant's
   value, the threshold it was judged against, and how it moved the score. Transparent, no black box.
4. **Policy check results:** each rule checked, pass or fail, with the rule's actual text cited
   (traceable, per the 100% policy-grounding metric).
5. **Officer action row:** Accept recommendation / Override / Start new assessment. Override
   matters: D2 says the human makes the final call, the UI must show that, even if v1 just
   records the choice on screen.

### 3d. States the flow must handle (so the demo cannot be embarrassed)

- **REFER outcome:** not an error, a first-class result. Show what the officer should verify
  manually and why the system was unsure. This is the D8 maturity story.
- **Policy fail on a good score:** an applicant who scores well but trips a policy rule. Decision
  shows DECLINE (or REFER) with the rule cited. Proves policy actually gates the score.
- **Missing or nonsense input:** form validation before anything runs. Cheap, prevents bad demos.
- **LLM slow or down:** progress screen needs a graceful "taking longer than usual" state.
  Latency target is generous (<15s) but the demo should not hang silently.

### 3e. Open UI decisions for Monika (product calls, not engineering)

- **U1. Flow shape:** Option A or B (recommendation: B). 
- **U2. Show agent steps live on the progress screen?** (recommendation: yes, it is the free demo
  moment; cut only if Phase 3 timeline bites)
- **U3. Tone of the explanation paragraph:** compliance-formal vs plain-conversational
  (recommendation: plain with formal structure, the officer reads it to humans)
- **U4. Does v1 show the officer override on screen?** (recommendation: yes as buttons, no
  persistence behind them, consistent with the cut list)

---

## 4. Data model brainstorm (first pass)

Follows the UI, per the brief's ordering. No database in v1 (cut list: one assessment per
session), but the entities still define every shape the app passes around, and they become the
Phase 3 code structure. Plain-language entity sketch:

- **Applicant:** the synthetic person. Name, nationality, months in UAE, visa/residency type,
  employment status, employer name and category, monthly salary, job tenure, housing status,
  rent payment history, plus whatever alt-data fields D-list below confirms.
- **Application:** what they are asking for. Product (personal loan or credit card, D3), amount,
  term. One applicant has one application in v1.
- **ScoreFactor:** one row per scorecard input. Field name, applicant's value, threshold, points
  awarded, one-line rationale. A set of these plus a total and a risk level = **ScoreResult**.
- **PolicyRule:** id, rule text, source (the policy doc section), and the machine-checkable
  condition. Small set in v1.
- **PolicyCheckResult:** rule id, pass / fail, the cited rule text, one-line finding. One per rule.
- **Decision:** the verdict (APPROVE / DECLINE / REFER), risk level, the explanation paragraph,
  the list of reasons, links to ScoreResult and PolicyCheckResults (traceability is a metric),
  and the officer's final action (accept / override) once clicked.

Relationships in one line: Applicant has one Application; Application produces one ScoreResult
(made of ScoreFactors) and many PolicyCheckResults (one per PolicyRule); ScoreResult plus
PolicyCheckResults produce one Decision.

### 4a. The input-field list (the named Phase 2 homework)

Product-definition 4a says: "exact alternative-data field list finalized in Phase 2." Candidate
list to finalize, with care flags from the verified-facts ledger:

| Field | Keep? | Notes |
|---|---|---|
| Monthly salary | Yes | Core. AECB itself now holds salary data, so it is industry-standard. |
| Employment status + job tenure | Yes | Core stability signal. |
| Employer category (free zone / mainland / government, or employer tier) | Likely | Real UAE underwriting signal, demos domain depth. |
| Months in UAE / visa type | Yes | Defines the newcomer segment itself. |
| Rent payment history | Yes, officer-entered | CAREFUL: never claim this comes live from AECB/Ejari (ledger: emerging only). It is data the officer collects from the applicant. |
| Existing bank balance / savings pattern | Maybe | Plausible officer-collected field, adds richness. |
| Home-country credit indicator | Probably NO | Overlaps Nova Credit; our positioning is serving applicants NOT covered by it. Discuss. |
| Remittances | NO | Ledger says do not claim remittances as a scoring input. Out. |
| Education level | Maybe | Used in some thin-file models but weak and debatable; cut if in doubt. |

Decision for Monika: **M1, confirm the final field list** (recommendation: the five Yes/Likely
rows, plus savings pattern if the scorecard wants a sixth factor; drop home-country credit and
education).

### 4b. Open data-model decisions

- **M2. How many policy rules in v1?** Recommendation: 5 to 8. Enough to make the policy check
  real and to produce a policy-fail demo case, few enough to keep grounded and testable.
- **M3. Score representation:** named bands only (low / medium / high) vs a numeric score that
  maps to bands. Recommendation: numeric points mapped to bands, because the scorecard breakdown
  on the hero screen needs visible per-factor points anyway.

---

## 5. Work plan for the Phase 2 week

Order matters: UI flow is the review milestone and the data model depends on it.

1. Monika answers U1-U4 and M1-M3 (one short session, recommendations are pre-loaded above).
2. Write `deliverables/01-ui-flow.md`: screen-by-screen journey, including the four edge states,
   with simple text/ASCII wireframes per screen. Review it (the milestone).
3. Write `deliverables/02-data-model.md`: entities, fields, relationships, one diagram, the
   finalized input-field list, and the v1 policy-rule list (titles at least).
4. Update the Phase 2 README and MEMORY.md status, then a short phase-2 sign-off mirroring the
   Phase 1 one.

Scope guard (standing rule 4): no visual design tools, no clickable prototype, no extra screens,
no Arabic, no applicant-facing anything. Markdown wireframes are enough for the review milestone.

---

## 6. Decisions queue (resolved 2026-06-10)

Monika called the two shaping decisions directly; the rest adopt the recommendations above as
defaults (she can override any of them at the review milestone).

| # | Decision | Outcome | How decided |
|---|---|---|---|
| U1 | Flow shape | Option B, three screens (intake, assessment in progress, decision hero) | Called by Monika |
| M1 | Final input-field list | The core five: monthly salary; employment status + job tenure; employer category; months in UAE + visa type; rent payment history (officer-entered). No savings pattern, no home-country credit, no education. | Called by Monika |
| U2 | Show agent steps live | Yes | Default adopted |
| U3 | Explanation tone | Plain language, formal structure | Default adopted |
| U4 | Officer override visible in v1 | Yes, buttons only, no persistence | Default adopted |
| M2 | Policy rule count | 5 to 8 | Default adopted |
| M3 | Score representation | Numeric points mapped to low/medium/high bands | Default adopted |

With these set, both deliverables are unblocked.

### Added at the review milestone (2026-06-11)

Monika reviewed both deliverables on 2026-06-11 and called three further decisions. The scored
set is untouched: M1 stays exactly five scored factors.

| # | Decision | Outcome | How decided |
|---|---|---|---|
| M4 | Policy-only input fields | Three officer-entered fields feed policy rules only and are never scored: existing monthly obligations AED (default 0, stated assumption: a newcomer carries zero UAE debt unless documented), age in years, visa months remaining. | Called by Monika, 2026-06-11 |
| M5 | Ground-truth labels locked before weight tuning | 24 labeled profiles (8 approve, 8 decline, 8 refer) locked in `../../04-evaluate-and-ship/ground-truth.md` before any scorecard weight exists. Phase 3 never edits the file; Phase 4 measures against it. | Called by Monika, 2026-06-11 |
| M6 | Grounding validator, counterfactuals, impact view in v1 scope | A deterministic grounding validator after the LLM (retry once, then template fallback), a deterministic "what would change this" block on decline and refer, and an impact view tab on Screen 3 (champion vs challenger on the ground truth, no LLM calls). | Called by Monika, 2026-06-11 |
