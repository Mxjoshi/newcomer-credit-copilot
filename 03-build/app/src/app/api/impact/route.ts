// The impact view's numbers (Screen 3 tab, decision M6): the 24 locked ground-truth profiles
// run through two strategies. Champion is the status quo (no AECB file means decline, every
// newcomer declined). Challenger is this product, on the LIVE pack read fresh from disk, so an
// edited cap changes these numbers on the next rerun. No LLM calls: both strategies are
// deterministic, the tab computes instantly and gives the same numbers every time. This doubles
// as the Phase 4 metrics-vs-baseline deliverable made visible.

import { NextResponse } from "next/server";
import { GROUND_TRUTH } from "@/lib/groundTruth";
import { assess } from "@/lib/decision";
import { loadLiveRuleset } from "@/lib/livePack";

export async function GET() {
  const ruleset = await loadLiveRuleset();

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
