// The explanation layer (Phase 3 step 4), implementing llm-integration.md. The one live LLM
// use case: the score, policy results, recommendation, and counterfactuals are all computed
// deterministically BEFORE the model is called; the model describes the decision, it cannot
// make or change it. The prompt context is exactly the structured blocks below, serialized as
// JSON. Nothing else ever enters the prompt: no officer free text, no documents, no web
// content, so every fact the model could state has a structured source the validator checks.
//
// Failure semantics, per the spec and the UI flow: a grounding-validation failure retries once
// with the failure appended, then falls back to the deterministic template (the officer never
// sees ungrounded text). An outright API failure THROWS: the UI shows "could not complete the
// assessment, nothing was decided, try again". The system never invents a result to cover an
// error.

import Anthropic from "@anthropic-ai/sdk";
import type {
  Applicant,
  Application,
  Decision,
  ExplainOutput,
  PolicyCheckResult,
  ScoreFactor,
  ValidationOutcome,
} from "./types";
import type { Ruleset } from "./ruleset";
import { EXPLANATION_MODEL, LLM_TIMEOUT_MS } from "./constants";
import { collectNumbers, validateGrounding, type GroundingContext } from "./validator";

// The exact prompt context (llm-integration.md, input blocks 1 to 5, plus the ruleset version
// and the score ceiling so "62 of 100" style statements are groundable).
export interface ExplainInput {
  applicant: Applicant;
  application: Application;
  recommendation: Decision["recommendation"];
  risk_band: Decision["risk_band"];
  ruleset_version: string;
  score: { factors: ScoreFactor[]; total_points: number; max_points: number };
  policy_results: PolicyCheckResult[];
  counterfactuals: string[];
}

export function buildExplainInput(
  a: Applicant,
  app: Application,
  decision: Decision,
  ruleset: Ruleset,
): ExplainInput {
  return {
    applicant: a,
    application: app,
    recommendation: decision.recommendation,
    risk_band: decision.risk_band,
    ruleset_version: decision.ruleset_version,
    score: {
      factors: decision.score_result.factors,
      total_points: decision.score_result.total_points,
      max_points: ruleset.scorecard.length * 20,
    },
    policy_results: decision.policy_results,
    counterfactuals: decision.counterfactuals,
  };
}

export function buildGroundingContext(input: ExplainInput): GroundingContext {
  const allowed_numbers = new Set<number>();
  collectNumbers(input, allowed_numbers);
  // Structural constants the text may legitimately state: the per-factor cap (M3).
  allowed_numbers.add(20);
  return {
    allowed_rule_ids: new Set(input.policy_results.map((r) => r.rule_id)),
    allowed_numbers,
  };
}

// The instruction, per the spec (tone per decision U3: plain language). Tuned for readability:
// the officer already sees the full scorecard and every cited rule on the same screen, so the
// paragraph leads with the decision and the few factors that drove it, rather than reciting
// everything. Shorter is also faster (latency) and easier to read aloud.
const SYSTEM_PROMPT = `You are drafting a credit decision explanation for a loan officer at a UAE digital bank. The officer also sees the full scorecard and every policy rule with its citation on the same screen, so do not repeat them all.

Using ONLY the fields, score factors, policy results, and counterfactual lines provided, write:
1. "explanation": a concise paragraph of three to five sentences, in plain, direct language an officer can read aloud. Lead with the recommendation and the one or two factors that decided it. For a decline or refer, name what drove it (by rule_id, or the weak score factor) and what would change it. Do not list every rule; mention only what mattered.
2. "reasons": a short list of three to six bullets, each a single driver of the outcome.

Rules: reference only the provided field values and policy results. When you mention a policy rule, refer to it by its rule_id (you need not quote the full rule text). Do not introduce any number, name, rule, or fact that is not in the provided data. Do not soften or change the recommendation. Be concise; no filler, no restating the task.`;

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    explanation: { type: "string" },
    reasons: { type: "array", items: { type: "string" } },
  },
  required: ["explanation", "reasons"],
  additionalProperties: false,
} as const;

// Narrow client surface so tests can stub the LLM without network access.
export interface ExplanationClient {
  messages: {
    create(params: Anthropic.MessageCreateParams): Promise<Anthropic.Message>;
  };
}

// Returns null when no API key is configured: a deploy-time condition, not a runtime failure.
// In that case explainDecision uses the deterministic template (works offline, no error), and
// upgrades to the LLM paragraph the moment a key is present. A key that IS set but whose call
// fails mid-flight is a different case and still throws ("nothing was decided").
export function defaultExplanationClient(): ExplanationClient | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ timeout: LLM_TIMEOUT_MS, maxRetries: 1 });
}

