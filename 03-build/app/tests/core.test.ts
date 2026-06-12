import { describe, expect, it } from "vitest";
import type { Applicant, Application } from "../src/lib/types";
import { checkPolicy, debtBurdenRatio } from "../src/lib/policy";
import { assess, combine } from "../src/lib/decision";
import { score } from "../src/lib/scorecard";
import { CURRENT_RULESET, UAE_V1, buildRuleset } from "../src/lib/ruleset";
import uaeV1Json from "../config/uae/policy-rules.v1.0.json";

// The boundary tests pin to the LOCKED v1.0 pack, not the editable live file, so an edited
// live ruleset (the demo changes it) can never make the locked edges look broken.
const V1 = UAE_V1;

// A strong baseline applicant; tests override single fields to probe one boundary at a time.
const base: Applicant = {
  full_name: "Test Applicant",
  months_in_uae: 12,
  visa_type: "employment",
  employment_status: "employed",
  job_tenure_months: 12,
  employer_category: "government",
  monthly_salary_aed: 20000,
  rent_history: "on_time_6plus",
  existing_monthly_obligations_aed: 0,
  age_years: 30,
  visa_months_remaining: 48,
};

const loan: Application = { product: "personal_loan", amount_aed: 40000, term_months: 12 };

const ruleResult = (a: Applicant, app: Application, id: string) =>
  checkPolicy(a, app, V1).find((r) => r.rule_id === id)!;

describe("rule boundaries (the locked ground-truth edges)", () => {
  it("rule 1: salary exactly at the product minimum passes; one dirham below fails", () => {
    expect(ruleResult({ ...base, monthly_salary_aed: 8000 }, loan, "rule-1").passed).toBe(true);
    expect(ruleResult({ ...base, monthly_salary_aed: 7999 }, loan, "rule-1").passed).toBe(false);
  });

  it("rule 1: credit card uses the 5,000 minimum", () => {
    const card: Application = { product: "credit_card", amount_aed: 10000, term_months: 12 };
    expect(ruleResult({ ...base, monthly_salary_aed: 5000 }, card, "rule-1").passed).toBe(true);
    expect(ruleResult({ ...base, monthly_salary_aed: 4999 }, card, "rule-1").passed).toBe(false);
  });

  it("rule 2: DBR exactly 0.50 passes (GT-04 numbers), above fails", () => {
    // installment = 30,000 * 1.08 / 12 = 2,700; (2,300 + 2,700) / 10,000 = 0.50 exactly
    const a = { ...base, monthly_salary_aed: 10000, existing_monthly_obligations_aed: 2300 };
    const app: Application = { product: "personal_loan", amount_aed: 30000, term_months: 12 };
    expect(debtBurdenRatio(a, app, V1.parameters)).toBeCloseTo(0.5, 10);
    expect(ruleResult(a, app, "rule-2").passed).toBe(true);
    expect(
      ruleResult({ ...a, existing_monthly_obligations_aed: 2301 }, app, "rule-2").passed,
    ).toBe(false);
  });

  it("rule 2: zero salary fails safely, no division blowup (GT-11 guard)", () => {
    const a = { ...base, monthly_salary_aed: 0, employment_status: "unemployed" as const };
    expect(debtBurdenRatio(a, loan, V1.parameters)).toBe(Infinity);
    expect(ruleResult(a, loan, "rule-2").passed).toBe(false);
    expect(ruleResult(a, loan, "rule-2").finding).toContain("not computable");
  });

  it("rule 3: age at maturity exactly 65 passes (GT-05), 66 fails (GT-14)", () => {
    const app36: Application = { product: "personal_loan", amount_aed: 80000, term_months: 36 };
    expect(ruleResult({ ...base, age_years: 62 }, app36, "rule-3").passed).toBe(true);
    const app24: Application = { product: "personal_loan", amount_aed: 50000, term_months: 24 };
    expect(ruleResult({ ...base, age_years: 64 }, app24, "rule-3").passed).toBe(false);
  });

  it("rule 4: tenure exactly 6 passes (GT-02), 5 fails", () => {
    expect(ruleResult({ ...base, job_tenure_months: 6 }, loan, "rule-4").passed).toBe(true);
    expect(ruleResult({ ...base, job_tenure_months: 5 }, loan, "rule-4").passed).toBe(false);
  });

  it("rule 5: visa equal to term passes (GT-19), one month short fails", () => {
    const app: Application = { product: "personal_loan", amount_aed: 40000, term_months: 24 };
    expect(ruleResult({ ...base, visa_months_remaining: 24 }, app, "rule-5").passed).toBe(true);
    expect(ruleResult({ ...base, visa_months_remaining: 23 }, app, "rule-5").passed).toBe(false);
  });

  it("rule 6: amount exactly 20x salary passes, above fails (GT-13)", () => {
    const a = { ...base, monthly_salary_aed: 8500 };
    expect(
      ruleResult(a, { product: "personal_loan", amount_aed: 170000, term_months: 12 }, "rule-6")
        .passed,
    ).toBe(true);
    expect(
      ruleResult(a, { product: "personal_loan", amount_aed: 170001, term_months: 12 }, "rule-6")
        .passed,
    ).toBe(false);
  });
});

