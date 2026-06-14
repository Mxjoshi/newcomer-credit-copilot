"use client";

// The app shell: a left navigation rail (enterprise console pattern) plus a content area. The
// rail carries the brand, the workspace sections, and the live ruleset identity; the content
// area runs the three-screen flow (intake -> assessing -> decision) and the standalone Policy,
// Policy impact, Review queue, and Audit log destinations.

import { useCallback, useEffect, useState } from "react";
import type { Applicant, Application, CaseRecord, Decision } from "@/lib/types";
import { createCase, loadCases, recordOfficerAction } from "@/lib/cases";
import {
  ensureBase,
  getActiveLabel,
  getVersion,
  type PolicyVersion,
} from "@/lib/policyVersions";
import type { RulesetSummary } from "@/components/summary";
import Brand from "@/components/Brand";
import Hero from "@/components/Hero";
import IntakeForm from "@/components/IntakeForm";
import AssessmentProgress from "@/components/AssessmentProgress";
import DecisionView from "@/components/DecisionView";
import ImpactView from "@/components/ImpactView";
import PolicyView from "@/components/PolicyView";
import VersionsView from "@/components/VersionsView";
import CaseList from "@/components/CaseList";

type ViewKind =
  | "intake"
  | "assessing"
  | "decision"
  | "policy"
  | "versions"
  | "impact"
  | "queue"
  | "audit";
type View =
  | { kind: "intake" }
  | { kind: "assessing"; applicant: Applicant; application: Application }
  | { kind: "decision"; record: CaseRecord }
  | { kind: "policy" }
  | { kind: "versions" }
  | { kind: "impact" }
  | { kind: "queue" }
  | { kind: "audit" };

// Stroke icons, 18px, for the rail.
const icons: Record<string, React.ReactNode> = {
  intake: (
    <path d="M12 5v14M5 12h14" />
  ),
  policy: (
    <>
      <path d="M5 3h10l4 4v14H5z" />
      <path d="M8 8h6M8 12h8M8 16h8" />
    </>
  ),
  impact: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-6M22 20H2" />
    </>
  ),
  queue: (
    <>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </>
  ),
  audit: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  versions: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="12" r="2.5" />
      <path d="M6 8.5v7M8.5 6H14a2 2 0 0 1 2 2v2M8.5 18H14a2 2 0 0 0 2-2v-2" />
    </>
  ),
};

