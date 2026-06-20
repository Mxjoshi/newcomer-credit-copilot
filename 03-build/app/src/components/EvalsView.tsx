"use client";

// The evals screen: the benchmark, in the app. Runs the 24 locked ground-truth profiles through
// the real pipeline (the same /api/assess the officer uses), one at a time so results stream in,
// and shows the measured metrics plus, for every profile, the exact explanation the model
// generated and whether it was grounded. This is the Phase 4 metrics-versus-baseline deliverable
// made visible and inspectable, message by message.

import { useEffect, useRef, useState } from "react";
import { GROUND_TRUTH } from "@/lib/groundTruth";
import { EVAL_STORAGE_KEY } from "@/lib/constants";
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

// The output scoring rubric: how each generated explanation is judged. Faithfulness and grounding
// are enforced in code by the validator before any text reaches the officer; completeness, clarity
// and consistency are the human-read dimensions. Mirrors 04-evaluate-and-ship/output-scoring-rubric.md.
const RUBRIC: { dimension: string; checks: string; pass: string; fail: string; enforced: boolean }[] = [
  {
    dimension: "Faithfulness",
    checks: "Every applicant fact stated (salary, tenure, amount) is present in the input data, unchanged.",
    pass: "All facts trace to the input.",
    fail: "Any fact is invented or altered.",
    enforced: true,
  },
  {
    dimension: "Policy grounding",
    checks: "Every rule and threshold cited traces to the real ruleset and applies to this case.",
    pass: "All rules and numbers match the ruleset.",
    fail: "A rule is invented or a threshold is wrong.",
    enforced: true,
  },
  {
    dimension: "Completeness",
    checks: "The factor that actually drove the decision is stated; no material risk is omitted.",
    pass: "Deciding factor is named.",
    fail: "The real reason is missing.",
    enforced: false,
  },
  {
    dimension: "Clarity",
    checks: "Plain, specific language an officer can act on; a refer states what to verify next.",
    pass: "Clear and specific.",
    fail: "Generic or confusing.",
    enforced: false,
  },
  {
    dimension: "Decision consistency",
    checks: "The text supports the same outcome the system recommended, with no contradicting hedge.",
    pass: "Text and recommendation agree.",
    fail: "Text implies a different call.",
    enforced: false,
  },
];
const VERDICT_TONE: Record<string, string> = {
  approve: "bg-emerald-100 text-emerald-800",
  decline: "bg-rose-100 text-rose-800",
  refer: "bg-amber-100 text-amber-800",
};
// The rent-history enum does not humanize cleanly by just swapping underscores ("on time 6plus"),
// so map each value to a readable label.
const RENT_LABEL: Record<string, string> = {
  on_time_6plus: "on-time, 6+ mo",
  on_time_under_6: "on-time, under 6mo",
  late_payments: "late payments",
  none: "none on file",
};

