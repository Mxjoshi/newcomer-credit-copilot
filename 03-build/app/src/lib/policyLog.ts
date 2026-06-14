// A session log of policy what-if runs: every time a policy value is moved on the impact screen
// and the 24-profile set re-computes, the change is recorded here (browser localStorage, like
// the case records). It answers "how do I know it took effect, is there an audit": the what-if
// is a hypothetical, but the trail of what was tried, and what it did to the numbers, is real.
// In production this is where a genuine ruleset version change would be logged.

export interface PolicyChange {
  param: string;
  label: string;
  from: number | string;
  to: number | string;
}

export interface PolicyLogEntry {
  id: string;
  at: string; // ISO timestamp
  changes: PolicyChange[];
  approved: number;
  referred: number;
  declined: number;
  accuracy: number;
  moved: number;
}

const KEY = "newcomer-credit-copilot.policy-log.v1";

export function loadPolicyLog(): PolicyLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as PolicyLogEntry[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendPolicyLog(entry: Omit<PolicyLogEntry, "id" | "at">): PolicyLogEntry[] {
  if (typeof window === "undefined") return [];
  const record: PolicyLogEntry = {
    ...entry,
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
  };
  const next = [record, ...loadPolicyLog()].slice(0, 25);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearPolicyLog(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}
