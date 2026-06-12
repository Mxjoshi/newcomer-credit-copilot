import { describe, expect, it } from "vitest";
import type { Applicant, Application, ExplainOutput } from "../src/lib/types";
import { assess } from "../src/lib/decision";
import { UAE_V1 } from "../src/lib/ruleset";
import { validateGrounding } from "../src/lib/validator";
import {
  buildExplainInput,
  buildGroundingContext,
  explainDecision,
  templateExplanation,
  type ExplanationClient,
} from "../src/lib/explain";

// No network anywhere in this file: the validator and template are deterministic, and the
// explainDecision pipeline is exercised through a stubbed client.

const base: Applicant = {
  full_name: "Test Applicant",
  months_in_uae: 12,
  visa_type: "employment",
  employment_status: "employed",
  job_tenure_months: 12,
  employer_category: "government",
  monthly_salary_aed: 20000,
  rent_history: "on_time_6plus",
  existing_monthly_obligations_aed: 0,
  age_years: 30,
  visa_months_remaining: 48,
};
const loan: Application = { product: "personal_loan", amount_aed: 40000, term_months: 12 };

const referApplicant: Applicant = { ...base, job_tenure_months: 3 };

function contextFor(a: Applicant, app: Application) {
  const decision = assess(a, app, UAE_V1);
  const input = buildExplainInput(a, app, decision, UAE_V1);
  return { decision, input, ctx: buildGroundingContext(input) };
}

describe("grounding validator (the seeded-failure acceptance check)", () => {
  it("passes an explanation that states only data-backed rules and numbers", () => {
    const { ctx } = contextFor(referApplicant, loan);
    const grounded: ExplainOutput = {
      explanation:
        "The recommendation is REFER. The applicant earns AED 20,000 against the AED 8,000 minimum, but tenure is 3 months and rule 4 requires 6 months of continuous employment.",
      reasons: ["tenure is 3 months, rule requires 6"],
    };
    expect(validateGrounding(grounded, ctx)).toEqual([]);
  });

  it("catches a seeded ungrounded number (an invented salary)", () => {
    const { ctx } = contextFor(referApplicant, loan);
    const seeded: ExplainOutput = {
      explanation: "The applicant earns AED 25,500, comfortably above the minimum.",
      reasons: [],
    };
    const issues = validateGrounding(seeded, ctx);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.join(" ")).toContain("25,500");
  });

  it("catches a citation of a rule that was never checked", () => {
    const { ctx } = contextFor(referApplicant, loan);
    const seeded: ExplainOutput = {
      explanation: "This application fails rule 9, which prohibits weekend applications.",
      reasons: [],
    };
    const issues = validateGrounding(seeded, ctx);
    expect(issues.join(" ")).toContain("rule-9");
  });

  it("accepts formatted variants of grounded numbers (commas, percent display)", () => {
    const { ctx } = contextFor(base, loan);
    const grounded: ExplainOutput = {
      explanation:
        "The requested amount of AED 40,000 over 12 months is within policy, and the debt burden cap is 50 percent.",
      reasons: [],
    };
    expect(validateGrounding(grounded, ctx)).toEqual([]);
  });
});

describe("template fallback", () => {
  it("renders for approve, refer, and decline, and always passes the validator", () => {
    const cases: Array<[Applicant, Application]> = [
      [base, loan], // approve
      [referApplicant, loan], // refer (tenure)
      [{ ...base, monthly_salary_aed: 6000 }, loan], // decline (below product minimum)
    ];
    for (const [a, app] of cases) {
      const { input, ctx } = contextFor(a, app);
      const output = templateExplanation(input);
      expect(output.explanation.length).toBeGreaterThan(0);
      expect(output.reasons.length).toBeGreaterThan(0);
      expect(validateGrounding(output, ctx)).toEqual([]);
    }
  });

  it("quotes the failed rule's cited text verbatim (policy grounding)", () => {
    const { decision, input } = contextFor(referApplicant, loan);
    const failed = decision.policy_results.find((r) => !r.passed)!;
    expect(templateExplanation(input).explanation).toContain(failed.cited_text);
  });
});

describe("explainDecision pipeline (stubbed client, no network)", () => {
  const stubClient = (responses: ExplainOutput[]): ExplanationClient => {
    let call = 0;
    return {
      messages: {
        create: async () => {
          const output = responses[Math.min(call, responses.length - 1)];
          call++;
          return {
            content: [{ type: "text", text: JSON.stringify(output) }],
          } as never;
        },
      },
    };
  };

  const grounded = (a: Applicant, app: Application): ExplainOutput =>
    templateExplanation(contextFor(a, app).input);
  const ungrounded: ExplainOutput = {
    explanation: "The applicant earns AED 99,999 and fails rule 9.",
    reasons: [],
  };

  it("a grounded first response passes", async () => {
    const { decision } = contextFor(referApplicant, loan);
    const result = await explainDecision(
      referApplicant,
      loan,
      decision,
      UAE_V1,
      stubClient([grounded(referApplicant, loan)]),
    );
    expect(result.validation_outcome).toBe("passed");
  });

  it("an ungrounded first response retries once and can pass on retry", async () => {
    const { decision } = contextFor(referApplicant, loan);
    const result = await explainDecision(
      referApplicant,
      loan,
      decision,
      UAE_V1,
      stubClient([ungrounded, grounded(referApplicant, loan)]),
    );
    expect(result.validation_outcome).toBe("passed_on_retry");
  });

  it("two ungrounded responses fall back to the template, never ungrounded text", async () => {
    const { decision, input, ctx } = contextFor(referApplicant, loan);
    const result = await explainDecision(
      referApplicant,
      loan,
      decision,
      UAE_V1,
      stubClient([ungrounded, ungrounded]),
    );
    expect(result.validation_outcome).toBe("fell_back_to_template");
    expect(result.output).toEqual(templateExplanation(input));
    expect(validateGrounding(result.output, ctx)).toEqual([]);
  });

  it("an API failure throws instead of fabricating a result", async () => {
    const { decision } = contextFor(referApplicant, loan);
    const failingClient: ExplanationClient = {
      messages: {
        create: async () => {
          throw new Error("network down");
        },
      },
    };
    await expect(
      explainDecision(referApplicant, loan, decision, UAE_V1, failingClient),
    ).rejects.toThrow("network down");
  });
});