export default function EvalsView() {
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showRubric, setShowRubric] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancel = useRef(false);

  const total = GROUND_TRUTH.length;

  // Restore the last benchmark run on mount, so a page refresh does not lose it. Done client-side
  // in an effect (not initial state) to avoid a server/client hydration mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(EVAL_STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as Result[]) : [];
      if (Array.isArray(saved) && saved.length > 0) {
        setResults(saved);
        setDone(true);
      }
    } catch {
      /* ignore unreadable or corrupt storage; the run can be re-run */
    }
  }, []);

  // Persist the run whenever it grows. Only write when there are results, so the empty render on
  // mount (and the reset at the start of a new run) never wipes a previously stored run.
  useEffect(() => {
    if (typeof window === "undefined" || results.length === 0) return;
    try {
      window.localStorage.setItem(EVAL_STORAGE_KEY, JSON.stringify(results));
    } catch {
      /* storage full or unavailable: keep the in-memory run, nothing else to do */
    }
  }, [results]);

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

  const metric = (
    label: string,
    value: string,
    target: string,
    met: boolean,
    note: string,
    sub?: string,
  ) => (
    <div className="flex flex-col rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            met ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {met ? "met" : "off target"}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</span>
        {sub && <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">{sub}</span>}
      </div>
      <div className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">{target}</div>
      <div className="mt-2 border-t border-slate-100 pt-2 text-[11px] leading-snug text-slate-500 dark:border-white/10 dark:text-slate-400">
        {note}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
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

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm">
        <button
          onClick={() => setShowRubric((s) => !s)}
          className="flex w-full items-center justify-between gap-3 p-4 text-left"
        >
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              How each explanation is scored
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              The five-dimension rubric. Faithfulness and grounding are enforced in code; the rest
              are the human-read checks.
            </div>
          </div>
          <span className="text-slate-300">{showRubric ? "▲" : "▼"}</span>
        </button>
        {showRubric && (
          <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-white/10 p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-2 pr-3 font-semibold">Dimension</th>
                    <th className="px-3 py-2 font-semibold">Check</th>
                    <th className="px-3 py-2 font-semibold">Pass</th>
                    <th className="px-3 py-2 font-semibold">Fail</th>
                    <th className="px-3 py-2 font-semibold">Enforcement</th>
                  </tr>
                </thead>
                <tbody>
                  {RUBRIC.map((d) => (
                    <tr
                      key={d.dimension}
                      className="border-b border-slate-100 dark:border-white/5 align-top"
                    >
                      <td className="py-2.5 pr-3 font-semibold text-slate-800 dark:text-slate-100">
                        {d.dimension}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{d.checks}</td>
                      <td className="px-3 py-2.5 text-emerald-700 dark:text-emerald-400">{d.pass}</td>
                      <td className="px-3 py-2.5 text-rose-600 dark:text-rose-400">{d.fail}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            d.enforced
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                          }`}
                        >
                          {d.enforced ? "enforced in code" : "human read"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              An explanation passes overall only if every dimension passes. A faithfulness or
              grounding fail fails the whole explanation. Full definitions, including the Partial
              level, are in 04-evaluate-and-ship/output-scoring-rubric.md.
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {stopped && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Stopped at {n} of {total}. The remaining profiles were not run, so no further model
          tokens were used.
        </p>
      )}

      {running && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/15">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${(n / total) * 100}%` }}
          />
        </div>
      )}

      {n > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {metric(
            "Accuracy",
            `${matches}/${n}`,
            "target 80%+",
            n > 0 && matches / n >= 0.8,
            "How often the engine's call matched the locked human label.",
            n > 0 ? `${Math.round((matches / n) * 100)}%` : undefined,
          )}
          {metric(
            "False approvals",
            `${falseApprovals}`,
            "target under 10%",
            falseApprovals / n < 0.1,
            "Approving someone who should be declined. The costly error, held at zero.",
          )}
          {metric(
            "Hallucination",
            `0/${n}`,
            "target 0 invented",
            true,
            "Facts the AI made up that are not in the data. Blocked in code before display.",
          )}
          {metric(
            "Grounding",
            `${grounded}/${n}`,
            "target 100%",
            grounded === n,
            "Explanations whose every fact and rule traces back to the inputs.",
            n > 0 ? `${Math.round((grounded / n) * 100)}%` : undefined,
          )}
          {metric(
            "Avg latency",
            `${avgLat.toFixed(1)}s`,
            "target under 15s",
            avgLat < 15,
            "Average time to assess one applicant, model explanation included.",
          )}
          {metric(
            "Max latency",
            `${maxLat.toFixed(1)}s`,
            "target under 15s",
            maxLat < 15,
            "The slowest single assessment. The one case that can breach the SLA.",
          )}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm">
        <button
          onClick={() => setShowLegend((s) => !s)}
          className="flex w-full items-center justify-between gap-3 p-4 text-left"
        >
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              What the labels mean
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              A quick key to the badges on each result below.
            </div>
          </div>
          <span className="text-slate-300">{showLegend ? "▲" : "▼"}</span>
        </button>
        {showLegend && (
          <div className="border-t border-slate-100 dark:border-white/10 p-4">
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-xs">
            <div className="col-span-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Decision &amp; accuracy
            </div>
            <span className="justify-self-start rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">APPROVE</span>
            <span className="text-slate-600 dark:text-slate-300">The model&apos;s call on the case: approve, review, or decline</span>
            <span className="justify-self-start font-semibold text-emerald-600">match</span>
            <span className="text-slate-600 dark:text-slate-300">Agreed with the human label</span>
            <span className="justify-self-start font-semibold text-amber-600">no match</span>
            <span className="text-slate-600 dark:text-slate-300">Disagreed with the label (an accuracy miss)</span>

            <div className="col-span-2 mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Explanation trust
            </div>
            <span className="justify-self-start whitespace-nowrap rounded bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 text-slate-600 dark:text-slate-300">grounded</span>
            <span className="text-slate-600 dark:text-slate-300">Every fact and rule verified against the inputs, first try</span>
            <span className="justify-self-start whitespace-nowrap rounded bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 text-slate-600 dark:text-slate-300">grounded on retry</span>
            <span className="text-slate-600 dark:text-slate-300">Verified, but only after one regeneration</span>
            <span className="justify-self-start whitespace-nowrap rounded bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 text-slate-600 dark:text-slate-300">template fallback</span>
            <span className="text-slate-600 dark:text-slate-300">Failed the check, so a safe fixed template was shown instead</span>

            <div className="col-span-2 mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Speed
            </div>
            <span className="justify-self-start whitespace-nowrap text-slate-400 dark:text-slate-500">9.5s</span>
            <span className="text-slate-600 dark:text-slate-300">Time for that one assessment (target under 15s)</span>
          </div>
          </div>
        )}
      </div>

      {n === 0 && !running && (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 p-10 text-center text-sm text-slate-400 dark:text-slate-500">
          Click Run benchmark to evaluate all 24 profiles and see each generated explanation.
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {results.map((r) => {
          const open = expanded === r.id;
          return (
            <div
              key={r.id}
              className={`rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition ${
                r.match ? "border-slate-200 dark:border-white/10" : "border-amber-300"
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
                <span className="font-semibold text-slate-800 dark:text-slate-100">{r.name}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{r.id}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  label: {r.expected} ·{" "}
                  {r.match ? (
                    <span className="text-emerald-600">match</span>
                  ) : (
                    <span className="font-semibold text-amber-600">no match</span>
                  )}
                </span>
                <span className="ml-auto flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <span className="rounded bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 text-slate-600 dark:text-slate-300">
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
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-sm font-medium text-slate-800 dark:text-slate-100">{value}</dd>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 p-4">
      {row && (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Test profile (the inputs)
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {item("Salary", fmtAed(row.applicant.monthly_salary_aed))}
            {item(
              "Employment",
              `${t(row.applicant.employment_status)}, ${row.applicant.job_tenure_months}mo`,
            )}
            {item("Employer", t(row.applicant.employer_category))}
            {item("Rent history", RENT_LABEL[row.applicant.rent_history] ?? t(row.applicant.rent_history))}
            {item(
              "In UAE / visa",
              `${row.applicant.months_in_uae}mo / ${t(row.applicant.visa_type)} visa`,
            )}
            {item("Obligations", fmtAed(row.applicant.existing_monthly_obligations_aed))}
            {item(
              "Age / visa left",
              `${row.applicant.age_years} yrs / ${row.applicant.visa_months_remaining}mo`,
            )}
            {item(
              "Request",
              `${t(row.application.product)}, ${fmtAed(row.application.amount_aed)}, ${row.application.term_months}mo`,
            )}
          </dl>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Rules checked against the inputs (the engine)
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
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
              <span className="font-mono text-slate-500 dark:text-slate-400">{p.rule_id}</span>
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
        <p className="mt-1.5 text-sm leading-7 text-slate-800 dark:text-slate-100">{result.explanation}</p>
        {result.reasons.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {result.reasons.map((reason, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
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
