// Every number the product depends on, written once, each with where it came from.
// The first group was locked with the ground truth (decisions M5 and B4) in
// 04-evaluate-and-ship/ground-truth.md on 2026-06-11, BEFORE any scoring code existed.
// Changing one of them breaks the labeled boundary cases, so a change needs a logged
// decision, not an edit.

import type { Product, RiskBand } from "./types";

// Minimum monthly salary per product (product assumption, stated in the ground truth).
export const PRODUCT_MIN_SALARY: Record<Product, number> = {
  personal_loan: 8000,
  credit_card: 5000,
};

// Flat annual interest rate, used ONLY to estimate the monthly installment for the debt burden
// check (rule 2). Product assumption, locked with the ground truth.
export const FLAT_ANNUAL_RATE = 0.08;

// UAE-standard caps (flagged in the ground truth for primary-sourcing): total repayments may
// not exceed half of income, and a personal loan may not exceed 20 times monthly salary.
export const DBR_CAP = 0.5;
export const AMOUNT_SALARY_MULTIPLE = 20;

// The borrower must be 65 or younger when the last installment falls due (rule 3).
export const MAX_AGE_AT_MATURITY = 65;

// Minimum months in the current job (rule 4); matches one full probation period.
export const MIN_TENURE_MONTHS = 6;

// Score bands (decision M3: numeric points mapped to bands; the cut-offs are Phase 3's call).
// Rationale: 70+ means strong on at least four of the five factors, the profile a conservative
// v1 (D6) can recommend approving. Under 45 means weakness is the pattern, not the exception.
// The middle goes to a human (D8).
export const BAND_CUTOFFS = {
  low: 70, // total_points >= 70 -> low risk
  high: 45, // total_points < 45 -> high risk; otherwise medium
} as const;

export function bandFor(totalPoints: number): RiskBand {
  if (totalPoints >= BAND_CUTOFFS.low) return "low";
  if (totalPoints < BAND_CUTOFFS.high) return "high";
  return "medium";
}

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
