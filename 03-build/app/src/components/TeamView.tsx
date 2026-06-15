"use client";

// Team management (superuser only): see everyone, add a person with a role, remove people. Each
// role decides what that person can see and do. Browser-stored for the demo.

import { useEffect, useState } from "react";
import {
  ROLES,
  ROLE_BLURB,
  ROLE_LABEL,
  addUser,
  deleteUser,
  loadUsers,
  type Role,
  type User,
} from "@/lib/auth";

const ROLE_TONE: Record<string, string> = {
  superuser: "bg-blue-100 text-blue-700",
  officer: "bg-emerald-100 text-emerald-700",
  risk_manager: "bg-amber-100 text-amber-700",
  viewer: "bg-slate-100 text-slate-600",
};

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export default function TeamView({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
    if (name.trim() === "" || email.trim() === "") {
      setError("Name and email are required.");
      return;
    }
    setError(null);
    setUsers(addUser(name, email, role));
    setName("");
    setEmail("");
    setRole("officer");
  };

  const remove = (id: string) => {
    if (window.confirm("Remove this person?")) setUsers(deleteUser(id));
  };

  const inputClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-500">
        Add people and assign a role. The role decides what each person can see and do.
      </p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Add a person</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Name
            </span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Email
            </span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Role
            </span>
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
        <p className="mt-2 text-xs text-slate-400">{ROLE_BLURB[role]}</p>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </section>

      <div className="flex flex-col gap-2.5">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-slate-700 text-sm font-bold text-white">
              {initials(u.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-800">
                {u.name}
                {u.id === currentUserId && (
                  <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>
                )}
              </div>
              <div className="text-xs text-slate-500">{u.email}</div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${ROLE_TONE[u.role]}`}
            >
              {ROLE_LABEL[u.role]}
            </span>
            {u.id !== currentUserId && (
              <button
                onClick={() => remove(u.id)}
                className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
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
