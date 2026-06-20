# Phase 4 evals: the 24 generated explanations

Captured from the same run that produced `eval-results.md` (ruleset uae-v1.0) on 2026-06-20.
This is the officer-facing text the manual rubric pass scores for completeness, clarity, and
consistency (faithfulness and grounding are already enforced in code by the validator). The model
explanation varies run to run, so this is one snapshot; re-run `npm run eval` to refresh it.

## GT-01 Arjun Mehta

Recommendation: **APPROVE** | locked label: approve | match: yes | grounding: passed

The recommendation is to approve Arjun Mehta's personal loan of AED 60,000 over 24 months. Two factors drove this outcome most strongly: a government employer placing him in the highest stability tier, and six or more months of on-time rent payments providing the strongest available behavioral evidence of repayment discipline. The application scores 90 out of 100 and passes all six policy rules, with a debt burden ratio of 16.1 percent well inside the rule-2 cap of 50 percent and a visa with 30 months remaining covering the full term under rule-5.

Reasons:
- Government employer, scoring maximum points for employment stability
- Six or more months of on-time rent, the strongest behavioral repayment signal available
- Monthly salary of AED 18,000 is more than double the product minimum, providing a strong repayment cushion
- Debt burden ratio of 16.1 percent is well within the 50 percent cap set by rule-2
- Nine months of continuous employment exceeds the six-month minimum required by rule-4
- Visa has 30 months remaining, fully covering the 24-month loan term under rule-5

## GT-02 Priya Nair

Recommendation: **APPROVE** | locked label: approve | match: yes | grounding: passed

The recommendation is to approve Priya Nair's personal loan of AED 40,000 over 18 months. The decision is driven by two standout factors: six or more months of on-time rent payments, which provided the strongest behavioral evidence available, and a salary of AED 14,000 that comfortably exceeds the product minimum. All six policy rules passed, including rule-2, where the debt burden ratio sits at only 17.8 percent against the 50 percent cap, and rule-5, confirming the visa covers the full loan term. The overall score of 82 out of 100 places the applicant in the low risk band.

Reasons:
- Rent payment history: on-time for 6 or more months, earning full points and providing the key behavioral signal
- Monthly salary of AED 14,000 is well above the AED 8,000 product minimum (rule-1)
- Debt burden ratio of 17.8 percent is well within the 50 percent cap (rule-2)
- Employment tenure of 6 months meets the continuous employment requirement (rule-4)
- Visa has 28 months remaining, covering the full 18-month term (rule-5)
- Total score of 82 out of 100 places the applicant in the low risk band

## GT-03 Joseph Thomas

Recommendation: **APPROVE** | locked label: approve | match: yes | grounding: passed

Joseph Thomas is recommended for approval on a low risk band, with all six policy rules passed and a total score of 70 out of 100. The two strongest drivers are a clean rent payment history of six or more months (the highest behavioral signal available) and a debt burden ratio of 27 percent, well inside the 50 percent cap under rule-2. Salary meets the product minimum exactly at AED 8,000 (rule-1), and the free zone employer category and nine months in the UAE contribute mid-tier points that support but do not elevate the overall score. No counterfactuals are flagged, and the visa covers the full 12-month term under rule-5.

Reasons:
- Rent payment history on time for 6 or more months: highest points awarded and strongest behavioral evidence on file
- Debt burden ratio at 27 percent, comfortably within the 50 percent cap (rule-2)
- All six policy rules passed with no exceptions
- Salary meets the product minimum of AED 8,000 but with little headroom (rule-1)
- Free zone employer category scores at a mid-stability tier, below government or mainland
- Nine months in the UAE and eight months of job tenure place the applicant in mid-tier ranges for residency and employment scoring

## GT-04 Chen Wei

Recommendation: **APPROVE** | locked label: approve | match: yes | grounding: passed

Chen Wei is approved for a personal loan of AED 30,000 over 12 months, rated low risk with a score of 82 out of 100. The two strongest drivers are a clean rent payment history of six or more consecutive on-time payments, which provided the highest single block of points, and a full 12 months of UAE residency that established a solid local footprint. All six policy rules passed, including rule-2, where the debt burden ratio lands exactly at the 50 percent cap, leaving no headroom to spare. The requested amount is well within the rule-6 salary multiple limit and the visa covers the full term under rule-5.

