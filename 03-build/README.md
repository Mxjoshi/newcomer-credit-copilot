# Phase 3: Build & AI Integration. Complete

> Build plan and engineering defaults: [`working/phase-3-plan.md`](working/phase-3-plan.md).

**Brief deliverable:** *"A working build with at least one live LLM-powered use case."*

## Tasks
1. **Build the product:** frontend and backend to make the core flow work (officer enters applicant
   data, then a rules-based score, then a policy check, then a recommendation).
2. **Integrate an LLM API:** the brief allows OpenAI, Anthropic or Gemini. Plan: Anthropic / Claude.
   Our live LLM use case is the explanation and decision-reasoning layer (and the policy-check
   grounding), the part we feature.

## Scope reminders (from Phase 1 decisions)
- Score approach: rules plus an LLM, no trained model (D7). A transparent judgmental scorecard.
- Output: approve, decline, or refer (D8).
- MVP cuts are engineering scaffolding only (no login, no real bank integration, synthetic data). The
  credit substance stays real (D9).

## Delivered artifacts
- The app (frontend and backend): [`app/`](app/), a Next.js officer console implementing the core
  flow (applicant intake, rules-based score, policy check, recommendation). Type-clean, tested
  (`npm test`), runs locally (`npm run dev`), and deployed live.
- `deliverables/llm-integration.md`: input, prompt, structured output, and validator spec for the
  explanation layer, the live LLM use case. Drafted 2026-06-11 during the Phase 2 review (the
  revised data model fixed every shape it needs); the build implements it. The model writes the
  explanation only; the score and verdict stay deterministic.


