import { describe, expect, it } from "vitest";
import type { Applicant, Application } from "../src/lib/types";
import { checkPolicy, debtBurdenRatio } from "../src/lib/policy";
import { assess, combine } from "../src/lib/decision";
import { score } from "../src/lib/scorecard";

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
  checkPolicy(a, app).find((r) => r.rule_id === id)!;

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
    expect(debtBurdenRatio(a, app)).toBeCloseTo(0.5, 10);
    expect(ruleResult(a, app, "rule-2").passed).toBe(true);
    expect(
      ruleResult({ ...a, existing_monthly_obligations_aed: 2301 }, app, "rule-2").passed,
    ).toBe(false);
  });

  it("rule 2: zero salary fails safely, no division blowup (GT-11 guard)", () => {
    const a = { ...base, monthly_salary_aed: 0, employment_status: "unemployed" as const };
    expect(debtBurdenRatio(a, loan)).toBe(Infinity);
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
  it("always returns exactly 5 factors, each 0 to 20, total equals the sum", () => {
    const s = score(base, loan);
    expect(s.factors).toHaveLength(5);
    for (const f of s.factors) {
      expect(f.points_awarded).toBeGreaterThanOrEqual(0);
      expect(f.points_awarded).toBeLessThanOrEqual(20);
    }
    expect(s.total_points).toBe(s.factors.reduce((t, f) => t + f.points_awarded, 0));
  });

  it("policy-only fields never move the score (M4)", () => {
    const s1 = score(base, loan);
    const s2 = score(
      { ...base, existing_monthly_obligations_aed: 9999, age_years: 64, visa_months_remaining: 1 },
      loan,
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
