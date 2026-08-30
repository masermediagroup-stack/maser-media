"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "motion/react";

type TimePeriod = "am" | "pm";

type ParsedSlot = {
  slot: string;
  hour12: number;
  minutes: number;
  period: TimePeriod;
  totalMinutes: number;
};

type DialColumnProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  optionIdPrefix: string;
};

function parseTimeSlot(slot: string): ParsedSlot | null {
  const match = /^(\d{1,2}):(\d{2})(am|pm)$/.exec(slot);
  if (!match) return null;

  const hour12 = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3] as TimePeriod;
  if (!Number.isFinite(hour12) || !Number.isFinite(minutes)) return null;

  const hour24 = period === "am" ? (hour12 === 12 ? 0 : hour12) : hour12 === 12 ? 12 : hour12 + 12;

  return {
    slot,
    hour12,
    minutes,
    period,
    totalMinutes: hour24 * 60 + minutes,
  };
}

function uniqueInOrder<T>(values: T[]): T[] {
  const seen = new Set<T>();
  const next: T[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    next.push(value);
  }
  return next;
}

function formatHour(hour12: number) {
  return String(hour12);
}

function formatMinutes(minutes: number) {
  return String(minutes).padStart(2, "0");
}

function formatPeriod(period: TimePeriod) {
  return period.toUpperCase();
}

function nearestSlot(
  slots: ParsedSlot[],
  hour12: number,
  minutes: number,
  period: TimePeriod,
): ParsedSlot | null {
  if (slots.length === 0) return null;

  const exact = slots.find(
    (slot) => slot.hour12 === hour12 && slot.minutes === minutes && slot.period === period,
  );
  if (exact) return exact;

  const sameHourPeriod = slots.filter((slot) => slot.hour12 === hour12 && slot.period === period);
  const pool =
    sameHourPeriod.length > 0 ? sameHourPeriod : slots.filter((slot) => slot.hour12 === hour12);
  const candidates = pool.length > 0 ? pool : slots;

  const hour24 = period === "am" ? (hour12 === 12 ? 0 : hour12) : hour12 === 12 ? 12 : hour12 + 12;
  const target = hour24 * 60 + minutes;

  return candidates.reduce((best, slot) => {
    const bestDist = Math.abs(best.totalMinutes - target);
    const slotDist = Math.abs(slot.totalMinutes - target);
    return slotDist < bestDist ? slot : best;
  });
}

