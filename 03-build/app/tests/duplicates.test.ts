import { describe, expect, it } from "vitest";
import { findDuplicate } from "../src/lib/cases";
import type { Applicant, Application, CaseRecord } from "../src/lib/types";

// findDuplicate only reads the name and the ask, so the records here are deliberately minimal.
const caseFor = (name: string, app: Application): CaseRecord =>
  ({
    case_id: name,
    created_at: "2026-06-15T00:00:00.000Z",
    applicant: { full_name: name } as Applicant,
    application: app,
    decision: { recommendation: "approve" },
    status: "closed",
  }) as unknown as CaseRecord;

const ask: Application = { product: "personal_loan", amount_aed: 40000, term_months: 12 };
const applicant = { full_name: "Amira Hassan" } as Applicant;

describe("findDuplicate", () => {
  it("flags the same applicant and the same ask", () => {
    const existing = [caseFor("Amira Hassan", ask)];
    expect(findDuplicate(applicant, ask, existing)?.case_id).toBe("Amira Hassan");
  });

  it("ignores case and extra whitespace in the name", () => {
    const existing = [caseFor("  amira   hassan ", ask)];
    expect(findDuplicate(applicant, ask, existing)).not.toBeNull();
  });

  it("does not flag a different amount, term, or product", () => {
    const existing = [
      caseFor("Amira Hassan", { ...ask, amount_aed: 50000 }),
      caseFor("Amira Hassan", { ...ask, term_months: 24 }),
      caseFor("Amira Hassan", { ...ask, product: "credit_card" }),
    ];
    expect(findDuplicate(applicant, ask, existing)).toBeNull();
  });

  it("does not flag a different applicant", () => {
    const existing = [caseFor("Lena Park", ask)];
    expect(findDuplicate(applicant, ask, existing)).toBeNull();
  });

  it("returns null against an empty history", () => {
    expect(findDuplicate(applicant, ask, [])).toBeNull();
  });
});
