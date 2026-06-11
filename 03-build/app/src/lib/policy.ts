// The six v1 policy rules, verbatim from the data model's candidate list (rule 7, salary paid
// into a bank account, is cut: no v1 field backs it, documented in the data model). Every rule
// is checked every time, no silent skips. rule_text is the sentence the decision screen cites;
// the 100 percent policy-grounding metric requires citations to trace back to it verbatim.

import type { Applicant, Application, PolicyCheckResult, PolicyRule } from "./types";
import {
  AMOUNT_SALARY_MULTIPLE,
  DBR_CAP,
  FLAT_ANNUAL_RATE,
  MAX_AGE_AT_MATURITY,
  MIN_TENURE_MONTHS,
  PRODUCT_MIN_SALARY,
} from "./constants";

export function newInstallment(app: Application): number {
  // Flat-rate installment estimate, used only for the DBR check (rule 2).
  return (app.amount_aed * (1 + (FLAT_ANNUAL_RATE * app.term_months) / 12)) / app.term_months;
}

export function debtBurdenRatio(a: Applicant, app: Application): number {
  // Guard: zero or missing salary cannot pass rule 1 anyway; return Infinity so rule 2 fails
  // safely instead of dividing by zero (ground-truth row GT-11).
  if (a.monthly_salary_aed <= 0) return Infinity;
  return (a.existing_monthly_obligations_aed + newInstallment(app)) / a.monthly_salary_aed;
}

export const POLICY_RULES: PolicyRule[] = [
  {
    rule_id: "rule-1",
    title: "Minimum salary for the product",
    rule_text:
      "Applicants must earn at least the minimum monthly salary set for the product applied for.",
    source_section: "Lending Policy, section 1.1",
    condition: "monthly_salary_aed >= PRODUCT_MIN_SALARY",
    severity: "hard_fail",
    check: (a, app) => a.monthly_salary_aed >= PRODUCT_MIN_SALARY[app.product],
  },
  {
    rule_id: "rule-2",
    title: "Debt burden ratio cap",
    rule_text:
      "Total monthly debt obligations including the new installment must not exceed 50 percent of monthly salary.",
    source_section: "Lending Policy, section 2.1",
    condition:
      "(existing_monthly_obligations_aed + new_installment) / monthly_salary_aed <= 0.50",
    severity: "hard_fail",
    check: (a, app) => debtBurdenRatio(a, app) <= DBR_CAP,
  },
  {
    rule_id: "rule-3",
    title: "Maximum age at loan maturity",
    rule_text: "The applicant must be no older than 65 at the end of the loan term.",
    source_section: "Lending Policy, section 3.1",
    condition: "age_years + term_months / 12 <= 65",
    severity: "hard_fail",
    check: (a, app) => a.age_years + app.term_months / 12 <= MAX_AGE_AT_MATURITY,
  },
  {
    rule_id: "rule-4",
    title: "Minimum employment tenure",
    rule_text: "Applicants must show 6 months of continuous employment.",
    source_section: "Lending Policy, section 2.3",
    condition: "job_tenure_months >= 6",
    severity: "refer",
    check: (a) => a.job_tenure_months >= MIN_TENURE_MONTHS,
  },
  {
    rule_id: "rule-5",
    title: "Valid residency for the loan term",
    rule_text: "The applicant's residency visa must remain valid for the full loan term.",
    source_section: "Lending Policy, section 3.2",
    condition: "visa_months_remaining >= term_months",
    severity: "refer",
    check: (a, app) => a.visa_months_remaining >= app.term_months,
  },
  {
    rule_id: "rule-6",
    title: "Maximum loan amount as a multiple of salary",
    rule_text: "The requested amount must not exceed 20 times the applicant's monthly salary.",
    source_section: "Lending Policy, section 1.2",
    condition: "amount_aed <= AMOUNT_SALARY_MULTIPLE * monthly_salary_aed",
    severity: "hard_fail",
    check: (a, app) => app.amount_aed <= AMOUNT_SALARY_MULTIPLE * a.monthly_salary_aed,
  },
];

function findingFor(rule: PolicyRule, a: Applicant, app: Application, passed: boolean): string {
  const fmt = (n: number) => `AED ${Math.round(n).toLocaleString("en-US")}`;
  switch (rule.rule_id) {
    case "rule-1": {
      const min = PRODUCT_MIN_SALARY[app.product];
      return passed
        ? `salary ${fmt(a.monthly_salary_aed)} meets the ${fmt(min)} minimum`
        : `salary ${fmt(a.monthly_salary_aed)} is below the ${fmt(min)} minimum`;
    }
    case "rule-2": {
      const dbr = debtBurdenRatio(a, app);
      const pct = Number.isFinite(dbr)
        ? `${(dbr * 100).toFixed(1)} percent`
        : "not computable on zero salary";
      return passed
        ? `debt burden ratio ${pct}, within the 50 percent cap`
        : `debt burden ratio ${pct}, over the 50 percent cap`;
    }
    case "rule-3": {
      const atMaturity = a.age_years + app.term_months / 12;
      return passed
        ? `age at maturity ${atMaturity.toFixed(1)} is within the limit of 65`
        : `age at maturity ${atMaturity.toFixed(1)} exceeds the limit of 65`;
    }
    case "rule-4":
      return passed
        ? `tenure is ${a.job_tenure_months} months, meets the required ${MIN_TENURE_MONTHS}`
        : `tenure is ${a.job_tenure_months} months, rule requires ${MIN_TENURE_MONTHS}`;
    case "rule-5":
      return passed
        ? `visa has ${a.visa_months_remaining} months remaining, covers the ${app.term_months} month term`
        : `visa has ${a.visa_months_remaining} months remaining, shorter than the ${app.term_months} month term`;
    case "rule-6": {
      const cap = AMOUNT_SALARY_MULTIPLE * a.monthly_salary_aed;
      return passed
        ? `requested ${fmt(app.amount_aed)} is within the ${fmt(cap)} cap`
        : `requested ${fmt(app.amount_aed)} exceeds the ${fmt(cap)} cap (20x salary)`;
    }
    default:
      return passed ? "check passed" : "check failed";
  }
}

export function checkPolicy(a: Applicant, app: Application): PolicyCheckResult[] {
  return POLICY_RULES.map((rule) => {
    const passed = rule.check(a, app);
    return {
      rule_id: rule.rule_id,
      passed,
      cited_text: rule.rule_text,
      finding: findingFor(rule, a, app, passed),
    };
  });
}
