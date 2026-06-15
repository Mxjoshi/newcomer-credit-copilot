// Server-side loader for the LIVE market pack. Reads config/uae/policy-rules.json from disk on
// every call (so a local edit is picked up without a restart); falls back to the bundled copy of
// the pack if the file is not readable at runtime, for example on a read-only serverless
// filesystem (Vercel). Optional parameter overrides (a saved version's values) are merged in
// memory and the pack's ruleset_version is relabelled, so a read or an assessment can run under
// exactly the chosen version. Server-only (uses fs).

import { promises as fs } from "fs";
import path from "path";
import { buildRuleset, type Ruleset } from "./ruleset";
import bundledPack from "../../config/uae/policy-rules.json";

const LIVE_PACK_PATH = path.join(process.cwd(), "config", "uae", "policy-rules.json");

const OVERRIDABLE = new Set([
  "dbr_cap",
  "amount_salary_multiple",
  "max_age_at_maturity",
  "min_tenure_months",
]);

export interface PackJson {
  parameters: Record<string, unknown>;
  ruleset_version: string;
  [key: string]: unknown;
}

export interface PackOverrides {
  params?: Record<string, number>;
  ruleset_version?: string;
}

// The raw live pack object. A deep copy, so callers can mutate it (apply overrides) freely.
export async function loadRawPack(): Promise<PackJson> {
  try {
    const raw = await fs.readFile(LIVE_PACK_PATH, "utf8");
    return JSON.parse(raw) as PackJson;
  } catch {
    return JSON.parse(JSON.stringify(bundledPack)) as PackJson;
  }
}

export function applyOverrides(pack: PackJson, overrides?: PackOverrides): PackJson {
  if (overrides?.params) {
    for (const [key, value] of Object.entries(overrides.params)) {
      if (OVERRIDABLE.has(key) && Number.isFinite(value)) pack.parameters[key] = value;
    }
  }
  if (overrides?.ruleset_version) pack.ruleset_version = overrides.ruleset_version;
  return pack;
}

export async function loadLiveRuleset(overrides?: PackOverrides): Promise<Ruleset> {
  const pack = applyOverrides(await loadRawPack(), overrides);
  return buildRuleset(pack);
}
