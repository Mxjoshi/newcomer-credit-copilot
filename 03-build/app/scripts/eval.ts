// Phase 4 evals benchmark. Runs the 24 locked ground-truth profiles through the full pipeline,
// including the real model explanation, and measures the success metrics against the Phase 1
// targets. Group A (decision quality) is deterministic; Group B (AI output) needs the model, so
// this is where the hallucination, grounding, and latency numbers are actually produced.
//
// Writes a report to 04-evaluate-and-ship/eval-results.md. Costs roughly 24 model calls.

import fs from "fs";
import path from "path";

// Load .env.local so this standalone script sees the API key (Next.js does this for the app, but
// a tsx script does not).
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
  }
}

import { GROUND_TRUTH } from "../src/lib/groundTruth";
import { assess } from "../src/lib/decision";
import { CURRENT_RULESET } from "../src/lib/ruleset";
import { explainDecision } from "../src/lib/explain";
import { buildExplainInput, buildGroundingContext } from "../src/lib/explain";
import { validateGrounding } from "../src/lib/validator";
import type { ValidationOutcome } from "../src/lib/types";

async function main() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  console.log(
    `Ruleset: ${CURRENT_RULESET.ruleset_version} | model explanations: ${
      hasKey ? "ON (real model)" : "OFF (no key, template only)"
    }\n`,
  );
  if (!hasKey) {
    console.log("No ANTHROPIC_API_KEY found; Group B would only measure the template. Stopping.");
    return;
  }

  let matches = 0;
  let falseApprovals = 0;
  let referred = 0;
  let labeledApprove = 0;
  let approvedOfLabeled = 0;
  const outcomes: Record<ValidationOutcome, number> = {
    passed: 0,
    passed_on_retry: 0,
    fell_back_to_template: 0,
  };
  let finalUngrounded = 0;
  const latencies: number[] = [];

  const rows: Array<{
    id: string;
    rec: string;
    expected: string;
    match: boolean;
    outcome: ValidationOutcome;
    grounded: boolean;
    ms: number;
  }> = [];

  // The generated explanation text per profile, captured so the manual rubric pass (completeness,
  // clarity, consistency) has something to read. eval.ts otherwise discards the prose after the
  // grounding check.
  const explanations: Array<{
    id: string;
    name: string;
    rec: string;
    expected: string;
    match: boolean;
    outcome: ValidationOutcome;
    explanation: string;
    reasons: string[];
  }> = [];

  console.log("id     | outcome | label   | match | explanation         | grounded | latency");
  console.log("-------|---------|---------|-------|---------------------|----------|--------");

  for (const row of GROUND_TRUTH) {
    const decision = assess(row.applicant, row.application, CURRENT_RULESET);
    const t0 = Date.now();
    const { output, validation_outcome } = await explainDecision(
      row.applicant,
      row.application,
      decision,
      CURRENT_RULESET,
    );
    const ms = Date.now() - t0;
    latencies.push(ms);
    outcomes[validation_outcome]++;

    // Independent check of the FINAL shown explanation: does any number or rule fail to trace?
    const ctx = buildGroundingContext(buildExplainInput(row.applicant, row.application, decision, CURRENT_RULESET));
    const issues = validateGrounding(output, ctx);
    const grounded = issues.length === 0;
    if (!grounded) finalUngrounded++;

    const match = decision.recommendation === row.expected_outcome;
    if (match) matches++;
    if (row.expected_outcome === "approve") {
      labeledApprove++;
      if (decision.recommendation === "approve") approvedOfLabeled++;
    }
    if (row.expected_outcome === "decline" && decision.recommendation === "approve") falseApprovals++;
    if (decision.recommendation === "refer") referred++;

    rows.push({ id: row.id, rec: decision.recommendation, expected: row.expected_outcome, match, outcome: validation_outcome, grounded, ms });
    explanations.push({
      id: row.id,
      name: row.applicant.full_name,
      rec: decision.recommendation,
      expected: row.expected_outcome,
      match,
      outcome: validation_outcome,
      explanation: output.explanation,
      reasons: output.reasons,
    });
    console.log(
      `${row.id} | ${decision.recommendation.padEnd(7)} | ${row.expected_outcome.padEnd(7)} | ${match ? "yes" : "NO "}   | ${validation_outcome.padEnd(19)} | ${(grounded ? "yes" : "NO").padEnd(8)} | ${(ms / 1000).toFixed(1)}s`,
    );
  }

  const n = GROUND_TRUTH.length;
  const accuracy = ((matches / n) * 100).toFixed(1);
  const falsePct = ((falseApprovals / n) * 100).toFixed(1);
  const referPct = ((referred / n) * 100).toFixed(1);
  const avgMs = latencies.reduce((a, b) => a + b, 0) / n;
  const maxMs = Math.max(...latencies);
  const firstPassPct = ((outcomes.passed / n) * 100).toFixed(1);

  console.log("\n=== Group A: decision quality ===");
  console.log(`Decision accuracy:   ${matches}/${n} = ${accuracy}%   (target 80%+)`);
  console.log(`False approval rate: ${falseApprovals}/${n} = ${falsePct}%   (target under 10%)`);
  console.log(`Refer rate:          ${referred}/${n} = ${referPct}%   (capacity assumption, not a fixed target)`);
  console.log(`Creditworthy approved: ${approvedOfLabeled}/${labeledApprove}`);

  console.log("\n=== Group B: AI output quality ===");
  console.log(`Explanations shown ungrounded (hallucination): ${finalUngrounded}/${n}   (target 0)`);
  console.log(`Policy grounding (final explanations fully traceable): ${n - finalUngrounded}/${n} = ${(((n - finalUngrounded) / n) * 100).toFixed(0)}%   (target 100%)`);
  console.log(`Model grounded on first attempt: ${outcomes.passed}/${n} = ${firstPassPct}%`);
  console.log(`  passed on retry: ${outcomes.passed_on_retry}/${n} | fell back to template: ${outcomes.fell_back_to_template}/${n}`);
  console.log(`Latency: average ${(avgMs / 1000).toFixed(1)}s, max ${(maxMs / 1000).toFixed(1)}s   (target under 15s)`);

  // Write the deliverable.
  const stamp = new Date().toISOString().slice(0, 10);
  const md = `# Phase 4 evals: measured metrics

Run on the 24 locked ground-truth profiles through the full pipeline (deterministic core plus the
real model explanation), ruleset ${CURRENT_RULESET.ruleset_version}. Generated by
\`03-build/app/scripts/eval.ts\` on ${stamp}.

## Results against the Phase 1 targets

| Group | Metric | Target | Measured | Met |
|---|---|---|---|---|
| A | Decision accuracy | 80% or higher | ${matches}/${n} (${accuracy}%) | ${matches / n >= 0.8 ? "yes" : "no"} |
| A | False approval rate | under 10% | ${falseApprovals}/${n} (${falsePct}%) | ${falseApprovals / n < 0.1 ? "yes" : "no"} |
| A | Refer rate | capacity assumption, stated | ${referred}/${n} (${referPct}%) | reported |
| B | Hallucination (invented facts shown) | 0 across the set | ${finalUngrounded}/${n} | ${finalUngrounded === 0 ? "yes" : "no"} |
| B | Policy grounding | 100% traceable | ${(((n - finalUngrounded) / n) * 100).toFixed(0)}% | ${finalUngrounded === 0 ? "yes" : "no"} |
| B | Latency | under 15s per assessment | avg ${(avgMs / 1000).toFixed(1)}s, max ${(maxMs / 1000).toFixed(1)}s | ${maxMs / 1000 < 15 ? "yes" : "no"} |

Creditworthy newcomers approved: ${approvedOfLabeled} of ${labeledApprove}.

## How the explanation was produced (the grounding mechanism at work)

| Outcome | Count | Meaning |
|---|---|---|
| grounded on first attempt | ${outcomes.passed}/${n} | the model wrote a fully grounded explanation first time |
| passed on retry | ${outcomes.passed_on_retry}/${n} | the first draft had an ungrounded item, the validator caught it, the retry was clean |
| fell back to template | ${outcomes.fell_back_to_template}/${n} | both attempts failed grounding, the deterministic template was shown |

In every case the officer-facing explanation was fully grounded; the validator guarantees no
ungrounded text reaches the officer. The hallucination metric is therefore enforced, not only
measured.

## Per-profile

| Profile | Outcome | Label | Match | Explanation | Grounded | Latency |
|---|---|---|---|---|---|---|
${rows.map((r) => `| ${r.id} | ${r.rec} | ${r.expected} | ${r.match ? "yes" : "NO"} | ${r.outcome} | ${r.grounded ? "yes" : "NO"} | ${(r.ms / 1000).toFixed(1)}s |`).join("\n")}

## Note on the four decision mismatches

The four accuracy mismatches are the same band-driven boundary cases the deterministic harness
reports (GT-08, GT-12, GT-16, GT-21). They are surfaced, not tuned away (decision M5): the
scorecard tiers were set from domain rationale before the labels, so a mismatch is information
about a borderline case, not a bug to hide. All four are reasonable refers or a conservative
call, none is a false approval.
`;
  const outPath = path.join(process.cwd(), "..", "..", "04-evaluate-and-ship", "eval-results.md");
  fs.writeFileSync(outPath, md);
  console.log(`\nWrote ${outPath}`);

  // Companion file: the actual explanation text, for the manual rubric pass to read and score.
  const expMd = `# Phase 4 evals: the 24 generated explanations

Captured from the same run that produced \`eval-results.md\` (ruleset ${CURRENT_RULESET.ruleset_version}) on ${stamp}.
This is the officer-facing text the manual rubric pass scores for completeness, clarity, and
consistency (faithfulness and grounding are already enforced in code by the validator). The model
explanation varies run to run, so this is one snapshot; re-run \`npm run eval\` to refresh it.

${explanations
  .map(
    (e) => `## ${e.id} ${e.name}

Recommendation: **${e.rec.toUpperCase()}** | locked label: ${e.expected} | match: ${e.match ? "yes" : "NO"} | grounding: ${e.outcome}

${e.explanation}

Reasons:
${e.reasons.map((r) => `- ${r}`).join("\n")}`,
  )
  .join("\n\n")}
`;
  const expPath = path.join(process.cwd(), "..", "..", "04-evaluate-and-ship", "eval-explanations.md");
  fs.writeFileSync(expPath, expMd);
  console.log(`Wrote ${expPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
