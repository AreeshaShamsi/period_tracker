export const DEMO_USER = {
  email: "areesha@example.com",
  password: "Password123",
  name: "Areesha Shamsi",
};

export const DUMMY_DASHBOARD_DATA = {
  user: DEMO_USER,
  cycleDay: 14,
  totalCycleDays: 28,
  phase: "Follicular Phase",
  fertilityStatus: "High Fertility Window",
  nextPeriodDays: 14,
  nextPeriodDate: "Oct 21, 2026",
  todayLog: {
    mood: "Energetic & Happy",
    sleepHours: "7.5 hrs",
    waterGlasses: 5,
    totalWaterTarget: 8,
    symptoms: ["Mild Cramps", "High Energy", "Clear Skin"],
  },
  dailyInsight: {
    title: "Follicular Phase Peak",
    message:
      "Your estrogen is rising! You may feel more energized, creative, and resilient. Great day for active workouts.",
  },
  recentLogs: [
    { date: "Yesterday", status: "Day 13 • Follicular", mood: "Calm" },
    { date: "2 days ago", status: "Day 12 • Follicular", mood: "Focused" },
    { date: "3 days ago", status: "Day 11 • Follicular", mood: "Normal" },
  ],
};
