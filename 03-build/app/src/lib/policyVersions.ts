// Policy versioning. The locked v1.0 is the immutable base; every change made to a policy value
// is saved as a new version with a mandatory rationale, so the trail of what changed and why is
// permanent. You can switch which version is live (rollback) and see the diff against the
// previous version. Browser-stored in v1 (like the case records); in production these are real
// ruleset versions a regulator could inspect. Decisions are stamped with the version that
// produced them, so any past decision can be reconstructed against the exact policy of the day.

import type { VersionParams } from "@/components/summary";

export interface PolicyVersion {
  id: string;
  label: string; // e.g. uae-v1.0, uae-v1.1
  parent_label: string | null;
  created_at: string; // ISO; empty for the seeded base
  rationale: string;
  params: VersionParams;
  is_base: boolean;
}

export interface ParamDiff {
  param: keyof VersionParams;
  label: string;
  from: number;
  to: number;
}

const VERSIONS_KEY = "newcomer-credit-copilot.policy-versions.v1";
const ACTIVE_KEY = "newcomer-credit-copilot.policy-active.v1";

export const PARAM_LABEL: Record<keyof VersionParams, string> = {
  dbr_cap: "Debt burden cap",
  amount_salary_multiple: "Amount multiple",
  max_age_at_maturity: "Max age at maturity",
  min_tenure_months: "Min tenure",
};

export const fmtParam = (key: keyof VersionParams, v: number): string => {
  if (key === "dbr_cap") return `${Math.round(v * 100)}%`;
  if (key === "amount_salary_multiple") return `${v}× salary`;
  if (key === "min_tenure_months") return `${v} months`;
  return String(v);
};

function read(): PolicyVersion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VERSIONS_KEY);
    const parsed = raw ? (JSON.parse(raw) as PolicyVersion[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(versions: PolicyVersion[]): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
  }
}

// Seeds the locked base from the live pack if it is not already present, and returns the full
// list. Idempotent: safe to call on every load.
export function ensureBase(baseLabel: string, baseParams: VersionParams): PolicyVersion[] {
  const versions = read();
  if (versions.some((v) => v.is_base)) return versions;
  const base: PolicyVersion = {
    id: "base",
    label: baseLabel,
    parent_label: null,
    created_at: "",
    rationale: "The locked baseline, set with the ground truth before any scoring code existed.",
    params: baseParams,
    is_base: true,
  };
  const next = [base, ...versions];
  write(next);
  return next;
}

export function loadVersions(): PolicyVersion[] {
  return read();
}

export function getActiveLabel(baseLabel: string): string {
  if (typeof window === "undefined") return baseLabel;
  return window.localStorage.getItem(ACTIVE_KEY) ?? baseLabel;
}

export function setActiveLabel(label: string): void {
  if (typeof window !== "undefined") window.localStorage.setItem(ACTIVE_KEY, label);
}

export function getVersion(label: string): PolicyVersion | undefined {
  return read().find((v) => v.label === label);
}

// The next minor label after the highest existing one (base is x.0, then x.1, x.2...).
function nextLabel(baseLabel: string): string {
  const minors = read()
    .filter((v) => !v.is_base)
    .map((v) => Number(v.label.split(".").pop()))
    .filter((n) => Number.isFinite(n));
  const next = (minors.length ? Math.max(...minors) : 0) + 1;
  const stem = baseLabel.replace(/\.\d+$/, "");
  return `${stem}.${next}`;
}

export function createVersion(args: {
  baseLabel: string;
  parentLabel: string;
  params: VersionParams;
  rationale: string;
}): PolicyVersion {
  const version: PolicyVersion = {
    id: crypto.randomUUID(),
    label: nextLabel(args.baseLabel),
    parent_label: args.parentLabel,
    created_at: new Date().toISOString(),
    rationale: args.rationale.trim(),
    params: args.params,
    is_base: false,
  };
  write([...read(), version]);
  setActiveLabel(version.label);
  return version;
}

export function deleteVersion(label: string): PolicyVersion[] {
  const versions = read().filter((v) => v.label !== label || v.is_base);
  write(versions);
  return versions;
}

export function diffParams(from: VersionParams, to: VersionParams): ParamDiff[] {
  return (Object.keys(to) as Array<keyof VersionParams>)
    .filter((k) => from[k] !== to[k])
    .map((k) => ({ param: k, label: PARAM_LABEL[k], from: from[k], to: to[k] }));
}
