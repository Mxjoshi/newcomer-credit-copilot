# Newcomer Credit Copilot, the app

The Phase 3 build. A credit officer enters a newcomer applicant's details, the system scores the
risk on a transparent 5-factor scorecard, checks six lending-policy rules, and returns an
approve, decline, or refer recommendation with a grounded plain-language explanation. The score
and the verdict are fully deterministic; the LLM writes the explanation only.

Specs this implements, in the repo:
- Data model and decision logic: `../../02-design/deliverables/02-data-model.md`
- Screens: `../../02-design/deliverables/01-ui-flow.md`
- LLM contract and validator: `../deliverables/llm-integration.md`
- Ground truth and locked constants: `../../04-evaluate-and-ship/ground-truth.md`

## Run it

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY (only needed for the explanation step)
npm run dev                  # http://localhost:3000
```

## Verify it

```bash
npm test          # unit tests: rule boundaries, scorecard, combination logic, validator
npm run harness   # runs the locked 24-profile ground truth, prints match/mismatch per row
```

No database, no login, one assessment per session, synthetic data only (Phase 1 cut list).
