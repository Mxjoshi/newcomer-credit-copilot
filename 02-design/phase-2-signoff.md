# Phase 2, Design: Sign-off

The single source of truth for "is Phase 2 done?" Signed off: 2026-06-11, by Monika's direction
after the review milestone and verification passed.
The brief's Phase 2 deliverable, in its own words: *"An end-to-end UI flow (review milestone) and
a first-pass data model."* This page maps each one to its artifact and validation status.

---

## The two deliverables: status

| # | Deliverable (from brief) | Artifact | Validated? |
|---|---|---|---|
| 1 | End-to-end UI flow (review milestone) | `deliverables/01-ui-flow.md`, 3 screens plus impact view tab, edge states, traceability table | Yes. Reviewed by Monika 2026-06-11 (the milestone held), decisions M4-M6 called and applied same day |
| 2 | First-pass data model | `deliverables/02-data-model.md`, 6 entities, 7 machine-checkable rules with explicit severities, derivation logic | Yes. Combination logic corrected and verified against the locked ground truth |

**Ordering respected:** the UI flow was written first, the data model after it, per the brief.

**Backing material (full reasoning, not graded):** `working/phase-2-plan.md` (design alternatives,
decisions queue U1-U4 and M1-M6, all resolved).

---

## No-ambiguity checks (each potential gap, resolved)

1. **The review milestone actually happened.** Monika reviewed both deliverables on 2026-06-11
   and called three decisions: M4 (three policy-only input fields, never scored, the scored set
   stays exactly the M1 five), M5 (ground truth locked before any weight exists), M6 (grounding
   validator, deterministic counterfactuals, impact view). All applied and committed same day.
2. **The decision logic is verified, not assumed.** Rule severities are explicit (rules 1, 2, 3,
   6 hard_fail; 4, 5 refer). The combination logic was corrected so a refer-severity failure
   downgrades an approve and never rescues a failing score. All 24 ground-truth labels were
   re-derived and confirmed structurally reachable under this logic and the locked constants.
3. **Early artifacts are deliberate, not scope creep.** Three Phase 3/4 artifacts were produced
   during the review because Phase 2 fixed the shapes they need: the 24-case ground truth
   (locked before weights exist so the exam cannot be graded by the student), the LLM
   integration spec, and the dated metrics amendment (hallucination target restated as zero on
   n=24). Each is recorded with its rationale.
4. **Style and consistency hold repo-wide.** Every mermaid diagram parses (checked with the
   mermaid parser), no en or em dashes exist anywhere, rule numbering and field counts are
   consistent across all files, and completed-phase files were swept for stale references.

---

## What is explicitly not in Phase 2 (so we don't over-build)

- Point weights, band cut-offs, final rule text, named-constant values in code: Phase 3.
- The app itself and the live LLM call: Phase 3.
- Running the evals and measuring metrics against the baseline: Phase 4.

---

## Verdict

Phase 2 is complete, reviewed, revised, and verified. Both required deliverables exist as clean
standalone documents resting on logged decisions (U1-U4, M1-M6). The decision logic is proven
consistent with the locked ground truth. Cleared to start Phase 3 (build and AI integration).
