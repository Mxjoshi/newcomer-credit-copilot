"use client";

// The signed-in user's own profile: their preferred name (alias), a profile picture, and a time
// zone. The time zone is applied to every date shown in the app.

import { useRef, useState } from "react";
import { TIMEZONES, updateUser, type User } from "@/lib/auth";
import Avatar from "./Avatar";

export default function ProfileView({ user, onSaved }: { user: User; onSaved: () => void }) {
  const [name, setName] = useState(user.name);
  const [alias, setAlias] = useState(user.alias);
  const [timezone, setTimezone] = useState(user.timezone);
  const [avatar, setAvatar] = useState(user.avatar);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  const save = () => {
    const cleanName = name.trim() || user.name;
    updateUser(user.id, {
      name: cleanName,
      alias: alias.trim() || cleanName.split(" ")[0],
      timezone,
      avatar,
    });
    onSaved();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="flex max-w-xl flex-col gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar name={name || user.name} avatar={avatar} size={64} />
          <div className="min-w-0">
            <div className="font-semibold text-slate-900">{name || user.name}</div>
            <div className="text-xs text-slate-500">
              <span className="font-mono">{user.userId}</span>
            </div>
          </div>
          <div className="ml-auto flex flex-col items-end gap-1">
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {avatar ? "Change picture" : "Upload picture"}
            </button>
            {avatar && (
              <button
                onClick={() => setAvatar("")}
                className="text-xs text-slate-400 transition hover:text-rose-600"
              >
                Remove
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFile}
              className="hidden"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Full name
            </span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Preferred name (alias)
            </span>
            <input value={alias} onChange={(e) => setAlias(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Time zone
            </span>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass}>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Dates and times across the app are shown in your time zone.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={save}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Save changes
          </button>
          {saved && <span className="text-sm font-medium text-emerald-600">Saved</span>}
        </div>
      </section>
    </div>
  );
}
