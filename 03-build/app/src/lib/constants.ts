// Named constants, locked with the ground truth (decision M5, B4).
// These values were fixed in 04-evaluate-and-ship/ground-truth.md on 2026-06-11, before any
// scorecard weight existed. Changing any of them breaks the labeled boundary cases, so a change
// requires a logged decision, not an edit.

import type { Product, RiskBand } from "./types";

export const PRODUCT_MIN_SALARY: Record<Product, number> = {
  personal_loan: 8000,
  credit_card: 5000,
};

// Flat annual interest rate, used only to estimate the installment for the DBR check (rule 2).
export const FLAT_ANNUAL_RATE = 0.08;

// UAE-standard cap concepts: 50 percent debt burden ratio, 20x salary loan cap.
export const DBR_CAP = 0.5;
export const AMOUNT_SALARY_MULTIPLE = 20;

export const MAX_AGE_AT_MATURITY = 65;
export const MIN_TENURE_MONTHS = 6;

// Score bands (decision M3: numeric points mapped to bands; cut-offs are Phase 3's call).
// Rationale: 70+ means the applicant is strong on at least four of the five factors, which is
// the profile a conservative v1 (D6) can auto-approve. Under 45 means weakness is the pattern,
// not the exception, and a conservative stance declines. The middle goes to a human (D8).
export const BAND_CUTOFFS: { low: number; high: number } = {
  low: 70, // total_points >= 70 -> low risk
  high: 45, // total_points < 45 -> high risk; otherwise medium
};

export function bandFor(totalPoints: number): RiskBand {
  if (totalPoints >= BAND_CUTOFFS.low) return "low";
  if (totalPoints < BAND_CUTOFFS.high) return "high";
  return "medium";
}

// The LLM model for the explanation layer (decision B3). Pinned, not "latest", so demo behavior
// is reproducible.
export const EXPLANATION_MODEL = "claude-sonnet-4-6";

// Latency guards from the success metrics (under 15s total) and the UI flow (slow notice ~10s).
export const SLOW_NOTICE_MS = 10_000;
export const LLM_TIMEOUT_MS = 30_000;
