// Server-side loader for the LIVE market pack. Reads config/uae/policy-rules.json from disk on
// every call, so an edit to the file is reflected on the next request without a restart: the
// plug and play demo's rerun depends on this. Server-only (uses fs); client code gets pack data
// through the API routes.

import { promises as fs } from "fs";
import path from "path";
import { buildRuleset, type Ruleset } from "./ruleset";

const LIVE_PACK_PATH = path.join(process.cwd(), "config", "uae", "policy-rules.json");

export async function loadLiveRuleset(): Promise<Ruleset> {
  const raw = await fs.readFile(LIVE_PACK_PATH, "utf8");
  return buildRuleset(JSON.parse(raw));
}
