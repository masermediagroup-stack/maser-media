"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type FormData = {
  service: string;
  brief: string;
  budget: string;
  firstName: string;
  email: string;
  phone: string;
};

const SERVICE_OPTIONS = [
  "Brand Identity",
  "Web Design",
  "Content / Copy",
  "Strategy & Consulting",
  "Not sure yet",
];

const BUDGET_OPTIONS = [
  "Under $1,000",
  "$1,000 - $5,000",
  "$5,000 - $15,000",
  "$15,000 - $50,000",
  "$50,000+",
  "Not sure yet",
];

const initialData: FormData = {
  service: "",
  brief: "",
  budget: "",
  firstName: "",
  email: "",
  phone: "",
};

export function ContactFlow() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<FormData>(initialData);
  const [error, setError] = useState("");

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;
  const stepLabel = useMemo(() => `Step ${step + 1} of ${totalSteps}`, [step]);

  const next = () => {
    if (step === 0 && !data.service) return setError("Select a service to continue.");
    if (step === 1 && data.brief.trim().length < 12) return setError("Please share a short project brief.");
    if (step === 2 && !data.budget) return setError("Pick a budget range to continue.");
    if (step === 3) {
      if (!data.firstName.trim()) return setError("First name is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return setError("Enter a valid email.");
      setSubmitted(true);
      setError("");
      return;
    }
    setError("");
    setStep((v) => Math.min(v + 1, totalSteps - 1));
  };

  const back = () => {
    setError("");
    setStep((v) => Math.max(0, v - 1));
  };

  if (submitted) {
    return (
      <section className="contact-flow-wrap" aria-labelledby="contact-success-title">
        <div className="contact-flow-shell">
          <h1 id="contact-success-title" className="contact-flow-title">You are booked. We will talk soon.</h1>
          <p className="contact-flow-subtitle">
            Check your inbox for confirmation. If you prefer direct email, contact hello@masermedia.com.
          </p>
          <a className="contact-flow-primary contact-flow-primary--link" href="https://calendly.com/client/meeting-type" target="_blank" rel="noopener noreferrer">
            Open Calendly
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="contact-flow-wrap" aria-labelledby="contact-flow-title">
      <div className="contact-flow-shell">
        <p className="contact-flow-step-label">{stepLabel}</p>
        <h1 id="contact-flow-title" className="contact-flow-title">Start your project in under two minutes.</h1>
        <p className="contact-flow-subtitle">Quick intake now, detailed planning on the call.</p>

        <div className="contact-flow-progress" role="progressbar" aria-label="Form progress" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
          <span style={{ width: `${progress}%` }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -18 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="contact-flow-step"
          >
            {step === 0 ? (
              <fieldset>
                <legend className="contact-flow-field-title">What can we help you with?</legend>
                <div className="contact-flow-grid">
                  {SERVICE_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`contact-flow-option${data.service === option ? " is-selected" : ""}`}
                      onClick={() => setData((v) => ({ ...v, service: option }))}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === 1 ? (
              <div>
                <label htmlFor="brief-input" className="contact-flow-field-title">Tell us about your project</label>
                <textarea
                  id="brief-input"
                  className="contact-flow-input contact-flow-textarea"
                  placeholder="Scope, timeline, and goals."
                  value={data.brief}
                  onChange={(e) => setData((v) => ({ ...v, brief: e.target.value }))}
                />
              </div>
            ) : null}

            {step === 2 ? (
              <fieldset>
                <legend className="contact-flow-field-title">What is your rough budget?</legend>
                <div className="contact-flow-grid">
                  {BUDGET_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`contact-flow-option${data.budget === option ? " is-selected" : ""}`}
                      onClick={() => setData((v) => ({ ...v, budget: option }))}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === 3 ? (
              <div className="contact-flow-fields">
                <label htmlFor="first-name">First name</label>
                <input
                  id="first-name"
                  className="contact-flow-input"
                  value={data.firstName}
                  onChange={(e) => setData((v) => ({ ...v, firstName: e.target.value }))}
                  autoComplete="given-name"
                />
                <label htmlFor="email-address">Email</label>
                <input
                  id="email-address"
                  className="contact-flow-input"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData((v) => ({ ...v, email: e.target.value }))}
                  autoComplete="email"
                />
                <label htmlFor="phone-number">Phone (optional)</label>
                <input
                  id="phone-number"
                  className="contact-flow-input"
                  type="tel"
                  inputMode="tel"
                  value={data.phone}
                  onChange={(e) => setData((v) => ({ ...v, phone: e.target.value }))}
                  autoComplete="tel"
                />
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {error ? <p className="contact-flow-error" role="alert">{error}</p> : null}

        <div className="contact-flow-actions">
          <button type="button" className="contact-flow-back" onClick={back} disabled={step === 0}>
            Back
          </button>
          <button type="button" className="contact-flow-primary" onClick={next}>
            {step === totalSteps - 1 ? "Submit and book call" : "Continue"}
          </button>
        </div>
      </div>
    </section>
  );
}

