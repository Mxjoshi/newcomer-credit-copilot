"use client";

// Screen 1: intake. The core five applicant fields, the three policy inputs in their own
// labelled group (M4: the boundary is visible on the form itself), and the application block.
// Validation runs before anything is sent; the personal loan term cap comes from the live pack.

import { useState } from "react";
import type { Applicant, Application } from "@/lib/types";
import { SAMPLE_PROFILES } from "@/lib/samples";
import type { RulesetSummary } from "./summary";

interface Props {
  summary: RulesetSummary | null;
  onAssess: (applicant: Applicant, application: Application) => void;
}

type FormState = {
  full_name: string;
  months_in_uae: string;
  visa_type: Applicant["visa_type"];
  employment_status: Applicant["employment_status"];
  job_tenure_months: string;
  employer_category: Applicant["employer_category"];
  monthly_salary_aed: string;
  rent_history: Applicant["rent_history"];
  existing_monthly_obligations_aed: string;
  age_years: string;
  visa_months_remaining: string;
  product: Application["product"];
  amount_aed: string;
  term_months: string;
};

const EMPTY: FormState = {
  full_name: "",
  months_in_uae: "",
  visa_type: "employment",
  employment_status: "employed",
  job_tenure_months: "",
  employer_category: "mainland_private",
  monthly_salary_aed: "",
  rent_history: "none",
  existing_monthly_obligations_aed: "0",
  age_years: "",
  visa_months_remaining: "",
  product: "personal_loan",
  amount_aed: "",
  term_months: "",
};

