// The six entities, verbatim from 02-design/deliverables/02-data-model.md.
// Field names match the data model exactly so every doc reference stays traceable.

export type VisaType = "employment" | "golden" | "green" | "other";
export type EmploymentStatus = "employed" | "self_employed" | "unemployed";
export type EmployerCategory =
  | "government"
  | "mainland_private"
  | "free_zone"
  | "sme"
  | "other";
export type RentHistory =
  | "on_time_6plus"
  | "on_time_under_6"
  | "late_payments"
  | "none";
export type Product = "personal_loan" | "credit_card";
export type RiskBand = "low" | "medium" | "high";
export type Recommendation = "approve" | "decline" | "refer";
export type Severity = "hard_fail" | "refer";
export type OfficerAction = "accepted" | "overridden" | "none";

export interface Applicant {
  full_name: string;
  months_in_uae: number;
  visa_type: VisaType;
  employment_status: EmploymentStatus;
  job_tenure_months: number;
  employer_category: EmployerCategory;
  monthly_salary_aed: number;
  rent_history: RentHistory;
  // Policy inputs (M4): policy rules only, never scored.
  existing_monthly_obligations_aed: number;
  age_years: number;
  visa_months_remaining: number;
}

export interface Application {
  product: Product;
  amount_aed: number;
  term_months: number;
}

export interface ScoreFactor {
  factor_name: string;
  applicant_value: string;
  threshold: string;
  points_awarded: number; // 0 to 20
  rationale: string;
}

export interface ScoreResult {
  factors: ScoreFactor[]; // always all 5, never silently skipped
  total_points: number; // 0 to 100
  risk_band: RiskBand;
}

export interface PolicyRule {
  rule_id: string;
  title: string;
  rule_text: string;
  source_section: string;
  condition: string; // human-readable form of the check below
  severity: Severity;
  check: (applicant: Applicant, application: Application) => boolean;
}

export interface PolicyCheckResult {
  rule_id: string;
  passed: boolean;
  cited_text: string;
  finding: string;
}

export interface Decision {
  recommendation: Recommendation;
  risk_band: RiskBand;
  explanation: string;
  reasons: string[];
  counterfactuals: string[]; // decline or refer only, deterministic, never LLM-written
  score_result: ScoreResult;
  policy_results: PolicyCheckResult[];
  officer_action: OfficerAction;
  override_reason?: string;
}

export interface ExplainOutput {
  explanation: string;
  reasons: string[];
}

export type ValidationOutcome = "passed" | "passed_on_retry" | "fell_back_to_template";
