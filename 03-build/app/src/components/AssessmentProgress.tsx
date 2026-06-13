"use client";

// Screen 2: the agent made visible (U2). A summary of exactly what was submitted sits at the
// top (transparency: these are the inputs, nothing hidden), then the fixed 3-step flow: score,
// policy check, explain. Steps 1 and 2 fill from /api/decide (deterministic, instant); step 3
// is the explanation (/api/assess). Slow notice past ~10s; plain failure state with retry,
// never a fabricated result. The rule count comes from the live pack.

import { useCallback, useEffect, useRef, useState } from "react";
import type { Applicant, Application, Decision } from "@/lib/types";
import { SLOW_NOTICE_MS } from "@/lib/constants";
import type { RulesetSummary } from "./summary";

interface Props {
  applicant: Applicant;
  application: Application;
  summary: RulesetSummary | null;
  onComplete: (decision: Decision) => void;
}

type StepState = "pending" | "busy" | "done";

const fmtAed = (n: number) => `AED ${n.toLocaleString("en-US")}`;
const titleCase = (s: string) => s.replace(/_/g, " ");

export default function AssessmentProgress({ applicant, application, summary, onComplete }: Props) {
  const [steps, setSteps] = useState<[StepState, StepState, StepState]>([
    "busy",
    "pending",
    "pending",
  ]);
  const [results, setResults] = useState<[string, string, string]>(["", "", ""]);
  const [failed, setFailed] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const running = useRef(false);

  const run = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    const slowTimer = setTimeout(() => setSlow(true), SLOW_NOTICE_MS);
    try {
      const body = JSON.stringify({ applicant, application });
      const headers = { "Content-Type": "application/json" };

      const decideRes = await fetch("/api/decide", { method: "POST", headers, body });
      if (!decideRes.ok) throw new Error("the scoring step failed");
      const { decision: core } = (await decideRes.json()) as { decision: Decision };
      const passed = core.policy_results.filter((r) => r.passed).length;
      const total = core.policy_results.length;
      const maxPoints = summary?.max_points ?? core.score_result.factors.length * 20;
      setSteps(["done", "busy", "pending"]);
      setResults([
        `${core.score_result.total_points} / ${maxPoints}, ${core.score_result.risk_band} risk`,
        "",
        "",
      ]);
      await new Promise((r) => setTimeout(r, 500));
      setSteps(["done", "done", "busy"]);
      setResults((prev) => [prev[0], `${passed} of ${total} rules passed`, ""]);

      const assessRes = await fetch("/api/assess", { method: "POST", headers, body });
      if (!assessRes.ok) {
        const err = (await assessRes.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? "could not complete the assessment");
      }
      const { decision } = (await assessRes.json()) as { decision: Decision };
      setSteps(["done", "done", "done"]);
      setResults((prev) => [prev[0], prev[1], "explanation written and grounded"]);
      clearTimeout(slowTimer);
      setTimeout(() => onComplete(decision), 550);
    } catch (err) {
      clearTimeout(slowTimer);
      setFailed(
        err instanceof Error
          ? err.message
          : "could not complete the assessment, nothing was decided, try again",
      );
    } finally {
      running.current = false;
    }
  }, [applicant, application, summary, onComplete]);

  useEffect(() => {
    const kickoff = setTimeout(() => void run(), 0);
    return () => clearTimeout(kickoff);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retry = () => {
    setFailed(null);
    setSlow(false);
    setSteps(["busy", "pending", "pending"]);
    setResults(["", "", ""]);
    setAttempt((a) => a + 1);
  };

  const summaryItem = (label: string, value: string) => (
    <div className="flex flex-col">
      <dt className="text-[11px] uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );

  const stepRow = (index: 0 | 1 | 2, title: string, hint: string) => {
    const state = steps[index];
    const tone =
      state === "done"
        ? "border-emerald-200 bg-emerald-50"
        : state === "busy"
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-white";
    const badge =
      state === "done" ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5 9-11" />
          </svg>
        </span>
      ) : state === "busy" ? (
        <span className="pulse-ring flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin" style={{ animationDuration: "1.1s" }}>
            <path d="M12 3a9 9 0 1 0 9 9" />
          </svg>
        </span>
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-200 text-xs font-semibold text-slate-400">
          {index + 1}
        </span>
      );
    return (
      <div className={`flex items-center gap-4 rounded-2xl border p-4 transition ${tone}`}>
        {badge}
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-slate-800">{title}</div>
          {state === "busy" && <div className="text-sm text-amber-700">{hint}</div>}
          {state === "pending" && <div className="text-sm text-slate-400">{hint}</div>}
          {state === "done" && results[index] && (
            <div className="text-sm text-emerald-800">{results[index]}</div>
          )}
        </div>
        {state === "busy" && (
          <div className="shimmer hidden h-1.5 w-24 rounded-full bg-amber-200 sm:block" />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Assessing {applicant.full_name}
        </h2>
        <p className="text-sm text-slate-500">
          The three steps below run in order. You can see exactly what was submitted.
        </p>
      </div>

      <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          What was submitted
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {summaryItem("Salary", fmtAed(applicant.monthly_salary_aed))}
          {summaryItem(
            "Employment",
            `${titleCase(applicant.employment_status)}, ${applicant.job_tenure_months}mo`,
          )}
          {summaryItem("Employer", titleCase(applicant.employer_category))}
          {summaryItem("Rent history", titleCase(applicant.rent_history))}
          {summaryItem(
            "In UAE / visa",
            `${applicant.months_in_uae}mo · ${applicant.visa_type}`,
          )}
          {summaryItem("Obligations", fmtAed(applicant.existing_monthly_obligations_aed))}
          {summaryItem(
            "Age / visa left",
            `${applicant.age_years} · ${applicant.visa_months_remaining}mo`,
          )}
          {summaryItem(
            "Request",
            `${titleCase(application.product)}, ${fmtAed(application.amount_aed)}, ${application.term_months}mo`,
          )}
        </div>
      </section>

      <div className="flex flex-col gap-3">
        {stepRow(0, "Score the applicant", "weighing the five factors...")}
        {stepRow(
          1,
          `Check lending policy (${summary?.rule_count ?? "..."} rules)`,
          "checking every rule...",
        )}
        {stepRow(2, "Write the explanation", "grounding every claim to the data...")}
      </div>

      {slow && !failed && (
        <p className="text-sm text-amber-700">taking longer than usual, still working</p>
      )}
      {failed && (
        <div className="animate-scale-in rounded-2xl border border-rose-300 bg-rose-50 p-5">
          <p className="text-sm font-semibold text-rose-800">{failed}</p>
          <p className="mt-1 text-xs text-rose-700">
            Nothing was decided. The system never invents a result to cover an error.
          </p>
          <button
            onClick={retry}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
