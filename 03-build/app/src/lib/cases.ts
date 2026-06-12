// CaseRecord storage (M7/B5): the review queue and audit log live in the browser's
// localStorage in v1. Identical on screen to a database-backed queue; the entity is shaped so
// v2 lifts it into a real table without redesign. Every function no-ops safely server-side.

import type { Applicant, Application, CaseRecord, Decision } from "./types";
import { CASE_STORAGE_KEY } from "./constants";

export function loadCases(): CaseRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CASE_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CaseRecord[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(cases: CaseRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(cases));
}

// Refers start awaiting_review and sit in the queue; approve and decline start closed (M7).
export function createCase(
  applicant: Applicant,
  application: Application,
  decision: Decision,
): CaseRecord {
  const record: CaseRecord = {
    case_id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    applicant,
    application,
    decision,
    status: decision.recommendation === "refer" ? "awaiting_review" : "closed",
    closed_at: decision.recommendation === "refer" ? undefined : new Date().toISOString(),
  };
  persist([record, ...loadCases()]);
  return record;
}

// The officer's call (U4, D2). Accept or override always closes the case: it has been handled.
export function recordOfficerAction(
  caseId: string,
  action: "accepted" | "overridden",
  overrideReason?: string,
): CaseRecord | null {
  const cases = loadCases();
  const record = cases.find((c) => c.case_id === caseId);
  if (!record) return null;
  record.decision.officer_action = action;
  if (action === "overridden") record.decision.override_reason = overrideReason;
  record.status = "closed";
  record.closed_at = new Date().toISOString();
  persist(cases);
  return record;
}
