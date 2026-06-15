"use client";

// The impact view (Screen 3 tab + Policy impact nav, M6): the status quo vs this product on the
// 24 locked ground-truth profiles, with a live "policy what-if" control. The baseline is the
// active policy version (choose another with the version picker); moving a value re-runs the 24
// against that version, the numbers shift, and every distinct what-if is written to a session
// change log. No file writes; instant, deterministic, repeatable, with a one-click reset.

import { useEffect, useRef, useState } from "react";
import {
  appendPolicyLog,
  clearPolicyLog,
  loadPolicyLog,
  type PolicyChange,
  type PolicyLogEntry,
} from "@/lib/policyLog";
import { loadVersions, type PolicyVersion } from "@/lib/policyVersions";
import VersionPicker from "./VersionPicker";

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
  parameters: Params;
  total: number;
  accuracy: number;
  champion: StrategyNumbers;
  challenger: StrategyNumbers;
  rows: ImpactRow[];
}

const PARAM_META: Record<keyof Params, { label: string; fmt: (v: number) => string }> = {
  dbr_cap: { label: "Debt burden cap", fmt: (v) => `${Math.round(v * 100)}%` },
  amount_salary_multiple: { label: "Amount multiple", fmt: (v) => `${v}× salary` },
  max_age_at_maturity: { label: "Max age at maturity", fmt: (v) => `${v}` },
  min_tenure_months: { label: "Min tenure", fmt: (v) => `${v} months` },
};
const KEYS: Array<keyof Params> = [
  "dbr_cap",
  "amount_salary_multiple",
  "max_age_at_maturity",
  "min_tenure_months",
];
const KNOBS: Array<keyof Params> = ["amount_salary_multiple", "max_age_at_maturity", "min_tenure_months"];

const countOutcomes = (rows: ImpactRow[]) =>
  rows.reduce(
    (a, r) => {
      a[r.recommendation as "approve" | "decline" | "refer"]++;
      return a;
    },
    { approve: 0, decline: 0, refer: 0 },
  );

const buildQuery = (p: Params, label: string) =>
  `?${new URLSearchParams({
    dbr_cap: String(p.dbr_cap),
    amount_salary_multiple: String(p.amount_salary_multiple),
    max_age_at_maturity: String(p.max_age_at_maturity),
    min_tenure_months: String(p.min_tenure_months),
    ruleset_version: label,
  }).toString()}`;

async function fetchImpact(query: string): Promise<ImpactData> {
  const res = await fetch(`/api/impact${query}`);
  if (!res.ok) throw new Error("impact run failed");
  return (await res.json()) as ImpactData;
}

