export type BirthdayData = {
  month: number;
  day: number;
  year: number;
};

export type OnboardingData = {
  name: string;
  birthday: BirthdayData;
  periodLength: number; // 1-10, default 4
  cycleType: "regular" | "irregular"; // default 'regular'
  cycleLength: number; // regular, 21-45, default 28
  cycleLengthMin: number; // irregular, default 26
  cycleLengthMax: number; // irregular, default 28
  lastPeriodDays: string[]; // ISO dates 'YYYY-MM-DD', sorted
};

export type UserLogs = {
  periodDays: string[];
  symptoms: Record<string, string[]>;
  moods: Record<string, string>;
  notes: Record<string, string>;
};
