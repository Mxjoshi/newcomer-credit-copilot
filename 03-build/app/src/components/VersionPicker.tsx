"use client";

// A small dropdown to choose which policy version to view. Used on the Policy and Policy impact
// screens so the reader can see any version, not only the active one. The active version is
// marked, and the base is marked.

import type { PolicyVersion } from "@/lib/policyVersions";

interface Props {
  versions: PolicyVersion[];
  selectedLabel: string;
  activeLabel: string;
  onChange: (label: string) => void;
}

export default function VersionPicker({ versions, selectedLabel, activeLabel, onChange }: Props) {
  if (versions.length <= 1) return null;
  return (
    <label className="flex items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Viewing version
      </span>
      <select
        value={selectedLabel}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 px-3 py-1.5 font-mono text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        {versions.map((v) => (
          <option key={v.label} value={v.label}>
            {v.label}
            {v.label === activeLabel ? " (active)" : v.is_base ? " (base)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