export default function Home() {
  const [view, setView] = useState<View>({ kind: "intake" });
  const [tab, setTab] = useState<"case" | "impact">("case");
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [summary, setSummary] = useState<RulesetSummary | null>(null);
  const [activeVersion, setActiveVersion] = useState<PolicyVersion | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/ruleset").catch(() => null);
      const data = res && res.ok ? ((await res.json()) as RulesetSummary) : null;
      if (cancelled) return;
      setSummary(data);
      setCases(loadCases());
      if (data) {
        ensureBase(data.ruleset_version, data.params);
        const label = getActiveLabel(data.ruleset_version);
        setActiveVersion(getVersion(label) ?? getVersion(data.ruleset_version) ?? null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activateVersion = (label: string) => {
    setActiveVersion(getVersion(label) ?? null);
  };

  const queueCount = cases.filter((c) => c.status === "awaiting_review").length;

  const onAssess = (applicant: Applicant, application: Application) => {
    setTab("case");
    setView({ kind: "assessing", applicant, application });
  };

  const onComplete = useCallback((decision: Decision) => {
    setView((current) => {
      if (current.kind !== "assessing") return current;
      const record = createCase(current.applicant, current.application, decision);
      setCases(loadCases());
      return { kind: "decision", record };
    });
  }, []);

  const onOfficerAction = (action: "accepted" | "overridden", overrideReason?: string) => {
    setView((current) => {
      if (current.kind !== "decision") return current;
      const updated = recordOfficerAction(current.record.case_id, action, overrideReason);
      setCases(loadCases());
      return updated ? { kind: "decision", record: updated } : current;
    });
  };

  const openCase = (record: CaseRecord) => {
    setTab("case");
    setView({ kind: "decision", record });
  };

  const navItem = (kind: ViewKind, label: string, badge?: number) => {
    const active = view.kind === kind || (kind === "intake" && view.kind === "assessing");
    return (
      <button
        onClick={() => setView({ kind } as View)}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
          active
            ? "bg-white/10 text-white"
            : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          {icons[kind]}
        </svg>
        <span className="hidden md:inline">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="ml-auto hidden rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-semibold text-white md:inline">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col bg-[#0b1a2e] md:w-60">
        <button
          onClick={() => setView({ kind: "intake" })}
          className="flex items-center gap-3 px-4 py-5 text-left"
        >
          <Brand size={34} />
          <span className="hidden md:block">
            <span className="block text-sm font-bold leading-tight text-white">
              Newcomer Credit
            </span>
            <span className="block text-xs text-slate-400">Copilot</span>
          </span>
        </button>

        <nav className="flex flex-1 flex-col gap-1 px-2.5">
          <div className="hidden px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 md:block">
            Assess
          </div>
          {navItem("intake", "New assessment")}
          {navItem("queue", "Review queue", queueCount)}
          {navItem("audit", "Audit log")}
          <div className="hidden px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500 md:block">
            Govern
          </div>
          {navItem("policy", "Policy")}
          {navItem("versions", "Versions")}
          {navItem("impact", "Policy impact")}
        </nav>

        <div className="hidden border-t border-white/10 px-4 py-4 text-xs md:block">
          {summary ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-medium text-slate-200">
                  {activeVersion?.label ?? summary.ruleset_version}
                </span>
                {activeVersion && !activeVersion.is_base && (
                  <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">
                    active
                  </span>
                )}
              </div>
              <div className="text-slate-500">
                {summary.market_name} · {summary.rule_count} rules · {summary.factor_count}{" "}
                factors
              </div>
            </>
          ) : (
            <div className="text-slate-500">loading ruleset...</div>
          )}
          <div className="mt-2 text-[11px] text-slate-600">Synthetic data only</div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          {view.kind === "intake" && (
            <div className="flex flex-col gap-7">
              <Hero summary={summary} />
              <IntakeForm summary={summary} onAssess={onAssess} />
            </div>
          )}

          {view.kind === "assessing" && (
            <AssessmentProgress
              applicant={view.applicant}
              application={view.application}
              summary={summary}
              activeVersion={activeVersion}
              onComplete={onComplete}
            />
          )}

          {view.kind === "decision" && (
            <div className="flex flex-col gap-5">
              <div className="flex gap-1 self-start rounded-full bg-slate-200/60 p-1">
                {(["case", "impact"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                      tab === t
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t === "case" ? "Case result" : "Impact view"}
                  </button>
                ))}
              </div>
              {tab === "case" ? (
                <DecisionView
                  record={view.record}
                  onAction={onOfficerAction}
                  onNew={() => setView({ kind: "intake" })}
                />
              ) : (
                <ImpactView />
              )}
            </div>
          )}

          {view.kind === "policy" && <PolicyView />}

          {view.kind === "versions" && (
            <VersionsView
              summary={summary}
              activeLabel={activeVersion?.label ?? summary?.ruleset_version ?? ""}
              onActivate={activateVersion}
            />
          )}

          {view.kind === "impact" && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Policy impact</h2>
                <p className="text-sm text-slate-500">
                  Champion vs challenger on the 24 locked profiles. Move a policy value and watch
                  the decisions shift, live.
                </p>
              </div>
              <ImpactView />
            </div>
          )}

          {view.kind === "queue" && <CaseList cases={cases} mode="queue" onOpen={openCase} />}

          {view.kind === "audit" && <CaseList cases={cases} mode="audit" onOpen={openCase} />}
        </main>

        <footer className="mx-auto w-full max-w-5xl px-6 py-6 text-center text-xs text-slate-400">
          A capstone demo of explainable, policy-grounded newcomer lending. Synthetic data only.
        </footer>
      </div>
    </div>
  );
}
