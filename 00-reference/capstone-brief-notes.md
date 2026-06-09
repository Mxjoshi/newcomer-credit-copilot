# PMCurve Capstone Brief - Cohort 6 (source of truth)

Extracted from Capstone-Cohort-6.pdf (15 pages). This is what the project is graded against.
Last updated: 2026-06-07

---

## The headline facts
- **4-week build** from kickoff to working MVP. Rough guide: one phase per week. (NOT 8 weeks. The 8 weeks was the learning portion.)
- **Self-paced phases, not fixed dates.** Progress through phases at your own pace.
- **Individual by default.** Group is optional (small group, every member must contribute and clear the bar).
- **"Bar over speed":** meeting the quality bar and clearing each phase is what matters, not finishing fast.

## Format options
- Work solo (default): own the full project - design, build, AI integration, evals.
- Team up (optional): small group on the same project.
- **Bring your own project (ALLOWED):** propose your own instead of the 10 presets, as long as it
  clears the quality bar. Can be a side project or an internal company project. Same phases and bar apply.
  -> Monika's "Newcomer Credit Decisioning Copilot" is a bring-your-own. It qualifies.

## The 10 preset projects (for reference / competitor inspiration only - we are bringing our own)
- Tier 1 High complexity (~6 hrs/week): KB search for PMs; Support agent with RAG + triage;
  Autonomous research agent; AI code-review assistant.
- Tier 2 Medium (~4 hrs/week): Shopping assistant Chrome extension; Meeting summariser; Resume<->JD matcher.
- Tier 3 Low (~2 hrs/week): Lead-qualification voice agent; Flashcard & quiz generator; Review sentiment dashboard.
- Note: our credit copilot is effectively Tier 1 (multi-step: score + RAG + agent + explanation). Scope accordingly.

## What gets you disqualified
- Missing phase progress: stalling on a phase or not completing it within the 4-week window.
- Falling short of the quality bar.
- If disqualified: can retake in next cohort. Capstone can be deferred at most twice, then no future participation.

---

## The four phases (THIS is the structure, maps to our folders)

### Phase 1 - Scope & Research  (folder: 01-scope-and-research)
- Pick project & format (solo/group).
- Study 3-5 competitors: what they do well, where they fall short.
- Define ONE key problem + measurable success metrics.
- **Deliverable:** clear problem statement, competitor notes, measurable definition of success.

### Phase 2 - Design  (folder: 02-design)
- End-to-end UI design flow: full user journey, screen by screen (can change later).
- Data model: entities and relationships, designed AFTER the UI flow.
- **Deliverable:** end-to-end UI flow (review milestone) + first-pass data model.

### Phase 3 - Build & AI Integration  (folder: 03-build)
- Build product: frontend, backend, any traditional AI needed for the core flow.
- Integrate an LLM API (OpenAI / Anthropic / Gemini) into at least one use case.
- **Deliverable:** working build with at least one live LLM-powered use case.

### Phase 4 - Evaluate & Iterate  (folder: 04-evaluate-and-ship)
- Surface & validate risks: list risks, find fastest/cheapest way to validate each.
- Define & build the MVP in STAR format. [STAR = NEEDS VERIFICATION - course-specific term]
- Set up evals benchmark, run v1, measure how far metrics are from targets.
- **Deliverable:** MVP, evals benchmark, first metrics measured against baseline.

---

## How they want SUCCESS METRICS written (worked example = the template for our Phase 1)
Their "Meeting summariser" example metrics (threshold-based, measurable):
- Completeness: % of action items captured (target 95%+)
- Attribution accuracy: items assigned to the right person
- Conciseness: summary length vs transcript (<10%)
- Hallucination rate: info not in transcript (<2%)
- Latency: summary for a 30-min meeting (<15s)
-> OUR metrics must be written in this same shape: named metric + measurable target threshold.

## How they want EVALS run (worked example = the template for our Phase 4)
- Run ~20 diverse sample inputs through the product.
- Manually verify each output against ground truth.
- Compute metrics to set the current baseline.
- Compare v1 results to targets and iterate.

---

## NEEDS VERIFICATION
- "STAR format" for MVP definition - confirm what STAR stands for in PMCurve's framework before using it.
