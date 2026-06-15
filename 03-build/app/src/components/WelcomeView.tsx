"use client";

// The overview / welcome screen: the landing page. Says plainly what the console is for and what
// the user can do, with a clear primary action and cards that navigate to each capability. Light
// and calm, no heavy banner.

import type { RulesetSummary } from "./summary";
import type { CaseRecord } from "@/lib/types";
import { useDateFormat } from "@/lib/userContext";

type Target = "intake" | "queue" | "audit" | "policy" | "versions" | "impact";

interface Props {
  summary: RulesetSummary | null;
  cases: CaseRecord[];
  queueCount: number;
  activeLabel: string;
  userName: string;
  canReview: boolean;
  onNavigate: (kind: Target) => void;
}

// The three recommendation outcomes, with the palette used consistently across the app.
const OUTCOMES = [
  { key: "approve", label: "Approved", dot: "bg-emerald-500", bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  { key: "refer", label: "Referred", dot: "bg-amber-500", bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  { key: "decline", label: "Declined", dot: "bg-rose-500", bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
] as const;

const VERDICT_TONE: Record<string, string> = {
  approve: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  decline: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
  refer: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

interface Capability {
  target: Target;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: number;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function WelcomeView({
  summary,
  cases,
  queueCount,
  activeLabel,
  userName,
  canReview,
  onNavigate,
}: Props) {
  const fmtDate = useDateFormat();
  const total = cases.length;
  const counts = {
    approve: cases.filter((c) => c.decision.recommendation === "approve").length,
    refer: cases.filter((c) => c.decision.recommendation === "refer").length,
    decline: cases.filter((c) => c.decision.recommendation === "decline").length,
  };
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));
  const recent = [...cases]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  const capabilities: Capability[] = [
    {
      target: "intake",
      title: "Assess an applicant",
      description:
        "Enter a newcomer, or load a sample. Get a scored, policy-checked, explained decision.",
      icon: <path d="M12 5v14M5 12h14" />,
    },
    {
      target: "queue",
      title: "Review queue",
      description: "Work the cases referred for a human decision.",
      icon: <path d="M4 7h16M4 12h16M4 17h10" />,
      badge: queueCount,
    },
    {
      target: "audit",
      title: "Audit log",
      description: "Every assessment and officer action, the defensibility trail.",
      icon: (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </>
      ),
    },
    {
      target: "policy",
      title: "Policy",
      description: "Read the live ruleset exactly as the engine runs it.",
      icon: (
        <>
          <path d="M5 3h10l4 4v14H5z" />
          <path d="M8 8h6M8 12h8M8 16h8" />
        </>
      ),
    },
    {
      target: "versions",
      title: "Policy versions",
      description: "Change a rule, record why, activate or roll back. Every decision is stamped.",
      icon: (
        <>
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="6" cy="18" r="2.5" />
          <circle cx="18" cy="12" r="2.5" />
          <path d="M6 8.5v7M8.5 6H14a2 2 0 0 1 2 2v2M8.5 18H14a2 2 0 0 0 2-2v-2" />
        </>
      ),
    },
    {
      target: "impact",
      title: "Policy impact",
      description: "Move a value and watch the locked test set re-decide, live.",
      icon: <path d="M4 20V10M10 20V4M16 20v-6M22 20H2" />,
    },
  ];

  const steps = [
    "Enter the applicant and the request",
    "The engine scores, checks policy, and explains",
    "The officer accepts or overrides, on the record",
  ];

  return (
    <div className="flex flex-col gap-6">
      {userName && (
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Hello, {userName}</h2>
      )}

      {/* Pending reviews are decisions a human must make; surface them on landing so they are
          not skipped. */}
      {canReview && queueCount > 0 && (
        <section className="animate-fade-up flex flex-wrap items-center gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-amber-900">
              {userName ? `${userName.split(" ")[0]}, you have ` : "You have "}
              {queueCount} {queueCount === 1 ? "case" : "cases"} awaiting review
            </div>
            <div className="text-sm text-amber-800">
              These are referred decisions a human must make. Please clear the queue.
            </div>
          </div>
          <button
            onClick={() => onNavigate("queue")}
            className="shrink-0 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
          >
            Review now
          </button>
        </section>
      )}

      {/* Portfolio dashboard: the live mix of recommendations this browser has produced, plus the
          most recent activity. Counts are read straight from the saved cases. */}
      <section className="animate-fade-up rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Portfolio at a glance
          </h3>
          {total > 0 && (
            <button
              onClick={() => onNavigate("audit")}
              className="text-xs font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400"
            >
              View audit log
            </button>
          )}
        </div>

        {total === 0 ? (
          <div className="mt-5 flex flex-col items-start gap-3 rounded-xl border border-dashed border-slate-300 dark:border-white/15 p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No assessments recorded yet. Run your first to see the portfolio mix and recent
              activity here.
            </p>
            <button
              onClick={() => onNavigate("intake")}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Start an assessment
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total assessed
                </div>
                <div className="mt-1 text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {total}
                </div>
              </div>
              {OUTCOMES.map((o) => (
                <div
                  key={o.key}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span className={`h-2 w-2 rounded-full ${o.dot}`} />
                    {o.label}
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className={`text-3xl font-bold tabular-nums ${o.text}`}>
                      {counts[o.key]}
                    </span>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      {pct(counts[o.key])}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* The recommendation mix as a single stacked bar. */}
            <div className="mt-5">
              <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                {OUTCOMES.map((o) =>
                  counts[o.key] > 0 ? (
                    <div
                      key={o.key}
                      className={o.bar}
                      style={{ width: `${pct(counts[o.key])}%` }}
                      title={`${o.label}: ${counts[o.key]} (${pct(counts[o.key])}%)`}
                    />
                  ) : null,
                )}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recent activity
              </div>
              <div className="flex flex-col gap-1.5">
                {recent.map((c) => (
                  <button
                    key={c.case_id}
                    onClick={() => onNavigate("audit")}
                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${VERDICT_TONE[c.decision.recommendation]}`}
                    >
                      {c.decision.recommendation.toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                      {c.applicant.full_name}
                    </span>
                    <span className="hidden shrink-0 text-xs text-slate-400 dark:text-slate-500 sm:inline">
                      {c.application.product.replace("_", " ")} · AED{" "}
                      {c.application.amount_aed.toLocaleString("en-US")}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                      {fmtDate(c.created_at)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600">
              Credit decisioning · officer console
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Assess newcomers, and explain every decision.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              For UAE newcomers with little local credit history. The copilot scores the risk on
              alternative data, checks lending policy, and returns an approve, decline, or refer
              recommendation, grounded in the rules, that an officer can defend.
            </p>
          </div>
          {summary && (
            <span className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {summary.market_name} · {activeLabel || summary.ruleset_version}
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate("intake")}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Start an assessment
            <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            {steps.map((s, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-slate-300">→</span>}
                <span>
                  <span className="font-semibold text-slate-400 dark:text-slate-500">{i + 1}.</span> {s}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">What you can do</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <button
              key={c.target}
              onClick={() => onNavigate(c.target)}
              className="group flex flex-col gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
                    {c.icon}
                  </svg>
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{c.title}</span>
                {c.badge !== undefined && c.badge > 0 && (
                  <span className="ml-auto rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {c.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{c.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
