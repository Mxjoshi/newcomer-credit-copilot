# Deliverable 1: Problem Statement

**Project:** Newcomer Credit Decisioning Copilot. A B2B tool that helps a UAE digital bank decide
whether a newcomer with no local credit history is safe to lend to, and explains the decision.
**Format:** Solo. Bring-your-own project (allowed by the capstone brief).
**Phase 1, Scope & Research.** Status: Locked. Last verified: 2026-06-09.

---

## The problem in one sentence

People who are new to the UAE cannot get personal loans or credit cards, even when they are
financially reliable, because the local credit bureau (AECB) has no history on them, and banks have
no fast, consistent way to assess them.

## The four parts

| Part | Detail |
|---|---|
| **Who** | Newcomers and expats with a thin or empty UAE credit file. |
| **What** | They cannot get a personal loan or credit card. |
| **Why** | No local AECB credit history for the bank to assess against. |
| **Cost** | The bank either rejects good customers or assesses them by hand, slowly and inconsistently. |

## Why the problem is real (verified facts)

- The UAE is about 88% expatriate (roughly 88.5% in 2024). This is the majority of residents, not an
  edge case. Confidence: high. It is a widely cited estimate; the UAE has no recent formal census, so
  treat it as a credible estimate rather than a census figure.
- A new arrival starts with a blank AECB file. Credit history does not transfer on arrival, so
  newcomers face restricted access, lower starting limits, and are often steered to secured products
  or made to wait out a probation period. Confidence: high.
- The bureau itself treats this as a real gap. AECB built the Nova Credit "Foreign Credit Report"
  partnership (launched March 2023) so new expats could import home-country credit history. That is
  direct evidence the problem is recognised at the infrastructure level. Confidence: high on launch,
  inferred for still-live status.

## Who we build for

**Primary user: a credit officer at a UAE digital bank (Wio or Liv style).** They review incoming
personal loan and credit card applications and decide who gets approved. When a newcomer with no AECB
history applies, there is no score to lean on, so the officer rejects by default or chases documents
by hand and makes a judgment call. That is slow, varies between officers, and loses good customers.
The officer is not technical. They want a fast, trustworthy second opinion they can defend to their
manager and to compliance.

**Secondary user: the applicant.** They are the subject of the assessment, not an operator of the
tool in v1.

## Job to be done

> When a newcomer with no UAE credit history applies for a personal loan or credit card, the credit
> officer wants to assess their risk quickly and consistently, so they can approve good applicants
> without fear and decline risky ones with a clear, defensible reason.

- Trigger: a newcomer applies and has no AECB history.
- Goal: assess quickly and consistently.
- Payoff: confident approvals, defensible declines.

This maps to the three things the product does: score (the assessment), policy check (consistency),
explanation (defensibility).

## Why it matters

Newcomers to the UAE are often financially reliable but locked out of credit because the bureau has
no file on them. Banks lose good customers and assess these cases slowly and inconsistently. The
product gives a credit officer a fast, consistent, defensible decision on a thin-file applicant in
minutes, using the alternative-data approach the industry already relies on. It widens credit access
for newcomers and wins the bank good customers it would otherwise reject.

---

### Sources
- UAE expatriate share: https://en.wikipedia.org/wiki/Demographics_of_the_United_Arab_Emirates , https://www.globalmediainsight.com/blog/uae-population-statistics/
- Thin-file newcomer problem: https://gulfnews.com/business/banking/new-expats-in-uae-can-access-banking-services-loans-faster-by-importing-their-credit-history-1.1678161200414 , https://www.adcb.com/en/consumer-education-awareness/money-guide-expatriates-uae/bringing-your-credit-history-to-the-uae
- AECB and Nova Credit (Foreign Credit Report): https://www.novacredit.com/corporate-blog/aecb-accelerates-cross-border-credit-access , https://www.thenationalnews.com/business/money/2023/03/07/new-uae-expats-can-use-financial-history-from-home-for-faster-credit/

*Full reasoning and decision log (D1 to D9): `../working/product-definition.md`.*
