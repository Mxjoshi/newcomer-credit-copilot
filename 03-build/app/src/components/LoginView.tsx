"use client";

// The sign-in screen: user ID plus password. Demo-grade (passwords are stored in the browser in
// plain text). The role of the account decides what is visible after signing in.

import { useEffect, useState } from "react";
import Brand from "./Brand";
import { ensureSeedUsers, login, type User } from "@/lib/auth";

export default function LoginView({ onSignedIn }: { onSignedIn: (user: User) => void }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => ensureSeedUsers());
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(userId, password);
    if (user) onSignedIn(user);
    else setError("Wrong user ID or password.");
  };

  const inputClass =
    "rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1a2e] px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Brand size={48} />
          <div>
            <h1 className="text-xl font-bold text-white">Newcomer Credit Copilot</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500">Officer console. Sign in to continue.</p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              User ID
            </span>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. monika"
              autoCapitalize="none"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className={inputClass}
            />
          </label>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <button
            type="submit"
            className="mt-1 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Demo accounts: <span className="font-mono text-slate-400 dark:text-slate-500">monika</span> (superuser),{" "}
          <span className="font-mono text-slate-400 dark:text-slate-500">ahmed</span> (officer),{" "}
          <span className="font-mono text-slate-400 dark:text-slate-500">lena</span> (risk manager). Password{" "}
          <span className="font-mono text-slate-400 dark:text-slate-500">demo</span>.
        </p>
      </div>
    </div>
  );
}
