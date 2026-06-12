# Pitch notes (working file)

Feeds the Phase 4 pitch deck and demo script. These are notes, not a deliverable. Anything here
that survives into the deck gets fact-checked and styled there.

## 1. The plug and play demo moment

The point of this beat: the audience watches policy change without a code change.

Exact steps, in order:

1. Have the app open on the impact tab, showing the current approval, decline, and refer split
   across the 24 ground-truth profiles under uae v1.0.
2. Switch to the editor, open `config/uae/policy-rules.json` (the live ruleset; the v1.0 file
   next to it stays locked), and scroll to the parameters block so the cap is visible on screen.
3. Change the DBR cap from 0.50 to 0.45. Say what you are doing while you type it: "the regulator
   tightens the debt burden ceiling, this is the whole change."
4. Rerun the impact tab.
5. Narrate the shift: which profiles moved from approve to refer or decline, and that every moved
   decision still carries its policy citation, now pointing at the 0.45 rule.
6. Close with the line: **policy is configuration, a new market is a pack, not a project.**

Build status (2026-06-12): the pack exists. The engine reads
`03-build/app/config/uae/policy-rules.json`; values, rule sentences, citations, and band
cut-offs all live there, and the cited rule text is rendered from the same number the check
enforces, so changing dbr_cap to 0.45 rewrites the citation to 45 percent automatically (tests
prove the flip and that the locked v1.0 pack still scores 20/24 on the ground truth). The rule
count is also pack-driven: the screens render one element per enabled rule, 10 rules means 10,
5 means 5. Still pending for this demo: the impact tab itself and its re-read-from-disk rerun
(Step 5 UI work).

## 2. Saudi pack roadmap slide spec

One slide, titled something like "The second market is a pack". Everything on it is marked
illustrative. Nothing on this slide claims verified Saudi policy.

- Bureau: SIMAH replaces AECB as the credit bureau the pack reads from.
- Regulator: SAMA replaces CBUAE as the source of lending rules.
- Two illustrative rule differences, each tagged "(illustrative)" on the slide itself:
  1. A different debt burden ceiling under SAMA responsible lending rules (illustrative).
  2. A different treatment of salary transfer or minimum credit history with SIMAH (illustrative).
- Footnote on the slide: "Rule values shown are illustrative. A real Saudi pack starts with
  primary-sourcing SAMA circulars, the same way the UAE pack started with CBUAE."

The slide exists to prove the architecture point from section 1, not to claim Saudi readiness.

## 3. Buy versus build, the Q&A answer

Likely question: "couldn't a bank just prompt an LLM to do this?"

Answer shape: a prototype proves the model works once. Production demands three things a prompt
does not give you: evals, override tracking, and decision reconstruction. This demo carries the
demo-scale version of each:

- Evals: the 24-profile ground truth, locked before any weight was tuned, run by the self-check
  harness.
- Override tracking: the review queue and audit log, where a referred case and its analyst action
  survive a reload.
- Decision reconstruction: policy citations on every rule outcome, and `ruleset_version` stamped
  on every decision, so you can answer "why did we decline this person in June" months later.

The pitch line: the hard part of lending AI is not the model, it is being able to stand behind
the decision afterward. That is what this architecture is shaped around.

Build status (2026-06-12): `ruleset_version` is stamped on every decision. The grounding
validator is Step 4 work; confirm it exists before promising it in Q&A.

## 4. Officer time, the illustration

Status quo: a manual newcomer review means an officer assembles salary, visa, obligations, and
bureau status by hand, checks each against policy from memory or a PDF, and writes up the
rationale. Call it the better part of an hour per file.

With the copilot: intake is structured, the market pack's policy rules run instantly with
citations, the
officer reviews the recommendation and the counterfactuals, and spends their judgment only on
the refer queue. Minutes, not an hour.

State it exactly this way in the pitch: **this is an illustration of where the time goes, not a
measured claim.** Phase 4 produces the measured numbers; until then the deck says "illustrative"
on this slide too. If a Phase 4 timing run happens, swap the illustration for the measurement.

## 5. v2 roadmap, parked on purpose

Things that are deliberately not in the MVP, kept here so the pitch can answer "what's next"
without scope-creeping the build:

- Analyst overrides as feedback signals: every queue override is labeled data about where the
  rules disagree with human judgment, which feeds rule tuning.
- A second ruleset version, uae v1.1, with a version selector on the impact tab, so champion vs
  challenger becomes version vs version instead of current vs edited.
- A second market pack (the Saudi pack from section 2), which is the real test of "a market is a
  pack, not a project."
