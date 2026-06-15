"use client";

// The app shell: a left navigation rail (enterprise console pattern) plus a content area. The
// rail carries the brand, the workspace sections, and the live ruleset identity; the content
// area runs the three-screen flow (intake -> assessing -> decision) and the standalone Policy,
// Policy impact, Review queue, and Audit log destinations.

import { useCallback, useEffect, useState } from "react";
import type { Applicant, Application, CaseRecord, Decision } from "@/lib/types";
import { clearCases, createCase, loadCases, recordOfficerAction } from "@/lib/cases";
import {
  ensureBase,
  getActiveLabel,
  getVersion,
  type PolicyVersion,
} from "@/lib/policyVersions";
import {
  can,
  ensureSeedUsers,
  firstName,
  getCurrentUser,
  logout,
  ROLE_LABEL,
  type User,
} from "@/lib/auth";
import { UserContext } from "@/lib/userContext";
import { getTheme, toggleTheme, type Theme } from "@/lib/theme";
import type { RulesetSummary } from "@/components/summary";
import Avatar from "@/components/Avatar";
import Brand from "@/components/Brand";
import LoginView from "@/components/LoginView";
import ProfileView from "@/components/ProfileView";
import WelcomeView from "@/components/WelcomeView";
import IntakeForm from "@/components/IntakeForm";
import AssessmentProgress from "@/components/AssessmentProgress";
import DecisionView from "@/components/DecisionView";
import ImpactView from "@/components/ImpactView";
import PolicyView from "@/components/PolicyView";
import VersionsView from "@/components/VersionsView";
import EvalsView from "@/components/EvalsView";
import TeamView from "@/components/TeamView";
import CaseList from "@/components/CaseList";

type ViewKind =
  | "home"
  | "intake"
  | "assessing"
  | "decision"
  | "policy"
  | "versions"
  | "impact"
  | "evals"
  | "team"
  | "profile"
  | "queue"
  | "audit";
type View =
  | { kind: "home" }
  | { kind: "intake" }
  | { kind: "assessing"; applicant: Applicant; application: Application }
  | { kind: "decision"; record: CaseRecord }
  | { kind: "policy" }
  | { kind: "versions" }
  | { kind: "impact" }
  | { kind: "evals" }
  | { kind: "team" }
  | { kind: "profile" }
  | { kind: "queue" }
  | { kind: "audit" };

// Stroke icons, 18px, for the rail.
const icons: Record<string, React.ReactNode> = {
  home: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  intake: (
    <path d="M12 5v14M5 12h14" />
  ),
  policy: (
    <>
      <path d="M5 3h10l4 4v14H5z" />
      <path d="M8 8h6M8 12h8M8 16h8" />
    </>
  ),
  impact: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-6M22 20H2" />
    </>
  ),
  queue: (
    <>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </>
  ),
  audit: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  versions: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="12" r="2.5" />
      <path d="M6 8.5v7M8.5 6H14a2 2 0 0 1 2 2v2M8.5 18H14a2 2 0 0 0 2-2v-2" />
    </>
  ),
  evals: (
    <>
      <path d="M9 11l3 3 6-6" />
      <path d="M21 12v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h11" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
      <path d="M16 7a3 3 0 0 1 0 6M18 20c0-2-1-3.5-2.5-4.3" />
    </>
  ),
};

