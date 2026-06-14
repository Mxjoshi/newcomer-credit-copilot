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
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
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
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {PARAM_LABEL[key] ?? key}
                </div>
                {data.parameter_notes[key] && (
                  <div className="mt-0.5 text-xs text-slate-400">{data.parameter_notes[key]}</div>
                )}
              </div>
              <div className="font-mono text-sm font-semibold text-blue-700">
                {paramValue(key, value)}
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
            <div className="sm:w-72">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Risk band cut-offs
              </div>
              <div className="mt-0.5 text-xs text-slate-400">{data.band_cutoffs.note}</div>
            </div>
            <div className="font-mono text-sm font-semibold text-blue-700">
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

// Renders one scorecard factor: name, rationale, and its tiers. A factor block can hold four
// shapes, so each is detected and rendered on its own terms: tier tables (arrays of
// {points, rationale}), point maps (category -> {points, rationale}), point bonuses
// (category -> number, e.g. visa_bonus), and plain lists (arrays of strings, e.g. which visas
// count as long-term). This is what fixes the "undefinedpt" rendering.

const sectionLabel = (k: string) => k.replace(/_/g, " ");
const titleWord = (k: string) => k.replace(/_/g, " ");

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function pointRow(points: unknown, text: string, key: string | number) {
  const p = typeof points === "number" ? `${points >= 0 ? "+" : ""}${points}` : "";
  return (
    <div key={key} className="flex gap-2 text-xs">
      <span className="w-10 shrink-0 font-mono font-semibold text-blue-700">{p}</span>
      <span className="text-slate-600">{text}</span>
    </div>
  );
}

function FactorCard({ factor }: { factor: Record<string, unknown> }) {
  const skip = new Set([
    "factor_id",
    "enabled",
    "factor_name",
    "_rationale",
    "threshold_label",
    "max_points",
    "long_term_bonus_rationale",
  ]);

  const sections: React.ReactNode[] = [];

  for (const [key, value] of Object.entries(factor)) {
    if (skip.has(key)) continue;

    if (Array.isArray(value)) {
      const arr = value as unknown[];
      if (arr.length > 0 && typeof arr[0] === "object" && arr[0] !== null) {
        // Tier table: rows of { points, rationale, threshold }.
        sections.push(
          <Section key={key} label={sectionLabel(key)}>
            {(arr as Array<Record<string, unknown>>).map((row, i) =>
              pointRow(row.points, String(row.rationale ?? ""), i),
            )}
          </Section>,
        );
      } else {
        // Plain list of strings, e.g. which visa types count as long-term.
        sections.push(
          <Section key={key} label={sectionLabel(key)}>
            <div className="text-xs text-slate-600">
              {arr.map((v) => titleWord(String(v))).join(", ")}
            </div>
          </Section>,
        );
      }
    } else if (value && typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>);
      const isPointMap = entries.every(
        ([, v]) => v !== null && typeof v === "object" && "points" in (v as object),
      );
      if (isPointMap) {
        sections.push(
          <Section key={key} label={sectionLabel(key)}>
            {entries.map(([name, raw]) => {
              const v = raw as { points?: number; rationale?: string };
              return pointRow(
                v.points,
                `${titleWord(name)}${v.rationale ? ` · ${v.rationale}` : ""}`,
                name,
              );
            })}
          </Section>,
        );
      } else {
        // Numeric bonus map, e.g. visa_bonus { golden: 4, green: 4, ... }.
        sections.push(
          <Section key={key} label={sectionLabel(key)}>
            {entries
              .filter(([, v]) => typeof v === "number")
              .map(([name, v]) => pointRow(v, titleWord(name), name))}
          </Section>,
        );
      }
    } else if (typeof value === "number") {
      // A scalar like a single bonus value.
      sections.push(
        <Section key={key} label={sectionLabel(key)}>
          {pointRow(value, "", key)}
        </Section>,
      );
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
      <div className="mt-2.5 flex flex-col gap-2.5">{sections}</div>
    </div>
  );
}