export default function IntakeForm({ summary, onAssess }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sampleIndex, setSampleIndex] = useState(0);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const loadSample = () => {
    const sample = SAMPLE_PROFILES[sampleIndex % SAMPLE_PROFILES.length];
    setSampleIndex((i) => i + 1);
    setErrors({});
    setForm({
      full_name: sample.applicant.full_name,
      months_in_uae: String(sample.applicant.months_in_uae),
      visa_type: sample.applicant.visa_type,
      employment_status: sample.applicant.employment_status,
      job_tenure_months: String(sample.applicant.job_tenure_months),
      employer_category: sample.applicant.employer_category,
      monthly_salary_aed: String(sample.applicant.monthly_salary_aed),
      rent_history: sample.applicant.rent_history,
      existing_monthly_obligations_aed: String(
        sample.applicant.existing_monthly_obligations_aed,
      ),
      age_years: String(sample.applicant.age_years),
      visa_months_remaining: String(sample.applicant.visa_months_remaining),
      product: sample.application.product,
      amount_aed: String(sample.application.amount_aed),
      term_months: String(sample.application.term_months),
    });
  };

  const submit = () => {
    const errs: Record<string, string> = {};
    const num = (key: keyof FormState, label: string, min: number, requirePositive = false) => {
      const value = Number(form[key]);
      if (form[key].trim() === "" || !Number.isFinite(value)) {
        errs[key] = `${label} is required`;
        return 0;
      }
      if (requirePositive && value <= 0) errs[key] = `${label} must be above zero`;
      else if (value < min) errs[key] = `${label} must be at least ${min}`;
      return value;
    };

    if (form.full_name.trim() === "") errs.full_name = "name is required";
    const months_in_uae = num("months_in_uae", "months in UAE", 0);
    const job_tenure_months = num("job_tenure_months", "job tenure", 0);
    const monthly_salary_aed = num("monthly_salary_aed", "salary", 0, true);
    const existing = num("existing_monthly_obligations_aed", "obligations", 0);
    const age_years = num("age_years", "age", 18);
    const visa_months_remaining = num("visa_months_remaining", "visa months remaining", 0);
    const amount_aed = num("amount_aed", "amount", 0, true);
    const term_months = num("term_months", "term", 1);
    const termCap = summary?.personal_loan_max_term_months;
    if (!errs.term_months && form.product === "personal_loan" && termCap && term_months > termCap) {
      errs.term_months = `personal loan terms are capped at ${termCap} months`;
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onAssess(
      {
        full_name: form.full_name.trim(),
        months_in_uae,
        visa_type: form.visa_type,
        employment_status: form.employment_status,
        job_tenure_months,
        employer_category: form.employer_category,
        monthly_salary_aed,
        rent_history: form.rent_history,
        existing_monthly_obligations_aed: existing,
        age_years,
        visa_months_remaining,
      },
      { product: form.product, amount_aed, term_months },
    );
  };

  const field = (
    key: keyof FormState,
    label: string,
    input: React.ReactNode,
  ) => (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {input}
      {errors[key] && <span className="text-xs text-rose-600">{errors[key]}</span>}
    </label>
  );

  const numberInput = (key: keyof FormState, placeholder = "") => (
    <input
      type="number"
      value={form[key]}
      placeholder={placeholder}
      onChange={(e) => set(key)(e.target.value)}
      className="rounded border border-slate-300 px-3 py-2"
    />
  );

  const selectInput = (key: keyof FormState, options: Array<[string, string]>) => (
    <select
      value={form[key]}
      onChange={(e) => set(key)(e.target.value)}
      className="rounded border border-slate-300 bg-white px-3 py-2"
    >
      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">New assessment</h2>
        <button
          onClick={loadSample}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
        >
          Load sample: {SAMPLE_PROFILES[sampleIndex % SAMPLE_PROFILES.length].label}
        </button>
      </div>

      <section className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-blue-900">Applicant (the scored five)</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {field(
            "full_name",
            "Full name",
            <input
              value={form.full_name}
              onChange={(e) => set("full_name")(e.target.value)}
              className="rounded border border-slate-300 px-3 py-2"
            />,
          )}
          {field("months_in_uae", "Months in UAE", numberInput("months_in_uae"))}
          {field(
            "visa_type",
            "Visa type",
            selectInput("visa_type", [
              ["employment", "Employment"],
              ["golden", "Golden"],
              ["green", "Green"],
              ["other", "Other"],
            ]),
          )}
          {field(
            "employment_status",
            "Employment status",
            selectInput("employment_status", [
              ["employed", "Employed"],
              ["self_employed", "Self-employed"],
              ["unemployed", "Unemployed"],
            ]),
          )}
          {field("job_tenure_months", "Job tenure (months)", numberInput("job_tenure_months"))}
          {field(
            "employer_category",
            "Employer category",
            selectInput("employer_category", [
              ["government", "Government"],
              ["mainland_private", "Mainland private"],
              ["free_zone", "Free zone"],
              ["sme", "SME"],
              ["other", "Other"],
            ]),
          )}
          {field("monthly_salary_aed", "Monthly salary (AED)", numberInput("monthly_salary_aed"))}
          {field(
            "rent_history",
            "Rent payment history",
            selectInput("rent_history", [
              ["on_time_6plus", "On time, 6+ months"],
              ["on_time_under_6", "On time, under 6 months"],
              ["late_payments", "Late payments"],
              ["none", "No rent history"],
            ]),
          )}
        </div>
      </section>

      <section className="rounded-lg border border-pink-200 bg-pink-50/50 p-4">
        <h3 className="mb-1 text-sm font-semibold text-pink-900">Policy inputs</h3>
        <p className="mb-3 text-xs text-pink-800">
          These three feed the policy rules only. They are never scored (M4).
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {field(
            "existing_monthly_obligations_aed",
            "Existing monthly obligations (AED)",
            numberInput("existing_monthly_obligations_aed"),
          )}
          {field("age_years", "Age (years)", numberInput("age_years"))}
          {field(
            "visa_months_remaining",
            "Visa months remaining",
            numberInput("visa_months_remaining"),
          )}
        </div>
      </section>

      <section className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-blue-900">Application</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {field(
            "product",
            "Product",
            selectInput("product", [
              ["personal_loan", "Personal loan"],
              ["credit_card", "Credit card"],
            ]),
          )}
          {field("amount_aed", "Amount requested (AED)", numberInput("amount_aed"))}
          {field("term_months", "Term (months)", numberInput("term_months"))}
        </div>
      </section>

      <button
        onClick={submit}
        className="self-start rounded-lg bg-emerald-600 px-6 py-2.5 font-semibold text-white hover:bg-emerald-700"
      >
        Assess applicant
      </button>
    </div>
  );
}
