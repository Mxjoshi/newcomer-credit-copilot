"use client";

// The Policy view: a read-only render of the live ruleset, so anyone can see exactly what is in
// policy. Market identity, the parameters with their notes, the band cut-offs, every rule with
// its cited text and severity, and the scorecard factors with their tiers. This is the
// "policy is configuration" claim made legible: the whole ruleset, on one page, from the same
// file the engine runs.

import { useEffect, useState } from "react";

interface RuleRow {
  rule_id: string;
  title: string;
  rule_text: string;
  source_section: string;
  condition: string;
  severity: "hard_fail" | "refer";
}
interface PolicyData {
  identity: {
    market_name: string;
    ruleset_version: string;
    currency: string;
    regulator: string;
    bureau: string;
  };
  parameters: Record<string, unknown>;
  parameter_notes: Record<string, string>;
  band_cutoffs: { low: number; high: number; note: string };
  rules: RuleRow[];
  scorecard: Array<Record<string, unknown>>;
}

const PARAM_LABEL: Record<string, string> = {
  product_min_salary: "Minimum salary per product (AED)",
  flat_annual_rate: "Flat annual rate (installment estimate)",
  dbr_cap: "Debt burden ratio cap",
  amount_salary_multiple: "Max loan amount (× salary)",
  max_age_at_maturity: "Max age at loan maturity",
  min_tenure_months: "Minimum employment tenure (months)",
  personal_loan_max_term_months: "Max personal loan term (months)",
};

function paramValue(key: string, value: unknown): string {
  if (key === "dbr_cap" && typeof value === "number") return `${Math.round(value * 100)}%`;
  if (key === "flat_annual_rate" && typeof value === "number") return `${(value * 100).toFixed(0)}%`;
  if (key === "product_min_salary" && value && typeof value === "object") {
    return Object.entries(value as Record<string, number>)
      .map(([k, v]) => `${k.replace("_", " ")}: ${v.toLocaleString("en-US")}`)
      .join(" · ");
  }
  return String(value);
}

export default function PolicyView() {
  const [data, setData] = useState<PolicyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/policy");
        if (!res.ok) throw new Error("failed");
        if (!cancelled) setData((await res.json()) as PolicyData);
      } catch {
        if (!cancelled) setError("could not load the policy");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!data) return <p className="text-sm text-slate-500">Loading the live policy...</p>;

  const params = Object.entries(data.parameters).filter(([k]) => !k.startsWith("_"));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Policy</h2>
        <p className="text-sm text-slate-500">
          The live ruleset, exactly as the engine runs it. This is the file behind every
          decision.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
            {data.identity.ruleset_version}
          </span>
          <span>
            <span className="text-slate-500">Market</span>{" "}
            <strong>{data.identity.market_name}</strong>
          </span>
          <span>
            <span className="text-slate-500">Regulator</span>{" "}
            <strong>{data.identity.regulator}</strong>
          </span>
          <span>
            <span className="text-slate-500">Bureau</span>{" "}
            <strong>{data.identity.bureau}</strong>
          </span>
          <span>
            <span className="text-slate-500">Currency</span>{" "}
            <strong>{data.identity.currency}</strong>
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Parameters</h3>
        <div className="flex flex-col divide-y divide-slate-100">
          {params.map(([key, value]) => (
            <div key={key} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
              <div className="sm:w-72">
                <div className="text-sm font-medium text-slate-800">
                  {PARAM_LABEL[key] ?? key}
                </div>
                {data.parameter_notes[key] && (
                  <div className="text-xs text-slate-400">{data.parameter_notes[key]}</div>
                )}
              </div>
              <div className="font-mono text-sm font-semibold text-indigo-700">
                {paramValue(key, value)}
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
            <div className="sm:w-72">
              <div className="text-sm font-medium text-slate-800">Risk band cut-offs</div>
              <div className="text-xs text-slate-400">{data.band_cutoffs.note}</div>
            </div>
            <div className="font-mono text-sm font-semibold text-indigo-700">
              low ≥ {data.band_cutoffs.low} · high &lt; {data.band_cutoffs.high}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Policy rules <span className="text-slate-400">· {data.rules.length}</span>
        </h3>
        <div className="flex flex-col gap-2.5">
          {data.rules.map((r, i) => (
            <div key={r.rule_id} className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-slate-800">{r.title}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    r.severity === "hard_fail"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {r.severity === "hard_fail" ? "hard fail" : "refer"}
                </span>
                <span className="ml-auto text-xs text-slate-400">{r.source_section}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">&ldquo;{r.rule_text}&rdquo;</p>
              <p className="mt-1 font-mono text-xs text-slate-400">{r.condition}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Scorecard factors{" "}
          <span className="text-slate-400">· {data.scorecard.length}, 0-20 points each</span>
        </h3>
        <div className="flex flex-col gap-2.5">
          {data.scorecard.map((f) => (
            <FactorCard key={String(f.factor_id)} factor={f} />
          ))}
        </div>
      </section>
    </div>
  );
}

// Renders one scorecard factor: name, rationale, and any tier tables or category maps it
// carries. Generic, so it copes with whatever shape a factor's tiers take.
function FactorCard({ factor }: { factor: Record<string, unknown> }) {
  const skip = new Set(["factor_id", "enabled", "factor_name", "_rationale", "threshold_label"]);
  const tierBlocks: Array<[string, Array<Record<string, unknown>>]> = [];
  const categoryBlocks: Array<[string, Record<string, unknown>]> = [];

  for (const [key, value] of Object.entries(factor)) {
    if (skip.has(key)) continue;
    if (Array.isArray(value)) {
      tierBlocks.push([key, value as Array<Record<string, unknown>>]);
    } else if (value && typeof value === "object" && "points" in (value as object)) {
      // single entry like "unemployed": {points, rationale}
      categoryBlocks.push([key, { [key]: value }]);
    } else if (value && typeof value === "object") {
      categoryBlocks.push([key, value as Record<string, unknown>]);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 p-3.5">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-sm font-semibold text-slate-800">
          {String(factor.factor_name)}
        </span>
        {!!factor.threshold_label && (
          <span className="text-xs text-slate-400">{String(factor.threshold_label)}</span>
        )}
      </div>
      {!!factor._rationale && (
        <p className="mt-1 text-xs text-slate-500">{String(factor._rationale)}</p>
      )}
      <div className="mt-2.5 flex flex-col gap-2">
        {tierBlocks.map(([key, rows]) => (
          <div key={key}>
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {key.replace(/_/g, " ")}
            </div>
            <div className="flex flex-col gap-1">
              {rows.map((row, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="w-10 shrink-0 font-mono font-semibold text-indigo-700">
                    {String(row.points)}pt
                  </span>
                  <span className="text-slate-600">{String(row.rationale ?? "")}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {categoryBlocks.map(([key, map]) => (
          <div key={key}>
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {key.replace(/_/g, " ")}
            </div>
            <div className="flex flex-col gap-1">
              {Object.entries(map).map(([name, raw]) => {
                const v = (raw ?? {}) as { points?: number; rationale?: string };
                return (
                  <div key={name} className="flex gap-2 text-xs">
                    <span className="w-10 shrink-0 font-mono font-semibold text-indigo-700">
                      {typeof v.points === "number" ? `${v.points}pt` : ""}
                    </span>
                    <span className="text-slate-600">
                      <strong>{name.replace(/_/g, " ")}</strong>
                      {v.rationale ? ` · ${v.rationale}` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
