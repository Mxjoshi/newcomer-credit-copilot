# Phase 3: Build & AI Integration. Not started

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

## Planned artifacts (to be created here)
- The app (frontend and backend).
- `deliverables/llm-integration.md`: input, prompt, and structured output spec for the explanation
  layer.

> Blocked until Phase 2 design is done.