Reasons:
- Rent payment history: six or more months on time, the strongest behavioral signal and highest scoring factor
- 12 months in UAE on an employment visa, meeting the top residency tier
- Salary of AED 10,000 clears the AED 8,000 product minimum under rule-1
- Job tenure of 10 months satisfies the six-month continuous employment requirement under rule-4
- Debt burden ratio of exactly 50 percent passes rule-2 but leaves no further borrowing capacity
- Requested amount of AED 30,000 is well below the rule-6 cap of AED 200,000

## GT-05 Samuel Okafor

Recommendation: **APPROVE** | locked label: approve | match: yes | grounding: passed

Samuel Okafor is approved for a personal loan of AED 80,000 over 36 months, rated low risk with a score of 90 out of 100. The two strongest drivers are his government employer (highest stability tier, full points under the employer category factor) and his six or more months of on-time rent payments, which provide the most reliable behavioral evidence available. All six policy rules passed cleanly, with the debt burden ratio at 11 percent against a 50 percent cap and his age at maturity landing exactly at the rule-3 limit of 65. No counterfactual conditions apply.

Reasons:
- Government employer category awarded maximum stability points
- Six or more months of on-time rent history, the strongest behavioral signal available
- Monthly salary of AED 25,000 is more than three times the product minimum, providing strong repayment headroom
- Debt burden ratio of 11 percent is well within the 50 percent cap under rule-2
- Visa has 40 months remaining, covering the full 36 month term under rule-5
- Age at loan maturity of 65 meets the rule-3 ceiling exactly, with no margin to extend the term

## GT-06 Aisha Rahman

Recommendation: **APPROVE** | locked label: approve | match: yes | grounding: passed

Aisha Rahman is recommended for approval at a low risk band, with a scorecard total of 82 out of 100. The two strongest drivers are her six-plus months of on-time rent payments, which provide the clearest behavioral evidence of financial discipline, and a monthly salary of AED 12,000 that is well above the AED 5,000 product minimum, resulting in a debt burden ratio of only 11.3 percent against the 50 percent cap under rule-2. All six policy rules passed cleanly, including rule-4 on employment tenure at seven months and rule-5 confirming her visa covers the full 12-month term. The mid-tier employer category score under the free zone classification is the only modest drag on the scorecard but is not sufficient to alter the outcome.

Reasons:
- Rent payment history on time for 6-plus months, maximum behavioral score points awarded
- Monthly salary AED 12,000 well above AED 5,000 product minimum, debt burden ratio 11.3 percent (rule-2 cap 50 percent)
- All six policy rules passed with no exceptions
- Employment tenure of 7 months clears the 6-month continuous employment requirement (rule-4)
- Visa validity of 22 months covers the 12-month product term (rule-5)
- Free zone employer category is the lowest-scoring factor but remains within the approved risk band

## GT-07 Daniel Petrov

Recommendation: **APPROVE** | locked label: approve | match: yes | grounding: passed

Daniel Petrov is approved for a personal loan of AED 150,000 over 36 months, rated low risk with a score of 96 out of 100. The decision is driven by two standout factors: a monthly salary of AED 35,000 that is well above the product minimum and a golden visa with 96 months remaining that substantially reduces departure risk. All six policy rules passed without exception, and the debt burden ratio sits at 23.3 percent, well inside the rule-2 cap of 50 percent. Six or more months of on-time rent payments further confirm a strong repayment profile.

Reasons:
- Salary of AED 35,000 is more than four times the AED 8,000 product minimum, providing a strong repayment cushion (rule-1)
- Debt burden ratio of 23.3 percent is comfortably within the 50 percent cap (rule-2)
- Golden visa with 96 months remaining covers the full loan term and lowers departure risk (rule-5)
- Twelve months of continuous employment with a mainland private employer signals stable income (rule-4)
- Six or more months of on-time rent payments represent the strongest available behavioral credit evidence
- Score of 96 out of 100 places the applicant firmly in the low risk band

