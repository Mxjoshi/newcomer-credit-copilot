// The assessment endpoint: deterministic core plus the explanation layer, server-side (the
// API key never reaches the browser). The live market pack is read from disk on EVERY request,
// so editing config/uae/policy-rules.json and rerunning reflects the change without a restart;
// that is the plug and play demo working end to end.

import { NextResponse } from "next/server";
import type { Applicant, Application } from "@/lib/types";
import { assess } from "@/lib/decision";
import { explainDecision } from "@/lib/explain";
import { loadLiveRuleset } from "@/lib/livePack";

export async function POST(request: Request) {
  let applicant: Applicant;
  let application: Application;
  try {
    const body = await request.json();
    applicant = body.applicant;
    application = body.application;
    if (!applicant || !application) throw new Error("missing applicant or application");
  } catch {
    return NextResponse.json(
      { error: "request must be JSON with applicant and application" },
      { status: 400 },
    );
  }

  const ruleset = await loadLiveRuleset();
  const decision = assess(applicant, application, ruleset);

  try {
    const { output, validation_outcome } = await explainDecision(
      applicant,
      application,
      decision,
      ruleset,
    );
    decision.explanation = output.explanation;
    decision.reasons = output.reasons;
    decision.validation_outcome = validation_outcome;
    return NextResponse.json({ decision });
  } catch {
    // LLM failure outright: say so plainly, decide nothing (UI flow failure state). The
    // deterministic decision is never shipped with an empty explanation to cover an error.
    return NextResponse.json(
      { error: "could not complete the assessment, nothing was decided, try again" },
      { status: 502 },
    );
  }
}
