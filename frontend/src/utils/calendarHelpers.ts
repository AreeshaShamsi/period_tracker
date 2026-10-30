import { OnboardingData, UserLogs } from "@/types/onboarding";
import {
  addDays,
  daysBetween,
  daysInMonth,
  MONTH_NAMES,
  parseISO,
  toISO,
} from "./date";
import { avgCycleLength, lastPeriodStart, ovulationDay } from "./cycle";
import { CalendarDataResponse } from "@/services/calendar.service";

export interface CalendarGridCell {
  year: number;
  month: number; // 1-indexed (1-12)
  day: number;
  iso: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  colIndex: number; // 0 (Sun) to 6 (Sat)
}

export type FertilityProbability = "High" | "Medium" | "Low";

export interface DateCycleInfo {
  iso: string;
  cycleDay: number;
  phase: "menstrual" | "follicular" | "ovulation" | "luteal";
  phaseName: string;
  cycleSummary: string; // e.g. "Cycle Day 12 - Follicular Phase"
  isPeriod: boolean;
  isPredictedPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  fertilityChance: FertilityProbability;
  fertilityDescription: string;
  hasSymptoms: boolean;
  symptoms: string[];
}

/**
 * Generate a complete 7-column calendar grid for a given year and month (1-indexed).
 * Always starts on Sunday. Includes leading days from the previous month and
 * trailing days from the next month for a clean rectangular grid.
 */
export function generateMonthGrid(year: number, month: number): CalendarGridCell[] {
  const todayISO = toISO(new Date());
  const totalDays = daysInMonth(year, month);
  const firstDayWeekday = new Date(year, month - 1, 1).getDay(); // 0 = Sun, 6 = Sat

  const cells: CalendarGridCell[] = [];

  // 1. Leading days from previous month
  if (firstDayWeekday > 0) {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthDays = daysInMonth(prevYear, prevMonth);
    const startDay = prevMonthDays - firstDayWeekday + 1;

    for (let d = startDay; d <= prevMonthDays; d++) {
      const dateObj = new Date(prevYear, prevMonth - 1, d);
      const iso = toISO(dateObj);
      cells.push({
        year: prevYear,
        month: prevMonth,
        day: d,
        iso,
        isCurrentMonth: false,
        isToday: iso === todayISO,
        colIndex: cells.length % 7,
      });
    }
  }

  // 2. Days of the current month
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month - 1, d);
    const iso = toISO(dateObj);
    cells.push({
      year,
      month,
      day: d,
      iso,
      isCurrentMonth: true,
      isToday: iso === todayISO,
      colIndex: cells.length % 7,
    });
  }

  // 3. Trailing days from next month to complete the row
  const remainder = cells.length % 7;
  const trailingNeeded = remainder === 0 ? 0 : 7 - remainder;

  if (trailingNeeded > 0) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    for (let d = 1; d <= trailingNeeded; d++) {
      const dateObj = new Date(nextYear, nextMonth - 1, d);
      const iso = toISO(dateObj);
      cells.push({
        year: nextYear,
        month: nextMonth,
        day: d,
        iso,
        isCurrentMonth: false,
        isToday: iso === todayISO,
        colIndex: cells.length % 7,
      });
    }
  }

  return cells;
}

/**
 * Compute cycle metrics, phase, period prediction, and fertility chance for any arbitrary ISO date.
 */
