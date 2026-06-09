# UAE Credit Market: Competitor & Domain Research (sourced)

Phase 1 deliverable (BACKING / working notes, clean version lives in ../deliverables/).
Research date: 2026-06-07. **Full re-verification sweep completed 2026-06-09** (see disposition
table at the bottom). Every claim carries a source. Confidence levels flagged.
NOTE: AECB official site (aecb.gov.ae) refused direct connection during checks, so AECB-specific
facts lean on consistent secondary reporting (The National, Gulf News, Khaleej Times). CBUAE
Rulebook IS reachable and was used as a primary source for the adverse-action point.

---

## VERIFIED FACTS (were flagged NEEDS VERIFICATION, now resolved)

### AECB credit score range: 300-900  [CONFIRMED, high confidence]
Three-digit scale, 300 min to 900 max, higher = lower default risk. Predicts likelihood of
missed payments over next 12 months.
- https://etihadbureau.ae/Individual/CreditScore
- https://www.stashaway.ae/r/complete-guide-aecb-credit-score
Caveat: exact band cutoffs (good/excellent) differ between sources. Range is solid; bands approximate.
Data held: loans, cards, overdrafts, payment history, inquiries, court judgments, bankruptcies,
collections, bounced cheques. Expanded to telecom + utility data; salary data now in millions of
reports; court data, Ejari rents, BNPL being added.

### UAE expat population: ~88% (88.5% in 2024)  [CONFIRMED, high confidence]
3rd-highest expat-to-national ratio globally. Use "roughly 88%" or "around 9 in 10 residents."
- https://en.wikipedia.org/wiki/Demographics_of_the_United_Arab_Emirates
(Primary source is govt/UN data via Wikipedia; cite a primary statistical source for high-stakes use.)

### Thin-file newcomer problem is REAL and documented  [CONFIRMED, high confidence]
Newcomers start with a blank AECB file, restricted credit access, lower initial limits, steered to
secured cards. AECB built the Nova Credit partnership specifically to address this.
- https://www.thenationalnews.com/business/money/2023/03/07/new-uae-expats-can-use-financial-history-from-home-for-faster-credit/
("12 months to build a score" / "lower limits" claims are from expat-guide sites, directional not official.)

---

## IMPORTANT CORRECTION to our rationale (D7 framing)

**Old claim (TOO ABSOLUTE, do NOT use):** "Rules+LLM is industry standard BECAUSE you cannot train
an ML model on borrowers with no history."

**What the evidence actually shows:**
- Lenders use a BLEND: judgmental underwriting + income/employment verification + bank-statement
  cash-flow + secured products + alternative data. https://finhelp.io/glossary/how-credit-models-evaluate-thin-file-borrowers/
- ML on alternative data IS a growing, active approach for thin-file consumers, not impossible.
  https://www.sciencedirect.com/science/article/pii/S0957417422018279
- BNPL players (Tabby, Tamara) already do instant ML decisioning on minimal-history data.
  https://trustdecision.com/articles/credit-decisioning-for-bnpl-how-ai-enhances-risk-assessment-and-portfolio-outcomes
- AECB + Nova Credit "Credit Passport" imports home-country bureau history in real time, so
  "new to country" does NOT always mean "no history" (covers India, Philippines, UK at launch).
  https://www.thenationalnews.com/business/money/2023/03/07/new-uae-expats-can-use-financial-history-from-home-for-faster-credit/

**CORRECTED POSITIONING (more defensible):**
Judgmental scorecards on alternative data + policy checks + EXPLAINABLE decisions are a defensible,
regulator-aligned, transparent baseline, especially where applicant-level performance data is thin
and regulators expect transparency. Do NOT claim "ML is impossible." Differentiate on:
explainability + alternative-data + policy-check, AND on serving applicants NOT covered by Nova
Credit (countries not on the network, or thin home-country files too).

Interview answer to "why not ML": "ML on alternative data is viable and growing. We chose a
transparent, judgmental scorecard + policy-check + explainable-decision approach because for a
v1 serving a regulated lending decision, explainability and defensibility matter more than a
marginal accuracy gain, and we have thin applicant-level data to validate an ML model on."

---

## COMPETITORS, THE TOP 5 (Phase 1 deliverable)  [LOCKED]
Confidence: HIGH on who/what; MEDIUM on shortfall judgments (reasoned from public materials, not teardowns).

**Why these 5:** each represents a DIFFERENT competitive angle, not five lookalikes. Together they
cover every way a UAE bank could solve the newcomer problem today, import the history, buy a
platform, use the incumbent app, lean on BNPL-style ML, or buy an explainable engine. Our product
sits in the gap none of them fully owns: newcomer-specific alt-data scoring + policy-check +
regulator-grade explainable approve/decline/refer, for applicants the others miss.

