# Ground Truth: 24 Labeled Synthetic Profiles (LOCKED)

The evaluation set for Phase 4, written and locked during the Phase 2 review. Decision M5.

---

## Labeling protocol (read before the table)

1. **Labels locked 2026-06-11, before any scorecard weight exists.** No point weights, band
   cut-offs, or rule code existed when these outcomes were assigned. The labels are judgmental
   ground truth (what a careful human underwriter would decide under our locked policy), not
   outputs of the system. That ordering is the point: the system will be graded against labels
   it could not have influenced.
2. **Phase 3 must never edit this file.** Weights and thresholds get tuned against intuition and
   the policy, never against these rows. This file is the exam; the scorecard is the student.
3. **Phase 4 measures against this file unchanged.** The brief's eval method (run diverse sample
   inputs, manually verify against ground truth, compute metrics vs baseline) runs on exactly
   these 24 rows. The impact view on Screen 3 uses the same rows.
4. **Distribution is engineered, not a market claim:** 8 approve, 8 decline, 8 refer, chosen to
   exercise every rule and boundary. Real-world outcome rates would differ; we never present
   these proportions as market data.
5. **Labeling constants (locked with this file).** The boundary cases below are exact only under
   these values, so Phase 3 adopts them: PRODUCT_MIN_SALARY = AED 8,000 (personal loan) and
   AED 5,000 (credit card); FLAT_ANNUAL_RATE = 0.08; AMOUNT_SALARY_MULTIPLE = 20. The 50 percent
   debt burden cap and the 20x salary multiple follow UAE-standard practice (flagged: confirm
   against the CBUAE regulation text during Phase 3 primary-sourcing); the product minimums and
   the 8 percent flat rate are our product assumptions, stated as such.
6. **All people are synthetic.** Names are invented for readability; no real personal data
   exists anywhere in this set (Phase 1 cut list).

Installment math used for the DBR column checks:
new_installment = amount_aed * (1 + 0.08 * term_months / 12) / term_months, per rule 2 in the
data model.

---

## The 24 profiles

Column key: months = months_in_uae, tenure = job_tenure_months, salary = monthly_salary_aed,
oblig = existing_monthly_obligations_aed, visa rem = visa_months_remaining, amount = amount_aed,
term = term_months. Employer categories and rent history values are the data-model enums.

