"use client";

// The app shell: three screens, one direction (intake -> assessing -> decision), plus the
// review queue and audit log reachable from every screen (M7), and the impact view as a tab on
// the decision screen (M6). The header shows the live ruleset identity from /api/ruleset.

import { useCallback, useEffect, useState } from "react";
import type { Applicant, Application, CaseRecord, Decision } from "@/lib/types";
import { createCase, loadCases, recordOfficerAction } from "@/lib/cases";
import type { RulesetSummary } from "@/components/summary";
import IntakeForm from "@/components/IntakeForm";
import AssessmentProgress from "@/components/AssessmentProgress";
import DecisionView from "@/components/DecisionView";
import ImpactView from "@/components/ImpactView";
import CaseList from "@/components/CaseList";

type View =
  | { kind: "intake" }
  | { kind: "assessing"; applicant: Applicant; application: Application }
  | { kind: "decision"; record: CaseRecord }
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
      className={`rounded px-3 py-1.5 text-sm font-medium ${
        active ? "bg-slate-800 text-white" : "text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Newcomer Credit Copilot</h1>
            <p className="text-xs text-slate-500">
              {summary
                ? `${summary.market_name} pack ${summary.ruleset_version} · ${summary.rule_count} rules · ${summary.factor_count} score factors · bureau ${summary.bureau} · regulator ${summary.regulator}`
                : "loading ruleset..."}
            </p>
          </div>
          <nav className="flex gap-2">
            {navButton("New assessment", view.kind === "intake", () =>
              setView({ kind: "intake" }),
            )}
            {navButton(`Review queue (${queueCount})`, view.kind === "queue", () =>
              setView({ kind: "queue" }),
            )}
            {navButton("Audit log", view.kind === "audit", () => setView({ kind: "audit" }))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {view.kind === "intake" && <IntakeForm summary={summary} onAssess={onAssess} />}

        {view.kind === "assessing" && (
          <AssessmentProgress
            applicant={view.applicant}
            application={view.application}
            summary={summary}
            onComplete={onComplete}
          />
        )}

        {view.kind === "decision" && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 border-b border-slate-200">
              {(["case", "impact"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium ${
                    tab === t
                      ? "border-b-2 border-slate-800 text-slate-900"
                      : "text-slate-500 hover:text-slate-800"
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

        {view.kind === "queue" && (
          <CaseList
            cases={cases}
            mode="queue"
            onOpen={(record) => {
              setTab("case");
              setView({ kind: "decision", record });
            }}
          />
        )}

        {view.kind === "audit" && (
          <CaseList
            cases={cases}
            mode="audit"
            onOpen={(record) => {
              setTab("case");
              setView({ kind: "decision", record });
            }}
          />
        )}
      </main>
    </div>
  );
}
