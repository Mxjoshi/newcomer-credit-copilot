// App-level constants only. The market policy values that used to live here (product salary
// minimums, the DBR cap, the amount multiple, age and tenure limits, the band cut-offs) moved
// to config/uae/policy-rules.v1.0.json on 2026-06-12 so that policy is configuration, not code.
// The lock note moved with them: the v1.0 values were locked with the ground truth (decisions
// M5 and B4) on 2026-06-11 and a change needs a logged decision, not an edit. The engine reads
// the editable copy config/uae/policy-rules.json; src/lib/ruleset.ts validates and builds both.

// The LLM model for the explanation layer (decision B3). Pinned to an exact version, not
// "latest", so the demo behaves the same every time.
export const EXPLANATION_MODEL = "claude-sonnet-4-6";

// Latency guards: the success metric is under 15 seconds end to end; the UI flow shows a
// "taking longer than usual" notice at about 10 seconds.
export const SLOW_NOTICE_MS = 10_000;
export const LLM_TIMEOUT_MS = 30_000;

// Browser storage key for CaseRecords (M7/B5: the review queue and audit log live in
// localStorage in v1).
export const CASE_STORAGE_KEY = "newcomer-credit-copilot.cases.v1";

// Browser storage key for the last evals benchmark run, so the results survive a page refresh
// instead of vanishing with the in-memory React state.
export const EVAL_STORAGE_KEY = "newcomer-credit-copilot.evals.v1";
