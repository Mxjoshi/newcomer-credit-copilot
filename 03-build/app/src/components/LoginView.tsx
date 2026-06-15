"use client";

// The sign-in screen. Demo-grade: pick a team member to sign in as (no password). The role of
// the person you choose decides what you can see. The superuser can add and remove people.

import { useEffect, useState } from "react";
import Brand from "./Brand";
import { ROLE_LABEL, ensureSeedUsers, login, type User } from "@/lib/auth";

const ROLE_TONE: Record<string, string> = {
  superuser: "bg-blue-100 text-blue-700",
  officer: "bg-emerald-100 text-emerald-700",
  risk_manager: "bg-amber-100 text-amber-700",
  viewer: "bg-slate-100 text-slate-600",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function LoginView({ onSignedIn }: { onSignedIn: (user: User) => void }) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setUsers(ensureSeedUsers());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = (id: string) => {
    const user = login(id);
    if (user) onSignedIn(user);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1a2e] px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Brand size={48} />
          <div>
            <h1 className="text-xl font-bold text-white">Newcomer Credit Copilot</h1>
            <p className="text-sm text-slate-400">Officer console. Sign in to continue.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Choose your account
          </div>
          <div className="flex flex-col gap-2">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => signIn(u.id)}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-blue-400/50 hover:bg-white/10"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-slate-700 text-sm font-bold text-white">
                  {initials(u.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-white">{u.name}</span>
                  <span className="block text-xs text-slate-400">{u.email}</span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${ROLE_TONE[u.role]}`}
                >
                  {ROLE_LABEL[u.role]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Demo sign-in, no password. Production uses a real auth provider with server-enforced
          access.
        </p>
      </div>
    </div>
  );
}
