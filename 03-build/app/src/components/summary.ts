// The /api/ruleset response shape, shared by the client components. Everything the screens
// need from the live pack: identity, counts, and form limits. No checks, no rule logic.

export interface RulesetSummary {
  market: string;
  market_name: string;
  ruleset_version: string;
  currency: string;
  regulator: string;
  bureau: string;
  rule_count: number;
  factor_count: number;
  max_points: number;
  product_min_salary: Record<string, number>;
  personal_loan_max_term_months: number;
  params: VersionParams;
}

// The four version-editable policy parameters.
export interface VersionParams {
  dbr_cap: number;
  amount_salary_multiple: number;
  max_age_at_maturity: number;
  min_tenure_months: number;
}
