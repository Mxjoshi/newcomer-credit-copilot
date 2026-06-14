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
  const shown = mode === "queue" ? cases.filter((c) => c.status === "awaiting_review") : cases;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        {mode === "queue"
          ? `${shown.length} ${shown.length === 1 ? "case" : "cases"} awaiting a human decision.`
          : `${shown.length} ${shown.length === 1 ? "assessment" : "assessments"} recorded in this browser, every officer action included.`}
      </p>

      {shown.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
          {mode === "queue" ? "No cases waiting for review." : "No assessments recorded yet."}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {shown.map((c) => (
          <button
            key={c.case_id}
            onClick={() => onOpen(c)}
            className="animate-fade-up flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${VERDICT_TONE[c.decision.recommendation]}`}
            >
              {c.decision.recommendation.toUpperCase()}
            </span>
            <span className="font-semibold text-slate-800">{c.applicant.full_name}</span>
            <span className="text-slate-600">
              {c.application.product.replace("_", " ")} · AED{" "}
              {c.application.amount_aed.toLocaleString("en-US")}
            </span>
            <span className="ml-auto text-right text-xs text-slate-400">
              <span className="block">{new Date(c.created_at).toLocaleString("en-GB")}</span>
              <span className="block">
                officer: {c.decision.officer_action} · {c.status.replace("_", " ")}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