## GT-08 Maria Santos

Recommendation: **REFER** | locked label: approve | match: NO | grounding: passed

This application is recommended for refer at medium risk. All six policy rules pass and the debt burden ratio is a comfortable 18.9 percent, but the total score of 66 out of 100 falls short of the 70-point threshold for a low-risk approval. The two factors holding the score down are Monthly salary, which scores only 8 of 20 points because the AED 9,500 salary meets the minimum with little headroom, and Employer category, which scores 8 of 20 points due to the SME classification carrying higher income-continuity risk. Four additional points would move this case to the low-risk band, achievable if the applicant can demonstrate a higher salary or a stronger employer category at a future application.

Reasons:
- Score of 66 out of 100 does not reach the 70-point low-risk threshold, triggering a refer outcome
- Monthly salary of AED 9,500 scores only 8 of 20 points, meeting the product minimum with little headroom
- SME employer category scores only 8 of 20 points, reflecting higher income-continuity risk
- UAE residency of only 9 months and job tenure of 8 months limit points in the months-in-UAE and employment factors
- Positive offset: rent payment history is on time for 6 or more months, earning full points on the strongest available behavioral indicator
- All policy rules (rule-1 through rule-6) pass, so the refer is driven by scorecard weakness, not a hard policy breach

## GT-09 Hassan Karimi

Recommendation: **DECLINE** | locked label: decline | match: yes | grounding: passed

The recommendation is decline. Hassan Karimi fails three mandatory policy rules: rule-1 (salary of AED 6,500 is below the AED 8,000 product minimum), rule-4 (4 months tenure is below the required 6 months), and rule-5 (visa has 20 months remaining, which is shorter than the 24-month term). The scorecard total of 36 out of 100 also places him firmly in the high-risk band, well short of the 70-point threshold, with the largest gaps on monthly salary and employment tenure. To reconsider, the applicant would need a salary at or above AED 8,000, at least 6 months of continuous employment, and either a shorter loan term within the visa validity or a visa renewal covering the full 24 months.

Reasons:
- Rule-1 fail: salary AED 6,500 is below the AED 8,000 product minimum, scoring zero points on the salary factor
- Rule-4 fail: job tenure is 4 months, two months short of the required 6 months of continuous employment
- Rule-5 fail: visa has 20 months remaining, insufficient to cover the 24-month loan term
- Scorecard total is 36 of 100, well below the 70-point low-risk threshold
- SME employer category and 5 months in UAE contribute low scores, reflecting income-continuity and footprint risk
- No path to approval without salary increase, tenure completion, and visa coverage alignment with the loan term

## GT-10 Olivia Brown

Recommendation: **DECLINE** | locked label: decline | match: yes | grounding: passed

The application is declined because rule-2 is breached: total monthly obligations including the new installment reach 57.5 percent of salary, above the 50 percent cap. Olivia Brown's scorecard is strong at 82 out of 100, with full points for rent history and solid marks across salary, tenure, and employer category, so the decline is entirely policy-driven rather than creditworthiness-driven. The single path to approval at the requested term is reducing the loan amount to approximately AED 41,379, which would bring the debt burden ratio within the 50 percent limit under rule-2. All other policy rules passed, so no further changes are required if the amount is reduced.

Reasons:
- Debt burden ratio of 57.5 percent fails rule-2, which caps total obligations at 50 percent of monthly salary
- Existing monthly obligations of AED 4,000 against a salary of AED 12,000 leave limited room for a new installment
- Reducing the requested amount to approximately AED 41,379 is the counterfactual that resolves the rule-2 breach
- Scorecard of 82 out of 100 (risk band low) reflects strong rent history, adequate tenure, and a mainland private employer
- All other rules (rule-1, rule-3, rule-4, rule-5, rule-6) passed without issue
- Decline is policy-driven only; the applicant's credit profile is otherwise acceptable

## GT-11 Rajesh Kumar

Recommendation: **DECLINE** | locked label: decline | match: yes | grounding: passed

