// Server-side loader for the LIVE market pack. Reads config/uae/policy-rules.json from disk on
// every call, so an edit to the file is reflected on the next request without a restart.
// Optional parameter overrides (a saved policy version's values) are merged in memory and the
// pack's ruleset_version is relabelled, so an assessment runs under exactly the active version
// and the resulting decision is stamped with it. Server-only (uses fs).

import { promises as fs } from "fs";
import path from "path";
import { buildRuleset, type Ruleset } from "./ruleset";

const LIVE_PACK_PATH = path.join(process.cwd(), "config", "uae", "policy-rules.json");

const OVERRIDABLE = new Set([
  "dbr_cap",
  "amount_salary_multiple",
  "max_age_at_maturity",
  "min_tenure_months",
]);

export interface PackOverrides {
  params?: Record<string, number>;
  ruleset_version?: string;
}

export async function loadLiveRuleset(overrides?: PackOverrides): Promise<Ruleset> {
  const raw = await fs.readFile(LIVE_PACK_PATH, "utf8");
  const pack = JSON.parse(raw) as {
    parameters: Record<string, unknown>;
    ruleset_version: string;
    [key: string]: unknown;
  };
  if (overrides?.params) {
    for (const [key, value] of Object.entries(overrides.params)) {
      if (OVERRIDABLE.has(key) && Number.isFinite(value)) pack.parameters[key] = value;
    }
  }
  if (overrides?.ruleset_version) pack.ruleset_version = overrides.ruleset_version;
  return buildRuleset(pack);
}
