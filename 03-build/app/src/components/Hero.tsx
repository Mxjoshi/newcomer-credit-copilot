// The intake-screen hero: a confident product band that frames what the copilot does before the
// officer reaches the form. Built for the pitch as much as the user. The pack badge shows the
// live market identity, so the "policy is configuration" story is visible from the first screen.

import type { RulesetSummary } from "./summary";

export default function Hero({ summary }: { summary: RulesetSummary | null }) {
  const chips = [
    "Every recommendation cited to policy",
    "Approve · decline · refer, human in the loop",
    "Policy is configuration, not code",
  ];
  return (
    <section className="hero-mesh animate-fade-up relative overflow-hidden rounded-2xl px-6 py-5 text-white shadow-lg shadow-blue-900/20 sm:px-8 sm:py-6">
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300">
            Credit decisioning · officer console
          </div>
          <h1 className="mt-1.5 text-xl font-bold leading-snug tracking-tight sm:text-2xl">
            Credit decisions for newcomers, explained well enough to defend.
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-300">
            Scored on alternative data, checked against lending policy, every recommendation
            grounded in the rules.
          </p>
        </div>
        {summary && (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {summary.market_name} · {summary.ruleset_version}
          </span>
        )}
      </div>
      <div className="relative z-10 mt-3.5 flex flex-wrap gap-2">
        {chips.map((c) => (
          <span
            key={c}
            className="rounded-md bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-white/10"
          >
            {c}
          </span>
        ))}
      </div>
    </section>
  );
}
