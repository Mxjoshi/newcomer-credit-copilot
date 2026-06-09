# Deliverable 2 — Competitor Analysis

**Phase 1 · Scope & Research** · Status: LOCKED · Last verified: 2026-06-09
Brief asks for the top **3–5 players**, what they do well, and where they fall short.

**Confidence:** HIGH on who each player is and what they do; MEDIUM on the shortfall judgments —
these are reasoned from public materials and marketing, not internal product teardowns.

---

## How to read this: 5 players, 5 different angles

These are not five lookalikes. Each represents a **different way a UAE bank could solve the newcomer
problem today** — import the history, buy an explainable engine, rely on the incumbent app, lean on
BNPL-style ML, or license a decisioning platform. Mapping them this way shows where the white space
is: **none of them fully owns newcomer-specific alternative-data scoring + policy-check +
regulator-grade explainable approve / decline / refer.** That gap is our product.

| # | Competitor | Angle it represents |
|---|---|---|
| 1 | AECB + Nova Credit "Credit Passport" | The most **direct substitute** |
| 2 | Newgen Agentic Credit Decisioning | The **explainability rival** (closest to our differentiator) |
| 3 | Liv (Emirates NBD) | The **status-quo incumbent** newcomers face today |
| 4 | Tabby & Tamara (BNPL) | **Proof** thin-file alt-data underwriting works in the UAE |
| 5 | CRIF "Lending Journey" | The **build-vs-buy** platform a bank could license |

---

## 1 · AECB + Nova Credit "Credit Passport" / Foreign Credit Report — the direct substitute
**Does well:** Solves new-to-country by importing the applicant's *real* home-country bureau history,
not an inference — bureau-grade data, AECB-backed. Launched March 2023 (first in GCC); covered India,
Philippines and the UK at launch, later expanding to 10+ countries.
**Where it falls short / our gap:** It only works for applicants from covered countries who have a
usable home-country file. Anyone outside the network — or with a thin home-country history too — is
still invisible and still needs salary / tenure / rent + policy-check + explainable scoring. **We
serve exactly the applicants Credit Passport cannot.**
*(Launch + countries: High confidence. Still operational in 2026: inferred from the live product page,
not independently confirmed — AECB site was unreachable.)*

## 2 · Newgen Agentic Credit Decisioning — the explainability rival
**Does well:** Markets an "AI-powered, fully explainable, audit-ready" agentic credit-decisioning
engine for Middle-East financial institutions, with plain-language rationales and audit trails — it
sells the exact explainability angle we differentiate on. (Vendor's own positioning.)
**Where it falls short / our gap:** It's a horizontal decisioning engine for FIs generally. No public
evidence it specializes in no-history newcomers or the specific alternative data (salary transfer, job
tenure, rent) that thin-file UAE applicants need. **We are the newcomer-specific application of that
explainability idea — not a generic engine the bank must configure.**
*(High confidence on positioning; "explainable/audit-ready" is Newgen's marketing claim, not an
independently tested capability.)*

## 3 · Liv (Emirates NBD) — the status-quo incumbent
**Does well:** UAE's first and largest digital bank ("over half a million customers" — Liv's own
figure), instant app-based cards and personal loans (up to AED 200k), actively markets to newcomers.
It's the default app a newcomer opens.
**Where it falls short / our gap:** It's a consumer banking *brand*, not a decisioning engine. No
public evidence of alternative-data underwriting for no-history applicants, or of explainable decline
reasons. **The newcomer who gets a quiet "no" from Liv is precisely our use case.**
*(High confidence on product/positioning; the ~500k user figure is self-reported.)*

## 4 · Tabby & Tamara (BNPL) — proof the approach works
**Does well:** Both operate across the UAE/GCC and use real-time AI underwriting (open-banking +
bureau data, proprietary algorithms) to make instant decisions on customers with limited bureau
history — at scale (Tabby: 15M+ users, CBUAE-licensed). They prove the market, the data, and the
instant-decision model all exist here.
**Where it falls short / our gap:** Small, short-tenor BNPL exposures — *not* personal loans or credit
cards. Optimized for checkout conversion, not regulator-grade explainable approve / decline / refer,
and their models are proprietary and opaque. **They validate the approach but don't serve the
regulated personal-lending decision we target.**
*(High confidence they exist and underwrite this way; "thin-file targeting" is implicit in the BNPL
model rather than an explicit claim.)*

## 5 · CRIF "Lending Journey" — the build-vs-buy platform
**Does well:** A white-label, cloud-native, API-based lending platform with digital onboarding, KYC,
open banking, AI-driven creditworthiness and configurable scorecards — and a UAE presence
(ae.crif.digital). A bank could license it instead of building.
**Where it falls short / our gap:** It's a general, configurable *platform* — not specific to thin-file
newcomers and without built-in newcomer explainability. The newcomer alternative-data logic still has
to be designed by the bank. **We are that opinionated, newcomer-specific logic — not a blank toolkit.**
*(High confidence; note the UAE domain is ae.crif.digital, not crif.ae.)*

---

## Our differentiation, in one line
Every competitor solves part of the problem; none owns the whole: **newcomer-specific alternative-data
scoring + UAE policy-check + a regulator-grade, plain-language approve / decline / refer decision the
officer can defend — for the applicants the others leave invisible.**

## Appendix — other players considered (not in the top 5)
- **Wio Bank** — real-time alt-data (POS sales) for instant *SME* lending. Out: SME/merchant cash-flow
  focus, not individual newcomer consumer lending. https://thefintechtimes.com/neo-pay-and-wio-bank-join-forces-to-streamline-sme-financing-in-the-uae/
- **Provenir** — unified AI decisioning, Forrester Wave Leader. Out: horizontal global platform, less
  UAE-local than CRIF; same build-vs-buy angle CRIF already represents. https://www.provenir.com
- **FICO** — decisioning platform, Forrester Wave Leader. Out: generic, not a packaged UAE-newcomer
  solution; same platform angle. https://www.fico.com
- **Synapse Analytics + Lean** — end-to-end AI credit decisioning across the GCC. Out: general
  decisioning/open-banking, not a dedicated thin-file newcomer product.

---

### Sources
- AECB + Nova Credit: https://www.novacredit.com/corporate-blog/aecb-accelerates-cross-border-credit-access · https://www.thenationalnews.com/business/money/2023/03/07/new-uae-expats-can-use-financial-history-from-home-for-faster-credit/
- Newgen: https://newgensoft.com/ae/blog/empowering-middle-eastern-financial-institutions-with-agentic-credit-decisioning/ · https://newgensoft.com/ae/resources/article/ai-credit-decisioning-for-banking/
- Liv: https://www.liv.me/en · https://www.emiratesnbd.com/en/media-center/emirates-nbd-revamps-digital-bank-liv-with-new-value-proposition-targeting-gen-now
- Tabby / Tamara: https://sacra.com/c/tabby/ · https://tabby.ai/en-AE · https://www.checkout.com/payment-methods/tamara
- CRIF: https://www.crif.com/business/services/platforms/lending-journey-platform/ · https://www.ae.crif.digital/

*Full research notes, alt-data sources and regulatory detail: `../working/market-and-domain-research.md`.*
