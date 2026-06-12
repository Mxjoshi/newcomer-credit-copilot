// The transparent judgmental scorecard (decision D7), pack-driven like the policy rules.
// Factor SEMANTICS (how to compute "salary headroom" or "settledness" from applicant fields)
// live here in code, keyed by factor_id; every number, tier, point value, factor name, and
// rationale lives in the market pack's scorecard block. The pack decides which factors run:
// uae v1.0 enables five (M1/M3, 0 to 20 points each, 100 total), and the screens render one
// row per enabled factor. The three policy-only fields (M4) never appear here.
//
// M5 guardrail, moved to the pack with the values: every tier is set from the domain rationale
// written next to it, never from the ground-truth labels. Changing a tier requires a rationale
// that stands on its own.

import type { Applicant, Application, RiskBand, ScoreFactor, ScoreResult } from "./types";
import type { BandCutoffs, Ruleset, RulesetParameters } from "./ruleset";
import { asObject, invalid, num, pickTier, points, str, tierTable } from "./packValidate";

export function bandFor(totalPoints: number, cutoffs: BandCutoffs): RiskBand {
  if (totalPoints >= cutoffs.low) return "low";
  if (totalPoints < cutoffs.high) return "high";
  return "medium";
}

// What a factor implementation produces; the pack-level factor_name is attached by the builder.
type FactorBody = Omit<ScoreFactor, "factor_name">;
type FactorImpl = (
  cfg: Record<string, unknown>,
  p: RulesetParameters,
  where: string,
) => (a: Applicant, app: Application) => FactorBody;

function categoryTable<K extends string>(
  raw: unknown,
  keys: readonly K[],
  where: string,
): Record<K, { points: number; rationale: string }> {
  const obj = asObject(raw, where);
  const out = {} as Record<K, { points: number; rationale: string }>;
  for (const key of keys) {
    const entry = asObject(obj[key], `${where}.${key}`);
    out[key] = {
      points: points(entry, "points", `${where}.${key}`),
      rationale: str(entry, "rationale", `${where}.${key}`),
    };
  }
  return out;
}

// The registry the pack builder draws from, mirroring RULE_CHECKS in policy.ts: a pack may
// only enable a factor_id that exists here; a genuinely new factor type is one keyed entry.
export const FACTOR_IMPLS: Record<string, FactorImpl> = {
  salary_headroom: (cfg, p, where) => {
    // The catch-all tier at min_ratio 0 is the below-minimum case.
    const tiers = tierTable(cfg.ratio_tiers, "min_ratio", `${where}.ratio_tiers`);
    return (a, app) => {
      const min = p.product_min_salary[app.product];
      const ratio = min > 0 ? a.monthly_salary_aed / min : 0;
      const tier = pickTier(tiers, ratio);
      return {
        applicant_value: `AED ${a.monthly_salary_aed.toLocaleString("en-US")}`,
        threshold: `vs product minimum AED ${min.toLocaleString("en-US")}`,
        points_awarded: tier.points,
        rationale: tier.rationale,
      };
    };
  },

  employment_tenure: (cfg, _p, where) => {
    const label = str(cfg as Record<string, unknown>, "threshold_label", where);
    const unemployed = asObject(cfg.unemployed, `${where}.unemployed`);
    const unemployedPoints = points(unemployed, "points", `${where}.unemployed`);
    const unemployedRationale = str(unemployed, "rationale", `${where}.unemployed`);
    const selfTiers = tierTable(cfg.self_employed_tiers, "min_months", `${where}.self_employed_tiers`);
    const employedTiers = tierTable(cfg.employed_tiers, "min_months", `${where}.employed_tiers`);
    return (a) => {
      let awarded: { points: number; rationale: string };
      if (a.employment_status === "unemployed") {
        awarded = { points: unemployedPoints, rationale: unemployedRationale };
      } else {
        const tiers = a.employment_status === "self_employed" ? selfTiers : employedTiers;
        awarded = pickTier(tiers, a.job_tenure_months);
      }
      return {
        applicant_value: `${a.employment_status.replace("_", " ")}, ${a.job_tenure_months} months`,
        threshold: label,
        points_awarded: awarded.points,
        rationale: awarded.rationale,
      };
    };
  },

  employer_category: (cfg, _p, where) => {
    const label = str(cfg as Record<string, unknown>, "threshold_label", where);
    const table = categoryTable(
      cfg.categories,
      ["government", "mainland_private", "free_zone", "sme", "other"] as const,
      `${where}.categories`,
    );
    return (a) => ({
      applicant_value: a.employer_category.replace("_", " "),
      threshold: label,
      points_awarded: table[a.employer_category].points,
      rationale: table[a.employer_category].rationale,
    });
  },

  settledness: (cfg, _p, where) => {
    const label = str(cfg as Record<string, unknown>, "threshold_label", where);
    const tiers = tierTable(cfg.month_tiers, "min_months", `${where}.month_tiers`);
    const bonusRaw = asObject(cfg.visa_bonus, `${where}.visa_bonus`);
    const bonus = {
      golden: num(bonusRaw, "golden", `${where}.visa_bonus`),
      green: num(bonusRaw, "green", `${where}.visa_bonus`),
      employment: num(bonusRaw, "employment", `${where}.visa_bonus`),
      other: num(bonusRaw, "other", `${where}.visa_bonus`),
    };
    const longTermVisas = cfg.long_term_visas;
    if (!Array.isArray(longTermVisas) || longTermVisas.some((v) => typeof v !== "string"))
      invalid(`${where}.long_term_visas must be an array of visa types`);
    const longTermRationale = str(
      cfg as Record<string, unknown>,
      "long_term_bonus_rationale",
      where,
    );
    const maxPoints = points(cfg as Record<string, unknown>, "max_points", where);
    return (a) => {
      const tier = pickTier(tiers, a.months_in_uae);
      const isLongTerm = (longTermVisas as string[]).includes(a.visa_type);
      const awarded = Math.min(maxPoints, tier.points + bonus[a.visa_type]);
      return {
        applicant_value: `${a.months_in_uae} months, ${a.visa_type} visa`,
        threshold: label,
        points_awarded: awarded,
        rationale: isLongTerm ? longTermRationale : tier.rationale,
      };
    };
  },

  rent_history: (cfg, _p, where) => {
    const label = str(cfg as Record<string, unknown>, "threshold_label", where);
    const table = categoryTable(
      cfg.categories,
      ["on_time_6plus", "on_time_under_6", "none", "late_payments"] as const,
      `${where}.categories`,
    );
    return (a) => ({
      applicant_value: a.rent_history.replace(/_/g, " "),
      threshold: label,
      points_awarded: table[a.rent_history].points,
      rationale: table[a.rent_history].rationale,
    });
  },
};

// Runs every enabled factor in the pack, in pack order. One ScoreFactor per enabled factor:
// a pack with 4 factors yields 4 rows on screen, never a fixed five.
export function score(applicant: Applicant, application: Application, ruleset: Ruleset): ScoreResult {
  const factors = ruleset.scorecard.map((f) => f.compute(applicant, application));
  const total = factors.reduce((s, f) => s + f.points_awarded, 0);
  return { factors, total_points: total, risk_band: bandFor(total, ruleset.band_cutoffs) };
}
