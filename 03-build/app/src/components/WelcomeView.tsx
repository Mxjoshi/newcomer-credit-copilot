"use client";

// The overview / welcome screen: the landing page. Says plainly what the console is for and what
// the user can do, with a clear primary action and cards that navigate to each capability. Light
// and calm, no heavy banner.

import type { RulesetSummary } from "./summary";

type Target = "intake" | "queue" | "audit" | "policy" | "versions" | "impact";

interface Props {
  summary: RulesetSummary | null;
  queueCount: number;
  activeLabel: string;
  userName: string;
  canReview: boolean;
  onNavigate: (kind: Target) => void;
}

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
  queueCount,
  activeLabel,
  userName,
  canReview,
  onNavigate,
}: Props) {
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
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Hello, {userName}</h2>
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600">
              Credit decisioning · officer console
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Assess newcomers, and explain every decision.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              For UAE newcomers with little local credit history. The copilot scores the risk on
              alternative data, checks lending policy, and returns an approve, decline, or refer
              recommendation, grounded in the rules, that an officer can defend.
            </p>
          </div>
          {summary && (
            <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
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
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            {steps.map((s, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-slate-300">→</span>}
                <span>
                  <span className="font-semibold text-slate-400">{i + 1}.</span> {s}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700">What you can do</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <button
              key={c.target}
              onClick={() => onNavigate(c.target)}
              className="group flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
                    {c.icon}
                  </svg>
                </span>
                <span className="font-semibold text-slate-900">{c.title}</span>
                {c.badge !== undefined && c.badge > 0 && (
                  <span className="ml-auto rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {c.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{c.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
