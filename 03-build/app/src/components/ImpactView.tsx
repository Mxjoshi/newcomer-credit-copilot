"use client";

// The impact view (Screen 3 tab, M6): champion vs challenger on the 24 locked ground-truth
// profiles, with a live "policy what-if" control. Moving the debt burden cap (or the other
// exposed knobs) re-runs the challenger against the same locked labels and the numbers shift on
// screen, with the cited rule text re-rendered from the new value. This is the plug and play
// demo made clickable: no file editing, fully repeatable, one click back to the locked
// v1.0 baseline. No LLM calls; instant and deterministic.

import { useCallback, useEffect, useRef, useState } from "react";

interface StrategyNumbers {
  label: string;
  approved_of_labeled: number;
  labeled_approve: number;
  false_approvals: number;
  referred: number;
}
interface ImpactRow {
  id: string;
  applicant_name: string;
  score: number;
  band: string;
  failed_rules: string[];
  recommendation: string;
  expected: string;
  match: boolean;
}
interface Params {
  dbr_cap: number;
  amount_salary_multiple: number;
  max_age_at_maturity: number;
  min_tenure_months: number;
}
interface ImpactData {
  ruleset_version: string;
  market_name: string;
  is_what_if: boolean;
  parameters: Params;
  total: number;
  accuracy: number;
  champion: StrategyNumbers;
  challenger: StrategyNumbers;
  rows: ImpactRow[];
}

const KNOBS: Array<{ key: keyof Params; label: string }> = [
  { key: "amount_salary_multiple", label: "Amount multiple (× salary)" },
  { key: "max_age_at_maturity", label: "Max age at maturity" },
  { key: "min_tenure_months", label: "Min tenure (months)" },
];

async function fetchImpact(query: string): Promise<ImpactData> {
  const res = await fetch(`/api/impact${query}`);
  if (!res.ok) throw new Error("impact run failed");
  return (await res.json()) as ImpactData;
}

export default function ImpactView() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [baseline, setBaseline] = useState<Params | null>(null);
  const [params, setParams] = useState<Params | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load: no overrides, so this is the locked v1.0 baseline.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchImpact("");
        if (!cancelled) {
          setData(result);
          setBaseline(result.parameters);
          setParams(result.parameters);
        }
      } catch {
        if (!cancelled) setError("could not run the impact view, try again");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rerun = useCallback(
    (next: Params, base: Params) => {
      const diffs = (Object.keys(next) as Array<keyof Params>).filter(
        (k) => next[k] !== base[k],
      );
      const query =
        diffs.length === 0 ? "" : `?${diffs.map((k) => `${k}=${next[k]}`).join("&")}`;
      fetchImpact(query)
        .then(setData)
        .catch(() => setError("could not run the impact view, try again"));
    },
    [],
  );

  const update = (key: keyof Params, value: number) => {
    if (!params || !baseline) return;
    const next = { ...params, [key]: value };
    setParams(next);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => rerun(next, baseline), 200);
  };

  const reset = () => {
    if (!baseline) return;
    setParams(baseline);
    rerun(baseline, baseline);
  };

  const pct = (v: number) => `${Math.round(v * 100)}`;

  const stat = (label: string, value: number, accent: string) => (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div key={`${label}-${value}`} className={`animate-count text-2xl font-bold ${accent}`}>
        {value}
      </div>
    </div>
  );

  const strategyCard = (s: StrategyNumbers, tone: string, accent: string) => (
    <div className={`flex-1 rounded-2xl border-2 p-5 ${tone}`}>
      <h4 className="text-sm font-semibold text-slate-800">{s.label}</h4>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {stat("Approved", s.approved_of_labeled, accent)}
        {stat("False approvals", s.false_approvals, "text-rose-600")}
        {stat("Referred", s.referred, "text-amber-600")}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        of {s.labeled_approve} creditworthy newcomers in the locked set
      </p>
    </div>
  );

  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!data || !params || !baseline) {
    return <p className="text-sm text-slate-500">Running the locked ground-truth set...</p>;
  }

  const dirty = (Object.keys(params) as Array<keyof Params>).some(
    (k) => params[k] !== baseline[k],
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-indigo-900">Policy what-if</h3>
            <p className="text-xs text-indigo-700">
              Move a policy value and the 24-profile run re-computes live. Policy is
              configuration, not code.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              data.is_what_if
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {data.is_what_if ? `${data.ruleset_version}` : "locked v1.0 baseline"}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium text-slate-700">Debt burden ratio cap</span>
            <span className="font-mono text-lg font-bold text-indigo-700">
              {pct(params.dbr_cap)}%
            </span>
          </div>
          <input
            type="range"
            min={0.3}
            max={0.6}
            step={0.01}
            value={params.dbr_cap}
            onChange={(e) => update("dbr_cap", Number(e.target.value))}
            className="mt-2 w-full accent-indigo-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>30%</span>
            <span>60%</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {KNOBS.map(({ key, label }) => (
            <label key={key} className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-600">{label}</span>
              <input
                type="number"
                value={params[key]}
                onChange={(e) => update(key, Number(e.target.value))}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          ))}
        </div>

        {dirty && (
          <button
            onClick={reset}
            className="mt-4 rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
          >
            Reset to locked v1.0 baseline
          </button>
        )}
      </section>

      <div className="flex flex-col gap-4 lg:flex-row">
        {strategyCard(data.champion, "border-slate-300 bg-white", "text-slate-700")}
        {strategyCard(data.challenger, "border-emerald-300 bg-emerald-50", "text-emerald-700")}
      </div>

      <p className="text-sm text-slate-700">
        Decision accuracy vs the locked labels:{" "}
        <strong>
          {data.accuracy} of {data.total}
        </strong>{" "}
        ({((data.accuracy / data.total) * 100).toFixed(1)}%, target 80%+).
      </p>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <th className="px-3 py-2">Profile</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Band</th>
              <th className="px-3 py-2">Rules failed</th>
              <th className="px-3 py-2">Outcome</th>
              <th className="px-3 py-2">Label</th>
              <th className="px-3 py-2">Match</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-slate-100 ${row.match ? "" : "bg-amber-50"}`}
              >
                <td className="px-3 py-2 font-medium text-slate-700">{row.id}</td>
                <td className="px-3 py-2">{row.score}</td>
                <td className="px-3 py-2">{row.band}</td>
                <td className="px-3 py-2 text-slate-500">
                  {row.failed_rules.length > 0 ? row.failed_rules.join(", ") : "none"}
                </td>
                <td className="px-3 py-2 font-medium">{row.recommendation}</td>
                <td className="px-3 py-2 text-slate-500">{row.expected}</td>
                <td className="px-3 py-2">
                  {row.match ? (
                    <span className="text-emerald-600">yes</span>
                  ) : (
                    <span className="font-semibold text-amber-600">NO</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
