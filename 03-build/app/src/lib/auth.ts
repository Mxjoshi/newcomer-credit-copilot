// Demo-grade authentication and role-based access control. Users and the signed-in session live
// in the browser (localStorage), so this is NOT real security: the role hiding is cosmetic, and
// the password is stored in plain text for the demo only. It demonstrates the model for the
// pitch. Production would use a real auth provider (for example Clerk) with hashed credentials
// and server-enforced permissions; that path is in the spec. The superuser manages the team.

export type Role = "superuser" | "officer" | "risk_manager" | "viewer";

export interface User {
  id: string; // internal id
  userId: string; // login username, no spaces, unique
  name: string; // display name, spaces allowed
  alias: string; // preferred name shown in greetings
  password: string; // demo only, plain text
  avatar: string; // data URL, or "" for initials
  timezone: string; // IANA time zone, applied to dates across the app
  role: Role;
}

export const ROLES: Role[] = ["superuser", "officer", "risk_manager", "viewer"];

export const ROLE_LABEL: Record<Role, string> = {
  superuser: "Superuser",
  officer: "Credit officer",
  risk_manager: "Risk manager",
  viewer: "Viewer",
};

export const ROLE_BLURB: Record<Role, string> = {
  superuser: "Full access, plus team management.",
  officer: "Assess applicants, work the queue, read the audit log.",
  risk_manager: "Govern policy: rules, versions, impact, and evals.",
  viewer: "Read-only: the policy and the audit log.",
};

export const ROLE_VIEWS: Record<Role, Set<string>> = {
  superuser: new Set([
    "home", "intake", "assessing", "decision", "queue", "audit",
    "policy", "versions", "impact", "evals", "team", "profile",
  ]),
  officer: new Set(["home", "intake", "assessing", "decision", "queue", "audit", "profile"]),
  risk_manager: new Set(["home", "policy", "versions", "impact", "evals", "audit", "profile"]),
  viewer: new Set(["home", "policy", "audit", "profile"]),
};

export function can(role: Role, view: string): boolean {
  return ROLE_VIEWS[role]?.has(view) ?? false;
}

// A common, short list of time zones for the picker.
export const TIMEZONES: string[] = [
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

export const firstName = (u: User) => (u.alias?.trim() || u.name.trim().split(" ")[0]);

// A userId must have no spaces; lowercase it and strip spaces for convenience.
export const normalizeUserId = (raw: string) => raw.trim().toLowerCase().replace(/\s+/g, "");

const USERS_KEY = "newcomer-credit-copilot.users.v2";
const SESSION_KEY = "newcomer-credit-copilot.session.v2";

function read(): User[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as User[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(users: User[]): void {
  if (typeof window !== "undefined") window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function ensureSeedUsers(): User[] {
  const users = read();
  if (users.length > 0) return users;
  const base = { password: "demo", avatar: "", timezone: "Asia/Dubai" };
  const seeded: User[] = [
    { id: "u-super", userId: "monika", name: "Monika Joshi", alias: "Monika", role: "superuser", ...base },
    { id: "u-officer", userId: "ahmed", name: "Ahmed Khan", alias: "Ahmed", role: "officer", ...base },
    { id: "u-risk", userId: "lena", name: "Lena Park", alias: "Lena", role: "risk_manager", ...base },
  ];
  write(seeded);
  return seeded;
}

export function loadUsers(): User[] {
  return read();
}

export interface NewUser {
  userId: string;
  name: string;
  password: string;
  role: Role;
  alias?: string;
  timezone?: string;
}

// Returns { error } if invalid, otherwise the new user list.
export function addUser(input: NewUser): { users?: User[]; error?: string } {
  const userId = normalizeUserId(input.userId);
  if (input.name.trim() === "") return { error: "Name is required." };
  if (userId === "") return { error: "User ID is required." };
  if (input.password.trim() === "") return { error: "Password is required." };
  if (read().some((u) => u.userId === userId)) return { error: `User ID "${userId}" is taken.` };
  const user: User = {
    id: crypto.randomUUID(),
    userId,
    name: input.name.trim(),
    alias: (input.alias ?? "").trim() || input.name.trim().split(" ")[0],
    password: input.password,
    avatar: "",
    timezone: input.timezone ?? "Asia/Dubai",
    role: input.role,
  };
  const next = [...read(), user];
  write(next);
  return { users: next };
}

export function updateUser(id: string, patch: Partial<User>): User[] {
  const users = read().map((u) => (u.id === id ? { ...u, ...patch } : u));
  write(users);
  return users;
}

export function deleteUser(id: string): User[] {
  write(read().filter((u) => u.id !== id));
  return read();
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return read().find((u) => u.id === id) ?? null;
}

// Sign in by userId + password. Returns the user, or null on a bad match.
export function login(userId: string, password: string): User | null {
  const user = read().find((u) => u.userId === normalizeUserId(userId) && u.password === password);
  if (!user) return null;
  if (typeof window !== "undefined") window.localStorage.setItem(SESSION_KEY, user.id);
  return user;
}

export function logout(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
}
