// The grounding validator (data model derivation step 7; llm-integration.md). Deterministic,
// no LLM involved: it checks an explanation against the exact structured data that was sent to
// the model. Two checks, per the spec: every rule the text cites must exist in the policy
// results that were checked, and every number the text states must appear in the inputs or the
// score output. This is the hallucination metric (<2 percent, target zero) and the 100 percent
// policy-grounding metric, enforced at runtime instead of only measured afterward.

import type { ExplainOutput } from "./types";

export interface GroundingContext {
  allowed_rule_ids: Set<string>;
  allowed_numbers: Set<number>;
}

// Pulls every number out of a value: numeric fields directly, and numerals embedded in strings
// (findings like "debt burden ratio 50.0 percent" or values like "AED 8,000"). Ratios below 1
// also register their percent display form (0.5 -> 50), since that is how the text cites them.
export function collectNumbers(value: unknown, into: Set<number>): void {
  if (typeof value === "number" && Number.isFinite(value)) {
    into.add(value);
    if (value > 0 && value < 1) into.add(Math.round(value * 10000) / 100);
  } else if (typeof value === "string") {
    for (const match of value.match(/\d[\d,]*(?:\.\d+)?/g) ?? []) {
      into.add(Number(match.replace(/,/g, "")));
    }
  } else if (Array.isArray(value)) {
    for (const item of value) collectNumbers(item, into);
  } else if (value !== null && typeof value === "object") {
    for (const item of Object.values(value)) collectNumbers(item, into);
  }
}

const RULE_MENTION = /rule[\s-]*(\d+)/gi;
const NUMBER_TOKEN = /\d[\d,]*(?:\.\d+)?/g;

function hasNumber(allowed: Set<number>, n: number): boolean {
  for (const v of allowed) {
    if (Math.abs(v - n) < 1e-9) return true;
  }
  return false;
}

// Returns the list of grounding failures, empty when the text is fully grounded. Rule mentions
// ("rule 4", "rule-4") are checked against the rules that actually ran, then removed before the
// number check so a legitimate citation's digits are not double-counted as standalone numbers.
export function validateGrounding(output: ExplainOutput, ctx: GroundingContext): string[] {
  const issues: string[] = [];
  for (const text of [output.explanation, ...output.reasons]) {
    const withoutRules = text.replace(RULE_MENTION, (_match, num: string) => {
      const ruleId = `rule-${num}`;
      if (!ctx.allowed_rule_ids.has(ruleId)) {
        issues.push(`cites ${ruleId}, which is not among the rules that were checked`);
      }
      return " ";
    });
    for (const match of withoutRules.match(NUMBER_TOKEN) ?? []) {
      const n = Number(match.replace(/,/g, ""));
      if (!hasNumber(ctx.allowed_numbers, n)) {
        issues.push(`states the number ${match}, which does not appear in the decision data`);
      }
    }
  }
  return issues;
}