**1. AECB + Nova Credit "Credit Passport" / Foreign Credit Report, the most DIRECT substitute.**
Solves new-to-country by importing the applicant's real home-country bureau history (launched Mar
2023: India, Philippines, UK; later expanded to 10+ countries). [Still-live-in-2026 inferred from
the live product page, not independently confirmed, AECB site was unreachable.] Strength: real bureau-grade data, not inference; AECB-backed.
Shortfall / our gap: only works for applicants from covered countries with a usable home file, those outside the network, or with thin home-country history too, are still invisible and still
need salary/tenure/rent + policy-check + explainable scoring. We serve exactly who they can't.
https://www.thenationalnews.com/business/money/2023/03/07/new-uae-expats-can-use-financial-history-from-home-for-faster-credit/

**2. Newgen Agentic Credit Decisioning, the EXPLAINABILITY rival (closest to our differentiator).**
Markets "AI-powered, fully explainable, audit-ready" instant decisioning for Middle-East FIs.
Strength: explicitly sells the explainable/auditable angle we differentiate on. Shortfall / our gap:
a horizontal decisioning engine for FIs generally, no public evidence it specializes in no-history
newcomers or the specific alt-data (salary transfer, tenure, rent) that thin-file UAE applicants
need. We are the newcomer-specific application of that explainability idea, not a generic engine.
https://newgensoft.com/ae/blog/empowering-middle-eastern-financial-institutions-with-agentic-credit-decisioning/

**3. Liv (Emirates NBD), the STATUS-QUO incumbent newcomers actually face.**
UAE's first and largest digital bank ("over half a million customers", Liv's own marketing figure,
not audited), instant app-based cards + personal loans (up to AED 200k), markets to newcomers. Strength: huge reach, trusted brand, the default app a newcomer opens. Shortfall / our
gap: a consumer banking brand, not a decisioning engine, no public evidence of alt-data
underwriting for no-history applicants or explainable decline reasons. The newcomer who gets a
quiet "no" from Liv is precisely our use case.
https://www.liv.me/en/important-information/features/liv-credit-card-feature

**4. Tabby & Tamara (BNPL), PROOF that thin-file ML underwriting works in the UAE.**
Instant AI underwriting on minimal-history data; already serve thin-file populations at scale.
Strength: prove the market and the data exist; fast instant decisions. Shortfall / our gap: small
short-tenor BNPL exposures, NOT personal loans / credit cards; optimized for checkout conversion,
not regulator-grade explainable approve/decline/refer; proprietary opaque models. They validate the
approach but don't serve the regulated personal-lending decision we target.
https://trustdecision.com/articles/credit-decisioning-for-bnpl-how-ai-enhances-risk-assessment-and-portfolio-outcomes

**5. CRIF "Lending Journey", the BUILD-vs-BUY platform a bank could license (UAE-local).**
Digital onboarding, KYC, open banking, AI creditworthiness, configurable scorecards; has a UAE
presence. Strength: ready-made, locally available, configurable. Shortfall / our gap: a general
configurable platform, not specific to thin-file newcomers and without built-in newcomer
explainability; the newcomer alt-data logic still has to be designed by the bank. We are that
opinionated, newcomer-specific logic, not a blank toolkit.
https://www.crif.com/business/services/platforms/lending-journey-platform/ · UAE site: https://www.ae.crif.digital/
[CORRECTED 2026-06-09: UAE domain is ae.crif.digital, NOT crif.ae.]

### Appendix, other players considered (not in the top 5, kept for completeness)
- **Wio Bank**: real-time alt-data (POS sales) for instant SME lending. Out of top 5: SME/merchant
  cash-flow focus, not individual newcomer consumer lending.
  https://thefintechtimes.com/neo-pay-and-wio-bank-join-forces-to-streamline-sme-financing-in-the-uae/
- **Provenir**: unified AI decisioning, Forrester Wave Leader Q2 2025. Out of top 5: horizontal
  global platform, less UAE-local than CRIF; same build-vs-buy angle CRIF already represents. https://www.provenir.com
- **FICO**: decisioning platform, Forrester Wave Leader. Out of top 5: generic, not a packaged
  UAE-newcomer solution; same platform angle. https://www.fico.com
- **Synapse Analytics + Lean**: end-to-end AI credit decisioning across GCC. Out of top 5: general
  decisioning/open-banking, not a dedicated thin-file newcomer product.

---

