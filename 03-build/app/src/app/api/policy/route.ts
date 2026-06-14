// The full live ruleset, read-only, for the Policy view: what is actually in policy right now.
// Rule text and conditions come rendered from the built ruleset (so the numbers shown are the
// numbers enforced); the parameter notes and scorecard tiers come from the raw pack so the
// reader sees the rationale next to each value. Read fresh from disk on every call.

import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { buildRuleset } from "@/lib/ruleset";

const LIVE_PACK_PATH = path.join(process.cwd(), "config", "uae", "policy-rules.json");

export async function GET() {
  const raw = await fs.readFile(LIVE_PACK_PATH, "utf8");
  const pack = JSON.parse(raw);
  const ruleset = buildRuleset(pack);

  const paramNotes = (pack.parameters?._notes ?? {}) as Record<string, string>;

  return NextResponse.json({
    identity: {
      market_name: ruleset.market_name,
      ruleset_version: ruleset.ruleset_version,
      currency: ruleset.currency,
      regulator: ruleset.regulator,
      bureau: ruleset.bureau,
    },
    parameters: ruleset.parameters,
    parameter_notes: paramNotes,
    band_cutoffs: {
      low: ruleset.band_cutoffs.low,
      high: ruleset.band_cutoffs.high,
      note: (pack.band_cutoffs?._note ?? "") as string,
    },
    rules: ruleset.rules.map((r) => ({
      rule_id: r.rule_id,
      title: r.title,
      rule_text: r.rule_text,
      source_section: r.source_section,
      condition: r.condition,
      severity: r.severity,
    })),
    // Raw scorecard factor blocks carry the tier tables and rationales the engine draws from.
    scorecard: (pack.scorecard?.factors ?? []).filter(
      (f: { enabled?: boolean }) => f.enabled !== false,
    ),
  });
}
