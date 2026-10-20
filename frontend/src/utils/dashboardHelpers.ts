import { DayStripItem } from "@/components/dashboard/DayStrip";
import { DayChipState } from "@/components/dashboard/DayChip";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Derives a dynamic 10-day strip window centered around today:
 * 3 days past, today, and 6 days upcoming.
 */
export function generateDayStripItems(today: Date = new Date()): {
  items: DayStripItem[];
  currentIndex: number;
} {
  const items: DayStripItem[] = [];
  const startOffset = -3;
  const totalCount = 10;
  const todayDateNum = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  let currentIndex = 3;

  for (let i = 0; i < totalCount; i++) {
    const offset = startOffset + i;
    const d = new Date(todayYear, todayMonth, todayDateNum + offset);
    const dayName = DAY_NAMES[d.getDay()];
    const dayNumber = d.getDate();

    let state: DayChipState = "upcoming";
    if (offset < 0) {
      state = "done";
    } else if (offset === 0) {
      state = "today";
      currentIndex = i;
    } else {
      state = "upcoming";
    }

    items.push({
      id: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      dayName,
      dayNumber,
      state,
    });
  }

  return { items, currentIndex };
}

/**
 * Formats phase name for display.
 */
export function formatPhaseName(rawPhase: string): string {
  switch (rawPhase.toLowerCase()) {
    case "menstrual":
    case "menstruation":
      return "Menstruation phase";
    case "follicular":
      return "Follicular phase";
    case "ovulation":
      return "Ovulation phase";
    case "luteal":
      return "Luteal phase";
    default:
      return `${rawPhase.charAt(0).toUpperCase() + rawPhase.slice(1)} phase`;
  }
}
