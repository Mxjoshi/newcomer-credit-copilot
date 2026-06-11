// The transparent judgmental scorecard (decision D7). Exactly the five M1 factors, 0 to 20
// points each, 100 total (decision M3). The three policy-only fields (M4) never appear here.
//
// M5 guardrail: every tier below is set from the domain rationale written next to it, never
// from the ground-truth labels. The harness reports how these land; changing a tier requires a
// rationale that stands on its own.

import type { Applicant, Application, ScoreFactor, ScoreResult } from "./types";
import { PRODUCT_MIN_SALARY, bandFor } from "./constants";

function salaryFactor(a: Applicant, app: Application): ScoreFactor {
  const min = PRODUCT_MIN_SALARY[app.product];
  const ratio = min > 0 ? a.monthly_salary_aed / min : 0;
  // Rationale: capacity is about headroom over the product minimum, not the absolute number.
  // Double the minimum is a strong cushion; at the minimum the applicant passes policy but has
  // no buffer for shocks, which matters more for a newcomer with no local safety net.
  let points: number;
  let rationale: string;
  if (ratio >= 2.0) {
    points = 20;
    rationale = "salary is at least double the product minimum, strong repayment cushion";
  } else if (ratio >= 1.5) {
    points = 16;
    rationale = "salary is well above the product minimum";
  } else if (ratio >= 1.2) {
    points = 12;
    rationale = "salary is moderately above the product minimum";
  } else if (ratio >= 1.0) {
    points = 8;
    rationale = "salary meets the product minimum with little headroom";
  } else {
    points = 0;
    rationale = "salary is below the product minimum";
  }
  return {
    factor_name: "Monthly salary",
    applicant_value: `AED ${a.monthly_salary_aed.toLocaleString("en-US")}`,
    threshold: `vs product minimum AED ${min.toLocaleString("en-US")}`,
    points_awarded: points,
    rationale,
  };
}

function employmentFactor(a: Applicant): ScoreFactor {
  // Rationale: 6 months tenure matches the policy threshold (one full probation period);
  // 12 months is a completed review cycle. Self-employment is capped lower not because the
  // income is worse but because v1 cannot verify drawings the way it can a salary letter.
  let points: number;
  let rationale: string;
  if (a.employment_status === "unemployed") {
    points = 0;
    rationale = "no current employment income";
  } else if (a.employment_status === "self_employed") {
    if (a.job_tenure_months >= 12) {
      points = 12;
      rationale = "established self-employment, but income is harder to verify than a salary";
    } else if (a.job_tenure_months >= 6) {
      points = 8;
      rationale = "self-employed past probation length, income verification still limited";
    } else {
      points = 4;
      rationale = "young self-employment with limited verifiable income history";
    }
  } else {
    if (a.job_tenure_months >= 12) {
      points = 20;
      rationale = "a full year in the current job, stable income";
    } else if (a.job_tenure_months >= 6) {
      points = 16;
      rationale = "past the typical probation period";
    } else if (a.job_tenure_months >= 3) {
      points = 8;
      rationale = "tenure under 6 months, stability not yet confirmed";
    } else {
      points = 4;
      rationale = "very short tenure, income stability unproven";
    }
  }
  return {
    factor_name: "Employment and tenure",
    applicant_value: `${a.employment_status.replace("_", " ")}, ${a.job_tenure_months} months`,
    threshold: "tiers at 3, 6 and 12 months; self-employed capped",
    points_awarded: points,
    rationale,
  };
}

function employerFactor(a: Applicant): ScoreFactor {
  // Rationale: standard UAE underwriting tiers. Government employment is the most stable;
  // SME and uncategorized employers carry the most income-continuity risk.
  const tiers: Record<Applicant["employer_category"], [number, string]> = {
    government: [20, "government employer, highest stability tier"],
    mainland_private: [16, "established mainland private employer"],
    free_zone: [12, "free zone employer, mid stability tier"],
    sme: [8, "SME employer, higher income-continuity risk"],
    other: [4, "uncategorized employer, stability unknown"],
  };
  const [points, rationale] = tiers[a.employer_category];
  return {
    factor_name: "Employer category",
    applicant_value: a.employer_category.replace("_", " "),
    threshold: "tiered: government > mainland > free zone > SME > other",
    points_awarded: points,
    rationale,
  };
}

function settlednessFactor(a: Applicant): ScoreFactor {
  // Rationale: time in country builds a verifiable footprint (address, banking, employer
  // record). A long-term visa (golden, green) reduces the leave-the-country risk that drives
  // newcomer defaults, so it earns a bonus on top.
  let base: number;
  if (a.months_in_uae >= 12) base = 16;
  else if (a.months_in_uae >= 6) base = 12;
  else if (a.months_in_uae >= 3) base = 6;
  else base = 2;
  const bonus = a.visa_type === "golden" || a.visa_type === "green" ? 4 : a.visa_type === "employment" ? 2 : 0;
  const points = Math.min(20, base + bonus);
  return {
    factor_name: "Months in UAE and visa",
    applicant_value: `${a.months_in_uae} months, ${a.visa_type} visa`,
    threshold: "tiers at 3, 6 and 12 months, plus long-term visa bonus",
    points_awarded: points,
    rationale:
      bonus === 4
        ? "long-term visa materially lowers departure risk"
        : a.months_in_uae >= 12
          ? "a full year in the UAE, established local footprint"
          : a.months_in_uae >= 6
            ? "settling in, footprint forming"
            : "recent arrival, little local footprint yet",
  };
}

function rentFactor(a: Applicant): ScoreFactor {
  // Rationale: rent is the behavioral anchor, the alt-data standing in for the missing credit
  // file. Sustained on-time payment is the strongest available repayment evidence; late
  // payments are adverse evidence, worse than no history at all.
  const tiers: Record<Applicant["rent_history"], [number, string]> = {
    on_time_6plus: [20, "6+ months of on-time rent, the strongest available behavioral evidence"],
    on_time_under_6: [12, "on-time so far, but the record is shorter than 6 months"],
    none: [6, "no rent history available, behavioral evidence missing"],
    late_payments: [0, "late rent payments, adverse behavioral evidence"],
  };
  const [points, rationale] = tiers[a.rent_history];
  return {
    factor_name: "Rent payment history",
    applicant_value: a.rent_history.replace(/_/g, " "),
    threshold: "on time 6+ months is full points; late payments is zero",
    points_awarded: points,
    rationale,
  };
}

export function score(applicant: Applicant, application: Application): ScoreResult {
  const factors = [
    salaryFactor(applicant, application),
    employmentFactor(applicant),
    employerFactor(applicant),
    settlednessFactor(applicant),
    rentFactor(applicant),
  ];
  const total = factors.reduce((s, f) => s + f.points_awarded, 0);
  return { factors, total_points: total, risk_band: bandFor(total) };
}
