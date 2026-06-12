// Market packs: every policy value, rule sentence, citation, and band cut-off the engine uses,
// loaded from config/<market>/ JSON instead of code. The engine's rule semantics (the check
// functions in policy.ts) stay in code, keyed by rule_id; the pack decides which rules run,
// with which numbers, citing which sentences. rule_text placeholders like {dbr_cap_pct} are
// rendered here from the same parameters the checks enforce, so the citation and the
// enforcement cannot disagree. A new market is a new config folder, not a fork of the engine.

import type { PolicyRule, Product, RiskBand, Severity } from "./types";
import { RULE_CHECKS, pctOf } from "./policy";
import uaeV1Json from "../../config/uae/policy-rules.v1.0.json";
import uaeCurrentJson from "../../config/uae/policy-rules.json";

export interface RulesetParameters {
  product_min_salary: Record<Product, number>;
  flat_annual_rate: number;
  dbr_cap: number;
  amount_salary_multiple: number;
  max_age_at_maturity: number;
  min_tenure_months: number;
  personal_loan_max_term_months: number;
}

export interface BandCutoffs {
  low: number; // total_points >= low -> low risk
  high: number; // total_points < high -> high risk; otherwise medium
}

export interface Ruleset {
  market: string;
  market_name: string;
  ruleset_version: string;
  currency: string;
  regulator: string;
  bureau: string;
  parameters: RulesetParameters;
  band_cutoffs: BandCutoffs;
  rules: PolicyRule[]; // enabled rules only, text rendered, checks attached, pack order kept
}

function invalid(msg: string): never {
  throw new Error(`invalid market pack: ${msg}`);
}

function asObject(v: unknown, where: string): Record<string, unknown> {
  if (typeof v !== "object" || v === null || Array.isArray(v)) invalid(`${where} must be an object`);
  return v as Record<string, unknown>;
}

function num(obj: Record<string, unknown>, key: string, where: string): number {
  const v = obj[key];
  if (typeof v !== "number" || !Number.isFinite(v)) invalid(`${where}.${key} must be a number`);
  return v;
}

function str(obj: Record<string, unknown>, key: string, where: string): string {
  const v = obj[key];
  if (typeof v !== "string" || v.length === 0) invalid(`${where}.${key} must be a non-empty string`);
  return v;
}

// Replaces {placeholder} tokens; an unknown placeholder is a config typo and must fail loudly,
// never render as literal braces in a cited sentence.
export function renderTemplate(
  template: string,
  values: Record<string, string>,
  where: string,
): string {
  return template.replace(/\{([a-z_]+)\}/g, (_match, key: string) => {
    const v = values[key];
    if (v === undefined) invalid(`${where} uses unknown placeholder {${key}}`);
    return v;
  });
}

export function templateValues(p: RulesetParameters): Record<string, string> {
  return {
    dbr_cap: p.dbr_cap.toFixed(2),
    dbr_cap_pct: pctOf(p.dbr_cap),
    amount_salary_multiple: String(p.amount_salary_multiple),
    max_age_at_maturity: String(p.max_age_at_maturity),
    min_tenure_months: String(p.min_tenure_months),
    flat_annual_rate: String(p.flat_annual_rate),
    personal_loan_max_term_months: String(p.personal_loan_max_term_months),
  };
}

// Builds a typed, validated Ruleset from raw pack JSON. Throws on anything malformed: a pack
// that half-loads would silently skip rules, and silent skips are the one thing this engine
// promises never to do. Keys starting with "_" are documentation and ignored.
export function buildRuleset(json: unknown): Ruleset {
  const pack = asObject(json, "pack");

  const paramsRaw = asObject(pack.parameters, "parameters");
  const minSalaryRaw = asObject(paramsRaw.product_min_salary, "parameters.product_min_salary");
  const parameters: RulesetParameters = {
    product_min_salary: {
      personal_loan: num(minSalaryRaw, "personal_loan", "parameters.product_min_salary"),
      credit_card: num(minSalaryRaw, "credit_card", "parameters.product_min_salary"),
    },
    flat_annual_rate: num(paramsRaw, "flat_annual_rate", "parameters"),
    dbr_cap: num(paramsRaw, "dbr_cap", "parameters"),
    amount_salary_multiple: num(paramsRaw, "amount_salary_multiple", "parameters"),
    max_age_at_maturity: num(paramsRaw, "max_age_at_maturity", "parameters"),
    min_tenure_months: num(paramsRaw, "min_tenure_months", "parameters"),
    personal_loan_max_term_months: num(paramsRaw, "personal_loan_max_term_months", "parameters"),
  };

  const cutoffsRaw = asObject(pack.band_cutoffs, "band_cutoffs");
  const band_cutoffs: BandCutoffs = {
    low: num(cutoffsRaw, "low", "band_cutoffs"),
    high: num(cutoffsRaw, "high", "band_cutoffs"),
  };
  if (band_cutoffs.low <= band_cutoffs.high)
    invalid("band_cutoffs.low must be above band_cutoffs.high");

  if (!Array.isArray(pack.rules) || pack.rules.length === 0)
    invalid("rules must be a non-empty array");
  const values = templateValues(parameters);
  const seen = new Set<string>();
  const rules: PolicyRule[] = [];
  for (const entry of pack.rules) {
    const r = asObject(entry, "rules[]");
    const rule_id = str(r, "rule_id", "rules[]");
    if (seen.has(rule_id)) invalid(`duplicate rule_id ${rule_id}`);
    seen.add(rule_id);
    if (typeof r.enabled !== "boolean") invalid(`${rule_id}.enabled must be true or false`);
    if (!r.enabled) continue;
    const severity = str(r, "severity", rule_id);
    if (severity !== "hard_fail" && severity !== "refer")
      invalid(`${rule_id}.severity must be hard_fail or refer`);
    const makeCheck = RULE_CHECKS[rule_id];
    if (!makeCheck)
      invalid(
        `no check implementation registered for ${rule_id}; rule semantics live in code ` +
          `(src/lib/policy.ts RULE_CHECKS), add one before enabling it in config`,
      );
    rules.push({
      rule_id,
      title: str(r, "title", rule_id),
      rule_text: renderTemplate(str(r, "rule_text", rule_id), values, `${rule_id}.rule_text`),
      source_section: str(r, "source_section", rule_id),
      condition: renderTemplate(str(r, "condition", rule_id), values, `${rule_id}.condition`),
      severity: severity as Severity,
      check: makeCheck(parameters),
    });
  }
  if (rules.length === 0) invalid("every rule is disabled; the pack must enable at least one");

  return {
    market: str(pack, "market", "pack"),
    market_name: str(pack, "market_name", "pack"),
    ruleset_version: str(pack, "ruleset_version", "pack"),
    currency: str(pack, "currency", "pack"),
    regulator: str(pack, "regulator", "pack"),
    bureau: str(pack, "bureau", "pack"),
    parameters,
    band_cutoffs,
    rules,
  };
}

export function bandFor(totalPoints: number, cutoffs: BandCutoffs): RiskBand {
  if (totalPoints >= cutoffs.low) return "low";
  if (totalPoints < cutoffs.high) return "high";
  return "medium";
}

// The packs the app knows at import time. UAE_V1 is the locked reference (the impact view's
// champion); CURRENT_RULESET comes from the editable live file, which starts as an exact copy.
// In `next dev` an edit to the live file is picked up on reload; the Step 5 UI adds the
// re-read-from-disk route so a rerun reflects the file without a restart.
export const UAE_V1: Ruleset = buildRuleset(uaeV1Json);
export const CURRENT_RULESET: Ruleset = buildRuleset(uaeCurrentJson);
