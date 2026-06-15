"use client";

// Screen 1: intake. The core five applicant fields, the three policy inputs in their own
// labelled group (M4: the boundary is visible on the form itself), and the application block.
// A dropdown loads any of the prepared sample scenarios directly. Validation runs before
// anything is sent; the personal loan term cap comes from the live pack.

import { useState } from "react";
import type { Applicant, Application, CaseRecord } from "@/lib/types";
import { SAMPLE_PROFILES } from "@/lib/samples";
import { findDuplicate } from "@/lib/cases";
import { useDateFormat } from "@/lib/userContext";
import type { RulesetSummary } from "./summary";

interface Props {
  summary: RulesetSummary | null;
  recentCases: CaseRecord[];
  onAssess: (applicant: Applicant, application: Application) => void;
}

const REC_LABEL: Record<string, string> = {
  approve: "APPROVE",
  decline: "DECLINE",
  refer: "REFER",
};

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

const inputClass =
  "rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

export default function IntakeForm({ summary, recentCases, onAssess }: Props) {
  const fmtDate = useDateFormat();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState<string>("");
  // A detected duplicate, with the exact payload it would assess. Cleared on any edit.
  const [dup, setDup] = useState<{
    match: CaseRecord;
    applicant: Applicant;
    application: Application;
  } | null>(null);

  const set = (key: keyof FormState) => (value: string) => {
    setDup(null);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const loadSample = (label: string) => {
    const sample = SAMPLE_PROFILES.find((s) => s.label === label);
    if (!sample) return;
    setLoaded(label);
    setErrors({});
    setDup(null);
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

    const applicant: Applicant = {
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
    };
    const application: Application = { product: form.product, amount_aed, term_months };

    // Stop a repeat submission of the same applicant and ask before it runs; the officer can still
    // proceed deliberately from the warning.
    const match = findDuplicate(applicant, application, recentCases);
    if (match) {
      setDup({ match, applicant, application });
      return;
    }
    onAssess(applicant, application);
  };

  const field = (key: keyof FormState, label: string, input: React.ReactNode) => (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>
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
      className={inputClass}
    />
  );

  const selectInput = (key: keyof FormState, options: Array<[string, string]>) => (
    <select value={form[key]} onChange={(e) => set(key)(e.target.value)} className={inputClass}>
      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );

  const sectionCard = (
    accent: string,
    badge: string,
    title: string,
    note: string | null,
    body: React.ReactNode,
  ) => (
    <section className="animate-fade-up rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${accent}`}>
          {badge}
        </span>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      </div>
      {note && <p className="-mt-2 mb-4 text-xs text-slate-500 dark:text-slate-400">{note}</p>}
      {body}
    </section>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Load a sample scenario
          </span>
          <select
            value={loaded}
            onChange={(e) => loadSample(e.target.value)}
            className={`${inputClass} min-w-[16rem]`}
          >
            <option value="" disabled>
              Choose a scenario...
            </option>
            {SAMPLE_PROFILES.map((s) => (
              <option key={s.label} value={s.label}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {sectionCard(
        "bg-blue-100 text-blue-700",
        "1",
        "Applicant details",
        "The five factors the scorecard uses to assess the applicant.",
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {field(
            "full_name",
            "Full name",
            <input
              value={form.full_name}
              onChange={(e) => set("full_name")(e.target.value)}
              className={inputClass}
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
        </div>,
      )}

      {sectionCard(
        "bg-pink-100 text-pink-700",
        "2",
        "Policy inputs",
        "Used by the lending rules only. These are never scored.",
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
        </div>,
      )}

      {sectionCard(
        "bg-sky-100 text-sky-700",
        "3",
        "Application details",
        "The product and amount being requested.",
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
        </div>,
      )}

      {dup ? (
        <section className="animate-scale-in rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-400/40 dark:bg-amber-500/10">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                Possible duplicate application
              </h3>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/90">
                {dup.match.applicant.full_name} already has an assessment for{" "}
                {dup.application.product.replace("_", " ")} of AED{" "}
                {dup.application.amount_aed.toLocaleString("en-US")} over {dup.application.term_months}{" "}
                months, recorded {fmtDate(dup.match.created_at)} with recommendation{" "}
                <span className="font-semibold">
                  {REC_LABEL[dup.match.decision.recommendation]}
                </span>
                . Running it again creates a second record and spends another API call.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const { applicant, application } = dup;
                    setDup(null);
                    onAssess(applicant, application);
                  }}
                  className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
                >
                  Assess anyway
                </button>
                <button
                  onClick={() => setDup(null)}
                  className="rounded-xl border border-amber-300 bg-white px-5 py-2.5 text-sm font-medium text-amber-800 transition hover:bg-amber-100 dark:border-amber-400/40 dark:bg-transparent dark:text-amber-200 dark:hover:bg-amber-500/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <button
          onClick={submit}
          className="group inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 hover:shadow-blue-600/40"
        >
          Assess applicant
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition group-hover:translate-x-0.5"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
