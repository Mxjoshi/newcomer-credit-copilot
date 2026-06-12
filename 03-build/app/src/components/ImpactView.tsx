"use client";

// The impact view (Screen 3 tab, M6): champion vs challenger on the 24 locked ground-truth
// profiles. Rerun re-reads the live pack from disk server-side, so a config edit shows up here
// on the next click: the plug and play demo moment. No LLM calls; instant and repeatable.

import { useCallback, useEffect, useState } from "react";

interface StrategyNumbers {
  label: string;
  approved_of_labeled: number;
  labeled_approve: number;
  false_approvals: number;
  referred: number;
}

interface ImpactRow {
  id: string;
  score: number;
  band: string;
  failed_rules: string[];
  recommendation: string;
  expected: string;
  match: boolean;
}

interface ImpactData {
  ruleset_version: string;
  market_name: string;
  total: number;
  accuracy: number;
  champion: StrategyNumbers;
  challenger: StrategyNumbers;
  rows: ImpactRow[];
}

async function fetchImpact(): Promise<ImpactData> {
  const res = await fetch("/api/impact");
  if (!res.ok) throw new Error("impact run failed");
  return (await res.json()) as ImpactData;
}

export default function ImpactView() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchImpact());
    } catch {
      setError("could not run the impact view, try again");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchImpact();
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setError("could not run the impact view, try again");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const card = (s: StrategyNumbers, accent: string) => (
    <div className={`flex-1 rounded-lg border-2 p-4 ${accent}`}>
      <h4 className="font-semibold">{s.label}</h4>
      <ul className="mt-2 space-y-1 text-sm">
        <li>
          Creditworthy newcomers approved:{" "}
          <strong>
            {s.approved_of_labeled} of {s.labeled_approve}
          </strong>
        </li>
        <li>
          False approvals (the costly error): <strong>{s.false_approvals}</strong>
        </li>
        <li>
          Referred to a human: <strong>{s.referred}</strong>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          The 24 locked ground-truth profiles, two strategies, run fresh against the live
          ruleset{data ? ` (${data.ruleset_version})` : ""}.
        </p>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40"
        >
          {loading ? "Running..." : "Rerun"}
        </button>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {data && (
        <>
          <div className="flex flex-col gap-4 lg:flex-row">
            {card(data.champion, "border-slate-300 bg-slate-50")}
            {card(data.challenger, "border-emerald-300 bg-emerald-50")}
          </div>
          <p className="text-sm text-slate-700">
            Decision accuracy vs the locked labels: <strong>{data.accuracy}</strong> of{" "}
            {data.total} ({((data.accuracy / data.total) * 100).toFixed(1)}%, target 80%+).
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-1.5 pr-2">Profile</th>
                <th className="py-1.5 pr-2">Score</th>
                <th className="py-1.5 pr-2">Band</th>
                <th className="py-1.5 pr-2">Rules failed</th>
                <th className="py-1.5 pr-2">Outcome</th>
                <th className="py-1.5 pr-2">Label</th>
                <th className="py-1.5">Match</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-slate-100 ${row.match ? "" : "bg-amber-50"}`}
                >
                  <td className="py-1.5 pr-2 font-medium">{row.id}</td>
                  <td className="py-1.5 pr-2">{row.score}</td>
                  <td className="py-1.5 pr-2">{row.band}</td>
                  <td className="py-1.5 pr-2">
                    {row.failed_rules.length > 0 ? row.failed_rules.join(", ") : "none"}
                  </td>
                  <td className="py-1.5 pr-2 font-medium">{row.recommendation}</td>
                  <td className="py-1.5 pr-2">{row.expected}</td>
                  <td className="py-1.5">{row.match ? "yes" : "NO"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
