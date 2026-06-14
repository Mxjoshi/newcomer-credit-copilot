# What a user does in the Newcomer Credit Copilot

A plain walkthrough of who uses the app and what they actually do, screen by screen. Written for
clarity: no jargon, tied to the real screens in the build.

## Who uses it

A credit officer at a UAE bank. They assess people who are new to the country and have little or
no local credit history. They are not technical. They use this tool to reach a decision on a loan
or credit card application, and to explain that decision well enough to defend it to a manager or
to compliance. The borrower never sees this tool; it is an internal officer console.

A second, lighter role is the risk or policy owner, who maintains the lending rules and reviews
how a change would land before it goes live.

## The main thing a user does: assess one applicant

This is the core loop, the three-screen flow from the left rail under "Assess".

1. **Start.** Open "New assessment". Either type the applicant in, or pick a ready-made scenario
   from the dropdown (there are six, two of each outcome) to see the flow end to end.
2. **Enter the applicant.** Fill three groups. The applicant (salary, employment and tenure,
   employer, months in the UAE and visa type, rent history). The policy inputs (existing monthly
   obligations, age, visa months remaining), which the rules use but the score never sees, kept in
   their own labelled group so the boundary is visible. The request (product, amount, term).
3. **Assess.** Click "Assess applicant". The form validates itself first, so a bad entry never
   reaches the engine and can never produce a confusing answer.
4. **Watch it work.** Three steps run in order: score the applicant, check lending policy, write
   the explanation. A summary of exactly what was submitted sits at the top, so nothing is hidden.
5. **Read the decision.** The decision screen shows the verdict (approve, decline, or refer) and
   the risk level, a plain paragraph explaining why (written to be read aloud to a manager), the
   scorecard with points per factor, every policy rule with its cited text, and, for a decline or
   refer, "what would change this".
6. **Make the call.** Accept the recommendation, or override it with a one-line reason that is
   recorded. The human makes the final decision, always.

## The supporting things a user does

Reachable from the rail at any time.

- **Review queue.** Every "refer" lands here and waits for a human. Open one to see its full
  decision again and close it. A refer is a case that outlives the moment, so it is kept.
- **Audit log.** Every assessment this browser has produced, with the officer's action and the
  ruleset version that made it. Read only. This is the defensibility trail.

## What a policy owner does

Under "Govern" in the rail.

- **Policy.** Read the live ruleset exactly as the engine runs it: market identity, every rule
  with its cited text and severity, the parameters with their notes, and the scorecard factors
  with their tiers. This makes "policy is configuration" legible on one page.
- **Versions.** Change a policy value and save it as a new version with a required rationale. Make
  any version active, or roll back to the locked baseline. Every decision is stamped with the
  version that produced it, so a past decision can be reconstructed against the exact policy of the
  day. The locked v1.0 is the immutable base.
- **Policy impact.** Move a policy value and watch the 24 locked test profiles re-decide live,
  status quo (champion) against this product (challenger). A what-if sandbox with a change log of
  what was tried, repeatable, with one click back to the baseline.

## The one rule the product never breaks

The system never invents a result. If the explanation cannot be grounded in the decision data, it
falls back to a plain deterministic paragraph; if the assessment cannot run at all, it says
plainly that nothing was decided rather than show a guess. Every number and rule on screen traces
back to the inputs or the policy.
