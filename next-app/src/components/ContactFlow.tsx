"use client";

import { useMemo, useState } from "react";
import type React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, Globe2 } from "lucide-react";

type ServiceId = "brand" | "web" | "copy" | "strategy" | "unsure";
type BudgetId = "under-1000" | "1000-5000" | "5000-15000" | "15000-plus" | "unsure";
type HeardAboutId =
  | "google"
  | "instagram"
  | "facebook"
  | "referral"
  | "existing-client"
  | "ai-search"
  | "other";

type ContactData = {
  service: ServiceId;
  brief: string;
  budget: BudgetId;
  heardAbout: HeardAboutId;
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

type HeardAboutOption = {
  id: HeardAboutId;
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

const HEARD_ABOUT_OPTIONS: HeardAboutOption[] = [
  { id: "google", label: "Google" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "referral", label: "Friend / referral" },
  { id: "existing-client", label: "Existing client" },
  { id: "ai-search", label: "AI search" },
  { id: "other", label: "Somewhere else", wide: true },
];

const STEP_COPY = [
  {
    title: "What are you looking to build?",
    helper: "",
  },
  {
    title: "Tell us about your goals.",
    helper: "Quick breakdown now, detailed planning soon!",
  },
  {
    title: "What's your rough budget?",
    helper: "",
  },
  {
    title: "How did you hear about us?",
    helper: "This helps us understand where the right people are finding Maser Media.",
  },
  {
    title: "Let's Meet.",
    helper: "Begin your creative partnership with Maser Media.",
  },
  {
    title: "We're exctied to hear about your project!",
    helper: "",
  },
];

const FIRST_BOOKING_HOUR = 10;
const LAST_BOOKING_HOUR = 19;
const BOOKING_SLOT_MINUTES = 20;

function formatTimeSlot(totalMinutes: number) {
  const hour24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hour24 >= 12 ? "pm" : "am";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")}${suffix}`;
}

function createTimeSlots() {
  const slots: string[] = [];
  for (
    let totalMinutes = FIRST_BOOKING_HOUR * 60;
    totalMinutes <= LAST_BOOKING_HOUR * 60;
    totalMinutes += BOOKING_SLOT_MINUTES
  ) {
    slots.push(formatTimeSlot(totalMinutes));
  }
  return slots;
}

const TIME_SLOTS = createTimeSlots();

function getSuggestedBookingDates() {
  const dates: Date[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);

  while (dates.length < 7) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function toDateId(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getMinBookingDateId() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  return toDateId(date);
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

function createInitialContactData(): ContactData {
  const firstDate = getSuggestedBookingDates()[0];
  return {
    service: "web",
    brief: "",
    budget: "5000-15000",
    heardAbout: "google",
    firstName: "",
    email: "",
    phone: "",
    callDate: firstDate ? toDateId(firstDate) : "",
    callTime: TIME_SLOTS[0] ?? "",
  };
}

export function ContactFlow() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<ContactData>(() => createInitialContactData());

  const totalSteps = 6;
  const copy = STEP_COPY[step];
  const progress = `${((step + 1) / totalSteps) * 100}%`;
  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(data.service);
    if (step === 1) return data.brief.trim().length > 0;
    if (step === 2) return Boolean(data.budget);
    if (step === 3) return Boolean(data.heardAbout);
    if (step === 4) return Boolean(data.callDate && data.callTime);
    return data.firstName.trim().length > 0 && data.email.trim().length > 0;
  }, [data, step]);

  const submitBooking = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, callTimezone: "America/Chicago" }),
      });
      const body = (await response.json().catch(() => null)) as
        | { ok: boolean; error?: string }
        | null;

      if (!response.ok || !body?.ok) {
        setErrorMessage(
          body?.error ??
            "We could not book the call right now. Please try again or email masermediagroup@gmail.com.",
        );
        return;
      }

      setSubmitted(true);
    } catch (error) {
      console.error("[ContactFlow] submit failed", error);
      setErrorMessage(
        "Network error. Please check your connection and try again, or email masermediagroup@gmail.com.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (!canContinue || submitting) return;
    if (step < totalSteps - 1) {
      setStep((currentStep) => currentStep + 1);
      return;
    }
    void submitBooking();
  };

  const back = () => {
    if (submitting) return;
    setErrorMessage(null);
    setStep((currentStep) => Math.max(0, currentStep - 1));
  };

  const resetToStart = () => {
    setSubmitted(false);
    setErrorMessage(null);
    setStep(0);
  };

  if (submitted) {
    return (
      <section className="contact-flow-wrap" aria-labelledby="contact-success-title">
        <div className="contact-flow-shell contact-flow-shell--success">
          <div className="contact-flow-success-icon" aria-hidden>
            <CheckCircle2 size={30} />
          </div>
          <p className="contact-flow-step-label">Booked</p>
          <h1 id="contact-success-title" className="contact-flow-title">
            You&apos;re on the calendar.
          </h1>
          <p className="contact-flow-subtitle">
            Check your inbox - a Google Calendar invite for your intro call is on its way. You can reschedule or cancel from the invite itself.
          </p>
          <button className="contact-flow-primary contact-flow-primary--compact" type="button" onClick={resetToStart}>
            Book another
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
        <input type="hidden" name="heard_about" value={data.heardAbout} />

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
            {step === 3 ? <HeardAboutStep data={data} setData={setData} /> : null}
            {step === 4 ? <ScheduleStep data={data} setData={setData} /> : null}
            {step === 5 ? <ContactStep data={data} setData={setData} /> : null}
          </motion.div>
        </AnimatePresence>

        {errorMessage ? (
          <p className="contact-flow-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <footer className="contact-flow-actions">
          <button
            type="button"
            className="contact-flow-back"
            onClick={back}
            disabled={step === 0 || submitting}
          >
            <ArrowLeft size={20} aria-hidden />
            Back
          </button>
          <button
            type="submit"
            className="contact-flow-primary"
            disabled={!canContinue || submitting}
            aria-busy={submitting}
          >
            {step === totalSteps - 1
              ? submitting
                ? "Booking your call..."
                : "Submit & Book a Call"
              : "Continue"}
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

function HeardAboutStep({
  data,
  setData,
}: {
  data: ContactData;
  setData: React.Dispatch<React.SetStateAction<ContactData>>;
}) {
  return (
    <fieldset className="contact-flow-fieldset">
      <div className="contact-flow-grid contact-flow-grid--heard-about">
        {HEARD_ABOUT_OPTIONS.map((option) => {
          const selected = data.heardAbout === option.id;

          return (
            <button
              type="button"
              key={option.id}
              className={`contact-flow-option contact-flow-option--heard-about${selected ? " is-selected" : ""}${
                option.wide ? " is-wide" : ""
              }`}
              aria-pressed={selected}
              onClick={() => setData((current) => ({ ...current, heardAbout: option.id }))}
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
  const bookingDates = useMemo(() => getSuggestedBookingDates(), []);
  const minBookingDate = useMemo(() => getMinBookingDateId(), []);
  const selectedDateLabel = formatBookingDate(data.callDate);

  return (
    <div className="contact-flow-scheduler">
      <div className="contact-flow-calendar-panel">
        <div className="contact-flow-calendar-head">
          <span>Pick a date</span>
          <strong>{selectedDateLabel}</strong>
        </div>
        <label className="contact-flow-date-input-label" htmlFor="contact-call-date">
          <input
            id="contact-call-date"
            className="contact-flow-input contact-flow-date-input"
            type="date"
            min={minBookingDate}
            value={data.callDate}
            onChange={(event) => {
              const nextDate = event.target.value;
              setData((current) => ({
                ...current,
                callDate: nextDate && nextDate >= minBookingDate ? nextDate : minBookingDate,
              }));
            }}
          />
        </label>
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
        <div className="contact-flow-calendar-head contact-flow-time-head">
          <div className="contact-flow-time-head-start">
            <span>Pick a time</span>
            <span className="contact-flow-call-duration" aria-label="Call length: 20 minutes">
              <Clock3 size={16} aria-hidden />
              20m
            </span>
          </div>
          <strong>{data.callTime ? `${data.callTime} CST` : "20m slots CST"}</strong>
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
        label="Name"
        placeholder="Jane Doe"
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
        placeholder="+1 (555) 000-0000"
        type="tel"
        autoComplete="tel"
        value={data.phone}
        onChange={(value) => setData((current) => ({ ...current, phone: value }))}
      />
      <p className="contact-flow-field-note contact-flow-field-note--inline">
        <Clock3 size={16} aria-hidden />
        Selected call: {formatBookingDate(data.callDate)} at {data.callTime} CST. We&apos;ll send the Google Calendar invite after review.
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