export function getCycleInfoForDate(
  targetISO: string,
  onboardingData: OnboardingData,
  userLogs: UserLogs,
  serverData?: CalendarDataResponse | null
): DateCycleInfo {
  const targetDate = parseISO(targetISO);
  const avg = avgCycleLength(onboardingData) || 28;
  const pLen = onboardingData.periodLength || 5;
  const ovDay = ovulationDay(onboardingData) || Math.max(1, avg - 14);

  // 1. Check if confirmed period exists on this date
  const loggedPeriodSet = new Set(userLogs?.periodDays || []);
  const initialPeriodSet = new Set(onboardingData?.lastPeriodDays || []);

  let isPeriod = loggedPeriodSet.has(targetISO) || initialPeriodSet.has(targetISO);

  if (!isPeriod && serverData?.periods) {
    isPeriod = serverData.periods.some((p) => {
      const start = p.start_date;
      const end = p.end_date || p.start_date;
      return targetISO >= start && targetISO <= end;
    });
  }

  // 2. Determine cycle day relative to last period start
  const lastStart = lastPeriodStart(onboardingData);
  const diff = daysBetween(lastStart, targetDate);
  const cycleOffset = Math.floor(diff / avg);
  const currentCycleStart = addDays(lastStart, cycleOffset * avg);
  const cDay = daysBetween(currentCycleStart, targetDate) + 1;

  // 3. Predicted period (only if NOT confirmed period)
  let isPredictedPeriod = false;
  if (!isPeriod) {
    if (cDay >= 1 && cDay <= pLen) {
      isPredictedPeriod = true;
    }
    // Also check server estimated periods if available
    if (serverData?.estimated_periods) {
      const hasServerEstimate = serverData.estimated_periods.some((ep) => {
        return targetISO >= ep.estimated_start_date && targetISO <= ep.estimated_end_date;
      });
      if (hasServerEstimate) {
        isPredictedPeriod = true;
      }
    }
  }

  // 4. Ovulation and Fertile Window
  const isOvulation = cDay === ovDay;
  const isFertile = cDay >= ovDay - 5 && cDay <= ovDay + 1;

  // 5. Fertility Probability
  let fertilityChance: FertilityProbability = "Low";
  if (cDay >= ovDay - 2 && cDay <= ovDay) {
    fertilityChance = "High";
  } else if (cDay >= ovDay - 5 && cDay <= ovDay + 1) {
    fertilityChance = "Medium";
  } else {
    fertilityChance = "Low";
  }

  // 6. Phase calculation
  let phase: "menstrual" | "follicular" | "ovulation" | "luteal" = "follicular";
  let phaseName = "Follicular Phase";

  if (isPeriod || isPredictedPeriod || cDay <= pLen) {
    phase = "menstrual";
    phaseName = "Menstrual Phase";
  } else if (cDay >= ovDay - 1 && cDay <= ovDay + 1) {
    phase = "ovulation";
    phaseName = "Ovulation Phase";
  } else if (cDay < ovDay - 1) {
    phase = "follicular";
    phaseName = "Follicular Phase";
  } else {
    phase = "luteal";
    phaseName = "Luteal Phase";
  }

  // 7. Symptoms
  const localSymptoms = userLogs?.symptoms?.[targetISO] || [];
  const serverSymptoms: string[] = [];
  if (serverData?.symptoms) {
    serverData.symptoms.forEach((s) => {
      if (s.log_date === targetISO && !serverSymptoms.includes(s.symptom_type)) {
        serverSymptoms.push(s.symptom_type);
      }
    });
  }

  const allSymptoms = Array.from(new Set([...localSymptoms, ...serverSymptoms]));
  const hasSymptoms = allSymptoms.length > 0;

  return {
    iso: targetISO,
    cycleDay: cDay,
    phase,
    phaseName,
    cycleSummary: `Cycle Day ${cDay} - ${phaseName}`,
    isPeriod,
    isPredictedPeriod,
    isFertile,
    isOvulation,
    fertilityChance,
    fertilityDescription: "- Chance of getting pregnant",
    hasSymptoms,
    symptoms: allSymptoms,
  };
}

/**
 * Format month only, e.g. "August" or "October"
 */
export function formatMonthOnly(month: number): string {
  return MONTH_NAMES[month - 1] || "";
}

/**
 * Format month and year, e.g. "October 2025"
 */
export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/**
 * Format compact selected date, e.g. "Aug 27" or "Oct 14"
 */
export function formatSelectedCompactDate(isoStr: string): string {
  const date = parseISO(isoStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();
  return `${monthName} ${dayNum}`;
}

/**
 * Format selected date header e.g. "Tuesday, Oct 14" or "Today, Oct 14"
 */
export function formatSelectedDateHeader(isoStr: string): string {
  const date = parseISO(isoStr);
  const todayISO = toISO(new Date());
  const isToday = isoStr === todayISO;

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const dayOfWeek = isToday ? "Today" : days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();

  return `${dayOfWeek}, ${monthName} ${dayNum}`;
}
