// The impact view's numbers (Screen 3 tab, decision M6): the 24 locked ground-truth profiles
// run through two strategies. Champion is the status quo (no AECB file means decline, every
// newcomer declined). Challenger is this product. No LLM calls: both strategies are
// deterministic, the tab computes instantly and gives the same numbers every time. This doubles
// as the Phase 4 metrics-vs-baseline deliverable made visible.
//
// Plug and play, made clickable: optional query overrides (e.g. ?dbr_cap=0.45) are merged into
// the live pack's parameters IN MEMORY, never written to disk, so the demo can move a policy
// value on screen, rerun, and watch the approval split shift, with the cited rule text
// re-rendered from the new value. The locked v1.0 baseline is one click away (omit the params).

import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { GROUND_TRUTH } from "@/lib/groundTruth";
import { assess } from "@/lib/decision";
import { buildRuleset } from "@/lib/ruleset";

const LIVE_PACK_PATH = path.join(process.cwd(), "config", "uae", "policy-rules.json");

// Only these parameters are exposed to the what-if control. Each is a number on the pack's
// `parameters` block; anything else is ignored, so the endpoint cannot be coaxed into changing
// rule logic, only the documented knobs.
const OVERRIDABLE = new Set([
  "dbr_cap",
  "amount_salary_multiple",
  "max_age_at_maturity",
  "min_tenure_months",
]);

export async function GET(request: Request) {
  const raw = await fs.readFile(LIVE_PACK_PATH, "utf8");
  const pack = JSON.parse(raw) as {
    parameters: Record<string, unknown>;
    ruleset_version: string;
    [key: string]: unknown;
  };

  const url = new URL(request.url);
  const overrides: Record<string, number> = {};
  for (const key of OVERRIDABLE) {
    const value = url.searchParams.get(key);
    if (value !== null && Number.isFinite(Number(value))) {
      pack.parameters[key] = Number(value);
      overrides[key] = Number(value);
    }
  }
  const isWhatIf = Object.keys(overrides).length > 0;
  if (isWhatIf) pack.ruleset_version = `${pack.ruleset_version} (what-if)`;

  const ruleset = buildRuleset(pack);

  let labeledApprove = 0;
  let approvedOfLabeled = 0;
  let falseApprovals = 0;
  let referred = 0;
  let matches = 0;

  const rows = GROUND_TRUTH.map((row) => {
    const d = assess(row.applicant, row.application, ruleset);
    const failed = d.policy_results.filter((p) => !p.passed).map((p) => p.rule_id);
    if (row.expected_outcome === "approve") {
      labeledApprove++;
      if (d.recommendation === "approve") approvedOfLabeled++;
    }
    if (row.expected_outcome === "decline" && d.recommendation === "approve") falseApprovals++;
    if (d.recommendation === "refer") referred++;
    if (d.recommendation === row.expected_outcome) matches++;
    return {
      id: row.id,
      applicant_name: row.applicant.full_name,
      score: d.score_result.total_points,
      band: d.score_result.risk_band,
      failed_rules: failed,
      recommendation: d.recommendation,
      expected: row.expected_outcome,
      match: d.recommendation === row.expected_outcome,
    };
  });

  return NextResponse.json({
    ruleset_version: ruleset.ruleset_version,
    market_name: ruleset.market_name,
    is_what_if: isWhatIf,
    overrides,
    parameters: {
      dbr_cap: ruleset.parameters.dbr_cap,
      amount_salary_multiple: ruleset.parameters.amount_salary_multiple,
      max_age_at_maturity: ruleset.parameters.max_age_at_maturity,
      min_tenure_months: ruleset.parameters.min_tenure_months,
    },
    total: GROUND_TRUTH.length,
    accuracy: matches,
    champion: {
      label: "Status quo: no credit file means decline",
      approved_of_labeled: 0,
      labeled_approve: labeledApprove,
      false_approvals: 0,
      referred: 0,
    },
    challenger: {
      label: "This product",
      approved_of_labeled: approvedOfLabeled,
      labeled_approve: labeledApprove,
      false_approvals: falseApprovals,
      referred,
    },
    rows,
  });
}
