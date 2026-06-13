import { describe, expect, it } from "vitest";
import { assess } from "../src/lib/decision";
import { CURRENT_RULESET } from "../src/lib/ruleset";
import { SAMPLE_PROFILES } from "../src/lib/samples";

// The dropdown labels lead with an outcome ("Decline · ..."). This guards that each scenario
// actually produces that outcome through the engine, so a label can never quietly become a lie.
describe("sample scenarios land on their labelled outcome", () => {
  for (const sample of SAMPLE_PROFILES) {
    it(`${sample.label} -> ${sample.expected}`, () => {
      const decision = assess(sample.applicant, sample.application, CURRENT_RULESET);
      expect(decision.recommendation).toBe(sample.expected);
    });
  }

  it("covers all three outcomes", () => {
    const outcomes = new Set(SAMPLE_PROFILES.map((s) => s.expected));
    expect(outcomes).toEqual(new Set(["approve", "decline", "refer"]));
  });
});
