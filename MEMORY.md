# AI-Capstone, Main Memory (read this first)

This is the index for the whole project. It stays short on purpose.
Each line points to a detailed file you open only when that topic is the task.
Last updated: 2026-06-11 (Phase 2 review: M4-M6 called, ground truth locked, metrics amendment)

---

## START HERE (resume protocol for a fresh session)
For accuracy, start a NEW session for each chunk of work rather than continuing a long one. The files
are the source of truth, not chat history. To rebuild context, read these in order:
1. This file (MEMORY.md), top to bottom.
2. 01-scope-and-research/phase-1-signoff.md (what is locked and done).
3. The specific file for the active task only (e.g. a deliverable, or the next phase README).
Do not trust recall over the files. Re-open the file before relying on a fact. Writing style: no en or
em dashes, plain human voice (saved in Claude memory). Project is on GitHub: Mxjoshi/newcomer-credit-copilot.
PUBLIC temporarily (Monika, 2026-06-11) so Claude desktop can read it; revert to private when the
capstone completes. Push after every committed chunk (standing rule 6) so the public copy is current.

---

## The project in one line
A B2B AI tool for UAE digital banks that assesses whether a newcomer with no local credit
history is safe to lend to, and explains the decision. PMCurve AI PM capstone (bring-your-own
project, allowed), aimed at a Dubai fintech job search. Must be a deployed, working MVP, presented.

## The hard constraint (corrected 2026-06-07)
**4-week build, one phase per week.** NOT 8 weeks (that was the learning portion). Self-paced
phases. Solo by default. Disqualified if you stall on a phase or miss the quality bar.
Full brief: 00-reference/capstone-brief.pdf (notes: 00-reference/capstone-brief-notes.md)
TO DO (Monika, 2026-06-11): remove capstone-brief.pdf from the repo (course material, not ours to
publish; the notes file covers every reference we make). The repo went PUBLIC on 2026-06-11, so the
PDF is currently exposed; Monika chose to clean this later. Deleting the file alone leaves it in git
history; decide then whether to rewrite history.

## The 4 phases (each = one folder)
1. Scope & Research (01-scope-and-research): problem, 3-5 competitors, measurable success metrics.
2. Design (02-design): end-to-end UI flow, then data model.
3. Build & AI Integration (03-build): working build + at least one live LLM use case.
4. Evaluate & Iterate (04-evaluate-and-ship): risks, MVP, evals benchmark, metrics vs baseline + pitch.

## Status
**PHASE 1 COMPLETE, FACT-VERIFIED & SIGNED OFF (2026-06-09).**
See 01-scope-and-research/phase-1-signoff.md. Three clean deliverables locked in
01-scope-and-research/deliverables/ (problem-statement, competitor-analysis, success-metrics).
Full web re-verification sweep done, every fact confirmed or confidence-flagged; nothing
load-bearing is unverified. Folder structure restructured (phase-based; course material → 00-reference).
Not building yet. **Phase 2 (Design) deliverables DRAFTED 2026-06-10:** 02-design/deliverables/
01-ui-flow.md (3 screens: intake, live 3-step assessment, decision hero; wireframes + edge states)
and 02-data-model.md (6 entities + candidate policy-rule list). Decisions called by Monika:
U1 three-screen flow, M1 core five input fields (salary, employment+tenure, employer category,
months in UAE+visa, rent history officer-entered; NO savings/home-country credit/education).
Rest defaulted per 02-design/working/phase-2-plan.md decisions queue.
**Phase 2 REVISED per Monika's review 2026-06-11 (M4-M6):** three policy-only inputs added (never
scored, M1 stays exactly five scored factors); ground truth locked early (04-evaluate-and-ship/
ground-truth.md, 24 cases, 8/8/8, Phase 3 must never edit it); grounding validator + counterfactual
"what would change this" + impact view tab added to scope. Hallucination target restated: zero
invented facts on the 24-case set (dated amendment in 03-success-metrics.md, locked text untouched).
LLM integration spec drafted early (03-build/deliverables/llm-integration.md).
Next: Monika signs off Phase 2.

## Success metrics (locked, threshold format)
Group A (credit): decision accuracy 80%+; false approval <10% (strictest, from D6); refer rate 10-25%.
Group B (AI output): hallucination <2%; policy grounding 100% traceable; latency <15s.
All Group A measured on synthetic sample data (stated honestly).

---

## Where everything lives (restructured 2026-06-09, phase-based)

