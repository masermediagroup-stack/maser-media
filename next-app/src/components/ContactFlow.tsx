"use client";

import { useMemo, useState } from "react";
import type React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Globe2,
} from "lucide-react";

type ServiceId = "brand" | "web" | "copy" | "strategy" | "unsure";
type BudgetId = "under-1000" | "1000-5000" | "5000-15000" | "15000-plus" | "unsure";

type ContactData = {
  service: ServiceId;
  brief: string;
  budget: BudgetId;
  firstName: string;
  email: string;
  phone: string;
  callDate: string;
  callTime: string;
};

type ServiceOption = {
  id: ServiceId;
  label: string;
  wide?: boolean;
};

type BudgetOption = {
  id: BudgetId;
  label: string;
  wide?: boolean;
};

const SERVICE_OPTIONS: ServiceOption[] = [
  { id: "brand", label: "Brand Identity" },
  { id: "web", label: "Web Design" },
  { id: "copy", label: "Content / Copy" },
  { id: "strategy", label: "Strategy & Consulting" },
  { id: "unsure", label: "Not sure yet", wide: true },
];

const BUDGET_OPTIONS: BudgetOption[] = [
  { id: "under-1000", label: "Under $1,000" },
  { id: "1000-5000", label: "$1,000 - $5,000" },
  { id: "5000-15000", label: "$5,000 - $15,000" },
  { id: "15000-plus", label: "$15,000+" },
  { id: "unsure", label: "Not sure yet", wide: true },
];

const STEP_COPY = [
  {
    title: "What are you looking to build?",
    helper: "A few quick questions so we can tailor the conversation to your goals.",
  },
  {
    title: "Tell us about your project.",
    helper: "Quick intake now, detailed planning on the call.",
  },
  {
    title: "What's your rough budget?",
    helper: "",
  },
  {
    title: "Choose a consulting call.",
    helper: "Pick a date and time that works for your intro call.",
  },
  {
    title: "Almost there - let's get in touch.",
    helper: "",
  },
];

const INITIAL_DATA: ContactData = {
  service: "web",
  brief: "",
  budget: "5000-15000",
  firstName: "",
  email: "",
  phone: "",
  callDate: "",
  callTime: "",
};

