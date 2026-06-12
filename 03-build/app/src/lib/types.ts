// The entity shapes, verbatim from 02-design/deliverables/02-data-model.md (entities 1 to 6
// plus the M7 amendment, CaseRecord). Field names match the data model exactly so every doc
// reference stays traceable. Nothing in this file does anything; it only declares what shape
// each piece of information must have, and the compiler rejects anything that does not match.

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
export type CaseStatus = "awaiting_review" | "closed";

// Entity 1: the synthetic person being assessed. The first eight fields are the scored core
// five (M1: salary, employment + tenure, employer category, months in UAE + visa, rent history,
// plus the display-only name). The last three are policy inputs (M4): rules only, NEVER scored.
export interface Applicant {
  full_name: string;
  months_in_uae: number;
  visa_type: VisaType;
  employment_status: EmploymentStatus;
  job_tenure_months: number;
  employer_category: EmployerCategory;
  monthly_salary_aed: number;
  rent_history: RentHistory;
  existing_monthly_obligations_aed: number; // policy input only (default 0, M4)
  age_years: number; // policy input only (M4)
  visa_months_remaining: number; // policy input only (M4)
}

// Entity 2: what the applicant is asking for.
export interface Application {
  product: Product;
  amount_aed: number;
  term_months: number;
}

// Entity 3a: one row of the scorecard table the officer sees.
export interface ScoreFactor {
  factor_name: string;
  applicant_value: string;
  threshold: string;
  points_awarded: number; // 0 to 20
  rationale: string;
}

// Entity 3b: the whole scorecard result.
// Amendment (2026-06-12): the factor list comes from the market pack, one entry per enabled
// factor, never silently skipped. uae v1.0 enables five (0 to 100 points total).
export interface ScoreResult {
  factors: ScoreFactor[];
  total_points: number;
  risk_band: RiskBand;
}

// Entity 4: one lending-policy rule. rule_text is the exact sentence the decision screen cites;
// the 100 percent policy-grounding metric requires citations to trace to it verbatim.
export interface PolicyRule {
  rule_id: string;
  title: string;
  rule_text: string;
  source_section: string;
  condition: string; // the human-readable form of the check function below
  severity: Severity;
  check: (applicant: Applicant, application: Application) => boolean;
}

// Entity 5: the outcome of checking one rule against this application.
export interface PolicyCheckResult {
  rule_id: string;
  passed: boolean;
  cited_text: string;
  finding: string;
}

// Entity 6: what the decision screen renders. It physically contains the score and policy
// results it rests on, so the explanation can be checked against them line by line.
// Amendment (2026-06-12): ruleset_version records which market pack produced the decision, so
// "why did we decline this person in June" is answerable after the rules change.
export interface Decision {
  recommendation: Recommendation;
  risk_band: RiskBand;
  ruleset_version: string;
  explanation: string;
  reasons: string[];
  counterfactuals: string[]; // decline or refer only, deterministic, never LLM-written
  score_result: ScoreResult;
  policy_results: PolicyCheckResult[];
  officer_action: OfficerAction;
  override_reason?: string;
  // Amendment (2026-06-12, llm-integration.md logging): how the explanation was produced.
  // Unset until the explanation layer has run. Feeds the Phase 4 hallucination eval directly.
  validation_outcome?: ValidationOutcome;
}

// Entity 7 (M7 amendment): a kept decision. Refers start awaiting_review and sit in the review
// queue until the officer closes them; everything appears in the audit log. Stored in the
// browser in v1 (B5); shaped to become a real database table in v2 without redesign.
export interface CaseRecord {
  case_id: string;
  created_at: string; // ISO timestamp
  applicant: Applicant;
  application: Application;
  decision: Decision;
  status: CaseStatus;
  closed_at?: string;
}

// The LLM's only output shape (llm-integration.md): one paragraph plus reasons.
export interface ExplainOutput {
  explanation: string;
  reasons: string[];
}

export type ValidationOutcome = "passed" | "passed_on_retry" | "fell_back_to_template";
