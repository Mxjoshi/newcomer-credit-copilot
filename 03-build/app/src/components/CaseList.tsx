"use client";

// The review queue and the audit log (M7). Queue: every REFER awaiting the officer, opening a
// case shows its full decision again. Audit log: every assessment this browser has produced,
// read-only, the defensibility story made visible.

import type { CaseRecord } from "@/lib/types";
import { useDateFormat } from "@/lib/userContext";

interface Props {
  cases: CaseRecord[];
  mode: "queue" | "audit";
  onOpen: (record: CaseRecord) => void;
  onClear: () => void;
}

const VERDICT_TONE: Record<string, string> = {
  approve: "bg-emerald-100 text-emerald-800",
  decline: "bg-rose-100 text-rose-800",
  refer: "bg-amber-100 text-amber-800",
};

const STATUS: Record<string, { label: string; tone: string }> = {
  awaiting_review: { label: "Awaiting review", tone: "bg-amber-100 text-amber-700" },
  closed: { label: "Closed", tone: "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300" },
};

const ACTION_LABEL: Record<string, string> = {
  accepted: "Accepted",
  overridden: "Overridden",
  none: "",
};

export default function CaseList({ cases, mode, onOpen, onClear }: Props) {
  const fmtDate = useDateFormat();
  const shown = mode === "queue" ? cases.filter((c) => c.status === "awaiting_review") : cases;

  const clear = () => {
    if (
      window.confirm(
        "Clear all saved applications? This wipes the audit log and the review queue for this browser. It cannot be undone.",
      )
    ) {
      onClear();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {mode === "queue"
            ? `${shown.length} ${shown.length === 1 ? "case" : "cases"} awaiting a human decision.`
            : `${shown.length} ${shown.length === 1 ? "assessment" : "assessments"} recorded in this browser, every officer action included.`}
        </p>
        {cases.length > 0 && (
          <button
            onClick={clear}
            className="rounded-lg border border-slate-300 dark:border-white/15 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
          >
            Clear all
          </button>
        )}
      </div>

      {shown.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 p-10 text-center text-sm text-slate-400 dark:text-slate-500">
          {mode === "queue" ? "No cases waiting for review." : "No assessments recorded yet."}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {shown.map((c) => {
          const action = ACTION_LABEL[c.decision.officer_action];
          const status = STATUS[c.status];
          return (
            <button
              key={c.case_id}
              onClick={() => onOpen(c)}
              className="animate-fade-up flex items-center gap-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${VERDICT_TONE[c.decision.recommendation]}`}
              >
                {c.decision.recommendation.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-800 dark:text-slate-100">{c.applicant.full_name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {c.application.product.replace("_", " ")} · AED{" "}
                  {c.application.amount_aed.toLocaleString("en-US")} · {fmtDate(c.created_at)}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {action && (
                  <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:inline">{action}</span>
                )}
                {status && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.tone}`}
                  >
                    {status.label}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