const TIME_SLOTS = ["8:00am", "8:20am", "8:40am", "9:00am", "9:20am", "9:40am", "10:00am", "10:20am"];
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function getBookingDates() {
  const dates: Date[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);

  while (dates.length < 10) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function toDateId(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatBookingDate(dateId: string) {
  if (!dateId) return "Select a date";
  const date = new Date(`${dateId}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function ContactFlow() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<ContactData>(INITIAL_DATA);

  const totalSteps = 5;
  const copy = STEP_COPY[step];
  const progress = `${((step + 1) / totalSteps) * 100}%`;
  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(data.service);
    if (step === 1) return data.brief.trim().length > 0;
    if (step === 2) return Boolean(data.budget);
    if (step === 3) return Boolean(data.callDate && data.callTime);
    return data.firstName.trim().length > 0 && data.email.trim().length > 0;
  }, [data, step]);

  const next = () => {
    if (!canContinue) return;
    if (step < totalSteps - 1) {
      setStep((currentStep) => currentStep + 1);
      return;
    }
    setSubmitted(true);
  };

  const back = () => {
    setStep((currentStep) => Math.max(0, currentStep - 1));
  };

  const resetToStart = () => {
    setSubmitted(false);
    setStep(0);
  };

  if (submitted) {
    return (
      <section className="contact-flow-wrap" aria-labelledby="contact-success-title">
        <div className="contact-flow-shell contact-flow-shell--success">
          <div className="contact-flow-success-icon" aria-hidden>
            <CheckCircle2 size={30} />
          </div>
          <p className="contact-flow-step-label">Submitted</p>
          <h1 id="contact-success-title" className="contact-flow-title">
            Thanks. We received your project intake.
          </h1>
          <p className="contact-flow-subtitle">
            We will review the details and send a Google Calendar invite for your selected intro call.
          </p>
          <button className="contact-flow-primary contact-flow-primary--compact" type="button" onClick={resetToStart}>
            Review answers
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="contact-flow-wrap" aria-labelledby="contact-flow-title">
      <form
        className="contact-flow-shell"
        onSubmit={(event) => {
          event.preventDefault();
          next();
        }}
      >
        <header className="contact-flow-header">
          <p className="contact-flow-step-label">
            Step {step + 1} of {totalSteps}
          </p>
          <h1 id="contact-flow-title" className="contact-flow-title">
            {copy.title}
          </h1>
          {copy.helper ? <p className="contact-flow-subtitle">{copy.helper}</p> : null}
        </header>

        <input type="hidden" name="call_date" value={data.callDate} />
        <input type="hidden" name="call_time" value={data.callTime} />
        <input type="hidden" name="call_timezone" value="America/Chicago" />

        <div
          className="contact-flow-progress"
          role="progressbar"
          aria-label="Form progress"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
        >
          <span style={{ width: progress }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="contact-flow-step"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -18 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 ? <ServiceStep data={data} setData={setData} /> : null}
            {step === 1 ? <BriefStep data={data} setData={setData} /> : null}
            {step === 2 ? <BudgetStep data={data} setData={setData} /> : null}
            {step === 3 ? <ScheduleStep data={data} setData={setData} /> : null}
            {step === 4 ? <ContactStep data={data} setData={setData} /> : null}
          </motion.div>
        </AnimatePresence>

        <footer className="contact-flow-actions">
          <button type="button" className="contact-flow-back" onClick={back} disabled={step === 0}>
            <ArrowLeft size={20} aria-hidden />
            Back
          </button>
          <button type="submit" className="contact-flow-primary" disabled={!canContinue}>
            {step === totalSteps - 1 ? "Submit & Book a Call" : "Continue"}
            <ArrowRight size={20} aria-hidden />
          </button>
        </footer>
      </form>
    </section>
  );
}

function ServiceStep({
  data,
  setData,
}: {
  data: ContactData;
  setData: React.Dispatch<React.SetStateAction<ContactData>>;
}) {
  return (
    <fieldset className="contact-flow-fieldset">
      <legend className="contact-flow-field-title">What can we help you with?</legend>
      <div className="contact-flow-grid contact-flow-grid--services">
        {SERVICE_OPTIONS.map((option) => {
          const selected = data.service === option.id;

          return (
            <button
              type="button"
              key={option.id}
              className={`contact-flow-option${selected ? " is-selected" : ""}${option.wide ? " is-wide" : ""}`}
              aria-pressed={selected}
              onClick={() => setData((current) => ({ ...current, service: option.id }))}
            >
              <span className="contact-flow-option-label">{option.label}</span>
              {selected ? (
                <span className="contact-flow-option-check" aria-hidden>
                  <Check size={16} strokeWidth={3} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function BriefStep({
  data,
  setData,
}: {
  data: ContactData;
  setData: React.Dispatch<React.SetStateAction<ContactData>>;
}) {
  return (
    <div className="contact-flow-fields">
      <label htmlFor="brief-input" className="contact-flow-field-title">
        Tell us about your project
      </label>
      <textarea
        id="brief-input"
        className="contact-flow-input contact-flow-textarea"
        placeholder="Scope, timeline, and goals."
        value={data.brief}
        onChange={(event) => setData((current) => ({ ...current, brief: event.target.value }))}
      />
      <p className="contact-flow-field-note">A short paragraph is plenty - we&apos;ll dig in on the call.</p>
    </div>
  );
}

function BudgetStep({
  data,
  setData,
}: {
  data: ContactData;
  setData: React.Dispatch<React.SetStateAction<ContactData>>;
}) {
  return (
    <fieldset className="contact-flow-fieldset">
      <legend className="contact-flow-field-title">What is your rough budget?</legend>
      <div className="contact-flow-grid contact-flow-grid--budget">
        {BUDGET_OPTIONS.map((option) => {
          const selected = data.budget === option.id;

          return (
            <button
              type="button"
              key={option.id}
              className={`contact-flow-option contact-flow-option--budget${selected ? " is-selected" : ""}${
                option.wide ? " is-wide" : ""
              }`}
              aria-pressed={selected}
              onClick={() => setData((current) => ({ ...current, budget: option.id }))}
            >
              <span className="contact-flow-option-label">{option.label}</span>
              {selected ? (
                <span className="contact-flow-option-check" aria-hidden>
                  <Check size={16} strokeWidth={3} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ScheduleStep({
  data,
  setData,
}: {
  data: ContactData;
  setData: React.Dispatch<React.SetStateAction<ContactData>>;
}) {
  const bookingDates = useMemo(() => getBookingDates(), []);
  const selectedDateLabel = formatBookingDate(data.callDate);

  return (
    <div className="contact-flow-scheduler">
      <aside className="contact-flow-call-card" aria-label="Consulting call details">
        <div className="contact-flow-call-icon" aria-hidden>
          <CalendarDays size={20} />
        </div>
        <h2>Intro Call</h2>
        <p>A focused 20 minute conversation about scope, timeline, and the cleanest next step.</p>
        <dl>
          <div>
            <Clock3 size={16} aria-hidden />
            <dt>Length</dt>
            <dd>20m</dd>
          </div>
          <div>
            <Globe2 size={16} aria-hidden />
            <dt>Timezone</dt>
            <dd>America/Chicago</dd>
          </div>
        </dl>
      </aside>

      <div className="contact-flow-calendar-panel">
        <div className="contact-flow-calendar-head">
          <span>Pick a date</span>
          <strong>{selectedDateLabel}</strong>
        </div>
        <div className="contact-flow-weekdays" aria-hidden>
          {WEEKDAY_LABELS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="contact-flow-date-grid" role="group" aria-label="Available dates">
          {bookingDates.map((date) => {
            const id = toDateId(date);
            const selected = data.callDate === id;

            return (
              <button
                type="button"
                key={id}
                className={`contact-flow-date${selected ? " is-selected" : ""}`}
                aria-pressed={selected}
                onClick={() =>
                  setData((current) => ({
                    ...current,
                    callDate: id,
                  }))
                }
              >
                <span>{new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)}</span>
                <strong>{date.getDate()}</strong>
              </button>
            );
          })}
        </div>
      </div>

      <div className="contact-flow-time-panel">
        <div className="contact-flow-calendar-head">
          <span>Pick a time</span>
          <strong>{data.callTime || "20m slots"}</strong>
        </div>
        <div className="contact-flow-time-list" role="group" aria-label="Available times">
          {TIME_SLOTS.map((time) => {
            const selected = data.callTime === time;

            return (
              <button
                type="button"
                key={time}
                className={`contact-flow-time${selected ? " is-selected" : ""}`}
                aria-pressed={selected}
                onClick={() => setData((current) => ({ ...current, callTime: time }))}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ContactStep({
  data,
  setData,
}: {
  data: ContactData;
  setData: React.Dispatch<React.SetStateAction<ContactData>>;
}) {
  return (
    <div className="contact-flow-fields">
      <TextField
        id="first-name"
        label="First Name"
        placeholder="Jane"
        autoComplete="given-name"
        value={data.firstName}
        onChange={(value) => setData((current) => ({ ...current, firstName: value }))}
      />
      <TextField
        id="email-address"
        label="Email"
        placeholder="jane@company.com"
        type="email"
        autoComplete="email"
        value={data.email}
        onChange={(value) => setData((current) => ({ ...current, email: value }))}
      />
      <TextField
        id="phone-number"
        label="Phone"
        optionalLabel="(optional)"
        placeholder="+1 (555) 000-0000"
        type="tel"
        autoComplete="tel"
        value={data.phone}
        onChange={(value) => setData((current) => ({ ...current, phone: value }))}
      />
      <p className="contact-flow-field-note contact-flow-field-note--inline">
        <Clock3 size={16} aria-hidden />
        Selected call: {formatBookingDate(data.callDate)} at {data.callTime} CT. We&apos;ll send the Google Calendar invite after review.
      </p>
    </div>
  );
}

function TextField({
  autoComplete,
  id,
  label,
  optionalLabel,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  autoComplete: string;
  id: string;
  label: string;
  optionalLabel?: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="contact-flow-text-field" htmlFor={id}>
      <span>
        {label}
        {optionalLabel ? <span>{optionalLabel}</span> : null}
      </span>
      <input
        id={id}
        className="contact-flow-input"
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
