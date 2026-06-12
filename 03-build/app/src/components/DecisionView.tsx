"use client";

// Screen 3, the hero: verdict banner, the Why paragraph (read it aloud to a manager), the full
// scorecard, every policy check with its citation, the deterministic counterfactuals, and the
// officer action row (D2: the human makes the final call). One scorecard row per enabled
// factor, one policy row per enabled rule: the counts come from the decision, never a constant.

import { useState } from "react";
import type { CaseRecord, Recommendation } from "@/lib/types";

interface Props {
  record: CaseRecord;
  onAction: (action: "accepted" | "overridden", overrideReason?: string) => void;
  onNew: () => void;
}

const VERDICT_STYLE: Record<Recommendation, string> = {
  approve: "border-emerald-400 bg-emerald-50 text-emerald-900",
  decline: "border-rose-400 bg-rose-50 text-rose-900",
  refer: "border-amber-400 bg-amber-50 text-amber-900",
};

const VERDICT_TEXT: Record<Recommendation, string> = {
  approve: "APPROVE",
  decline: "DECLINE",
  refer: "REFER TO MANUAL REVIEW",
};

export default function DecisionView({ record, onAction, onNew }: Props) {
  const { decision, applicant, application } = record;
  const overrideOptions = (["approve", "decline", "refer"] as const).filter(
    (o) => o !== record.decision.recommendation,
  );
  const [overriding, setOverriding] = useState(false);
  const [overrideOutcome, setOverrideOutcome] = useState<Recommendation>(overrideOptions[0]);
  const [overrideReason, setOverrideReason] = useState("");
  const passed = decision.policy_results.filter((r) => r.passed).length;
  const total = decision.policy_results.length;
  const maxPoints = decision.score_result.factors.length * 20;

  const confirmOverride = () => {
    if (overrideReason.trim() === "") return;
    onAction(
      "overridden",
      `overrode to ${VERDICT_TEXT[overrideOutcome]}: ${overrideReason.trim()}`,
    );
    setOverriding(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className={`rounded-lg border-2 p-4 ${VERDICT_STYLE[decision.recommendation]}`}>
        <div className="text-xl font-bold">
          RECOMMENDATION: {VERDICT_TEXT[decision.recommendation]} · Risk:{" "}
          {decision.risk_band.toUpperCase()}
        </div>
        <div className="mt-1 text-xs opacity-75">
          {applicant.full_name} · {application.product.replace("_", " ")} · AED{" "}
          {application.amount_aed.toLocaleString("en-US")} over {application.term_months} months ·
          ruleset {decision.ruleset_version}
          {decision.validation_outcome && (
            <>
              {" "}
              · explanation:{" "}
              {
                {
                  passed: "grounded",
                  passed_on_retry: "grounded on retry",
                  fell_back_to_template: "template fallback",
                }[decision.validation_outcome]
              }
            </>
          )}
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          Why (read this to your manager)
        </h3>
        <p className="text-sm leading-6 text-slate-800">{decision.explanation}</p>
        {decision.reasons.length > 0 && (
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
            {decision.reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          Scorecard ({decision.score_result.total_points} / {maxPoints},{" "}
          {decision.score_result.risk_band})
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="py-1.5 pr-2">Factor</th>
              <th className="py-1.5 pr-2">Value</th>
              <th className="py-1.5 pr-2">Threshold</th>
              <th className="py-1.5 pr-2">Points</th>
              <th className="py-1.5">Rationale</th>
            </tr>
          </thead>
          <tbody>
            {decision.score_result.factors.map((f) => (
              <tr key={f.factor_name} className="border-b border-slate-100 align-top">
                <td className="py-2 pr-2 font-medium">{f.factor_name}</td>
                <td className="py-2 pr-2">{f.applicant_value}</td>
                <td className="py-2 pr-2 text-slate-600">{f.threshold}</td>
                <td className="py-2 pr-2 whitespace-nowrap">{f.points_awarded}/20</td>
                <td className="py-2 text-slate-600">{f.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          Policy checks ({passed} of {total} passed)
        </h3>
        <div className="flex flex-col gap-2">
          {decision.policy_results.map((r) => (
            <details
              key={r.rule_id}
              open={!r.passed}
              className={`rounded border p-2 text-sm ${
                r.passed ? "border-slate-200" : "border-rose-300 bg-rose-50"
              }`}
            >
              <summary className="cursor-pointer font-medium">
                {r.passed ? "✅" : "❌"} {r.rule_id}: {r.finding}
              </summary>
              <p className="mt-2 pl-6 text-slate-700">
                Cited rule text: &ldquo;{r.cited_text}&rdquo;
              </p>
            </details>
          ))}
        </div>
      </section>

      {decision.counterfactuals.length > 0 && (
        <section className="rounded-lg border border-sky-200 bg-sky-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-sky-900">What would change this</h3>
          <ul className="list-disc pl-5 text-sm text-sky-900">
            {decision.counterfactuals.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-wrap items-center gap-3">
        {decision.officer_action === "none" ? (
          <>
            <button
              onClick={() => onAction("accepted")}
              className="rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white hover:bg-emerald-700"
            >
              Accept recommendation
            </button>
            <button
              onClick={() => setOverriding((v) => !v)}
              className="rounded-lg border border-slate-300 px-5 py-2 font-medium hover:bg-slate-100"
            >
              Override
            </button>
          </>
        ) : (
          <span className="rounded bg-slate-100 px-3 py-2 text-sm text-slate-700">
            Officer action recorded: {decision.officer_action}
            {decision.override_reason ? ` (${decision.override_reason})` : ""}
          </span>
        )}
        <button
          onClick={onNew}
          className="rounded-lg border border-slate-300 px-5 py-2 font-medium hover:bg-slate-100"
        >
          New assessment
        </button>
      </section>

      {overriding && decision.officer_action === "none" && (
        <section className="rounded-lg border border-slate-300 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-semibold">Override the recommendation</h3>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span>New outcome</span>
              <select
                value={overrideOutcome}
                onChange={(e) => setOverrideOutcome(e.target.value as Recommendation)}
                className="rounded border border-slate-300 bg-white px-3 py-2"
              >
                {(["approve", "decline", "refer"] as const)
                  .filter((o) => o !== decision.recommendation)
                  .map((o) => (
                    <option key={o} value={o}>
                      {VERDICT_TEXT[o]}
                    </option>
                  ))}
              </select>
            </label>
            <label className="flex grow flex-col gap-1 text-sm">
              <span>Reason (required)</span>
              <input
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="one line, recorded in the audit log"
                className="rounded border border-slate-300 px-3 py-2"
              />
            </label>
            <button
              onClick={confirmOverride}
              disabled={overrideReason.trim() === ""}
              className="rounded-lg bg-slate-800 px-5 py-2 font-medium text-white disabled:opacity-40"
            >
              Confirm override
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