describe("scorecard shape", () => {
  it("returns one factor per enabled pack factor (5 in uae v1.0), each 0 to 20", () => {
    const s = score(base, loan, V1);
    expect(s.factors).toHaveLength(5);
    for (const f of s.factors) {
      expect(f.points_awarded).toBeGreaterThanOrEqual(0);
      expect(f.points_awarded).toBeLessThanOrEqual(20);
    }
    expect(s.total_points).toBe(s.factors.reduce((t, f) => t + f.points_awarded, 0));
  });

  it("policy-only fields never move the score (M4)", () => {
    const s1 = score(base, loan, V1);
    const s2 = score(
      { ...base, existing_monthly_obligations_aed: 9999, age_years: 64, visa_months_remaining: 1 },
      loan,
      V1,
    );
    expect(s2.total_points).toBe(s1.total_points);
  });
});

describe("combination logic (corrected per the 2026-06-11 review)", () => {
  const lowBand = { factors: [], total_points: 90, risk_band: "low" as const };
  const medBand = { factors: [], total_points: 60, risk_band: "medium" as const };
  const highBand = { factors: [], total_points: 30, risk_band: "high" as const };
  const pass = (id: string) => ({ rule_id: id, passed: true, cited_text: "", finding: "" });
  const fail = (id: string) => ({ rule_id: id, passed: false, cited_text: "", finding: "" });
  const allPass = ["rule-1", "rule-2", "rule-3", "rule-4", "rule-5", "rule-6"].map(pass);

  it("hard_fail forces decline even on a low-risk score", () => {
    expect(combine(lowBand, [...allPass.slice(1), fail("rule-1")])).toBe("decline");
  });

  it("high band declines even when only refer-severity rules failed (never rescued)", () => {
    expect(
      combine(highBand, [...allPass.slice(0, 3), fail("rule-4"), pass("rule-5"), pass("rule-6")]),
    ).toBe("decline");
  });

  it("medium band refers", () => {
    expect(combine(medBand, allPass)).toBe("refer");
  });

  it("low band approves when everything passes", () => {
    expect(combine(lowBand, allPass)).toBe("approve");
  });

  it("refer-severity failure downgrades a low-band approve to refer", () => {
    expect(combine(lowBand, [...allPass.slice(0, 4), fail("rule-5"), pass("rule-6")])).toBe(
      "refer",
    );
  });
});

