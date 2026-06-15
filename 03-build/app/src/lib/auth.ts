// Demo-grade authentication and role-based access control. Users and the signed-in session live
// in the browser (localStorage), so this is NOT real security: the role hiding is cosmetic and a
// determined user could bypass it. It demonstrates the RBAC model for the pitch. Production would
// use a real auth provider (for example Clerk) with server-enforced permissions; that path is in
// the spec. The superuser sees everything and manages the team.

export type Role = "superuser" | "officer" | "risk_manager" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
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

// Which screens each role may reach. Includes the non-nav screens (assessing, decision) so the
// flow works for whoever can start an assessment.
export const ROLE_VIEWS: Record<Role, Set<string>> = {
  superuser: new Set([
    "home", "intake", "assessing", "decision", "queue", "audit",
    "policy", "versions", "impact", "evals", "team",
  ]),
  officer: new Set(["home", "intake", "assessing", "decision", "queue", "audit"]),
  risk_manager: new Set(["home", "policy", "versions", "impact", "evals", "audit"]),
  viewer: new Set(["home", "policy", "audit"]),
};

export function can(role: Role, view: string): boolean {
  return ROLE_VIEWS[role]?.has(view) ?? false;
}

const USERS_KEY = "newcomer-credit-copilot.users.v1";
const SESSION_KEY = "newcomer-credit-copilot.session.v1";

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

// Seeds a superuser and two example team members on first run, so the role model is visible
// immediately. Idempotent.
export function ensureSeedUsers(): User[] {
  const users = read();
  if (users.length > 0) return users;
  const seeded: User[] = [
    { id: "u-super", name: "Monika Raj", email: "monika@newcomer.ae", role: "superuser" },
    { id: "u-officer", name: "Ahmed Khan", email: "ahmed@newcomer.ae", role: "officer" },
    { id: "u-risk", name: "Lena Park", email: "lena@newcomer.ae", role: "risk_manager" },
  ];
  write(seeded);
  return seeded;
}

export function loadUsers(): User[] {
  return read();
}

export function addUser(name: string, email: string, role: Role): User[] {
  const user: User = { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), role };
  write([...read(), user]);
  return read();
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

export function login(id: string): User | null {
  if (typeof window !== "undefined") window.localStorage.setItem(SESSION_KEY, id);
  return getCurrentUser();
}

export function logout(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
}
