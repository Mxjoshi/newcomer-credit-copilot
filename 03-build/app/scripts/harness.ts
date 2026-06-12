// The ground-truth harness (Phase 3 chunk 3). Runs all 24 locked profiles through the
// deterministic core and reports match or mismatch per row. This is a REPORT, not a gate:
// per decision M5, mismatches are presented to Monika, never tuned away silently.
// It also computes the champion vs challenger numbers the Screen 3 impact view shows.

import { GROUND_TRUTH } from "../src/lib/groundTruth";
import { assess } from "../src/lib/decision";
import { CURRENT_RULESET } from "../src/lib/ruleset";

const severityOf = (id: string) => CURRENT_RULESET.rules.find((r) => r.rule_id === id)!.severity;

console.log(
  `Ruleset: ${CURRENT_RULESET.ruleset_version} (${CURRENT_RULESET.market_name}, ${CURRENT_RULESET.rules.length} rules enabled)\n`,
);

let matches = 0;
const mismatches: string[] = [];
let challengerApproveOfLabeledApprove = 0;
let challengerFalseApprovals = 0;
let challengerRefers = 0;
let labeledApprove = 0;

console.log("id     | score | band   | rules failed (severity)        | outcome | label   | match");
console.log("-------|-------|--------|--------------------------------|---------|---------|------");

for (const row of GROUND_TRUTH) {
  const d = assess(row.applicant, row.application);
  const failed = d.policy_results
    .filter((p) => !p.passed)
    .map((p) => `${p.rule_id}(${severityOf(p.rule_id)})`)
    .join(", ") || "none";
  const match = d.recommendation === row.expected_outcome;
  if (match) matches++;
  else
    mismatches.push(
      `${row.id}: system says ${d.recommendation} (score ${d.score_result.total_points}, ${d.score_result.risk_band}; failed: ${failed}), label says ${row.expected_outcome}. Label rationale: ${row.rationale}`,
    );

  if (row.expected_outcome === "approve") {
    labeledApprove++;
    if (d.recommendation === "approve") challengerApproveOfLabeledApprove++;
  }
  if (row.expected_outcome === "decline" && d.recommendation === "approve") challengerFalseApprovals++;
  if (d.recommendation === "refer") challengerRefers++;

  console.log(
    `${row.id} |  ${String(d.score_result.total_points).padStart(3)}  | ${d.score_result.risk_band.padEnd(6)} | ${failed.padEnd(30)} | ${d.recommendation.padEnd(7)} | ${row.expected_outcome.padEnd(7)} | ${match ? "yes" : "NO"}`,
  );
}

const n = GROUND_TRUTH.length;
console.log("\n=== Summary ===");
console.log(`Decision accuracy: ${matches}/${n} = ${((matches / n) * 100).toFixed(1)}% (target: 80% or higher)`);
console.log(`False approvals (labeled decline, system approves): ${challengerFalseApprovals} (target: under 10%, i.e. under ${Math.ceil(n * 0.1)} of ${n})`);
console.log(`Cases referred: ${challengerRefers}/${n} = ${((challengerRefers / n) * 100).toFixed(1)}% (a capacity assumption, stated, not a fixed target)`);

console.log("\n=== Impact view numbers (Screen 3 tab) ===");
console.log(`Champion (status quo, no AECB file means decline): creditworthy newcomers approved 0/${labeledApprove}, false approvals 0, referred 0`);
console.log(`Challenger (this product): creditworthy newcomers approved ${challengerApproveOfLabeledApprove}/${labeledApprove}, false approvals ${challengerFalseApprovals}, referred ${challengerRefers}`);

if (mismatches.length) {
  console.log("\n=== Mismatches (reported per M5, never silently tuned away) ===");
  for (const m of mismatches) console.log(`- ${m}`);
}
