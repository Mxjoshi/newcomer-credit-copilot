// Shared validation helpers for loading market packs. A pack that half-loads would silently
// skip rules or factors, and silent skips are the one thing this engine promises never to do,
// so every helper throws on the first malformed field.

export function invalid(msg: string): never {
  throw new Error(`invalid market pack: ${msg}`);
}

export function asObject(v: unknown, where: string): Record<string, unknown> {
  if (typeof v !== "object" || v === null || Array.isArray(v)) invalid(`${where} must be an object`);
  return v as Record<string, unknown>;
}

export function num(obj: Record<string, unknown>, key: string, where: string): number {
  const v = obj[key];
  if (typeof v !== "number" || !Number.isFinite(v)) invalid(`${where}.${key} must be a number`);
  return v;
}

export function str(obj: Record<string, unknown>, key: string, where: string): string {
  const v = obj[key];
  if (typeof v !== "string" || v.length === 0) invalid(`${where}.${key} must be a non-empty string`);
  return v;
}

export function points(obj: Record<string, unknown>, key: string, where: string): number {
  const v = num(obj, key, where);
  if (v < 0 || v > 20) invalid(`${where}.${key} must be between 0 and 20 (decision M3)`);
  return v;
}

// A tier table: ordered descending by its threshold key, last entry must be the catch-all at 0,
// so every input lands somewhere and nothing falls through silently.
export interface Tier {
  threshold: number;
  points: number;
  rationale: string;
}

export function tierTable(
  raw: unknown,
  thresholdKey: string,
  where: string,
): Tier[] {
  if (!Array.isArray(raw) || raw.length === 0) invalid(`${where} must be a non-empty array`);
  const tiers: Tier[] = raw.map((entry, i) => {
    const t = asObject(entry, `${where}[${i}]`);
    return {
      threshold: num(t, thresholdKey, `${where}[${i}]`),
      points: points(t, "points", `${where}[${i}]`),
      rationale: str(t, "rationale", `${where}[${i}]`),
    };
  });
  for (let i = 1; i < tiers.length; i++) {
    if (tiers[i].threshold >= tiers[i - 1].threshold)
      invalid(`${where} must be ordered by descending ${thresholdKey}`);
  }
  if (tiers[tiers.length - 1].threshold !== 0)
    invalid(`${where} must end with a catch-all tier at ${thresholdKey} 0`);
  return tiers;
}

export function pickTier(tiers: Tier[], value: number): Tier {
  return tiers.find((t) => value >= t.threshold) ?? tiers[tiers.length - 1];
}
