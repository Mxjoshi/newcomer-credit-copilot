// The 24 locked ground-truth profiles, transcribed from
// 04-evaluate-and-ship/ground-truth.md (decision M5, locked 2026-06-11).
// THE MARKDOWN FILE IS THE SOURCE OF TRUTH. This file mirrors it for the harness and the
// impact view; any difference is a bug here, never a reason to edit the markdown.

import type { Applicant, Application, Recommendation } from "./types";

export interface GroundTruthRow {
  id: string;
  applicant: Applicant;
  application: Application;
  expected_outcome: Recommendation;
  rationale: string;
}

const row = (
  id: string,
  full_name: string,
  months_in_uae: number,
  visa_type: Applicant["visa_type"],
  employment_status: Applicant["employment_status"],
  job_tenure_months: number,
  employer_category: Applicant["employer_category"],
  monthly_salary_aed: number,
  rent_history: Applicant["rent_history"],
  existing_monthly_obligations_aed: number,
  age_years: number,
  visa_months_remaining: number,
  product: Application["product"],
  amount_aed: number,
  term_months: number,
  expected_outcome: Recommendation,
  rationale: string,
): GroundTruthRow => ({
  id,
  applicant: {
    full_name,
    months_in_uae,
    visa_type,
    employment_status,
    job_tenure_months,
    employer_category,
    monthly_salary_aed,
    rent_history,
    existing_monthly_obligations_aed,
    age_years,
    visa_months_remaining,
  },
  application: { product, amount_aed, term_months },
  expected_outcome,
  rationale,
});

