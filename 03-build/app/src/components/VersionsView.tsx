"use client";

// Policy versions: the governed history of the ruleset. The locked v1.0 base, plus every
// version created from a change (each with a required rationale). Activate any version to make
// it live (rollback), see the diff from its parent, and create a new version by editing the
// values and writing why. The active version drives every assessment and stamps each decision.

import { useEffect, useState } from "react";
import type { RulesetSummary, VersionParams } from "./summary";
import {
  PARAM_LABEL,
  createVersion,
  deleteVersion,
  diffParams,
  ensureBase,
  fmtParam,
  getVersion,
  loadVersions,
  setActiveLabel,
  type PolicyVersion,
} from "@/lib/policyVersions";

interface Props {
  summary: RulesetSummary | null;
  activeLabel: string;
  onActivate: (label: string) => void;
}

export default function VersionsView({ summary, activeLabel, onActivate }: Props) {
  const [versions, setVersions] = useState<PolicyVersion[]>([]);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<VersionParams | null>(null);
  const [rationale, setRationale] = useState("");

  useEffect(() => {
    if (!summary) return;
    let cancelled = false;
    // Defer off the synchronous effect body; seed the locked base and load the list.
    Promise.resolve().then(() => {
      if (!cancelled) setVersions(ensureBase(summary.ruleset_version, summary.params));
    });
    return () => {
      cancelled = true;
    };
  }, [summary]);

  if (!summary) return <p className="text-sm text-slate-500">Loading...</p>;

  const baseLabel = summary.ruleset_version;
  const activeParams = getVersion(activeLabel)?.params ?? summary.params;
  // Newest first, but the base always last so the timeline reads top-down to the locked origin.
  const ordered = [...versions].sort((a, b) => {
    if (a.is_base) return 1;
    if (b.is_base) return -1;
    return b.created_at.localeCompare(a.created_at);
  });

  const startCreate = () => {
    setDraft({ ...activeParams });
    setRationale("");
    setCreating(true);
  };

  const saveVersion = () => {
    if (!draft || rationale.trim() === "") return;
    const created = createVersion({
      baseLabel,
      parentLabel: activeLabel,
      params: draft,
      rationale,
    });
    setVersions(loadVersions());
    setCreating(false);
    onActivate(created.label);
  };

  const activate = (label: string) => {
    setActiveLabel(label);
    onActivate(label);
  };

  const remove = (label: string) => {
    setVersions(deleteVersion(label));
    if (label === activeLabel) {
      setActiveLabel(baseLabel);
      onActivate(baseLabel);
    }
  };

  const setDraftParam = (key: keyof VersionParams, value: number) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-500">
          Every policy change is a version, with a rationale, switchable and reversible. The
          active version drives every assessment.
        </p>
        {!creating && (
          <button
            onClick={startCreate}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            New version
          </button>
        )}
      </div>

      {creating && draft && (
        <section className="animate-scale-in rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
          <h3 className="text-sm font-semibold text-blue-900">
            New version from {activeLabel}
          </h3>
          <p className="text-xs text-blue-700">
            Adjust the values, then record why. The change and its rationale are kept permanently.
          </p>

          <div className="mt-4">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-slate-700">Debt burden ratio cap</span>
              <span className="font-mono text-base font-bold text-blue-700">
                {Math.round(draft.dbr_cap * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.3}
              max={0.6}
              step={0.01}
              value={draft.dbr_cap}
              onChange={(e) => setDraftParam("dbr_cap", Number(e.target.value))}
              className="mt-2 w-full accent-blue-600"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(["amount_salary_multiple", "max_age_at_maturity", "min_tenure_months"] as const).map(
              (key) => (
                <label key={key} className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-slate-600">{PARAM_LABEL[key]}</span>
                  <input
                    type="number"
                    value={draft[key]}
                    onChange={(e) => setDraftParam(key, Number(e.target.value))}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              ),
            )}
          </div>

          <label className="mt-4 flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Rationale (required)</span>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={2}
              placeholder="Why is this changing? e.g. CBUAE tightened the debt burden ceiling effective Q3."
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={saveVersion}
              disabled={rationale.trim() === ""}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40"
            >
              Save version
            </button>
            <button
              onClick={() => setCreating(false)}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium transition hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3">
        {ordered.map((v) => {
          const isActive = v.label === activeLabel;
          const parent = v.parent_label ? getVersion(v.parent_label) : undefined;
          const diffs = parent ? diffParams(parent.params, v.params) : [];
          return (
            <div
              key={v.id}
              className={`rounded-2xl border p-5 shadow-sm transition ${
                isActive ? "border-blue-400 bg-blue-50/40" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900">{v.label}</span>
                {v.is_base && (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    locked base
                  </span>
                )}
                {isActive && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    active
                  </span>
                )}
                <span className="ml-auto text-xs text-slate-400">
                  {v.created_at ? new Date(v.created_at).toLocaleString("en-GB") : "origin"}
                  {v.parent_label ? ` · from ${v.parent_label}` : ""}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-700">{v.rationale}</p>

              {diffs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {diffs.map((d) => (
                    <span key={d.param} className="text-slate-600">
                      {d.label}{" "}
                      <span className="font-mono text-slate-400">
                        {fmtParam(d.param, d.from)}
                      </span>
                      {" → "}
                      <span className="font-mono font-semibold text-blue-700">
                        {fmtParam(d.param, d.to)}
                      </span>
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                {!isActive && (
                  <button
                    onClick={() => activate(v.label)}
                    className="rounded-lg border border-blue-300 bg-white px-4 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                  >
                    {v.is_base ? "Roll back to base" : "Make active"}
                  </button>
                )}
                {!v.is_base && (
                  <button
                    onClick={() => remove(v.label)}
                    className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