This application is declined. Rajesh Kumar is unemployed with a monthly salary of AED 0, which simultaneously fails rule-1 (product minimum of AED 8,000), rule-2 (debt burden ratio uncomputable), rule-4 (zero months tenure against a six-month requirement), and rule-6 (requested amount exceeds 20 times salary, leaving an effective cap of AED 0). A fifth hard stop, rule-5, is also triggered because the visa has only 10 months remaining against a 12-month term. The scorecard reflects the same picture, with a total of 16 out of 100 points driven mainly by zero scores on salary and employment. For this application to be reconsidered, the applicant would need to secure employment with a salary of at least AED 8,000 sustained for six months, and either reduce the loan term to within the visa validity or renew the visa to cover the full term.

Reasons:
- Salary is AED 0, below the AED 8,000 product minimum (rule-1)
- Debt burden ratio cannot be computed on zero salary, breaching the 50 percent cap (rule-2)
- Employment tenure is zero months, failing the six-month continuous employment requirement (rule-4)
- Visa has 10 months remaining, shorter than the 12-month loan term (rule-5)
- Requested AED 20,000 exceeds the 20-times-salary cap, effectively AED 0 (rule-6)
- Scorecard total is 16 of 100, with zero points on both salary and employment factors, far below the low-risk threshold of 70

## GT-12 Victor Adeyemi

Recommendation: **REFER** | locked label: decline | match: NO | grounding: passed

This application is referred rather than approved, driven by two issues: a hard policy failure on rule-5 and a borderline score of 62 out of 100. Victor Adeyemi's visa has only 30 months remaining against a requested 36-month term, which means the visa does not cover the full loan period. The score falls short of the 70-point threshold for a low-risk band, with the rent payment history scoring zero points due to recorded late payments, and the free-zone employer category contributing only a mid-tier score. To move toward approval, the applicant should either shorten the term to 30 months or provide evidence of a visa renewal covering the full term to clear rule-5, and the rent payment history issue is the single largest score gap available to address.

Reasons:
- Rule-5 fail: visa has 30 months remaining but the requested loan term is 36 months
- Score of 62 out of 100 does not reach the 70-point low-risk threshold
- Rent payment history scored zero due to late payments, the largest single score gap
- Free-zone employer category contributes only mid-tier points, limiting the employer score
- Shortening the term to 30 months or renewing the visa to cover 36 months would clear rule-5
- Improving rent payment behavior or employer category are the most impactful paths to a higher score

## GT-13 Lin Feng

Recommendation: **DECLINE** | locked label: decline | match: yes | grounding: passed

This application is declined. Three hard policy rules failed: rule-2 (debt burden ratio of 58.2 percent exceeds the 50 percent cap), rule-5 (visa valid for only 30 months against a 48-month term), and rule-6 (requested AED 180,000 exceeds the AED 170,000 salary-multiple cap). The scorecard result of 78 out of 100 in the low risk band is solid, with strong rent history and established UAE footprint, but the policy failures cannot be overridden by score alone. The application could be reconsidered if Lin Feng reduces the amount to AED 154,545 or below (clearing both rule-2 and rule-6) and either shortens the term to 30 months or provides evidence of visa renewal covering the full 48-month term (clearing rule-5).

Reasons:
- Rule-2 failed: monthly debt burden ratio is 58.2 percent, above the 50 percent policy cap
- Rule-5 failed: visa has 30 months remaining but the requested term is 48 months
- Rule-6 failed: requested AED 180,000 exceeds the 20x salary cap of AED 170,000
- Scorecard is 78 out of 100 (low risk band), but policy rule failures mandate decline
- Reducing the requested amount to AED 154,545 would address rule-2 and rule-6 simultaneously
- Visa renewal covering 48 months, or shortening the term to 30 months, would clear rule-5

## GT-14 George Mathew

Recommendation: **DECLINE** | locked label: decline | match: yes | grounding: passed

This application is declined solely because of rule-3: George Mathew will be 66.0 years old at loan maturity, exceeding the maximum permitted age of 65 at end of term. Every other policy rule passes, and the scorecard returns a strong 90 out of 100 in the low-risk band, supported by a government employer, zero existing obligations, and a clean rent history. The decline can be resolved by reducing the loan term to 12 months or less, which would keep his age at maturity within the 65-year limit. No other changes to the application are required.

