# Pitch notes (working file)

Feeds the Phase 4 pitch deck and demo script. These are notes, not a deliverable. Anything here
that survives into the deck gets fact-checked and styled there.

## 1. The plug and play demo moment

The point of this beat: the audience watches policy change without a code change.

There are now two ways to run it. The on-stage version (option A) is fully in-app, safe, and
repeatable; the file version (option B) shows that the policy really is just a config file.

**Option A, the in-app what-if (recommended for the live demo):**
1. Open the impact tab. The "Policy what-if" panel sits at the top, the locked v1.0 baseline
   showing the approval, decline, and refer split across the 24 profiles.
2. Drag the debt burden ratio cap slider from 50 percent down to 45. The 24-profile run
   re-computes live as you drag; the panel badge flips from "locked v1.0 baseline" to "what-if".
3. Narrate the shift: approvals drop from 7 of 8 to 6 of 8, GT-04 and GT-24 move to decline, and
   every moved decision still carries its policy citation, now reading 45 percent.
4. Click "Reset to locked v1.0 baseline" to snap back. Nothing was written to disk; the locked
   pack is untouched, so the demo is repeatable on the spot.
5. Close with the line: **policy is configuration, a new market is a pack, not a project.**

**Option B, the config file (use to prove it is genuinely just config):**
1. Show the impact tab baseline.
2. Open `config/uae/policy-rules.json` (the live ruleset; the v1.0 file next to it stays locked),
   change dbr_cap from 0.50 to 0.45, save.
3. Rerun the impact tab. Same shift, driven by an actual file edit. Restore 0.50 after.

Build status (2026-06-12): the pack exists. The engine reads
`03-build/app/config/uae/policy-rules.json`; values, rule sentences, citations, and band
cut-offs all live there, and the cited rule text is rendered from the same number the check
enforces, so changing dbr_cap to 0.45 rewrites the citation to 45 percent automatically (tests
prove the flip and that the locked v1.0 pack still scores 20/24 on the ground truth). The
scorecard is in the pack too: factor tiers, points, and rationales, so a market can carry a
different scorecard, not just different rules. Rule and factor counts are pack-driven: the
screens render one element per enabled rule or factor, 10 rules means 10, 5 means 5.

Demo verified working (2026-06-13, Step 5 done): the impact tab re-reads the pack from disk on
every rerun. Editing dbr_cap to 0.45 and clicking Rerun moves GT-04 and GT-24 from approve and
refer to decline (rule-2), approvals drop from 7 of 8 to 6 of 8, and every citation reads 45
percent. Restoring 0.50 brings the baseline back exactly. Narrate GT-04: it sits at a debt
burden of exactly 50 percent, the boundary case the regulator's tightening catches first.

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

Build status (2026-06-12, updated after Step 4): `ruleset_version` is stamped on every
decision, and the grounding validator is built and tested: it catches a seeded ungrounded
explanation, retries once, and falls back to a deterministic template, with the outcome
(`validation_outcome`) recorded on the decision for the Phase 4 evals. All four Q&A items are
now real.

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
