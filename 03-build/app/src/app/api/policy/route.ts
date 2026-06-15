// The full live ruleset, read-only, for the Policy view: what is actually in policy right now.
// Rule text and conditions come rendered from the built ruleset (so the numbers shown are the
// numbers enforced); the parameter notes and scorecard tiers come from the raw pack so the
// reader sees the rationale next to each value. Read fresh from disk on every call.
//
// Optional query overrides (a saved version's parameters, plus its label) are merged in memory,
// so the Policy view can render any version, not only the locked base on disk.

import { NextResponse } from "next/server";
import { buildRuleset } from "@/lib/ruleset";
import { applyOverrides, loadRawPack } from "@/lib/livePack";

const OVERRIDABLE = ["dbr_cap", "amount_salary_multiple", "max_age_at_maturity", "min_tenure_months"];

export async function GET(request: Request) {
  const pack = await loadRawPack();
  const url = new URL(request.url);
  const params: Record<string, number> = {};
  for (const key of OVERRIDABLE) {
    const value = url.searchParams.get(key);
    if (value !== null && Number.isFinite(Number(value))) params[key] = Number(value);
  }
  applyOverrides(pack, {
    params,
    ruleset_version: url.searchParams.get("ruleset_version") ?? undefined,
  });

  const ruleset = buildRuleset(pack);
  const paramNotes = ((pack.parameters as { _notes?: Record<string, string> })._notes ??
    {}) as Record<string, string>;
  const bandNote = (pack.band_cutoffs as { _note?: string } | undefined)?._note ?? "";
  const factors =
    (pack.scorecard as { factors?: Array<{ enabled?: boolean }> } | undefined)?.factors ?? [];

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
      note: bandNote,
    },
    rules: ruleset.rules.map((r) => ({
      rule_id: r.rule_id,
      title: r.title,
      rule_text: r.rule_text,
      source_section: r.source_section,
      condition: r.condition,
      severity: r.severity,
    })),
    scorecard: factors.filter((f) => f.enabled !== false),
  });
}
