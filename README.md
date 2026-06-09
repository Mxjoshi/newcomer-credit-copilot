# Newcomer Credit Decisioning Copilot

A **B2B AI tool for UAE digital banks** that decides whether a newcomer with **no local credit
history** is safe to lend to — and **explains** the decision so a credit officer can defend it.
PMCurve AI-PM capstone (Cohort 6), bring-your-own project, solo. Goal: a deployed, working MVP,
presented.

> **The gap we fill:** the UAE is ~88% expat, yet a new arrival starts with a blank AECB credit file.
> Banks reject good customers or assess them slowly by hand. Our tool gives the officer a fast,
> consistent, defensible approve / decline / refer decision on a thin-file applicant — using the
> alternative-data approach the industry actually relies on.

## The build: 4 phases (one per week, self-paced, bar over speed)

| Phase | Folder | Deliverable | Status |
|---|---|---|---|
| 1 · Scope & Research | [`01-scope-and-research/`](01-scope-and-research/) | Problem statement, competitor notes, success metrics | ✅ **Complete (2026-06-09)** |
| 2 · Design | [`02-design/`](02-design/) | End-to-end UI flow + first-pass data model | ⬜ Not started |
| 3 · Build & AI Integration | [`03-build/`](03-build/) | Working build + ≥1 live LLM use case | ⬜ Not started |
| 4 · Evaluate & Iterate (ship) | [`04-evaluate-and-ship/`](04-evaluate-and-ship/) | MVP + evals benchmark + metrics vs baseline | ⬜ Not started |

## Repository map
- **[`00-reference/`](00-reference/)** — the course material: the capstone brief (PDF + notes). Read-only reference, not our work.
- **`01`–`04`** — our work, one folder per phase. Each phase folder has a `README.md`, a
  `deliverables/` folder (the graded outputs), and `working/` (the reasoning behind them).
- **`MEMORY.md`** — the working index / context file (decisions, status, standing rules).

## Where the project stands (one line)
**Phase 1 is done, fact-verified, and signed off.** Next: Phase 2 — design the end-to-end UI flow,
then the data model. See [`01-scope-and-research/phase-1-signoff.md`](01-scope-and-research/phase-1-signoff.md).

## How the product works (v1, locked in Phase 1)
Officer enters a newcomer's details (employment, salary, tenure, rent history, a few alt-data fields)
→ a **rules-based judgmental scorecard** assesses repay-vs-default risk → a **policy check** against
UAE lending rules → an **LLM-generated plain-language explanation** the officer can read and defend →
output: **APPROVE / DECLINE / REFER**, human makes the final call.

Approach: **rules + LLM, no trained model** — chosen because for a regulated v1 lending decision,
explainability and defensibility matter more than a marginal accuracy gain. The showcase is the
explanation / decision-reasoning layer.