function DialColumn({ label, options, value, onChange, optionIdPrefix }: DialColumnProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ignoreScrollRef = useRef(false);
  const frameRef = useRef(0);
  const settleRef = useRef(0);
  const hasMountedRef = useRef(false);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const index = Math.max(0, options.indexOf(value));
    const option = scroller.querySelector<HTMLElement>("[data-dial-option]");
    const itemHeight = option?.offsetHeight ?? 0;
    if (itemHeight <= 0) return;
    const top = index * itemHeight;
    if (Math.abs(scroller.scrollTop - top) < 2) return;
    ignoreScrollRef.current = true;
    scroller.scrollTo({
      top,
      behavior: !hasMountedRef.current || reduceMotion ? "auto" : "smooth",
    });
    hasMountedRef.current = true;
    window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => {
      ignoreScrollRef.current = false;
    }, reduceMotion ? 0 : 280);
    return () => {
      window.clearTimeout(settleRef.current);
    };
  }, [value, options, reduceMotion]);

  useEffect(() => {
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      window.clearTimeout(settleRef.current);
    };
  }, []);

  const commitFromScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller || ignoreScrollRef.current || options.length === 0) return;
    const option = scroller.querySelector<HTMLElement>("[data-dial-option]");
    const itemHeight = option?.offsetHeight ?? 0;
    if (itemHeight <= 0) return;
    const index = Math.min(options.length - 1, Math.max(0, Math.round(scroller.scrollTop / itemHeight)));
    const nextValue = options[index];
    if (nextValue && nextValue !== value) onChange(nextValue);
  };

  const onScroll = () => {
    if (frameRef.current) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = 0;
      commitFromScroll();
    });
  };

  const moveBy = (delta: number) => {
    const index = Math.max(0, options.indexOf(value));
    const next = options[Math.min(options.length - 1, Math.max(0, index + delta))];
    if (next) onChange(next);
  };

  return (
    <div
      ref={scrollerRef}
      className="contact-flow-dial-column"
      role="listbox"
      aria-label={label}
      aria-activedescendant={`${optionIdPrefix}-${value}`}
      tabIndex={0}
      onScroll={onScroll}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "PageDown") {
          event.preventDefault();
          moveBy(1);
        } else if (event.key === "ArrowUp" || event.key === "PageUp") {
          event.preventDefault();
          moveBy(-1);
        } else if (event.key === "Home") {
          event.preventDefault();
          if (options[0]) onChange(options[0]);
        } else if (event.key === "End") {
          event.preventDefault();
          const last = options[options.length - 1];
          if (last) onChange(last);
        }
      }}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            id={`${optionIdPrefix}-${option}`}
            type="button"
            role="option"
            data-dial-option=""
            className={`contact-flow-dial-option${selected ? " is-selected" : ""}`}
            aria-selected={selected}
            tabIndex={-1}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function ContactTimeDial({
  slots,
  value,
  onChange,
}: {
  slots: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const reactId = useId().replace(/:/g, "");
  const parsedSlots = useMemo(() => {
    return slots.flatMap((slot) => {
      const parsed = parseTimeSlot(slot);
      return parsed ? [parsed] : [];
    });
  }, [slots]);

  const selected = useMemo(() => {
    return parsedSlots.find((slot) => slot.slot === value) ?? parsedSlots[0] ?? null;
  }, [parsedSlots, value]);

  const hourOptions = useMemo(
    () => uniqueInOrder(parsedSlots.map((slot) => formatHour(slot.hour12))),
    [parsedSlots],
  );

  const hourValue = selected ? formatHour(selected.hour12) : (hourOptions[0] ?? "");
  const selectedHour = selected?.hour12 ?? Number(hourOptions[0]);

  const periodOptions = useMemo(() => {
    const matching = parsedSlots.filter((slot) => slot.hour12 === selectedHour);
    const periods = uniqueInOrder(matching.map((slot) => formatPeriod(slot.period)));
    return periods.length > 0 ? periods : uniqueInOrder(parsedSlots.map((slot) => formatPeriod(slot.period)));
  }, [parsedSlots, selectedHour]);

  const periodValue = selected ? formatPeriod(selected.period) : (periodOptions[0] ?? "");
  const selectedPeriod = (periodValue.toLowerCase() as TimePeriod) || "am";

  const minuteOptions = useMemo(() => {
    const matching = parsedSlots.filter(
      (slot) => slot.hour12 === selectedHour && slot.period === selectedPeriod,
    );
    const minutes = uniqueInOrder(matching.map((slot) => formatMinutes(slot.minutes)));
    return minutes.length > 0 ? minutes : uniqueInOrder(parsedSlots.map((slot) => formatMinutes(slot.minutes)));
  }, [parsedSlots, selectedHour, selectedPeriod]);

  const minuteValue = selected ? formatMinutes(selected.minutes) : (minuteOptions[0] ?? "");

  const commit = (hour12: number, minutes: number, period: TimePeriod) => {
    const next = nearestSlot(parsedSlots, hour12, minutes, period);
    if (next && next.slot !== value) onChange(next.slot);
  };

  if (!selected) return null;

  return (
    <div className="contact-flow-time-dial" aria-label="Call time">
      <label className="contact-flow-sr-only" htmlFor={`${reactId}-time-select`}>
        Call time
        <select
          id={`${reactId}-time-select`}
          value={selected.slot}
          onChange={(event) => onChange(event.target.value)}
        >
          {parsedSlots.map((slot) => (
            <option key={slot.slot} value={slot.slot}>
              {slot.slot} CST
            </option>
          ))}
        </select>
      </label>

      <div className="contact-flow-dial" role="group" aria-label="Time dial">
        <div className="contact-flow-dial-window" aria-hidden />
        <DialColumn
          label="Hour"
          options={hourOptions}
          value={hourValue}
          optionIdPrefix={`${reactId}-hour`}
          onChange={(nextHour) => {
            commit(Number(nextHour), selected.minutes, selected.period);
          }}
        />
        <span className="contact-flow-dial-colon" aria-hidden>
          :
        </span>
        <DialColumn
          label="Minutes"
          options={minuteOptions}
          value={minuteValue}
          optionIdPrefix={`${reactId}-minute`}
          onChange={(nextMinutes) => {
            commit(selected.hour12, Number(nextMinutes), selected.period);
          }}
        />
        <DialColumn
          label="AM or PM"
          options={periodOptions}
          value={periodValue}
          optionIdPrefix={`${reactId}-period`}
          onChange={(nextPeriod) => {
            commit(selected.hour12, selected.minutes, nextPeriod.toLowerCase() as TimePeriod);
          }}
        />
      </div>
    </div>
  );
}
