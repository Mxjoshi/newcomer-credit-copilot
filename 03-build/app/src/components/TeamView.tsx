"use client";

// Team management (superuser only): see everyone, add a person (user ID without spaces, display
// name with spaces, a password, and a role), remove people. The role decides what that person
// can see and do. Browser-stored for the demo.

import { useEffect, useState } from "react";
import {
  ROLES,
  ROLE_BLURB,
  ROLE_LABEL,
  addUser,
  deleteUser,
  loadUsers,
  normalizeUserId,
  type Role,
  type User,
} from "@/lib/auth";
import Avatar from "./Avatar";

const ROLE_TONE: Record<string, string> = {
  superuser: "bg-blue-100 text-blue-700",
  officer: "bg-emerald-100 text-emerald-700",
  risk_manager: "bg-amber-100 text-amber-700",
  viewer: "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300",
};

export default function TeamView({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("officer");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setUsers(loadUsers());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const add = () => {
    const result = addUser({ userId, name, password, role });
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    setUsers(result.users ?? loadUsers());
    setName("");
    setUserId("");
    setPassword("");
    setRole("officer");
  };

  const remove = (id: string) => {
    if (window.confirm("Remove this person?")) setUsers(deleteUser(id));
  };

  const inputClass =
    "rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
  const labelClass = "text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Add people and assign a role. The role decides what each person can see and do.
      </p>

      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Add a person</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>User ID (no spaces)</span>
            <input
              value={userId}
              onChange={(e) => setUserId(normalizeUserId(e.target.value))}
              placeholder="e.g. sara"
              className={`${inputClass} font-mono`}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={inputClass}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              onClick={add}
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Add person
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{ROLE_BLURB[role]}</p>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </section>

      <div className="flex flex-col gap-2.5">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4 shadow-sm"
          >
            <Avatar name={u.name} avatar={u.avatar} size={40} />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-800 dark:text-slate-100">
                {u.name}
                {u.id === currentUserId && (
                  <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">(you)</span>
                )}
              </div>
              <div className="font-mono text-xs text-slate-500 dark:text-slate-400">{u.userId}</div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${ROLE_TONE[u.role]}`}
            >
              {ROLE_LABEL[u.role]}
            </span>
            {u.id !== currentUserId && (
              <button
                onClick={() => remove(u.id)}
                className="shrink-0 rounded-lg border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