export default function Home() {
  const [view, setView] = useState<View>({ kind: "home" });
  const [tab, setTab] = useState<"case" | "impact">("case");
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [summary, setSummary] = useState<RulesetSummary | null>(null);
  const [activeVersion, setActiveVersion] = useState<PolicyVersion | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/ruleset").catch(() => null);
      const data = res && res.ok ? ((await res.json()) as RulesetSummary) : null;
      if (cancelled) return;
      setSummary(data);
      setCases(loadCases());
      ensureSeedUsers();
      setUser(getCurrentUser());
      setThemeState(getTheme());
      if (data) {
        ensureBase(data.ruleset_version, data.params);
        const label = getActiveLabel(data.ruleset_version);
        setActiveVersion(getVersion(label) ?? getVersion(data.ruleset_version) ?? null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSignedIn = (u: User) => {
    setUser(u);
    setView({ kind: "home" });
  };
  const onLogout = () => {
    logout();
    setUser(null);
    setView({ kind: "home" });
  };
  const onToggleTheme = () => setThemeState(toggleTheme());

  const activateVersion = (label: string) => {
    setActiveVersion(getVersion(label) ?? null);
  };

  const queueCount = cases.filter((c) => c.status === "awaiting_review").length;

  const onAssess = (applicant: Applicant, application: Application) => {
    setTab("case");
    setView({ kind: "assessing", applicant, application });
  };

  // The case is created here, NOT inside a setState updater: updater functions must be pure, and
  // React invokes them twice in development, which would write the record twice.
  const onComplete = useCallback(
    (decision: Decision, applicant: Applicant, application: Application) => {
      const record = createCase(applicant, application, decision);
      setCases(loadCases());
      setView({ kind: "decision", record });
    },
    [],
  );

  // Same rule as onComplete: the localStorage write happens in the handler body, not inside a
  // setState updater (which React double-invokes in development).
  const onOfficerAction = (action: "accepted" | "overridden", overrideReason?: string) => {
    if (view.kind !== "decision") return;
    const updated = recordOfficerAction(view.record.case_id, action, overrideReason);
    setCases(loadCases());
    if (updated) setView({ kind: "decision", record: updated });
  };

  const openCase = (record: CaseRecord) => {
    setTab("case");
    setView({ kind: "decision", record });
  };

  const clearAllCases = () => {
    clearCases();
    setCases([]);
  };

  // The persistent top bar shows the current screen's name and a one-line description.
  const screenMeta: Record<ViewKind, { title: string; description: string }> = {
    home: {
      title: "Overview",
      description: "What this console does and where to start.",
    },
    intake: {
      title: "New assessment",
      description: "Enter a newcomer applicant, or load a prepared scenario.",
    },
    assessing: {
      title: "Assessment in progress",
      description: "Scoring, checking lending policy, and writing the explanation.",
    },
    decision: {
      title: "Decision",
      description: "The recommendation, the evidence behind it, and the officer's call.",
    },
    policy: { title: "Policy", description: "The live ruleset, exactly as the engine runs it." },
    versions: {
      title: "Policy versions",
      description: "Create, activate, and roll back ruleset versions, each with a rationale.",
    },
    impact: {
      title: "Policy impact",
      description: "Champion vs challenger on the 24 locked profiles, with a live what-if.",
    },
    evals: {
      title: "Evals",
      description: "The 24-profile benchmark with the real model, and every generated explanation.",
    },
    team: { title: "Team", description: "Add people and assign roles." },
    profile: { title: "My profile", description: "Your name, picture, and time zone." },
    queue: { title: "Review queue", description: "Refers awaiting a human decision." },
    audit: { title: "Audit log", description: "Every assessment and the officer action taken." },
  };
  const screen =
    view.kind === "decision"
      ? {
          title: `Decision · ${view.record.applicant.full_name}`,
          description: screenMeta.decision.description,
        }
      : screenMeta[view.kind];

  const navItem = (kind: ViewKind, label: string, badge?: number) => {
    const active = view.kind === kind || (kind === "intake" && view.kind === "assessing");
    return (
      <button
        onClick={() => setView({ kind } as View)}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
          active
            ? "bg-white/10 text-white"
            : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          {icons[kind]}
        </svg>
        <span className="hidden md:inline">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="ml-auto hidden rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-semibold text-white md:inline">
            {badge}
          </span>
        )}
      </button>
    );
  };

  // No session: show the sign-in screen and nothing else.
  if (!user) return <LoginView onSignedIn={onSignedIn} />;

  const role = user.role;
  const allow = (kind: ViewKind) => can(role, kind);
  const groupHas = (kinds: ViewKind[]) => kinds.some(allow);

  return (
    <UserContext.Provider value={user}>
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col bg-[#0b1a2e] md:w-60">
        <button
          onClick={() => setView({ kind: "home" })}
          className="flex items-center gap-3 px-4 py-5 text-left"
        >
          <Brand size={34} />
          <span className="hidden md:block">
            <span className="block text-sm font-bold leading-tight text-white">
              Newcomer Credit
            </span>
            <span className="block text-xs text-slate-400">Copilot</span>
          </span>
        </button>

        <nav className="flex flex-1 flex-col gap-1 px-2.5 pt-2">
          {navItem("home", "Overview")}
          {groupHas(["intake", "queue", "audit"]) && (
            <div className="hidden px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 md:block">
              Assess
            </div>
          )}
          {allow("intake") && navItem("intake", "New assessment")}
          {allow("queue") && navItem("queue", "Review queue", queueCount)}
          {allow("audit") && navItem("audit", "Audit log")}
          {groupHas(["policy", "versions", "impact", "evals", "team"]) && (
            <div className="hidden px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500 md:block">
              Govern
            </div>
          )}
          {allow("policy") && navItem("policy", "Policy")}
          {allow("versions") && navItem("versions", "Versions")}
          {allow("impact") && navItem("impact", "Policy impact")}
          {allow("evals") && navItem("evals", "Evals")}
          {allow("team") && navItem("team", "Team")}
        </nav>

        <div className="hidden border-t border-white/10 px-4 py-4 text-xs md:block">
          {summary ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-medium text-slate-200">
                  {activeVersion?.label ?? summary.ruleset_version}
                </span>
                {activeVersion && !activeVersion.is_base && (
                  <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">
                    active
                  </span>
                )}
              </div>
              <div className="text-slate-500">
                {summary.market_name} · {summary.rule_count} rules · {summary.factor_count}{" "}
                factors
              </div>
            </>
          ) : (
            <div className="text-slate-500">loading ruleset...</div>
          )}
          <div className="mt-2 text-[11px] text-slate-600">Synthetic data only</div>
        </div>

        <div className="hidden border-t border-white/10 px-4 py-3 md:block">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setView({ kind: "profile" })}
              title="My profile"
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 text-left transition hover:bg-white/5"
            >
              <Avatar name={user.name} avatar={user.avatar} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-white">{user.name}</span>
                <span className="block text-[11px] text-slate-400">{ROLE_LABEL[role]}</span>
              </span>
            </button>
            <button
              onClick={onToggleTheme}
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
              )}
            </button>
            <button
              onClick={onLogout}
              title="Sign out"
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/85">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-6 py-3.5">
            <div>
              <h1 className="text-base font-semibold leading-tight text-slate-900 dark:text-slate-100">
                {screen.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{screen.description}</p>
            </div>
            {summary && (
              <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs dark:border-white/10 dark:bg-white/5">
                <span className="text-slate-500 dark:text-slate-400">Ruleset</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">
                  {activeVersion?.label ?? summary.ruleset_version}
                </span>
                {activeVersion && !activeVersion.is_base && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                    active
                  </span>
                )}
              </span>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          {view.kind === "home" && (
            <WelcomeView
              summary={summary}
              queueCount={queueCount}
              activeLabel={activeVersion?.label ?? summary?.ruleset_version ?? ""}
              userName={firstName(user)}
              canReview={allow("queue")}
              onNavigate={(kind) => setView({ kind } as View)}
            />
          )}

          {view.kind === "intake" && <IntakeForm summary={summary} onAssess={onAssess} />}

          {view.kind === "assessing" && (
            <AssessmentProgress
              applicant={view.applicant}
              application={view.application}
              summary={summary}
              activeVersion={activeVersion}
              onComplete={onComplete}
            />
          )}

          {view.kind === "decision" && (
            <div className="flex flex-col gap-5">
              <div className="flex gap-1 self-start rounded-full bg-slate-200/60 p-1 dark:bg-white/5">
                {(["case", "impact"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                      tab === t
                        ? "bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    }`}
                  >
                    {t === "case" ? "Case result" : "Impact view"}
                  </button>
                ))}
              </div>
              {tab === "case" ? (
                <DecisionView
                  record={view.record}
                  onAction={onOfficerAction}
                  onNew={() => setView({ kind: "intake" })}
                  onViewAudit={() => setView({ kind: "audit" })}
                />
              ) : (
                <ImpactView activeLabel={activeVersion?.label ?? summary?.ruleset_version ?? ""} />
              )}
            </div>
          )}

          {view.kind === "policy" && (
            <PolicyView activeLabel={activeVersion?.label ?? summary?.ruleset_version ?? ""} />
          )}

          {view.kind === "versions" && (
            <VersionsView
              summary={summary}
              activeLabel={activeVersion?.label ?? summary?.ruleset_version ?? ""}
              onActivate={activateVersion}
            />
          )}

          {view.kind === "impact" && <ImpactView activeLabel={activeVersion?.label ?? summary?.ruleset_version ?? ""} />}

          {view.kind === "team" && <TeamView currentUserId={user.id} />}

          {view.kind === "profile" && (
            <ProfileView user={user} onSaved={() => setUser(getCurrentUser())} />
          )}

          {view.kind === "evals" && <EvalsView />}

          {view.kind === "queue" && (
            <CaseList cases={cases} mode="queue" onOpen={openCase} onClear={clearAllCases} />
          )}

          {view.kind === "audit" && (
            <CaseList cases={cases} mode="audit" onOpen={openCase} onClear={clearAllCases} />
          )}
        </main>

        <footer className="mx-auto w-full max-w-5xl px-6 py-6 text-center text-xs text-slate-400">
          A capstone demo of explainable, policy-grounded newcomer lending. Synthetic data only.
        </footer>
      </div>
    </div>
    </UserContext.Provider>
  );
}