export const GROUND_TRUTH: GroundTruthRow[] = [
  row("GT-01", "Arjun Mehta", 10, "employment", "employed", 9, "government", 18000, "on_time_6plus", 0, 32, 30, "personal_loan", 60000, 24, "approve", "Strong on all five factors, every rule passes with room."),
  row("GT-02", "Priya Nair", 8, "employment", "employed", 6, "mainland_private", 14000, "on_time_6plus", 0, 29, 28, "personal_loan", 40000, 18, "approve", "Tenure exactly 6 months sits on the rule 4 boundary and passes."),
  row("GT-03", "Joseph Thomas", 9, "employment", "employed", 8, "free_zone", 8000, "on_time_6plus", 0, 27, 26, "personal_loan", 24000, 12, "approve", "Salary exactly at the AED 8,000 product minimum passes rule 1."),
  row("GT-04", "Chen Wei", 12, "employment", "employed", 10, "mainland_private", 10000, "on_time_6plus", 2300, 31, 24, "personal_loan", 30000, 12, "approve", "DBR exactly 50 percent passes rule 2 at the cap."),
  row("GT-05", "Samuel Okafor", 11, "employment", "employed", 10, "government", 25000, "on_time_6plus", 0, 62, 40, "personal_loan", 80000, 36, "approve", "Age at maturity exactly 65 passes rule 3 at the boundary."),
  row("GT-06", "Aisha Rahman", 7, "employment", "employed", 7, "free_zone", 12000, "on_time_6plus", 0, 26, 22, "credit_card", 15000, 12, "approve", "Clean credit card case, all rules pass."),
  row("GT-07", "Daniel Petrov", 14, "golden", "employed", 12, "mainland_private", 35000, "on_time_6plus", 3000, 38, 96, "personal_loan", 150000, 36, "approve", "Golden visa, long tenure, DBR about 23 percent."),
  row("GT-08", "Maria Santos", 9, "employment", "employed", 8, "sme", 9500, "on_time_6plus", 0, 30, 26, "personal_loan", 20000, 12, "approve", "Modest ask well inside every rule, consistent rent record despite SME employer."),
  row("GT-09", "Hassan Karimi", 5, "employment", "employed", 4, "sme", 6500, "on_time_under_6", 0, 28, 20, "personal_loan", 30000, 24, "decline", "Salary below the product minimum, rule 1 hard fail."),
  row("GT-10", "Olivia Brown", 10, "employment", "employed", 9, "mainland_private", 12000, "on_time_6plus", 4000, 33, 30, "personal_loan", 60000, 24, "decline", "DBR 57.5 percent breaches the cap, rule 2 hard fail."),
  row("GT-11", "Rajesh Kumar", 3, "other", "unemployed", 0, "other", 0, "none", 0, 35, 10, "personal_loan", 20000, 12, "decline", "Unemployed with no income, fails rule 1 outright."),
  row("GT-12", "Victor Adeyemi", 11, "employment", "employed", 10, "free_zone", 28000, "late_payments", 0, 36, 30, "personal_loan", 100000, 36, "decline", "High salary but the only payment-behavior signal is negative (D6)."),
  row("GT-13", "Lin Feng", 12, "employment", "employed", 11, "mainland_private", 8500, "on_time_6plus", 0, 34, 30, "personal_loan", 180000, 48, "decline", "Amount exceeds 20x salary, rule 6 hard fail; DBR also breaches."),
  row("GT-14", "George Mathew", 10, "employment", "employed", 9, "government", 20000, "on_time_6plus", 0, 64, 28, "personal_loan", 50000, 24, "decline", "Age at maturity 66 exceeds the 65 limit, rule 3 hard fail."),
  row("GT-15", "Tanya Ivanova", 2, "employment", "employed", 2, "other", 8200, "none", 0, 24, 8, "personal_loan", 100000, 36, "decline", "Passes every hard rule but every risk signal is weak: high-risk band declines on score alone."),
  row("GT-16", "Ahmed Sayed", 4, "employment", "employed", 3, "mainland_private", 15000, "late_payments", 1000, 30, 20, "personal_loan", 60000, 18, "decline", "Negative rent behavior on top of 3-month tenure puts it in the high-risk band."),
  row("GT-17", "Nadia Hussain", 9, "employment", "employed", 8, "government", 16000, "on_time_6plus", 0, 31, 18, "personal_loan", 60000, 24, "refer", "Visa shorter than the term, rule 5 fails at severity refer; everything else strong."),
  row("GT-18", "Wang Jun", 3, "golden", "employed", 2, "mainland_private", 30000, "on_time_under_6", 0, 40, 110, "personal_loan", 90000, 24, "refer", "Golden visa with 2 months tenure: residency secure, employment unproven, rule 4 refer."),
  row("GT-19", "Elena Garcia", 5, "employment", "employed", 7, "free_zone", 22000, "none", 0, 33, 24, "personal_loan", 70000, 24, "refer", "Strong salary but no rent history at all: the alt-data standing in for the credit file is missing."),
  row("GT-20", "Layla Mansour", 4, "employment", "employed", 3, "free_zone", 12000, "on_time_6plus", 0, 27, 20, "personal_loan", 40000, 18, "refer", "The borderline case from the UI worked example: income fine, tenure too short."),
  row("GT-21", "Omar Sheikh", 12, "employment", "self_employed", 12, "sme", 18000, "on_time_6plus", 2000, 37, 30, "personal_loan", 60000, 24, "refer", "Self-employed income is harder to verify; rules pass, a human checks."),
  row("GT-22", "Kavya Pillai", 6, "employment", "employed", 7, "sme", 9000, "on_time_under_6", 500, 26, 26, "personal_loan", 35000, 24, "refer", "Medium on every factor, nothing fails: the textbook middle band."),
  row("GT-23", "Ibrahim Diallo", 4, "employment", "employed", 4, "free_zone", 7000, "on_time_under_6", 0, 25, 18, "credit_card", 8000, 12, "refer", "Card salary minimum passes but tenure trips rule 4 (refer)."),
  row("GT-24", "Sophie Martin", 5, "employment", "employed", 8, "mainland_private", 11000, "on_time_under_6", 2500, 29, 20, "personal_loan", 40000, 18, "refer", "DBR about 45 percent near the cap with a short rent record: prudence refers."),
];
