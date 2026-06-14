// The deterministic core only: score, policy check, combination, counterfactuals. No LLM call,
// so it returns near-instantly. Screen 2 uses it to show steps 1 and 2 with real results while
// the explanation (step 3, /api/assess) is still running.

import { NextResponse } from "next/server";
import type { Applicant, Application } from "@/lib/types";
import { assess } from "@/lib/decision";
import { loadLiveRuleset } from "@/lib/livePack";

export async function POST(request: Request) {
  let applicant: Applicant;
  let application: Application;
  let overrides: { params?: Record<string, number>; ruleset_version?: string } | undefined;
  try {
    const body = await request.json();
    applicant = body.applicant;
    application = body.application;
    overrides = body.overrides;
    if (!applicant || !application) throw new Error("missing applicant or application");
  } catch {
    return NextResponse.json(
      { error: "request must be JSON with applicant and application" },
      { status: 400 },
    );
  }
  const ruleset = await loadLiveRuleset(overrides);
  return NextResponse.json({ decision: assess(applicant, application, ruleset) });
}
