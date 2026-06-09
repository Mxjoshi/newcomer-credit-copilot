# Deliverable 1 — Problem Statement

**Project:** Newcomer Credit Decisioning Copilot — a B2B AI tool that helps a UAE digital bank decide
whether a newcomer with no local credit history is safe to lend to, and explains the decision.
**Format:** Solo · bring-your-own project (permitted by the capstone brief).
**Phase 1 · Scope & Research** · Status: LOCKED · Last verified: 2026-06-09

---

## The problem (one sentence)

People who are new to the UAE cannot get personal loans or credit cards — even when they are
financially reliable — because the local credit bureau (AECB) has no history on them, and banks have
no fast, consistent way to assess these applicants.

## The four parts

| Part | Detail |
|---|---|
| **Who** | Newcomers / expats with a thin or empty UAE credit file. |
| **What** | They cannot get a personal loan or credit card. |
| **Why** | No local AECB credit history for the bank to assess against. |
| **Cost** | The bank either rejects good customers or spends manual effort assessing them case by case — slowly and inconsistently. |

## Why this problem is real (verified facts)

- **The UAE is ~88% expatriate** (≈88.5% in 2024) — the population this problem affects is the
  overwhelming majority of residents, not an edge case. *(Confidence: High. Widely-cited estimate; UAE
  has no recent formal census, so treat as a credible estimate.)*
- **A new arrival starts with a blank AECB file.** Credit history is not transferable on arrival;
  newcomers face restricted access, lower initial limits, and are often steered to secured products
  or made to wait out a probation period. *(Confidence: High.)*
- **The bureau itself treats this as a real gap:** AECB built the Nova Credit "Foreign Credit Report"
  partnership (launched March 2023) specifically so new expats could import home-country credit
  history — direct evidence the newcomer thin-file problem is recognised at the infrastructure level.
  *(Confidence: High on launch; still-live-in-2026 inferred.)*

## Who we build for

- **Primary user — a Credit Officer at a UAE digital bank (Wio / Liv style).** Reviews incoming
  personal-loan and credit-card applications and decides who is approved. When a newcomer with no AECB
  history arrives, there is no score to lean on, so the officer rejects by default or manually chases
  documents and makes a judgment call — slow, inconsistent between officers, and it loses good
  customers. Not technical. Wants a fast, trustworthy second opinion they can defend to their manager
  and to compliance.
- **Secondary user — the applicant.** The subject of the assessment, *not* an operator of the tool in
  v1.

## Job to be done

> When a newcomer with no UAE credit history applies for a personal loan or credit card, the credit
> officer wants to assess their risk quickly and consistently, so they can approve good applicants
> without fear and decline risky ones with a clear, defensible reason.

- **Trigger:** a newcomer applies; no AECB history exists.
- **Goal:** assess quickly and consistently.
- **Payoff:** confident approvals, defensible declines.

This maps to the three things the product must do: **score** (the assessment) → **policy check**
(consistency) → **explanation** (defensibility).

## Why it matters / impact

Newcomers to the UAE are often financially reliable but locked out of credit because the bureau has
no file on them. Banks lose good customers and assess these cases slowly and inconsistently. This
product gives a credit officer a fast, consistent, defensible decision on a thin-file applicant in
minutes — using the alternative-data approach the industry actually relies on. It widens credit
access for newcomers and wins the bank good customers it would otherwise reject.

---

### Sources
- UAE expatriate share: https://en.wikipedia.org/wiki/Demographics_of_the_United_Arab_Emirates · https://www.globalmediainsight.com/blog/uae-population-statistics/
- Thin-file newcomer problem: https://gulfnews.com/business/banking/new-expats-in-uae-can-access-banking-services-loans-faster-by-importing-their-credit-history-1.1678161200414 · https://www.adcb.com/en/consumer-education-awareness/money-guide-expatriates-uae/bringing-your-credit-history-to-the-uae
- AECB + Nova Credit (Foreign Credit Report): https://www.novacredit.com/corporate-blog/aecb-accelerates-cross-border-credit-access · https://www.thenationalnews.com/business/money/2023/03/07/new-uae-expats-can-use-financial-history-from-home-for-faster-credit/

*Full reasoning and decision log (D1–D9): `../working/product-definition.md`.*