// One model call. Returns null when the response is not valid JSON in the required shape;
// the spec counts that as a validation failure (retry, then template), not an API failure.
async function requestExplanation(
  client: ExplanationClient,
  input: ExplainInput,
  retryIssues?: string[],
): Promise<ExplainOutput | null> {
  const data = JSON.stringify(input, null, 2);
  const content = retryIssues
    ? `${data}\n\nYour previous draft failed the grounding validator with these issues:\n${retryIssues.map((i) => `- ${i}`).join("\n")}\nWrite a corrected explanation and reasons that state only rules and numbers present in the data above.`
    : data;
  const response = await client.messages.create({
    model: EXPLANATION_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
    messages: [{ role: "user", content }],
  } as Anthropic.MessageCreateParams);
  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  try {
    const parsed: unknown = JSON.parse(text);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      typeof (parsed as ExplainOutput).explanation === "string" &&
      Array.isArray((parsed as ExplainOutput).reasons) &&
      (parsed as ExplainOutput).reasons.every((r) => typeof r === "string")
    ) {
      return parsed as ExplainOutput;
    }
    return null;
  } catch {
    return null;
  }
}

// The deterministic template fallback, assembled from the score factors, the failed rules with
// their cited text, and the counterfactual lines. Plainer than the LLM's paragraph, but every
// word traces to the decision data, so it always passes the validator (tested).
export function templateExplanation(input: ExplainInput): ExplainOutput {
  const recText = {
    approve: "APPROVE",
    decline: "DECLINE",
    refer: "REFER to manual review",
  }[input.recommendation];
  const product = input.application.product.replace("_", " ");
  const amount = `AED ${input.application.amount_aed.toLocaleString("en-US")}`;
  const scoreText = `${input.score.total_points} of ${input.score.max_points}`;
  const failed = input.policy_results.filter((r) => !r.passed);

  const parts = [
    `The recommendation is ${recText} for this ${product} application of ${amount} over ${input.application.term_months} months.`,
    `The applicant scored ${scoreText} points, which places them in the ${input.risk_band} risk band.`,
  ];
  if (failed.length > 0) {
    parts.push(
      `The following policy ${failed.length === 1 ? "rule was" : "rules were"} not met: ` +
        failed.map((f) => `${f.finding} (${f.rule_id}: "${f.cited_text}")`).join("; ") +
        ".",
    );
  } else {
    parts.push(`All ${input.policy_results.length} policy rules passed.`);
  }
  if (input.counterfactuals.length > 0) {
    parts.push(`What would change this: ${input.counterfactuals.join("; ")}.`);
  }

  const strongest = [...input.score.factors]
    .sort((x, y) => y.points_awarded - x.points_awarded)
    .slice(0, 2)
    .map((f) => `${f.factor_name}: ${f.rationale}`);
  const reasons = [
    ...failed.map((f) => f.finding),
    `score ${scoreText} (${input.risk_band} risk band)`,
    ...strongest,
  ];

  return { explanation: parts.join(" "), reasons };
}

export interface ExplainResult {
  output: ExplainOutput;
  validation_outcome: ValidationOutcome;
}

// The full pipeline: call, validate, retry once with the failure appended, then fall back to
// the template. API errors are NOT caught here, by design (see the header comment).
export async function explainDecision(
  a: Applicant,
  app: Application,
  decision: Decision,
  ruleset: Ruleset,
  client: ExplanationClient | null = defaultExplanationClient(),
): Promise<ExplainResult> {
  const input = buildExplainInput(a, app, decision, ruleset);
  const ctx = buildGroundingContext(input);

  // No key configured: the deterministic template is the explanation. Always grounded.
  if (!client) {
    return { output: templateExplanation(input), validation_outcome: "fell_back_to_template" };
  }

  const first = await requestExplanation(client, input);
  const firstIssues = first
    ? validateGrounding(first, ctx)
    : ["the response was not valid JSON in the required shape"];
  if (first && firstIssues.length === 0) {
    return { output: first, validation_outcome: "passed" };
  }

  const second = await requestExplanation(client, input, firstIssues);
  if (second && validateGrounding(second, ctx).length === 0) {
    return { output: second, validation_outcome: "passed_on_retry" };
  }

  return { output: templateExplanation(input), validation_outcome: "fell_back_to_template" };
}
