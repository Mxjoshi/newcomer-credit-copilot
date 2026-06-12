"use client";

// Screen 2: the agent made visible (U2). The fixed 3-step flow: score, policy check, explain.
// Steps 1 and 2 fill from /api/decide (deterministic, instant); step 3 is the one LLM call
// (/api/assess). Slow state past ~10 seconds; plain failure state with retry, never a
// fabricated result. The rule count in the step text comes from the live pack.

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

export default function AssessmentProgress({ applicant, application, summary, onComplete }: Props) {
  // Step 1 starts busy on first render, so the effect-triggered run never needs a
  // synchronous setState before its first await (react-hooks/set-state-in-effect).
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
      await new Promise((r) => setTimeout(r, 350));
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
      setTimeout(() => onComplete(decision), 400);
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
    // Kick off after paint; the assessment is an external request, not a render concern.
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

  const stepRow = (index: 0 | 1 | 2, title: string) => {
    const state = steps[index];
    const icon = state === "done" ? "✅" : state === "busy" ? "⏳" : "⬜";
    const tone =
      state === "done"
        ? "border-emerald-300 bg-emerald-50"
        : state === "busy"
          ? "border-amber-300 bg-amber-50"
          : "border-slate-200 bg-slate-50 text-slate-500";
    return (
      <div className={`flex items-center gap-3 rounded-lg border p-4 ${tone}`}>
        <span>{icon}</span>
        <div>
          <div className="font-medium">{title}</div>
          {state === "busy" && <div className="text-sm text-amber-700">running...</div>}
          {state === "done" && results[index] && (
            <div className="text-sm text-emerald-800">{results[index]}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-slate-900">
        Assessing: {applicant.full_name} · {application.product.replace("_", " ")}, AED{" "}
        {application.amount_aed.toLocaleString("en-US")}
      </h2>
      {stepRow(0, "Step 1: Score the applicant")}
      {stepRow(1, `Step 2: Check lending policy (${summary?.rule_count ?? "..."} rules)`)}
      {stepRow(2, "Step 3: Write the explanation")}
      {slow && !failed && (
        <p className="text-sm text-amber-700">taking longer than usual, still working</p>
      )}
      {failed && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-4">
          <p className="text-sm font-medium text-rose-800">{failed}</p>
          <p className="mt-1 text-xs text-rose-700">Nothing was decided.</p>
          <button
            onClick={retry}
            className="mt-3 rounded bg-rose-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
