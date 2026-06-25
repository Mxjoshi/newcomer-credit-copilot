# Newcomer Credit Decisioning Copilot

A B2B tool for UAE digital banks that decides whether a newcomer with no local credit history is safe
to lend to, and explains the decision so a credit officer can defend it. The output is an approve,
decline, or refer recommendation with a plain-language rationale, and a human makes the final call.

Built solo as the PMCurve AI-PM capstone (Cohort 6), a bring-your-own project. Goal: a working,
evaluated MVP.

> **The gap we fill:** the UAE is about 88% expat, yet a new arrival starts with a blank AECB credit
> file (no record at the Al Etihad Credit Bureau, the UAE credit bureau). Banks reject good customers
> or assess them slowly by hand. The tool gives the officer a fast,
> consistent, defensible approve, decline, or refer decision on a thin-file applicant, using the
> alternative-data approach the industry already relies on.

> Synthetic data only. No real applicants or bank data. The 24 evaluation profiles are fabricated.

## How the product works (v1, locked in Phase 1)
The officer enters a newcomer's details (employment, salary, tenure, rent history, a few alt-data
fields). A rules-based judgmental scorecard assesses repay-vs-default risk. A policy check runs the
applicant against UAE lending rules. An LLM writes a plain-language explanation the officer can read
and defend. The output is approve, decline, or refer, and the human makes the final call. The score
and the verdict are fully deterministic: the LLM writes the explanation only and has no ability to
alter points, rules, or the recommendation.

The approach is rules plus an LLM, with no trained model. We chose it because for a regulated v1
lending decision, explainability and defensibility matter more than a marginal accuracy gain. The part
we feature is the explanation and decision-reasoning layer.

## What a decision looks like
Take a government employee, 14 months in the UAE, earning AED 20,000 a month with an on-time rent
record, applying for a 40,000 personal loan over 12 months. The tool returns:

- **Recommendation:** approve. **Risk band:** low. **Score:** 98/100.
- **Why:** salary is more than double the AED 8,000 product minimum, leaving a debt burden of 18
  percent (inside the 50 percent cap); government employer at the top stability tier; all six policy
  rules pass; 6+ months of on-time rent.
- The officer reads that rationale, can defend it, and makes the final call.

A weaker profile (short tenure, no rent history, or a rule that fails at refer-severity) comes back
as **refer** for a human to check, or **decline** with the exact rule that failed named.

## Run it
The app is a Next.js console in [`03-build/app/`](03-build/app/). You need **Node.js 20+** and an
**Anthropic API key** (from [console.anthropic.com](https://console.anthropic.com); only the
explanation step calls the model, the score and verdict run without it).

From a fresh clone:

```bash
cd 03-build/app
npm install
cp .env.example .env.local   # then set ANTHROPIC_API_KEY=sk-ant-... in .env.local
npm run dev                  # open http://localhost:3000
```

On the assessment screen, load a ready case from the **Load a sample scenario** dropdown (approve,
decline, refer, or a prompt-injection probe), or enter your own applicant.

Verify the decision logic against the locked answer key:

```bash
npm test          # rule boundaries, scorecard, combination logic, validator
npm run harness   # runs the 24-profile ground truth, prints match/mismatch per row
```

No login and no server database, decisions and logs live in the browser. See the
[app README](03-build/app/README.md) for more.

## Where the project stands
All four phases are complete: the MVP is built, type-clean, tested, and evaluated, and the v1 baseline
is measured and recorded. Live deployment is the remaining step. The next-version backlog lives in
[`04-evaluate-and-ship/iteration-plan.md`](04-evaluate-and-ship/iteration-plan.md).

The build ran in 4 phases, one per week, self-paced, bar over speed:

| Phase | Folder | Deliverable | Status |
|---|---|---|---|
| 1. Scope & Research | [`01-scope-and-research/`](01-scope-and-research/) | Problem statement, competitor notes, success metrics | **Complete** |
| 2. Design | [`02-design/`](02-design/) | End-to-end UI flow plus first-pass data model | **Complete** |
| 3. Build & AI Integration | [`03-build/`](03-build/) | Working build plus at least one live LLM use case | **Complete** |
| 4. Evaluate & Iterate | [`04-evaluate-and-ship/`](04-evaluate-and-ship/) | MVP, evals benchmark, metrics vs baseline | **Complete** |

## Repository map
- **`01` to `04`:** our work, one folder per phase. Each phase folder has a `README.md`, a
  `deliverables/` folder (the graded outputs), and `working/` (the reasoning behind them).
- **`MEMORY.md`:** the working index (decisions, status, standing rules).

## How this is built
Product decisions, scope, reviews, and sign-offs are Monika's. The engineering pair is Claude Code,
the build tool the course brief itself directs students to (capstone brief, page 14).
