// Live pack summary for the UI: market identity, version, counts, and the form-validation
// limits. The screens render from this, never from hardcoded counts: a pack with 10 rules
// means Screen 2 says "checking 10 rules" and Screen 3 shows 10 rows.

import { NextResponse } from "next/server";
import { loadLiveRuleset } from "@/lib/livePack";

export async function GET() {
  const ruleset = await loadLiveRuleset();
  return NextResponse.json({
    market: ruleset.market,
    market_name: ruleset.market_name,
    ruleset_version: ruleset.ruleset_version,
    currency: ruleset.currency,
    regulator: ruleset.regulator,
    bureau: ruleset.bureau,
    rule_count: ruleset.rules.length,
    factor_count: ruleset.scorecard.length,
    max_points: ruleset.scorecard.length * 20,
    product_min_salary: ruleset.parameters.product_min_salary,
    personal_loan_max_term_months: ruleset.parameters.personal_loan_max_term_months,
    // The version-editable parameters, so the client can seed the locked v1.0 base version.
    params: {
      dbr_cap: ruleset.parameters.dbr_cap,
      amount_salary_multiple: ruleset.parameters.amount_salary_multiple,
      max_age_at_maturity: ruleset.parameters.max_age_at_maturity,
      min_tenure_months: ruleset.parameters.min_tenure_months,
    },
  });
}