export default function ImpactView({ activeLabel }: { activeLabel: string }) {
  const [data, setData] = useState<ImpactData | null>(null);
  const [params, setParams] = useState<Params | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<PolicyLogEntry[]>([]);
  const [versions, setVersions] = useState<PolicyVersion[]>([]);
  const [selectedLabel, setSelectedLabel] = useState(activeLabel);
  // The baseline (the selected version) to compare what-if edits against.
  const [baseline, setBaseline] = useState<Params | null>(null);
  const [baselineOutcomes, setBaselineOutcomes] = useState<Record<string, string>>({});
  const [baselineCounts, setBaselineCounts] = useState({ approve: 0, decline: 0, refer: 0 });

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSig = useRef<string>("");

  // Load the baseline for the selected version (and reload when the version changes).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const vers = loadVersions();
        const v = vers.find((x) => x.label === selectedLabel) ?? vers.find((x) => x.is_base);
        const result = await fetchImpact(v ? buildQuery(v.params, v.label) : "");
        if (cancelled) return;
        const baseParams = v ? v.params : result.parameters;
        setVersions(vers);
        setBaseline(baseParams);
        setBaselineOutcomes(Object.fromEntries(result.rows.map((r) => [r.id, r.recommendation])));
        setBaselineCounts(countOutcomes(result.rows));
        setData(result);
        setParams(baseParams);
        setLog(loadPolicyLog());
        lastSig.current = "";
      } catch {
        if (!cancelled) setError("could not run the impact view, try again");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedLabel]);

  const rerun = (next: Params, base: Params, outcomes: Record<string, string>, label: string) => {
    fetchImpact(buildQuery(next, label))
      .then((result) => {
        setData(result);
        const diffs = KEYS.filter((k) => next[k] !== base[k]);
        if (diffs.length === 0) return;
        const changes: PolicyChange[] = diffs.map((k) => ({
          param: k,
          label: PARAM_META[k].label,
          from: PARAM_META[k].fmt(base[k]),
          to: PARAM_META[k].fmt(next[k]),
        }));
        const sig = JSON.stringify(changes);
        if (sig === lastSig.current) return;
        lastSig.current = sig;
        const counts = countOutcomes(result.rows);
        const moved = result.rows.filter((r) => r.recommendation !== outcomes[r.id]).length;
        setLog(
          appendPolicyLog({
            changes,
            approved: counts.approve,
            referred: counts.refer,
            declined: counts.decline,
            accuracy: result.accuracy,
            moved,
          }),
        );
      })
      .catch(() => setError("could not run the impact view, try again"));
  };

  const update = (key: keyof Params, value: number) => {
    if (!params || !baseline) return;
    const next = { ...params, [key]: value };
    const base = baseline;
    const outcomes = baselineOutcomes;
    const label = selectedLabel;
    setParams(next);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => rerun(next, base, outcomes, label), 220);
  };

  const reset = () => {
    if (!baseline) return;
    setParams(baseline);
    lastSig.current = "";
    rerun(baseline, baseline, baselineOutcomes, selectedLabel);
  };

  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!data || !params || !baseline) {
    return <p className="text-sm text-slate-500">Running the locked ground-truth set...</p>;
  }
  const base = baseline;

  const dirty = KEYS.some((k) => params[k] !== base[k]);
  const changedKeys = KEYS.filter((k) => params[k] !== base[k]);
  const movedRows = new Set(
    dirty ? data.rows.filter((r) => r.recommendation !== baselineOutcomes[r.id]).map((r) => r.id) : [],
  );
  const nowCounts = countOutcomes(data.rows);

  const stat = (label: string, value: number, accent: string) => (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
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

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Policy what-if</h3>
            <p className="text-xs text-blue-700">
              Move a policy value and the 24-profile run re-computes live. Policy is configuration,
              not code.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <VersionPicker
              versions={versions}
              selectedLabel={selectedLabel}
              activeLabel={activeLabel}
              onChange={setSelectedLabel}
            />
            <span
              className={`rounded-full px-3 py-1 font-mono text-xs font-semibold ${
                dirty ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {selectedLabel}
              {dirty ? " · modified" : ""}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Debt burden ratio cap
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={Math.round(params.dbr_cap * 100)}
                onChange={(e) => update("dbr_cap", Number(e.target.value) / 100)}
                className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right font-mono text-sm font-semibold text-blue-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <span className="font-mono text-sm font-semibold text-blue-700">%</span>
            </div>
          </div>
          <input
            type="range"
            min={0.3}
            max={0.6}
            step={0.01}
            value={params.dbr_cap}
            onChange={(e) => update("dbr_cap", Number(e.target.value))}
            className="mt-2 w-full accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>30%</span>
            <span>60%</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {KNOBS.map((key) => (
            <label key={key} className="flex flex-col gap-1.5 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {PARAM_META[key].label}
              </span>
              <input
                type="number"
                value={params[key]}
                onChange={(e) => update(key, Number(e.target.value))}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          ))}
        </div>

        {dirty && (
          <div className="animate-fade-up mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-sm">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {changedKeys.map((k) => (
                <span key={k} className="font-medium text-amber-900">
                  {PARAM_META[k].label}{" "}
                  <span className="font-mono text-slate-500">{PARAM_META[k].fmt(base[k])}</span>
                  {" → "}
                  <span className="font-mono text-amber-700">{PARAM_META[k].fmt(params[k])}</span>
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-amber-800">
              <span>
                <strong>{movedRows.size}</strong> of {data.total} decisions moved
              </span>
              <span>
                approve {baselineCounts.approve} → <strong>{nowCounts.approve}</strong>
              </span>
              <span>
                refer {baselineCounts.refer} → <strong>{nowCounts.refer}</strong>
              </span>
              <span>
                decline {baselineCounts.decline} → <strong>{nowCounts.decline}</strong>
              </span>
            </div>
          </div>
        )}

        {dirty && (
          <button
            onClick={reset}
            className="mt-4 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            Reset to {selectedLabel}
          </button>
        )}
      </section>

      <div>
        <p className="mb-3 text-sm text-slate-600">
          Two strategies on the same 24 locked profiles. <strong>Today</strong>, a newcomer with no
          usable credit file is declined; <strong>with the copilot</strong>, they are assessed on
          alternative data against this ruleset.
        </p>
        <div className="flex flex-col gap-4 lg:flex-row">
          {strategyCard(data.champion, "border-slate-300 bg-white", "text-slate-700")}
          {strategyCard(data.challenger, "border-emerald-300 bg-emerald-50", "text-emerald-700")}
        </div>
      </div>

      <div>
        <p className="text-sm text-slate-700">
          Decision accuracy vs the locked labels:{" "}
          <strong>
            {data.accuracy} of {data.total}
          </strong>{" "}
          ({((data.accuracy / data.total) * 100).toFixed(1)}%, target 80%+).
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Below are the 24 test profiles in the benchmark: synthetic applicants, each with a known
          correct outcome (the &ldquo;label&rdquo;), locked before the model was built so the model
          cannot grade its own exam. &ldquo;Match&rdquo; is whether the model agreed with the label.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <th className="px-3 py-2">Test applicant</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Band</th>
              <th className="px-3 py-2">Rules failed</th>
              <th className="px-3 py-2">Model says</th>
              <th className="px-3 py-2">Correct answer</th>
              <th className="px-3 py-2">Match</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => {
              const moved = movedRows.has(row.id);
              return (
                <tr
                  key={row.id}
                  className={`border-b border-slate-100 ${
                    moved ? "bg-blue-50" : row.match ? "" : "bg-amber-50"
                  }`}
                >
                  <td className="px-3 py-2 font-medium text-slate-700">
                    {row.applicant_name}
                    <span className="ml-1.5 text-[10px] text-slate-400">{row.id}</span>
                    {moved && (
                      <span className="ml-1.5 rounded bg-blue-200 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">
                        moved
                      </span>
                    )}
                  </td>
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
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Policy change log</h3>
            <p className="text-xs text-slate-500">
              Every what-if run this session, with what it did to the numbers. In production this is
              where a real ruleset version change is recorded.
            </p>
          </div>
          {log.length > 0 && (
            <button
              onClick={() => {
                clearPolicyLog();
                setLog([]);
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Clear log
            </button>
          )}
        </div>
        {log.length === 0 ? (
          <p className="text-sm text-slate-400">
            No changes yet. Move a policy value above and it will be recorded here.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {log.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs"
              >
                <span className="text-slate-400">
                  {new Date(entry.at).toLocaleTimeString("en-GB")}
                </span>
                <span className="font-medium text-slate-700">
                  {entry.changes.map((c) => `${c.label} ${c.from} → ${c.to}`).join(", ")}
                </span>
                <span className="ml-auto text-slate-500">
                  {entry.moved} moved · approve {entry.approved} · refer {entry.referred} · decline{" "}
                  {entry.declined} · accuracy {entry.accuracy}/24
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