Reasons:
- Rule-3 failure: age at maturity projected at 66.0, above the 65-year policy ceiling
- Counterfactual: a term of 12 months or less resolves the age-at-maturity breach
- Score of 90 out of 100 places applicant in the low-risk band, no scorecard concerns
- Government employer and 9-month tenure reflect high employment stability
- Debt burden ratio of 12.1 percent is well within the 50 percent cap (rule-2)
- Visa validity of 28 months covers the requested 24-month term (rule-5)

## GT-15 Tanya Ivanova

Recommendation: **DECLINE** | locked label: decline | match: yes | grounding: passed

The recommendation is decline. Two hard policy rules cannot be waived: rule-4 requires six months of continuous employment and Tanya Ivanova has only two, and rule-5 requires the visa to cover the full loan term but her visa has eight months remaining against a 36-month term. Beyond the policy failures, the scorecard total is 26 out of 100, well below the 70-point threshold for a low-risk band, with the largest deficits on employment tenure and employer category. If she reapplies after four more months of employment, secures a visa renewal covering 36 months, and builds tenure with a categorized employer, both blocking rules would clear and the score gap would narrow materially.

Reasons:
- rule-4 failed: job tenure is 2 months, six months of continuous employment is required
- rule-5 failed: visa has 8 months remaining, which does not cover the 36-month loan term
- scorecard total is 26 of 100, far below the 70-point low-risk threshold
- employment and tenure scored 4 of 20, the largest single gap on the scorecard
- employer category scored 4 of 20, reflecting an uncategorized employer with unknown stability
- salary meets the minimum and debt burden ratio is within policy, so those factors are not the obstacle

## GT-16 Ahmed Sayed

Recommendation: **REFER** | locked label: decline | match: NO | grounding: passed

This application is referred rather than approved, driven by two weaknesses: a failed policy rule and a below-threshold score. Rule-4 requires six months of continuous employment and Ahmed Sayed has only three months of tenure, which is an automatic policy fail regardless of other factors. The scorecard total of 48 out of 100 also falls well short of the 70 points required for a low-risk band, with the largest gaps on rent payment history (0 of 20 points, due to late payments) and employment tenure (8 of 20 points). Reapplying in three months would clear rule-4, and demonstrating on-time rent payments would recover up to 20 scorecard points, bringing the application materially closer to approval.

Reasons:
- Rule-4 fail: job tenure is 3 months against a required minimum of 6 months
- Scorecard total of 48 out of 100 is below the 70-point threshold for low risk
- Rent payment history scored zero due to late payments, the single largest scorecard gap
- Employment tenure scored only 8 of 20 points because stability is not yet confirmed after 3 months
- Recent UAE arrival (4 months) contributes limited local footprint to the scorecard
- Salary and debt burden ratio are both within policy limits and are not drivers of the refer outcome

## GT-17 Nadia Hussain

Recommendation: **REFER** | locked label: refer | match: yes | grounding: passed

This application is referred because rule-5 is not satisfied: Nadia Hussain's employment visa has 18 months remaining, which is shorter than the requested 24-month loan term. All other policy rules pass, and the scorecard returns 90 out of 100 with a low risk band, supported by a government employer, a salary of AED 16,000 against a debt burden ratio of 18.1 percent, and six or more months of on-time rent payments. The refer can be resolved in one of two ways: the applicant provides evidence of visa renewal covering the full 24-month term, or the loan term is reduced to 18 months or fewer to fall within the current visa validity.

Reasons:
- Rule-5 failure: visa validity of 18 months does not cover the 24-month loan term
- Strong scorecard of 90 out of 100, placing the applicant in the low risk band
- Government employer provides the highest stability tier in the scoring model
- Salary of AED 16,000 is double the product minimum, with a debt burden ratio of only 18.1 percent
- Six or more months of on-time rent payments, the strongest available behavioral evidence
- Resolution options: shorten term to 18 months or produce a visa renewal covering the full term

## GT-18 Wang Jun

Recommendation: **REFER** | locked label: refer | match: yes | grounding: passed