- **README.md** (root), project front page / human-facing overview.
- **00-reference/**, the course material (capstone brief PDF + notes). Read-only reference, not our work.
- **01-scope-and-research/**, Phase 1. `deliverables/` = the 3 graded outputs (problem statement,
  competitor analysis, success metrics). `working/` = `product-definition.md` (decision log, the heart)
  + `market-and-domain-research.md` (UAE facts, AECB, lenders, alt-data, fact-verification ledger).
  `phase-1-signoff.md` = the done-verdict.
- **02-design/**, Phase 2. UI flow + data model. (README stub; empty.)
- **03-build/**, Phase 3. The app + LLM integration (Anthropic/Claude). (README stub; empty.)
- **04-evaluate-and-ship/**, Phase 4. Risks, MVP, evals benchmark, metrics, + the final pitch. (README stub; empty.)

---

## Standing rules for this project
1. **Accuracy standard:** every number/fact is sourced & cited, or flagged "NEEDS VERIFICATION." No confident unchecked figures. Model performance = real measured metrics, not adjectives.
2. **Treat Monika as new to domain/tech/AI**, explain plainly, define terms. She is strong on PM craft.
3. **Claude carries the technical build.** Monika makes product decisions and presents.
4. **Scope discipline:** 4-week build alongside a full-time job. Protect the timeline. Cut, don't add. Over-building is the real disqualification risk.
5. **Efficiency:** read this file first. Open a detailed file only when that topic is the active task.
6. **Push after every committed chunk of work (Monika, 2026-06-11).** Work happens across multiple
   sessions and tools, so origin/main on GitHub must always hold the current copy. Commit, then push,
   same session, no local-only pileups.

---

## Decision log (the short version, full reasoning in 01-scope-and-research/working/product-definition.md)
- D1. Problem owner: the bank (B2B). Primary user = loan officer.
- D2. Output: recommendation + explanation, human makes final call.
- D3. v1 loan product: personal loan / credit card only.
- D4. Bank type: digital bank (Wio / Liv style).
- D5. Access: internal only, officer enters applicant data.
- D6. Error stance: AVOID BAD LOANS (conservative v1). False approvals cost more than false declines.
- D7. Score approach: RULES + LLM, no trained model, a transparent "judgmental scorecard." Chosen
  because for a regulated v1, explainability/defensibility beat a marginal accuracy gain, and
  applicant data to validate ML is thin. (Do NOT claim ML is impossible, see Key framing below.)
- D8. Output: APPROVE / DECLINE / REFER (refer = borderline -> human).
- D9. "Real but appropriately scoped": credit substance is real/bank-grade; only engineering
  scaffolding (login, real integration) is MVP-cut. Monika's directive: must be real + have impact.
- M4 (2026-06-11). Three policy-only input fields (existing monthly obligations AED default 0,
  age in years, visa months remaining): feed policy rules ONLY, never scored. Scored set stays
  exactly the M1 five.
- M5 (2026-06-11). Ground-truth labels locked BEFORE any scorecard weight exists
  (04-evaluate-and-ship/ground-truth.md, 24 cases). Phase 3 never edits it; Phase 4 measures against it.
- M6 (2026-06-11). Added to v1 scope: grounding validator after the LLM (retry once, then template
  fallback), deterministic counterfactual block on decline/refer, impact view tab (champion vs
  challenger on the ground truth, no LLM calls).

## Key framing (use in pitch + interviews) - CORRECTED 2026-06-07 after research
Do NOT claim "ML is impossible on no-history borrowers" (research debunked this - ML on alt-data
is growing; AECB+Nova Credit even imports home-country history). Correct positioning: judgmental
scorecard + policy checks + EXPLAINABLE decisions is a transparent, regulator-ALIGNED baseline,
chosen because explainability/defensibility beat marginal accuracy for a regulated v1, and
applicant data to validate ML is thin. Differentiate on explainability + alt-data + serving
applicants NOT covered by Nova Credit. Showcase = the explanation/decision-reasoning layer.

## Verified facts (full ledger: 01-scope-and-research/working/market-and-domain-research.md), SWEEP DONE 2026-06-09
CONFIRMED: AECB score 300-900. UAE expats ~88% (88.5% 2024). Thin-file newcomer problem real.
AECB salary data in reports (Q1 2024, 3.71M customers). CBUAE abolished minimum-salary loan
requirement 18 Nov 2025 (banks now use own risk models, strengthens our thesis). Top-5 competitors
all verified (closest: AECB+Nova Credit "Credit Passport" + Newgen explainable decisioning).
KEY CORRECTION (now confirmed): UAE has NO US-style legal adverse-action/decline-reason mandate, only a soft "reasons where feasible" duty (CBUAE Circular 8/2020). NEVER claim the tool satisfies a
legal requirement. DO NOT CLAIM: remittances as scoring input; rent/Ejari live in AECB (emerging only).
Flagged self-reported: Liv "~500k users"; Credit Passport "still live 2026" inferred. CRIF UAE domain
= ae.crif.digital (not crif.ae). Refer-rate = function of bank review capacity, not a fixed number.
