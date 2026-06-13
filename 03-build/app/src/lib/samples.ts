// The prepared synthetic profiles behind Screen 1's scenario dropdown. Synthetic data only, no
// real personal data (cut list). Labels lead with the outcome they produce so the demo can pick
// a specific result on purpose. Each is verified against the engine to land on its labelled
// outcome (see the samples sanity check in tests/samples.test.ts).

import type { Applicant, Application } from "./types";

export interface SampleProfile {
  label: string;
  expected: "approve" | "decline" | "refer";
  applicant: Applicant;
  application: Application;
}

export const SAMPLE_PROFILES: SampleProfile[] = [
  {
    label: "Approve · clean newcomer",
    expected: "approve",
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
    label: "Approve · credit card",
    expected: "approve",
    applicant: {
      full_name: "Yusuf Rahman",
      months_in_uae: 18,
      visa_type: "employment",
      employment_status: "employed",
      job_tenure_months: 18,
      employer_category: "government",
      monthly_salary_aed: 12000,
      rent_history: "on_time_6plus",
      existing_monthly_obligations_aed: 0,
      age_years: 30,
      visa_months_remaining: 48,
    },
    application: { product: "credit_card", amount_aed: 20000, term_months: 12 },
  },
  {
    label: "Refer · short tenure, borderline",
    expected: "refer",
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
    label: "Refer · self-employed, rules all pass",
    expected: "refer",
    applicant: {
      full_name: "Lina Haddad",
      months_in_uae: 8,
      visa_type: "employment",
      employment_status: "self_employed",
      job_tenure_months: 18,
      employer_category: "free_zone",
      monthly_salary_aed: 14000,
      rent_history: "on_time_under_6",
      existing_monthly_obligations_aed: 0,
      age_years: 35,
      visa_months_remaining: 36,
    },
    application: { product: "personal_loan", amount_aed: 40000, term_months: 24 },
  },
  {
    label: "Decline · debt burden too high",
    expected: "decline",
    applicant: {
      full_name: "Omar Khalifa",
      months_in_uae: 16,
      visa_type: "employment",
      employment_status: "employed",
      job_tenure_months: 14,
      employer_category: "government",
      monthly_salary_aed: 10000,
      rent_history: "on_time_6plus",
      existing_monthly_obligations_aed: 4000,
      age_years: 33,
      visa_months_remaining: 48,
    },
    application: { product: "personal_loan", amount_aed: 30000, term_months: 12 },
  },
  {
    label: "Decline · age over the limit at maturity",
    expected: "decline",
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
