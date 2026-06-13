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
    <section className="hero-mesh animate-fade-up relative overflow-hidden rounded-3xl px-8 py-10 text-white shadow-xl shadow-indigo-900/20 sm:px-12 sm:py-14">
      <div className="relative z-10 max-w-2xl">
        {summary && (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {summary.market_name} · {summary.ruleset_version} · bureau {summary.bureau} ·
            regulator {summary.regulator}
          </span>
        )}
        <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-[2.6rem]">
          Credit decisions for newcomers,
          <br className="hidden sm:block" /> explained well enough to defend.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-indigo-100">
          A credit officer enters a newcomer&rsquo;s details. The copilot scores the risk on
          alternative data, checks lending policy, and returns a recommendation with an
          explanation grounded in the rules, every time.
        </p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-indigo-50 ring-1 ring-inset ring-white/15"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
