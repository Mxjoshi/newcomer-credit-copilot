"use client";

// The review queue and the audit log (M7). Queue: every REFER awaiting the officer, opening a
// case shows its full decision again. Audit log: every assessment this browser has produced,
// read-only, the defensibility story made visible.

import type { CaseRecord } from "@/lib/types";

interface Props {
  cases: CaseRecord[];
  mode: "queue" | "audit";
  onOpen: (record: CaseRecord) => void;
}

const VERDICT_TONE: Record<string, string> = {
  approve: "bg-emerald-100 text-emerald-800",
  decline: "bg-rose-100 text-rose-800",
  refer: "bg-amber-100 text-amber-800",
};

export default function CaseList({ cases, mode, onOpen }: Props) {
  const shown =
    mode === "queue" ? cases.filter((c) => c.status === "awaiting_review") : cases;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-slate-900">
        {mode === "queue"
          ? `Cases waiting for review (${shown.length})`
          : `Audit log (${shown.length} assessments in this browser)`}
      </h2>
      {shown.length === 0 && (
        <p className="text-sm text-slate-500">
          {mode === "queue" ? "No cases waiting." : "No assessments recorded yet."}
        </p>
      )}
      {shown.map((c) => (
        <button
          key={c.case_id}
          onClick={() => onOpen(c)}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left text-sm hover:border-slate-400"
        >
          <span className="text-xs text-slate-500">
            {new Date(c.created_at).toLocaleString("en-GB")}
          </span>
          <span className="font-medium">{c.applicant.full_name}</span>
          <span className="text-slate-600">
            {c.application.product.replace("_", " ")} · AED{" "}
            {c.application.amount_aed.toLocaleString("en-US")}
          </span>
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${VERDICT_TONE[c.decision.recommendation]}`}
          >
            {c.decision.recommendation.toUpperCase()}
          </span>
          <span className="text-xs text-slate-500">
            officer: {c.decision.officer_action} · {c.status.replace("_", " ")} · ruleset{" "}
            {c.decision.ruleset_version}
          </span>
        </button>
      ))}
    </div>
  );
}
