"use client";

// Screen 3, the hero: verdict banner, the Why paragraph (read it aloud to a manager), the full
// scorecard with a points bar per factor, every policy check with its citation, the
// deterministic counterfactuals, and the officer action row (D2: the human makes the final
// call). One scorecard row per enabled factor, one policy row per enabled rule: the counts come
// from the decision, never a constant.

import { useState } from "react";
import type { CaseRecord, Recommendation } from "@/lib/types";

interface Props {
  record: CaseRecord;
  onAction: (action: "accepted" | "overridden", overrideReason?: string) => void;
  onNew: () => void;
}

const VERDICT: Record<
  Recommendation,
  { text: string; mesh: string; chip: string; bar: string }
> = {
  approve: {
    text: "APPROVE",
    mesh: "from-emerald-500 to-teal-600",
    chip: "bg-emerald-100 text-emerald-800",
    bar: "bg-emerald-500",
  },
  decline: {
    text: "DECLINE",
    mesh: "from-rose-500 to-red-600",
    chip: "bg-rose-100 text-rose-800",
    bar: "bg-rose-500",
  },
  refer: {
    text: "REFER TO MANUAL REVIEW",
    mesh: "from-amber-500 to-orange-600",
    chip: "bg-amber-100 text-amber-800",
    bar: "bg-amber-500",
  },
};

const VALIDATION_LABEL: Record<string, string> = {
  passed: "explanation grounded",
  passed_on_retry: "grounded on retry",
  fell_back_to_template: "deterministic explanation",
};

export default function DecisionView({ record, onAction, onNew }: Props) {
  const { decision, applicant, application } = record;
  const verdict = VERDICT[decision.recommendation];
  const overrideOptions = (["approve", "decline", "refer"] as const).filter(
    (o) => o !== decision.recommendation,
  );
  const [overriding, setOverriding] = useState(false);
  const [overrideOutcome, setOverrideOutcome] = useState<Recommendation>(overrideOptions[0]);
  const [overrideReason, setOverrideReason] = useState("");
  const passed = decision.policy_results.filter((r) => r.passed).length;
  const total = decision.policy_results.length;
  const maxPoints = decision.score_result.factors.length * 20;

  const confirmOverride = () => {
    if (overrideReason.trim() === "") return;
    onAction("overridden", `overrode to ${VERDICT[overrideOutcome].text}: ${overrideReason.trim()}`);
    setOverriding(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className={`animate-scale-in rounded-3xl bg-gradient-to-br ${verdict.mesh} p-6 text-white shadow-xl`}
      >
        <div className="text-xs font-medium uppercase tracking-widest text-white/70">
          Recommendation
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-3">
          <h2 className="text-3xl font-bold tracking-tight">{verdict.text}</h2>
          <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
            {decision.risk_band.toUpperCase()} RISK
          </span>
        </div>
        <div className="mt-3 text-sm text-white/80">
          {applicant.full_name} · {application.product.replace("_", " ")} · AED{" "}
          {application.amount_aed.toLocaleString("en-US")} over {application.term_months} months ·
          ruleset {decision.ruleset_version}
          {decision.validation_outcome && ` · ${VALIDATION_LABEL[decision.validation_outcome]}`}
        </div>
      </div>

      <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          Why (read this to your manager)
        </h3>
        <p className="text-sm leading-7 text-slate-800">{decision.explanation}</p>
        {decision.reasons.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {decision.reasons.map((reason, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                {reason}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Scorecard</h3>
          <span className="text-sm font-semibold text-slate-700">
            {decision.score_result.total_points}{" "}
            <span className="text-slate-400">/ {maxPoints}</span> · {decision.score_result.risk_band}
          </span>
        </div>
        <div className="flex flex-col gap-3.5">
          {decision.score_result.factors.map((f) => (
            <div key={f.factor_name}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-slate-800">{f.factor_name}</span>
                <span className="text-slate-500">
                  {f.applicant_value} · {f.points_awarded}/20
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${verdict.bar} transition-all`}
                  style={{ width: `${(f.points_awarded / 20) * 100}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-slate-500">{f.rationale}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Policy checks <span className="text-slate-400">· {passed} of {total} passed</span>
        </h3>
        <div className="flex flex-col gap-2">
          {decision.policy_results.map((r) => (
            <details
              key={r.rule_id}
              open={!r.passed}
              className={`group rounded-xl border p-3 text-sm ${
                r.passed ? "border-slate-200 bg-slate-50/50" : "border-rose-200 bg-rose-50"
              }`}
            >
              <summary className="flex cursor-pointer items-center gap-2 font-medium">
                <span>{r.passed ? "✅" : "❌"}</span>
                <span className="text-slate-500">{r.rule_id}</span>
                <span className="text-slate-800">{r.finding}</span>
              </summary>
              <p className="mt-2 border-l-2 border-slate-300 pl-3 text-slate-600">
                &ldquo;{r.cited_text}&rdquo;
              </p>
            </details>
          ))}
        </div>
      </section>

      {decision.counterfactuals.length > 0 && (
        <section className="animate-fade-up rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <h3 className="mb-2 text-sm font-semibold text-sky-900">What would change this</h3>
          <ul className="space-y-1.5">
            {decision.counterfactuals.map((line, i) => (
              <li key={i} className="flex gap-2 text-sm text-sky-900">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                {line}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-wrap items-center gap-3">
        {decision.officer_action === "none" ? (
          <>
            <button
              onClick={() => onAction("accepted")}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-emerald-700"
            >
              Accept recommendation
            </button>
            <button
              onClick={() => setOverriding((v) => !v)}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium transition hover:bg-slate-100"
            >
              Override
            </button>
          </>
        ) : (
          <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${verdict.chip}`}>
            Officer action recorded: {decision.officer_action}
            {decision.override_reason ? ` (${decision.override_reason})` : ""}
          </span>
        )}
        <button
          onClick={onNew}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium transition hover:bg-slate-100"
        >
          New assessment
        </button>
      </section>

      {overriding && decision.officer_action === "none" && (
        <section className="animate-scale-in rounded-2xl border border-slate-300 bg-slate-50 p-5">
          <h3 className="mb-3 text-sm font-semibold">Override the recommendation</h3>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span>New outcome</span>
              <select
                value={overrideOutcome}
                onChange={(e) => setOverrideOutcome(e.target.value as Recommendation)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                {overrideOptions.map((o) => (
                  <option key={o} value={o}>
                    {VERDICT[o].text}
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
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <button
              onClick={confirmOverride}
              disabled={overrideReason.trim() === ""}
              className="rounded-xl bg-slate-800 px-5 py-2.5 font-medium text-white transition hover:bg-slate-900 disabled:opacity-40"
            >
              Confirm override
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
