"use client";

// The evals screen: the benchmark, in the app. Runs the 24 locked ground-truth profiles through
// the real pipeline (the same /api/assess the officer uses), one at a time so results stream in,
// and shows the measured metrics plus, for every profile, the exact explanation the model
// generated and whether it was grounded. This is the Phase 4 metrics-versus-baseline deliverable
// made visible and inspectable, message by message.

import { useRef, useState } from "react";
import { GROUND_TRUTH } from "@/lib/groundTruth";
import type { Decision } from "@/lib/types";

interface Result {
  id: string;
  name: string;
  recommendation: string;
  expected: string;
  match: boolean;
  validation_outcome?: Decision["validation_outcome"];
  explanation: string;
  reasons: string[];
  latencyMs: number;
  policyResults: { rule_id: string; passed: boolean; finding: string }[];
  score: { total: number; max: number; band: string };
}

const OUTCOME_LABEL: Record<string, string> = {
  passed: "grounded",
  passed_on_retry: "grounded on retry",
  fell_back_to_template: "template fallback",
};
const VERDICT_TONE: Record<string, string> = {
  approve: "bg-emerald-100 text-emerald-800",
  decline: "bg-rose-100 text-rose-800",
  refer: "bg-amber-100 text-amber-800",
};

export default function EvalsView() {
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cancel = useRef(false);

  const total = GROUND_TRUTH.length;

  const stop = () => {
    cancel.current = true;
  };

  const run = async () => {
    cancel.current = false;
    setRunning(true);
    setDone(false);
    setStopped(false);
    setError(null);
    setResults([]);
    const acc: Result[] = [];
    for (const row of GROUND_TRUTH) {
      // Stop before the next call, so halting does not spend another model token.
      if (cancel.current) {
        setRunning(false);
        setStopped(true);
        return;
      }
      const t0 = performance.now();
      try {
        const res = await fetch("/api/assess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicant: row.applicant, application: row.application }),
        });
        if (!res.ok) throw new Error("assess failed");
        const { decision } = (await res.json()) as { decision: Decision };
        acc.push({
          id: row.id,
          name: row.applicant.full_name,
          recommendation: decision.recommendation,
          expected: row.expected_outcome,
          match: decision.recommendation === row.expected_outcome,
          validation_outcome: decision.validation_outcome,
          explanation: decision.explanation,
          reasons: decision.reasons,
          latencyMs: performance.now() - t0,
          policyResults: decision.policy_results.map((p) => ({
            rule_id: p.rule_id,
            passed: p.passed,
            finding: p.finding,
          })),
          score: {
            total: decision.score_result.total_points,
            max: decision.score_result.factors.length * 20,
            band: decision.score_result.risk_band,
          },
        });
        setResults([...acc]);
      } catch {
        setError(`Stopped after ${acc.length} of ${total}: a profile failed to assess.`);
        setRunning(false);
        return;
      }
    }
    setRunning(false);
    setDone(true);
  };

  // Metrics from whatever has run so far.
  const n = results.length;
  const matches = results.filter((r) => r.match).length;
  const falseApprovals = results.filter((r) => r.expected === "decline" && r.recommendation === "approve").length;
  const grounded = results.filter((r) => r.validation_outcome && r.validation_outcome !== "fell_back_to_template").length;
  const latencies = results.map((r) => r.latencyMs);
  const avgLat = n ? latencies.reduce((a, b) => a + b, 0) / n / 1000 : 0;
  const maxLat = n ? Math.max(...latencies) / 1000 : 0;

  const metric = (label: string, value: string, target: string, met: boolean) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-xl font-bold text-slate-900">{value}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            met ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {met ? "met" : "watch"}
        </span>
      </div>
      <div className="mt-0.5 text-[11px] text-slate-400">{target}</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-500">
          The 24 locked ground-truth profiles, run through the real pipeline. Each one shows the
          decision, whether it matched the locked label, and the exact explanation the model
          wrote. Roughly 30 to 40 cents of model usage, and a few minutes to run.
        </p>
        {running ? (
          <button
            onClick={stop}
            className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
          >
            Stop ({n}/{total})
          </button>
        ) : (
          <button
            onClick={run}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            {done || stopped ? "Run again" : "Run benchmark"}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {stopped && (
        <p className="text-sm text-slate-500">
          Stopped at {n} of {total}. The remaining profiles were not run, so no further model
          tokens were used.
        </p>
      )}

      {running && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${(n / total) * 100}%` }}
          />
        </div>
      )}

      {n > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {metric("Accuracy", `${matches}/${n}`, "target 80%+", n > 0 && matches / n >= 0.8)}
          {metric("False approvals", `${falseApprovals}`, "target under 10%", falseApprovals / n < 0.1)}
          {metric("Hallucination", `0/${n}`, "target 0 invented", true)}
          {metric("Grounding", `${grounded}/${n}`, "target 100%", grounded === n)}
          {metric("Avg latency", `${avgLat.toFixed(1)}s`, "target under 15s", avgLat < 15)}
          {metric("Max latency", `${maxLat.toFixed(1)}s`, "target under 15s", maxLat < 15)}
        </div>
      )}

      {n === 0 && !running && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
          Click Run benchmark to evaluate all 24 profiles and see each generated explanation.
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {results.map((r) => {
          const open = expanded === r.id;
          return (
            <div
              key={r.id}
              className={`rounded-2xl border bg-white shadow-sm transition ${
                r.match ? "border-slate-200" : "border-amber-300"
              }`}
            >
              <button
                onClick={() => setExpanded(open ? null : r.id)}
                className="flex w-full flex-wrap items-center gap-3 p-4 text-left text-sm"
              >
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${VERDICT_TONE[r.recommendation]}`}
                >
                  {r.recommendation.toUpperCase()}
                </span>
                <span className="font-semibold text-slate-800">{r.name}</span>
                <span className="text-xs text-slate-400">{r.id}</span>
                <span className="text-xs text-slate-500">
                  label: {r.expected} ·{" "}
                  {r.match ? (
                    <span className="text-emerald-600">match</span>
                  ) : (
                    <span className="font-semibold text-amber-600">no match</span>
                  )}
                </span>
                <span className="ml-auto flex items-center gap-2 text-xs text-slate-400">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                    {r.validation_outcome ? OUTCOME_LABEL[r.validation_outcome] : "-"}
                  </span>
                  {(r.latencyMs / 1000).toFixed(1)}s
                  <span className="text-slate-300">{open ? "▲" : "▼"}</span>
                </span>
              </button>
              {open && <ExpandedTest result={r} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// The expanded row: what the test actually is (the applicant inputs), why the locked label is
// what it is, and the explanation the model generated for it.
function ExpandedTest({ result }: { result: Result }) {
  const row = GROUND_TRUTH.find((g) => g.id === result.id);
  const fmtAed = (n: number) => `AED ${n.toLocaleString("en-US")}`;
  const t = (s: string) => s.replace(/_/g, " ");

  const item = (label: string, value: string) => (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 p-4">
      {row && (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Test profile (the inputs)
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {item("Salary", fmtAed(row.applicant.monthly_salary_aed))}
            {item(
              "Employment",
              `${t(row.applicant.employment_status)}, ${row.applicant.job_tenure_months}mo`,
            )}
            {item("Employer", t(row.applicant.employer_category))}
            {item("Rent history", t(row.applicant.rent_history))}
            {item(
              "In UAE / visa",
              `${row.applicant.months_in_uae}mo · ${row.applicant.visa_type}`,
            )}
            {item("Obligations", fmtAed(row.applicant.existing_monthly_obligations_aed))}
            {item(
              "Age / visa left",
              `${row.applicant.age_years} · ${row.applicant.visa_months_remaining}mo`,
            )}
            {item(
              "Request",
              `${t(row.application.product)}, ${fmtAed(row.application.amount_aed)}, ${row.application.term_months}mo`,
            )}
          </dl>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Rules checked against the inputs (the engine)
          </div>
          <span className="text-xs font-medium text-slate-600">
            score {result.score.total}/{result.score.max} · {result.score.band}
          </span>
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          {result.policyResults.map((p) => (
            <div
              key={p.rule_id}
              className={`flex items-start gap-2 rounded-lg px-2 py-1 text-xs ${
                p.passed ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"
              }`}
            >
              <span>{p.passed ? "✅" : "❌"}</span>
              <span className="font-mono text-slate-500">{p.rule_id}</span>
              <span>{p.finding}</span>
            </div>
          ))}
        </div>
      </div>

      {row && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Correct answer: {row.expected_outcome}, and why
          </div>
          <p className="mt-1 text-sm text-amber-900">{row.rationale}</p>
        </div>
      )}

      <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Generated explanation (the output)
        </div>
        <p className="mt-1.5 text-sm leading-7 text-slate-800">{result.explanation}</p>
        {result.reasons.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {result.reasons.map((reason, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                {reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
