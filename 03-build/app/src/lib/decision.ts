// Combination logic and counterfactual generation, verbatim from the data model's
// "How a decision is derived": any hard_fail means DECLINE; otherwise the band maps high to
// DECLINE, medium to REFER, low to APPROVE unless a refer-severity rule failed, which
// downgrades the approve to REFER. A refer failure never upgrades a decline (D6).
// Everything is parameterized by the market pack; the default is the live ruleset from
// config/uae/policy-rules.json.

import type {
  Applicant,
  Application,
  Decision,
  PolicyCheckResult,
  Recommendation,
  ScoreResult,
} from "./types";
import { checkPolicy, pctOf } from "./policy";
import { CURRENT_RULESET, type Ruleset, type RulesetParameters } from "./ruleset";
import { score } from "./scorecard";

function severityOf(ruleId: string, ruleset: Ruleset): "hard_fail" | "refer" {
  const rule = ruleset.rules.find((r) => r.rule_id === ruleId);
  if (!rule) throw new Error(`unknown rule_id ${ruleId}`);
  return rule.severity;
}

export function combine(
  scoreResult: ScoreResult,
  policyResults: PolicyCheckResult[],
  ruleset: Ruleset = CURRENT_RULESET,
): Recommendation {
  const failed = policyResults.filter((p) => !p.passed);
  if (failed.some((p) => severityOf(p.rule_id, ruleset) === "hard_fail")) return "decline";
  if (scoreResult.risk_band === "high") return "decline";
  if (scoreResult.risk_band === "medium") return "refer";
  // low band: a refer-severity failure downgrades the approve, never rescues anything
  return failed.some((p) => severityOf(p.rule_id, ruleset) === "refer") ? "refer" : "approve";
}

const fmt = (n: number) => `AED ${Math.round(n).toLocaleString("en-US")}`;

function ruleCounterfactual(
  ruleId: string,
  a: Applicant,
  app: Application,
  p: RulesetParameters,
): string | null {
  switch (ruleId) {
    case "rule-1":
      return `a monthly salary of ${fmt(p.product_min_salary[app.product])} would meet the product minimum (rule 1)`;
    case "rule-2": {
      const capPct = pctOf(p.dbr_cap);
      const headroom = p.dbr_cap * a.monthly_salary_aed - a.existing_monthly_obligations_aed;
      if (headroom <= 0) {
        return `existing obligations alone exceed the ${capPct} percent debt burden cap at this salary; no loan amount fits (rule 2)`;
      }
      const maxAmount =
        (headroom * app.term_months) / (1 + (p.flat_annual_rate * app.term_months) / 12);
      return `reducing the requested amount to about ${fmt(maxAmount)} would bring the debt burden ratio within the ${capPct} percent cap (rule 2)`;
    }
    case "rule-3": {
      const maxTerm = Math.floor((p.max_age_at_maturity - a.age_years) * 12);
      return maxTerm > 0
        ? `a term of ${maxTerm} months or less would keep age at maturity within ${p.max_age_at_maturity} (rule 3)`
        : `age already exceeds the maturity limit for any loan term (rule 3)`;
    }
    case "rule-4": {
      const more = p.min_tenure_months - a.job_tenure_months;
      return `reaching ${p.min_tenure_months} months of tenure (${more} more) would clear the minimum tenure rule (rule 4)`;
    }
    case "rule-5":
      return `a term within the visa's remaining ${a.visa_months_remaining} months, or a visa renewal covering the ${app.term_months} month term, would clear the residency rule (rule 5)`;
    case "rule-6":
      return `reducing the requested amount to ${fmt(p.amount_salary_multiple * a.monthly_salary_aed)} (${p.amount_salary_multiple} times salary) would clear the amount cap (rule 6)`;
    default:
      return null;
  }
}

export function counterfactuals(
  a: Applicant,
  app: Application,
  scoreResult: ScoreResult,
  policyResults: PolicyCheckResult[],
  recommendation: Recommendation,
  ruleset: Ruleset = CURRENT_RULESET,
): string[] {
  if (recommendation === "approve") return [];
  const lines: string[] = [];
  for (const p of policyResults) {
    if (!p.passed) {
      const line = ruleCounterfactual(p.rule_id, a, app, ruleset.parameters);
      if (line) lines.push(line);
    }
  }
  // Band-driven outcomes get a deterministic score counterfactual: the gap to the next band
  // and the two factors with the most ground to make up.
  if (scoreResult.risk_band !== "low") {
    const target = ruleset.band_cutoffs.low;
    const gap = target - scoreResult.total_points;
    const weakest = [...scoreResult.factors]
      .sort((x, y) => x.points_awarded - y.points_awarded)
      .slice(0, 2)
      .map((f) => `${f.factor_name} (${f.points_awarded} of 20)`);
    lines.push(
      `the score is ${scoreResult.total_points} of 100; reaching ${target} (low risk) needs ${gap} more points, with the largest gaps on ${weakest.join(" and ")}`,
    );
  }
  return lines;
}

// Runs the full deterministic pipeline. The explanation is filled in later by the LLM step
// (or the template fallback); it starts empty so nothing ungrounded ever ships by default.
export function assess(a: Applicant, app: Application, ruleset: Ruleset = CURRENT_RULESET): Decision {
  const score_result = score(a, app, ruleset);
  const policy_results = checkPolicy(a, app, ruleset);
  const recommendation = combine(score_result, policy_results, ruleset);
  return {
    recommendation,
    risk_band: score_result.risk_band,
    ruleset_version: ruleset.ruleset_version,
    explanation: "",
    reasons: [],
    counterfactuals: counterfactuals(a, app, score_result, policy_results, recommendation, ruleset),
    score_result,
    policy_results,
    officer_action: "none",
  };
}