This application is referred rather than approved, driven by two linked weaknesses: Wang Jun fails rule-4 (minimum six months of continuous employment) with only two months of tenure, and the overall score of 62 out of 100 falls short of the 70-point threshold for a low-risk band. All other policy rules pass cleanly, the debt burden ratio is 14.5 percent, and the golden visa substantially reduces departure risk. Approval can be reconsidered in approximately four months once the six-month employment requirement is met under rule-4, and additional score points can accumulate on the Employment and tenure and Months in UAE and visa factors.

Reasons:
- rule-4 failed: job tenure is 2 months against a required 6 months minimum
- score of 62 out of 100 is below the 70-point low-risk threshold
- Employment and tenure factor is very weak, scoring 4 out of 20 points due to unproven income stability
- Months in UAE and visa factor scored 10 out of 20, limited by only 3 months of UAE residence
- All other policy rules (rule-1, rule-2, rule-3, rule-5, rule-6) passed without issue
- Clearing rule-4 in 4 more months would be the primary path to approval

## GT-19 Elena Garcia

Recommendation: **REFER** | locked label: refer | match: yes | grounding: passed

The recommendation is refer, with a medium risk band. Elena Garcia passes all six policy rules, including salary, debt burden, tenure, and visa validity, so there are no hard stops. The refer is driven by a scorecard total of 62 out of 100, which falls short of the 70-point threshold for a low risk band. The two weakest factors are months in UAE and visa (only 5 months in country, scoring 8 of 20) and rent payment history (no history available, scoring 6 of 20). An additional 8 points would move the application into the low risk band; those points are most available once the applicant has been in the UAE for at least 6 months and has documented rent payment history.

Reasons:
- Score of 62 out of 100 is below the 70-point low risk threshold, triggering a refer rather than an approval
- Months in UAE and visa scored 8 of 20: applicant arrived only 5 months ago, leaving limited local credit footprint
- Rent payment history scored 6 of 20: no rent history is on record, removing a key behavioral data point
- Employer category is free zone, a mid-tier stability rating that limited scorecard points
- All six policy rules passed, so no hard policy barrier exists to approval
- Eight additional points, most accessible through longer UAE residence and documented on-time rent payments, would reach the low risk band

## GT-20 Layla Mansour

Recommendation: **REFER** | locked label: refer | match: yes | grounding: passed

This application is referred for manual review primarily because Layla Mansour fails rule-4, which requires six months of continuous employment, and she has only three months of tenure. The overall score of 64 out of 100 also falls short of the 70-point threshold for a low-risk band, with the largest gaps in Employment and tenure and Months in UAE and visa, both reflecting her recent arrival. All other policy rules pass, and her rent history and salary are strong positives. If she reapplies in approximately three months, rule-4 will be cleared and additional tenure and UAE residency points could lift the score into the low-risk band.

Reasons:
- Rule-4 failed: job tenure is 3 months against the required 6 months minimum
- Score of 64 out of 100 is below the 70-point low-risk threshold
- Employment and tenure factor is weak at 8 out of 20 points due to sub-6-month tenure
- Months in UAE and visa factor is weak at 8 out of 20 points due to recent arrival of 4 months
- Positive offset: rent payment history earned full 20 out of 20 points
- Positive offset: salary of AED 12,000 clears the minimum and debt burden ratio is 20.7 percent, well within the 50 percent cap

## GT-21 Omar Sheikh

Recommendation: **APPROVE** | locked label: refer | match: NO | grounding: passed

This application is recommended for approval at a low risk band, with a score of 78 out of 100. The two strongest drivers are a monthly salary of AED 18,000 that is well above the AED 8,000 product minimum and a verified rent payment history of six or more months with no late payments, which together provide solid repayment evidence. All six policy rules passed, including a debt burden ratio of 27.2 percent against the 50 percent cap under rule-2 and visa validity covering the full 24-month term under rule-5. The only relative weaknesses are the self-employed SME income profile, which scores lower than salaried employment due to harder income verification and higher income-continuity risk, but these did not override the overall positive picture.

