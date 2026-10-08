import { OnboardingData, UserLogs } from "@/types/onboarding";
import { addDays, daysBetween, parseISO, toISO } from "./date";

export function avgCycleLength(data: OnboardingData): number {
  if (data.cycleType === "regular") {
    return data.cycleLength || 28;
  }
  const min = data.cycleLengthMin || 26;
  const max = data.cycleLengthMax || 28;
  return Math.round((min + max) / 2);
}

export function lastPeriodStart(data: OnboardingData): Date {
  if (data.lastPeriodDays && data.lastPeriodDays.length > 0) {
    // Return earliest logged last period day
    const sorted = [...data.lastPeriodDays].sort();
    return parseISO(sorted[0]);
  }
  // Default fallback: 14 days ago
  return addDays(new Date(), -14);
}

export function effectiveStart(
  data: OnboardingData,
  today: Date = new Date()
): Date {
  const lastStart = lastPeriodStart(data);
  const avg = avgCycleLength(data);
  const diff = daysBetween(lastStart, today);

  if (diff >= avg && avg > 0) {
    const cyclesPassed = Math.floor(diff / avg);
    return addDays(lastStart, cyclesPassed * avg);
  }
  return lastStart;
}

export function cycleDay(
  data: OnboardingData,
  today: Date = new Date()
): number {
  const effStart = effectiveStart(data, today);
  const diff = daysBetween(effStart, today);
  return Math.max(1, diff + 1);
}

export function ovulationDay(data: OnboardingData): number {
  const avg = avgCycleLength(data);
  return Math.max(1, avg - 14);
}

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export function getPhase(
  cDay: number,
  periodLength: number,
  avgLength: number
): CyclePhase {
  const ov = Math.max(1, avgLength - 14);
  if (cDay <= periodLength) {
    return "menstrual";
  }
  if (cDay >= ov - 1 && cDay <= ov + 1) {
    return "ovulation";
  }
  if (cDay < ov - 1) {
    return "follicular";
  }
  return "luteal";
}

export function nextPeriod(data: OnboardingData, today: Date = new Date()) {
  const effStart = effectiveStart(data, today);
  const avg = avgCycleLength(data);
  const nextDate = addDays(effStart, avg);
  const daysUntil = daysBetween(today, nextDate);

  const isLate = daysUntil < 0;
  const daysLate = isLate ? Math.abs(daysUntil) : 0;

  if (data.cycleType === "irregular") {
    const minLen = data.cycleLengthMin || 26;
    const maxLen = data.cycleLengthMax || 28;
    const minDate = addDays(effStart, minLen);
    const maxDate = addDays(effStart, maxLen);
    const minDaysUntil = daysBetween(today, minDate);
    const maxDaysUntil = daysBetween(today, maxDate);

    return {
      date: nextDate,
      minDate,
      maxDate,
      daysUntil,
      minDaysUntil,
      maxDaysUntil,
      isLate,
      daysLate,
    };
  }

  return {
    date: nextDate,
    daysUntil,
    isLate,
    daysLate,
  };
}

export function fertileWindow(data: OnboardingData, today: Date = new Date()) {
  const effStart = effectiveStart(data, today);
  const ovDay = ovulationDay(data);
  const startDate = addDays(effStart, ovDay - 5);
  const endDate = addDays(effStart, ovDay + 1);
  const ovulationDate = addDays(effStart, ovDay);

  return {
    startDate,
    endDate,
    ovulationDate,
  };
}

export function getStats(data: OnboardingData, logs: UserLogs) {
  const avgCycle =
    data.cycleType === "regular"
      ? `${data.cycleLength || 28}`
      : `${data.cycleLengthMin || 26}-${data.cycleLengthMax || 28}`;

  const avgPeriod = data.periodLength || 4;

  let extraStarts = 0;
  const loggedSet = new Set(logs.periodDays || []);
  const initialSet = new Set(data.lastPeriodDays || []);

  loggedSet.forEach((iso) => {
    if (initialSet.has(iso)) return;
    const date = parseISO(iso);
    const prevISO = toISO(addDays(date, -1));
    if (!loggedSet.has(prevISO)) {
      extraStarts += 1;
    }
  });

  const cyclesTracked = 1 + extraStarts;

  return {
    avgCycle,
    avgPeriod,
    cyclesTracked,
  };
}
