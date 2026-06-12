// The three prepared synthetic profiles behind Screen 1's "Load sample" button (UI flow:
// clean approve, borderline refer, policy-fail). Synthetic data only, no real personal data
// (cut list). These are the three worked examples the Step 5 acceptance check renders.

import type { Applicant, Application } from "./types";

export interface SampleProfile {
  label: string;
  applicant: Applicant;
  application: Application;
}

export const SAMPLE_PROFILES: SampleProfile[] = [
  {
    label: "Clean approve",
    applicant: {
      full_name: "Amira Hassan",
      months_in_uae: 14,
      visa_type: "employment",
      employment_status: "employed",
      job_tenure_months: 13,
      employer_category: "government",
      monthly_salary_aed: 20000,
      rent_history: "on_time_6plus",
      existing_monthly_obligations_aed: 0,
      age_years: 31,
      visa_months_remaining: 48,
    },
    application: { product: "personal_loan", amount_aed: 40000, term_months: 12 },
  },
  {
    label: "Borderline refer",
    applicant: {
      full_name: "Daniel Okafor",
      months_in_uae: 4,
      visa_type: "employment",
      employment_status: "employed",
      job_tenure_months: 3,
      employer_category: "free_zone",
      monthly_salary_aed: 12000,
      rent_history: "on_time_6plus",
      existing_monthly_obligations_aed: 0,
      age_years: 29,
      visa_months_remaining: 30,
    },
    application: { product: "personal_loan", amount_aed: 30000, term_months: 12 },
  },
  {
    label: "Policy fail (good score, hard rule)",
    applicant: {
      full_name: "Sofia Petrova",
      months_in_uae: 18,
      visa_type: "employment",
      employment_status: "employed",
      job_tenure_months: 24,
      employer_category: "mainland_private",
      monthly_salary_aed: 18000,
      rent_history: "on_time_6plus",
      existing_monthly_obligations_aed: 0,
      age_years: 64,
      visa_months_remaining: 36,
    },
    application: { product: "personal_loan", amount_aed: 50000, term_months: 24 },
  },
];