| id | full_name | months | visa_type | employment_status | tenure | employer_category | salary | rent_history | oblig | age_years | visa rem | product | amount | term | expected_outcome | rationale |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| GT-01 | Arjun Mehta | 10 | employment | employed | 9 | government | 18,000 | on_time_6plus | 0 | 32 | 30 | personal_loan | 60,000 | 24 | approve | Strong on all five factors, every rule passes with room. |
| GT-02 | Priya Nair | 8 | employment | employed | 6 | mainland_private | 14,000 | on_time_6plus | 0 | 29 | 28 | personal_loan | 40,000 | 18 | approve | EDGE: tenure exactly 6 months sits on the rule 4 boundary and passes; rest is strong. |
| GT-03 | Joseph Thomas | 9 | employment | employed | 8 | free_zone | 8,000 | on_time_6plus | 0 | 27 | 26 | personal_loan | 24,000 | 12 | approve | EDGE: salary exactly at the AED 8,000 product minimum passes rule 1; modest ask, clean record. |
| GT-04 | Chen Wei | 12 | employment | employed | 10 | mainland_private | 10,000 | on_time_6plus | 2,300 | 31 | 24 | personal_loan | 30,000 | 12 | approve | EDGE: DBR exactly 50 percent (2,300 + 2,700 installment on 10,000) passes rule 2 at the cap; rest is strong. |
| GT-05 | Samuel Okafor | 11 | employment | employed | 10 | government | 25,000 | on_time_6plus | 0 | 62 | 40 | personal_loan | 80,000 | 36 | approve | EDGE: age at maturity exactly 65 (62 + 3 years) passes rule 3 at the boundary; strong profile. |
| GT-06 | Aisha Rahman | 7 | employment | employed | 7 | free_zone | 12,000 | on_time_6plus | 0 | 26 | 22 | credit_card | 15,000 | 12 | approve | Clean credit card case, all rules pass, solid rent record. |
| GT-07 | Daniel Petrov | 14 | golden | employed | 12 | mainland_private | 35,000 | on_time_6plus | 3,000 | 38 | 96 | personal_loan | 150,000 | 36 | approve | Golden visa, long tenure, DBR about 23 percent, everything passes comfortably. |
| GT-08 | Maria Santos | 9 | employment | employed | 8 | sme | 9,500 | on_time_6plus | 0 | 30 | 26 | personal_loan | 20,000 | 12 | approve | Modest ask well inside every rule, consistent rent record despite SME employer. |
| GT-09 | Hassan Karimi | 5 | employment | employed | 4 | sme | 6,500 | on_time_under_6 | 0 | 28 | 20 | personal_loan | 30,000 | 24 | decline | Salary below the AED 8,000 product minimum, rule 1 hard fail. |
| GT-10 | Olivia Brown | 10 | employment | employed | 9 | mainland_private | 12,000 | on_time_6plus | 4,000 | 33 | 30 | personal_loan | 60,000 | 24 | decline | DBR 57.5 percent (4,000 + 2,900 installment on 12,000) breaches the 50 percent cap, rule 2 hard fail. |
| GT-11 | Rajesh Kumar | 3 | other | unemployed | 0 | other | 0 | none | 0 | 35 | 10 | personal_loan | 20,000 | 12 | decline | Unemployed with no income, fails rule 1 outright. |
| GT-12 | Victor Adeyemi | 11 | employment | employed | 10 | free_zone | 28,000 | late_payments | 0 | 36 | 30 | personal_loan | 100,000 | 36 | decline | EDGE: high salary but the only payment-behavior signal is negative; conservative stance declines (D6). |
| GT-13 | Lin Feng | 12 | employment | employed | 11 | mainland_private | 8,500 | on_time_6plus | 0 | 34 | 30 | personal_loan | 180,000 | 48 | decline | Amount exceeds 20x salary (170,000), rule 6 hard fail; DBR also breaches the cap. |
| GT-14 | George Mathew | 10 | employment | employed | 9 | government | 20,000 | on_time_6plus | 0 | 64 | 28 | personal_loan | 50,000 | 24 | decline | Age at maturity 66 exceeds the 65 limit, rule 3 hard fail. |
| GT-15 | Tanya Ivanova | 2 | employment | employed | 2 | other | 8,200 | none | 0 | 24 | 8 | personal_loan | 100,000 | 36 | decline | Passes every hard rule but every risk signal is weak (2 months in UAE and in job, no rent history, large ask): high-risk band declines on score alone. |
| GT-16 | Ahmed Sayed | 4 | employment | employed | 3 | mainland_private | 15,000 | late_payments | 1,000 | 30 | 20 | personal_loan | 60,000 | 18 | decline | Negative rent behavior on top of 3-month tenure: rules mostly pass but the combined signals put it in the high-risk band. |
| GT-17 | Nadia Hussain | 9 | employment | employed | 8 | government | 16,000 | on_time_6plus | 0 | 31 | 18 | personal_loan | 60,000 | 24 | refer | EDGE: visa (18 months) shorter than the 24-month term, rule 5 fails at severity refer; everything else strong. |
| GT-18 | Wang Jun | 3 | golden | employed | 2 | mainland_private | 30,000 | on_time_under_6 | 0 | 40 | 110 | personal_loan | 90,000 | 24 | refer | EDGE: golden visa with 2 months tenure: residency is secure but employment is unproven, rule 4 refer. |
| GT-19 | Elena Garcia | 5 | employment | employed | 7 | free_zone | 22,000 | none | 0 | 33 | 24 | personal_loan | 70,000 | 24 | refer | EDGE: strong salary but no rent history at all: the alt-data that stands in for the credit file is missing, so a human verifies. |
| GT-20 | Layla Mansour | 4 | employment | employed | 3 | free_zone | 12,000 | on_time_6plus | 0 | 27 | 20 | personal_loan | 40,000 | 18 | refer | The borderline case from the UI worked example: income fine, tenure too short to confirm stability. |
| GT-21 | Omar Sheikh | 12 | employment | self_employed | 12 | sme | 18,000 | on_time_6plus | 2,000 | 37 | 30 | personal_loan | 60,000 | 24 | refer | Self-employed income is harder to verify; rules pass, a human checks the bank statements. |
| GT-22 | Kavya Pillai | 6 | employment | employed | 7 | sme | 9,000 | on_time_under_6 | 500 | 26 | 26 | personal_loan | 35,000 | 24 | refer | Medium on every factor, nothing fails: the textbook middle band goes to a human. |
| GT-23 | Ibrahim Diallo | 4 | employment | employed | 4 | free_zone | 7,000 | on_time_under_6 | 0 | 25 | 18 | credit_card | 8,000 | 12 | refer | Card salary minimum passes but tenure of 4 months trips rule 4 (refer); thin record overall. |
| GT-24 | Sophie Martin | 5 | employment | employed | 8 | mainland_private | 11,000 | on_time_under_6 | 2,500 | 29 | 20 | personal_loan | 40,000 | 18 | refer | DBR about 45 percent sits near the cap with an under-6-months rent record: passes, but prudence refers. |

---

## Edge-case coverage checklist (required cases, each present above)

| Required edge case | Row |
|---|---|
| Tenure exactly 6 months | GT-02 |
| Salary exactly at the product minimum | GT-03 |
| DBR exactly at 50 percent | GT-04 |
| Visa shorter than the loan term | GT-17 |
| Golden visa with 2 months tenure | GT-18 |
| High salary with late rent payments | GT-12 |
| Age at the maturity boundary | GT-05 |
| Strong salary with no rent history | GT-19 |

Distribution check: GT-01 to GT-08 approve, GT-09 to GT-16 decline, GT-17 to GT-24 refer
(8 / 8 / 8).