describe("market pack (policy is configuration, not code)", () => {
  type DraftPack = {
    ruleset_version: string;
    parameters: { dbr_cap: number };
    rules: Array<{ rule_id: string; enabled: boolean; [key: string]: unknown }>;
    scorecard: {
      factors: Array<{
        factor_id: string;
        enabled: boolean;
        categories?: Record<string, { points: number; rationale: string }>;
        [key: string]: unknown;
      }>;
    };
  };
  const draftPack = (): DraftPack => structuredClone(uaeV1Json) as unknown as DraftPack;

  it("the live pack matches the locked v1.0 pack (nobody edited current without a decision)", () => {
    expect(CURRENT_RULESET.ruleset_version).toBe(V1.ruleset_version);
    expect(CURRENT_RULESET.parameters).toEqual(V1.parameters);
    expect(CURRENT_RULESET.band_cutoffs).toEqual(V1.band_cutoffs);
    expect(CURRENT_RULESET.rules.map((r) => [r.rule_id, r.rule_text, r.severity])).toEqual(
      V1.rules.map((r) => [r.rule_id, r.rule_text, r.severity]),
    );
  });

  it("rule text and condition render the configured number (citation cannot disagree)", () => {
    const rule2 = V1.rules.find((r) => r.rule_id === "rule-2")!;
    expect(rule2.rule_text).toBe(
      "Total monthly debt obligations including the new installment must not exceed 50 percent of monthly salary.",
    );
    expect(rule2.condition).toContain("<= 0.50");
  });

  it("the demo edit: dbr_cap 0.45 flips the GT-04 boundary AND the citation follows", () => {
    const draft = draftPack();
    draft.parameters.dbr_cap = 0.45;
    draft.ruleset_version = "uae-v1.1-draft";
    const challenger = buildRuleset(draft);

    // DBR exactly 0.50: passes the locked pack, fails the tightened one
    const a = { ...base, monthly_salary_aed: 10000, existing_monthly_obligations_aed: 2300 };
    const app: Application = { product: "personal_loan", amount_aed: 30000, term_months: 12 };
    expect(checkPolicy(a, app, V1).find((r) => r.rule_id === "rule-2")!.passed).toBe(true);
    const tightened = checkPolicy(a, app, challenger).find((r) => r.rule_id === "rule-2")!;
    expect(tightened.passed).toBe(false);
    expect(tightened.cited_text).toContain("45 percent");
    expect(tightened.finding).toContain("45 percent cap");

    // The full decision flips, stamps the draft version, and the counterfactual cites 45
    const d = assess(a, app, challenger);
    expect(d.recommendation).toBe("decline");
    expect(d.ruleset_version).toBe("uae-v1.1-draft");
    expect(d.counterfactuals.join(" ")).toContain("45 percent cap");
    expect(assess(a, app, V1).recommendation).toBe("approve");
  });

  it("the rule count comes from the pack: disable one rule, get one fewer result", () => {
    const draft = draftPack();
    draft.rules.find((r) => r.rule_id === "rule-5")!.enabled = false;
    const pack = buildRuleset(draft);
    expect(pack.rules).toHaveLength(5);
    const results = checkPolicy(base, loan, pack);
    expect(results).toHaveLength(5);
    expect(results.some((r) => r.rule_id === "rule-5")).toBe(false);
  });

  it("a pack rule with no check implementation refuses to load (no silent skips)", () => {
    const draft = draftPack();
    draft.rules.push({
      rule_id: "rule-99",
      enabled: true,
      title: "Imaginary rule",
      rule_text: "Some sentence.",
      source_section: "Nowhere, section 0",
      condition: "true",
      severity: "refer",
    });
    expect(() => buildRuleset(draft)).toThrow(/no check implementation/);
  });

  it("an unknown placeholder in rule text refuses to load (config typos fail loudly)", () => {
    const draft = draftPack();
    draft.rules.find((r) => r.rule_id === "rule-2")!.rule_text = "Cap is {dbr_capp} percent.";
    expect(() => buildRuleset(draft)).toThrow(/unknown placeholder/);
  });

  it("every decision is stamped with the ruleset version", () => {
    expect(assess(base, loan).ruleset_version).toBe(CURRENT_RULESET.ruleset_version);
  });

  it("scorecard points come from the pack: lowering a tier moves the total", () => {
    const draft = draftPack();
    const rent = draft.scorecard.factors.find((f) => f.factor_id === "rent_history")!;
    rent.categories!.on_time_6plus.points = 10;
    const pack = buildRuleset(draft);
    expect(score(base, loan, pack).total_points).toBe(score(base, loan, V1).total_points - 10);
  });

  it("the factor count comes from the pack: disable one factor, get one fewer row", () => {
    const draft = draftPack();
    draft.scorecard.factors.find((f) => f.factor_id === "rent_history")!.enabled = false;
    const pack = buildRuleset(draft);
    expect(pack.scorecard).toHaveLength(4);
    expect(score(base, loan, pack).factors).toHaveLength(4);
  });

  it("a pack factor with no implementation refuses to load (no silent skips)", () => {
    const draft = draftPack();
    draft.scorecard.factors.push({
      factor_id: "astrology_sign",
      enabled: true,
      factor_name: "Star sign",
    });
    expect(() => buildRuleset(draft)).toThrow(/no factor implementation/);
  });
});

describe("counterfactuals", () => {
  it("empty for an approve", () => {
    const d = assess(base, loan);
    expect(d.recommendation).toBe("approve");
    expect(d.counterfactuals).toEqual([]);
  });

  it("a refer caused only by tenure names the tenure fix", () => {
    const d = assess({ ...base, job_tenure_months: 3 }, loan);
    expect(d.recommendation).not.toBe("approve");
    expect(d.counterfactuals.join(" ")).toContain("6 months of tenure");
  });

  it("never written by the LLM: generated even before any explanation exists", () => {
    const d = assess({ ...base, job_tenure_months: 3 }, loan);
    expect(d.explanation).toBe("");
    expect(d.counterfactuals.length).toBeGreaterThan(0);
  });
});
