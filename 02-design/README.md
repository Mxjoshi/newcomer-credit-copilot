# Phase 2: Design. Reviewed and revised, pending sign-off

**Status (2026-06-11):** Monika reviewed both deliverables (the brief's review milestone) and
called decisions M4-M6; both files are revised accordingly. Sign-off is next.

> Planning and brainstorm: `working/phase-2-plan.md` (flow options, hero-screen contents, entity
> sketch, candidate input fields, decisions queue U1-U4 / M1-M3 resolved 2026-06-10, review
> decisions M4-M6 called by Monika 2026-06-11: policy-only inputs, ground truth locked early,
> validator plus counterfactuals plus impact view).

**Brief deliverable:** *"An end-to-end UI flow (review milestone) and a first-pass data model."*

## Tasks
1. **End-to-end UI design flow:** map the full user journey, screen by screen (officer enters
   applicant data, then score, then policy check, then recommendation plus explanation). This can
   change later.
2. **Data model:** once the UI flow is set, design the entities and relationships behind it
   (applicant, application, score inputs, policy rules, decision plus explanation).

## Artifacts (all drafted 2026-06-10)
- `deliverables/01-ui-flow.md`: screen-by-screen journey, 3 screens with wireframes, edge
  states, and a traceability table back to D1-D9 and the metrics. THE REVIEW MILESTONE.
- `deliverables/02-data-model.md`: 6 entities (Applicant, Application, ScoreFactor/ScoreResult,
  PolicyRule, PolicyCheckResult, Decision), relationships, candidate v1 policy-rule list.
- `working/phase-2-plan.md`: design exploration, alternatives considered, decisions queue.

> Phase 1 is signed off, so Phase 2 is cleared to begin. The part we feature is the explanation and
> decision-reasoning layer, so the design should put it front and centre.
