# Deliverable 2: Competitor Analysis

**Phase 1, Scope & Research.** Status: Locked. Last verified: 2026-06-09.
The brief asks for the top 3 to 5 players, what they do well, and where they fall short.

**Confidence:** high on who each player is and what they do. Medium on the shortfall judgments, which
are reasoned from public materials and marketing rather than internal product teardowns.

---

## How to read this: 5 players, 5 different angles

These are not five versions of the same thing. Each one is a different way a UAE bank could solve the
newcomer problem today: import the history, buy an explainable engine, rely on the incumbent app, lean
on BNPL-style underwriting, or license a decisioning platform. Mapping them this way shows the gap.
None of them fully owns newcomer-specific alternative-data scoring plus a policy check plus a
regulator-grade explainable approve, decline, or refer decision. That gap is our product.

| # | Competitor | The angle it represents |
|---|---|---|
| 1 | AECB and Nova Credit "Credit Passport" | The most direct substitute |
| 2 | Newgen Agentic Credit Decisioning | The explainability rival, closest to our differentiator |
| 3 | Liv (Emirates NBD) | The status-quo incumbent newcomers face today |
| 4 | Tabby and Tamara (BNPL) | Proof that thin-file alt-data underwriting works in the UAE |
| 5 | CRIF "Lending Journey" | The build-vs-buy platform a bank could license |

---

## 1. AECB and Nova Credit "Credit Passport" / Foreign Credit Report: the direct substitute
**Does well:** solves new-to-country by importing the applicant's real home-country bureau history,
not an inference. Bureau-grade data, AECB-backed. Launched March 2023 (first in the GCC), covering
India, the Philippines and the UK at launch, later expanding to more than 10 countries.
**Where it falls short, and our gap:** it only works for applicants from covered countries who have a
usable home-country file. Anyone outside the network, or with a thin home-country history, is still
invisible and still needs salary, tenure and rent data plus a policy check and explainable scoring. We
serve the applicants Credit Passport cannot.
*(Launch and countries: high confidence. Still operational in 2026: inferred from the live product
page, not independently confirmed, as the AECB site was unreachable.)*

## 2. Newgen Agentic Credit Decisioning: the explainability rival
**Does well:** markets an "AI-powered, fully explainable, audit-ready" agentic credit-decisioning
engine for Middle East financial institutions, with plain-language rationales and audit trails. It
sells the same explainability angle we differentiate on. (This is the vendor's own positioning.)
**Where it falls short, and our gap:** it is a general decisioning engine for financial institutions.
There is no public evidence it specialises in no-history newcomers or the specific alternative data
(salary transfer, job tenure, rent) that thin-file UAE applicants need. We are the newcomer-specific
application of that explainability idea, not a generic engine the bank has to configure.
*(High confidence on positioning. "Explainable, audit-ready" is Newgen's marketing claim, not an
independently tested capability.)*

## 3. Liv (Emirates NBD): the status-quo incumbent
**Does well:** the UAE's first and largest digital bank ("over half a million customers" by Liv's own
figure), with instant app-based cards and personal loans up to AED 200k, marketed to newcomers. It is
the default app a newcomer opens.
**Where it falls short, and our gap:** it is a consumer banking brand, not a decisioning engine. There
is no public evidence of alternative-data underwriting for no-history applicants, or of explainable
decline reasons. The newcomer who gets a quiet "no" from Liv is exactly our use case.
*(High confidence on product and positioning. The 500k user figure is self-reported.)*

## 4. Tabby and Tamara (BNPL): proof the approach works
**Does well:** both operate across the UAE and GCC and use real-time underwriting (open banking plus
bureau data, proprietary algorithms) to make instant decisions on customers with limited bureau
history, at scale (Tabby has 15M+ users and a CBUAE licence). They prove the market, the data, and the
instant-decision model all exist here.
**Where it falls short, and our gap:** these are small, short-tenor BNPL exposures, not personal loans
or credit cards. They are built for checkout conversion, not a regulator-grade explainable approve,
decline, or refer decision, and the models are proprietary and opaque. They validate the approach but
do not serve the regulated personal-lending decision we target.
*(High confidence they exist and underwrite this way. Thin-file targeting is implicit in the BNPL
model rather than an explicit claim.)*

## 5. CRIF "Lending Journey": the build-vs-buy platform
**Does well:** a white-label, cloud-native, API-based lending platform with digital onboarding, KYC,
open banking, AI-driven creditworthiness and configurable scorecards, with a UAE presence
(ae.crif.digital). A bank could license it instead of building.
**Where it falls short, and our gap:** it is a general, configurable platform, not specific to
thin-file newcomers and without built-in newcomer explainability. The newcomer alternative-data logic
still has to be designed by the bank. We are that opinionated, newcomer-specific logic, not a blank
toolkit.
*(High confidence. Note the UAE domain is ae.crif.digital, not crif.ae.)*

---

## Our differentiation, in one line
Every competitor solves part of the problem. None owns the whole: newcomer-specific alternative-data
scoring, a UAE policy check, and a regulator-grade plain-language approve, decline, or refer decision
the officer can defend, for the applicants the others leave invisible.

## Appendix: other players considered (not in the top 5)
- **Wio Bank:** real-time alt-data (POS sales) for instant SME lending. Out of the top 5 because its
  focus is SME and merchant cash-flow, not individual newcomer consumer lending. https://thefintechtimes.com/neo-pay-and-wio-bank-join-forces-to-streamline-sme-financing-in-the-uae/
- **Provenir:** unified AI decisioning, Forrester Wave Leader. Out because it is a horizontal global
  platform, less UAE-local than CRIF, and covers the same build-vs-buy angle CRIF already represents. https://www.provenir.com
- **FICO:** decisioning platform, Forrester Wave Leader. Out because it is generic, not a packaged
  UAE-newcomer solution, and covers the same platform angle. https://www.fico.com
- **Synapse Analytics and Lean:** end-to-end AI credit decisioning across the GCC. Out because it is
  general decisioning and open banking, not a dedicated thin-file newcomer product.

---

### Sources
- AECB and Nova Credit: https://www.novacredit.com/corporate-blog/aecb-accelerates-cross-border-credit-access , https://www.thenationalnews.com/business/money/2023/03/07/new-uae-expats-can-use-financial-history-from-home-for-faster-credit/
- Newgen: https://newgensoft.com/ae/blog/empowering-middle-eastern-financial-institutions-with-agentic-credit-decisioning/ , https://newgensoft.com/ae/resources/article/ai-credit-decisioning-for-banking/
- Liv: https://www.liv.me/en , https://www.emiratesnbd.com/en/media-center/emirates-nbd-revamps-digital-bank-liv-with-new-value-proposition-targeting-gen-now
- Tabby and Tamara: https://sacra.com/c/tabby/ , https://tabby.ai/en-AE , https://www.checkout.com/payment-methods/tamara
- CRIF: https://www.crif.com/business/services/platforms/lending-journey-platform/ , https://www.ae.crif.digital/

*Full research notes, alt-data sources and regulatory detail: `../working/market-and-domain-research.md`.*