## ALTERNATIVE DATA SOURCES (UAE/GCC)
- Salary/income: salary-transfer to lending bank is standard; loans secured against salary +
  end-of-service gratuity. **Salary data IS in AECB reports, added Q1 2024, covering 3.71M
  customers, with "last reported salary" + Expense-to-Salary Ratio. [CONFIRMED 2026-06-09, secondary.]**
- **Minimum-salary floor: CBUAE ABOLISHED the mandatory minimum-salary requirement for personal
  loans on 18 Nov 2025; banks now set their own criteria via internal risk models. [CONFIRMED
  2026-06-09, Khaleej Times, Gulf News, LexisMiddleEast.] Strengthens our thesis: lenders now lean
  on risk models, not a blanket salary gate, exactly where alt-data + explainable scoring fits.**
- Telecom + utility: already supplied to AECB. [confirmed via The National]
- Rent/Ejari: planned/being added to AECB, NOT yet live in reports. Treat as EMERGING, do not state
  as a current AECB data source. [CONFIRMED emerging-only 2026-06-09.]
- Cross-border home-country history: via AECB Foreign Credit Report (Nova Credit). Launch (Mar 2023):
  India, Philippines, UK; later expanded to 10+ countries. Still-live-in-2026 inferred, not directly confirmed.
- Remittances: NOT verified as a scoring input anywhere. DO NOT CLAIM.

---

## EXPLAINABILITY / ADVERSE ACTION - UAE REGULATION  [VERIFIED 2026-06-09, primary source]
**RESOLVED:** There is NO UAE equivalent of the US ECOA/FCRA adverse-action notice. The framework is
the CBUAE Consumer Protection Regulation (Circular 8 of 2020) + Consumer Protection Standards, which
impose a SOFT "provide reasons where feasible" + responsible-financing + transparency duty, not a
hard statutory right to a specific decline reason.
- CBUAE Consumer Protection Regulation (Circular 8 of 2020), governing framework.
  https://rulebook.centralbank.ae/en/rulebook/consumer-protection-regulation
- Consumer Protection Standards (reachable as primary source).
  https://rulebook.centralbank.ae/en/rulebook/consumer-protection-standards
- Art. 7 Responsible Financing: creditworthiness assessment required to prevent over-indebtedness.
- Art. 2 Disclosure & Transparency: good disclosure required.
- **POSITIONING (locked):** explainability is BEST-PRACTICE and regulator-ALIGNED, NOT legally
  mandated. Do NOT market the tool as satisfying a hard legal adverse-action requirement, that
  claim would be false. The softer "reasons where feasible" duty + transparency expectation is the
  honest, defensible hook. This is our most important correction.

---

## FACT-VERIFICATION LEDGER, POST-SWEEP  [COMPLETE 2026-06-09]
All previously-open items were re-checked against the live web on 2026-06-09. Status now:

| # | Item | Status after sweep | Confidence / source |
|---|---|---|---|
| 1 | AECB score-band cutoffs (good/excellent) | Range 300-900 CONFIRMED; exact band labels vary by source, we cite only the range | High (range) |
| 2 | AECB salary data in reports | **CONFIRMED**, added Q1 2024, 3.71M customers, "last reported salary" + Expense-to-Salary Ratio | Med-High, secondary |
| 3 | Judgmental-vs-ML "standard" share | Closed, D7 dropped the absolute claim; we never quantify "standard" | n/a |
| 4 | CBUAE min-salary removal (Nov 2025) | **CONFIRMED**, abolished 18 Nov 2025; banks set own criteria | High, multi-source secondary |
| 5 | Ejari / rent in AECB | CONFIRMED **emerging-only**, planned, not live in reports. Hedged everywhere | Medium |
| 6 | Remittances as scoring input | Closed, we explicitly DO NOT claim | n/a |
| 7 | UAE reason-for-decline legal mandate | **RESOLVED, REFUTED as a hard mandate.** Only a soft "where feasible" duty (CBUAE Circular 8/2020). Positioning corrected | Med-High, **primary** (CBUAE Rulebook) |
| 8 | Competitor shortfalls | Disclosed MEDIUM confidence (reasoned from public materials, not teardowns) | Medium |

**Corrections applied this sweep:** (a) CRIF UAE domain is **ae.crif.digital**, not crif.ae; (b) Liv
"~500k users" is Liv's own marketing claim, flagged as self-reported; (c) Credit Passport launch +
country list solid, but "still-live-2026" is inferred (AECB site unreachable), softened; (d) the
adverse-action point is now a CONFIRMED *non*-mandate, which strengthens our honest positioning.

**Conclusion:** every fact used in a Phase 1 deliverable is now confirmed or transparently
confidence-flagged. Nothing load-bearing rests on an unverified claim. Phase 1 is fact-complete.
