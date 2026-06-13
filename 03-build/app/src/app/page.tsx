"use client";

// The app shell: three screens, one direction (intake -> assessing -> decision), plus the
// review queue and audit log reachable from every screen (M7), and the impact view as a tab on
// the decision screen (M6). Sticky brand header with the live ruleset identity.

import { useCallback, useEffect, useState } from "react";
import type { Applicant, Application, CaseRecord, Decision } from "@/lib/types";
import { createCase, loadCases, recordOfficerAction } from "@/lib/cases";
import type { RulesetSummary } from "@/components/summary";
import Brand from "@/components/Brand";
import Hero from "@/components/Hero";
import IntakeForm from "@/components/IntakeForm";
import AssessmentProgress from "@/components/AssessmentProgress";
import DecisionView from "@/components/DecisionView";
import ImpactView from "@/components/ImpactView";
import CaseList from "@/components/CaseList";

type View =
  | { kind: "intake" }
  | { kind: "assessing"; applicant: Applicant; application: Application }
  | { kind: "decision"; record: CaseRecord }
  | { kind: "impact" }
  | { kind: "queue" }
  | { kind: "audit" };

export default function Home() {
  const [view, setView] = useState<View>({ kind: "intake" });
  const [tab, setTab] = useState<"case" | "impact">("case");
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [summary, setSummary] = useState<RulesetSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/ruleset").catch(() => null);
      const data = res && res.ok ? ((await res.json()) as RulesetSummary) : null;
      if (!cancelled) {
        setSummary(data);
        setCases(loadCases());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const navButton = (label: string, active: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );

  const openCase = (record: CaseRecord) => {
    setTab("case");
    setView({ kind: "decision", record });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3.5">
          <button
            onClick={() => setView({ kind: "intake" })}
            className="flex items-center gap-3 text-left"
          >
            <Brand />
            <span>
              <span className="block text-base font-bold leading-tight text-slate-900">
                Newcomer Credit Copilot
              </span>
              <span className="block text-xs text-slate-500">
                {summary
                  ? `${summary.market_name} · ${summary.ruleset_version} · ${summary.rule_count} rules · ${summary.factor_count} factors`
                  : "loading ruleset..."}
              </span>
            </span>
          </button>
          <nav className="flex items-center gap-1.5">
            {navButton("New assessment", view.kind === "intake", () =>
              setView({ kind: "intake" }),
            )}
            {navButton("Policy impact", view.kind === "impact", () =>
              setView({ kind: "impact" }),
            )}
            {navButton(`Review queue (${queueCount})`, view.kind === "queue", () =>
              setView({ kind: "queue" }),
            )}
            {navButton("Audit log", view.kind === "audit", () => setView({ kind: "audit" }))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
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
            onComplete={onComplete}
          />
        )}

        {view.kind === "decision" && (
          <div className="flex flex-col gap-5">
            <div className="flex gap-1 rounded-full bg-slate-200/60 p-1 self-start">
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

        {view.kind === "queue" && (
          <CaseList cases={cases} mode="queue" onOpen={openCase} />
        )}

        {view.kind === "audit" && (
          <CaseList cases={cases} mode="audit" onOpen={openCase} />
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-slate-400">
        Synthetic data only. A capstone demo of explainable, policy-grounded newcomer lending.
      </footer>
    </div>
  );
}