Reasons:
- Monthly salary of AED 18,000 is more than double the AED 8,000 product minimum, providing strong repayment headroom
- Six or more months of on-time rent payments is the strongest behavioral credit evidence available and awarded full points
- Debt burden ratio of 27.2 percent is well within the 50 percent cap required by rule-2
- All six policy rules passed with no exceptions or waivers required
- Self-employed SME status introduces higher income-continuity risk and income verification difficulty, reducing the employment and employer category score components
- Visa has 30 months remaining, comfortably covering the 24-month loan term as required by rule-5

## GT-22 Kavya Pillai

Recommendation: **REFER** | locked label: refer | match: yes | grounding: passed

This application is referred for manual review. All six policy rules pass, so there is no hard decline trigger, but the scorecard total of 58 out of 100 falls short of the 70 points required for a low-risk approval. The two factors holding the score back most are Monthly salary, where AED 9,000 earns only 8 of a possible 20 points due to limited headroom above the minimum, and Employer category, where the SME classification also scores 8 of 20 because of higher income-continuity risk. To reach the 70-point threshold, Kavya Pillai would need a combination of a higher salary, a stronger employer category, or a longer UAE footprint and rent history that lifts the remaining factor scores.

Reasons:
- Score of 58 out of 100 does not reach the 70-point low-risk threshold, triggering a refer outcome
- Monthly salary of AED 9,000 is only marginally above the AED 8,000 minimum, scoring 8 of 20 points
- SME employer category carries higher income-continuity risk, scoring 8 of 20 points
- Rent payment history is on time but shorter than 6 months, so full points were not awarded
- UAE presence is only 6 months, limiting the footprint and visa-stability score contribution
- All policy rules (rule-1 through rule-6) pass, so no hard decline bar exists and the case is eligible for officer override

## GT-23 Ibrahim Diallo

Recommendation: **REFER** | locked label: refer | match: yes | grounding: passed

This application is referred because Ibrahim Diallo does not yet meet the 6-month continuous employment requirement under rule-4, with current tenure at 4 months. The score of 52 out of 100 also falls short of the 70-point threshold for a low-risk band, with the largest gaps in Employment and tenure and Months in UAE and visa, both reflecting his recent arrival and short work history. All other policy rules pass, including salary, debt burden, visa validity, and requested amount. Reapplying in approximately 2 months, once tenure reaches 6 months, would clear rule-4, and the additional tenure and UAE residency time would also lift the score closer to the 70-point threshold.

Reasons:
- rule-4 failed: employment tenure is 4 months against the required 6 months
- score of 52 out of 100 is below the 70-point low-risk threshold
- Employment and tenure factor is weak at 8 out of 20 points due to sub-6-month tenure
- Months in UAE and visa factor is weak at 8 out of 20 points due to recent arrival of 4 months
- Rent payment history is on time but the record is under 6 months, limiting points awarded
- Employer is free zone category, a mid-tier stability rating that limits score upside

## GT-24 Sophie Martin

Recommendation: **REFER** | locked label: refer | match: yes | grounding: passed

This application is referred rather than approved, driven by a scorecard total of 64 out of 100, which falls short of the 70-point threshold for a low-risk decision. All six policy rules pass, so the referral is purely a scoring matter. The two weakest areas are Months in UAE and visa, where Sophie Martin scores 8 of 20 points as a five-month resident with limited local footprint, and Monthly salary, where she scores 12 of 20 points at AED 11,000. Six additional points would move the file into the low-risk band; those points are most accessible through additional time in the UAE building local credit footprint, or through a higher verified salary.

Reasons:
- Score of 64 out of 100 falls below the 70-point low-risk threshold, triggering a refer outcome
- Months in UAE and visa is the largest scoring gap, returning only 8 of 20 possible points due to only 5 months of UAE residency
- Monthly salary factor returns 12 of 20 points, as AED 11,000 is above the minimum but well below the top salary tier
- Rent payment history is on time but the record is under 6 months, limiting points awarded in that factor
- All policy rules (rule-1 through rule-6) pass, so no hard decline trigger exists and the file is eligible for manual review
- Six additional scorecard points, most achievable as UAE tenure grows or salary increases, would move the application to the low-risk band
