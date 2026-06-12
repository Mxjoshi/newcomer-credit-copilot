// The policy rule SEMANTICS: one check implementation per rule_id, parameterized by the market
// pack (config/<market>/policy-rules.json). Which rules run, with which numbers, citing which
// sentences, is the pack's call (ruleset.ts builds and validates it); what a rule MEANS is code
// here. Every enabled rule is checked every time, no silent skips. cited_text is the pack's
// rendered rule_text; the 100 percent policy-grounding metric requires citations to trace back
// to it verbatim. Rule 7 from the data model's candidate list (salary paid into a bank account)
// stays cut: no v1 field backs it, documented in the data model.

import type { Applicant, Application, PolicyCheckResult } from "./types";
import type { Ruleset, RulesetParameters } from "./ruleset";

export function newInstallment(app: Application, p: RulesetParameters): number {
  // Flat-rate installment estimate, used only for the DBR check (rule 2).
  return (app.amount_aed * (1 + (p.flat_annual_rate * app.term_months) / 12)) / app.term_months;
}

export function debtBurdenRatio(a: Applicant, app: Application, p: RulesetParameters): number {
  // Guard: zero or missing salary cannot pass rule 1 anyway; return Infinity so rule 2 fails
  // safely instead of dividing by zero (ground-truth row GT-11).
  if (a.monthly_salary_aed <= 0) return Infinity;
  return (a.existing_monthly_obligations_aed + newInstallment(app, p)) / a.monthly_salary_aed;
}

// Percent display for a ratio parameter: 0.5 -> "50", 0.45 -> "45" (no float noise).
export const pctOf = (ratio: number) => String(Math.round(ratio * 10000) / 100);

type Check = (a: Applicant, app: Application) => boolean;

// The registry the pack builder draws from. A pack may only enable a rule_id that exists here;
// adding a genuinely new rule type is one keyed entry, everything else about it lives in config.
export const RULE_CHECKS: Record<string, (p: RulesetParameters) => Check> = {
  "rule-1": (p) => (a, app) => a.monthly_salary_aed >= p.product_min_salary[app.product],
  "rule-2": (p) => (a, app) => debtBurdenRatio(a, app, p) <= p.dbr_cap,
  "rule-3": (p) => (a, app) => a.age_years + app.term_months / 12 <= p.max_age_at_maturity,
  "rule-4": (p) => (a) => a.job_tenure_months >= p.min_tenure_months,
  "rule-5": () => (a, app) => a.visa_months_remaining >= app.term_months,
  "rule-6": (p) => (a, app) => app.amount_aed <= p.amount_salary_multiple * a.monthly_salary_aed,
};

function findingFor(
  ruleId: string,
  a: Applicant,
  app: Application,
  passed: boolean,
  p: RulesetParameters,
): string {
  const fmt = (n: number) => `AED ${Math.round(n).toLocaleString("en-US")}`;
  switch (ruleId) {
    case "rule-1": {
      const min = p.product_min_salary[app.product];
      return passed
        ? `salary ${fmt(a.monthly_salary_aed)} meets the ${fmt(min)} minimum`
        : `salary ${fmt(a.monthly_salary_aed)} is below the ${fmt(min)} minimum`;
    }
    case "rule-2": {
      const dbr = debtBurdenRatio(a, app, p);
      const shown = Number.isFinite(dbr)
        ? `${(dbr * 100).toFixed(1)} percent`
        : "not computable on zero salary";
      const cap = `${pctOf(p.dbr_cap)} percent`;
      return passed
        ? `debt burden ratio ${shown}, within the ${cap} cap`
        : `debt burden ratio ${shown}, over the ${cap} cap`;
    }
    case "rule-3": {
      const atMaturity = a.age_years + app.term_months / 12;
      return passed
        ? `age at maturity ${atMaturity.toFixed(1)} is within the limit of ${p.max_age_at_maturity}`
        : `age at maturity ${atMaturity.toFixed(1)} exceeds the limit of ${p.max_age_at_maturity}`;
    }
    case "rule-4":
      return passed
        ? `tenure is ${a.job_tenure_months} months, meets the required ${p.min_tenure_months}`
        : `tenure is ${a.job_tenure_months} months, rule requires ${p.min_tenure_months}`;
    case "rule-5":
      return passed
        ? `visa has ${a.visa_months_remaining} months remaining, covers the ${app.term_months} month term`
        : `visa has ${a.visa_months_remaining} months remaining, shorter than the ${app.term_months} month term`;
    case "rule-6": {
      const cap = p.amount_salary_multiple * a.monthly_salary_aed;
      return passed
        ? `requested ${fmt(app.amount_aed)} is within the ${fmt(cap)} cap`
        : `requested ${fmt(app.amount_aed)} exceeds the ${fmt(cap)} cap (${p.amount_salary_multiple}x salary)`;
    }
    default:
      return passed ? "check passed" : "check failed";
  }
}

// Runs every enabled rule in the pack, in pack order. The decision screen renders one element
// per result here: a pack with 10 enabled rules shows 10, a pack with 5 shows 5.
export function checkPolicy(a: Applicant, app: Application, ruleset: Ruleset): PolicyCheckResult[] {
  return ruleset.rules.map((rule) => {
    const passed = rule.check(a, app);
    return {
      rule_id: rule.rule_id,
      passed,
      cited_text: rule.rule_text,
      finding: findingFor(rule.rule_id, a, app, passed, ruleset.parameters),
    };
  });
}
