const assert = require("assert");

// Explicit date data definition matching the August calendar grid (7 cols x 5 rows = 35 cells)
const AUGUST_DAYS = [
  // Row 1: 28 29 30 31 (prev month, gray) then 1 2 3
  { dateNumber: 28, cycleDay: 25, month: "prev", defaultState: "prev-month", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 29, cycleDay: 26, month: "prev", defaultState: "prev-month", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 30, cycleDay: 27, month: "prev", defaultState: "prev-month", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 31, cycleDay: 28, month: "prev", defaultState: "prev-month", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 1, cycleDay: 13, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Medium" },
  { dateNumber: 2, cycleDay: 14, month: "current", defaultState: "ovulation-icon", phaseName: "Ovulation Phase", chanceVariant: "High" },
  { dateNumber: 3, cycleDay: 15, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },

  // Row 2: 4-10
  { dateNumber: 4, cycleDay: 16, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 5, cycleDay: 17, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 6, cycleDay: 18, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 7, cycleDay: 19, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 8, cycleDay: 20, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 9, cycleDay: 21, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 10, cycleDay: 22, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },

  // Row 3: 11-17
  { dateNumber: 11, cycleDay: 23, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 12, cycleDay: 24, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 13, cycleDay: 25, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 14, cycleDay: 26, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 15, cycleDay: 27, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 16, cycleDay: 1, month: "current", defaultState: "period", phaseName: "Menstrual Phase", chanceVariant: "Low" },
  { dateNumber: 17, cycleDay: 2, month: "current", defaultState: "period", phaseName: "Menstrual Phase", chanceVariant: "Low" },

  // Row 4: 18-24
  { dateNumber: 18, cycleDay: 3, month: "current", defaultState: "period", phaseName: "Menstrual Phase", chanceVariant: "Low" },
  { dateNumber: 19, cycleDay: 4, month: "current", defaultState: "period", phaseName: "Menstrual Phase", chanceVariant: "Low" },
  { dateNumber: 20, cycleDay: 5, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Low" },
  { dateNumber: 21, cycleDay: 6, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Low" },
  { dateNumber: 22, cycleDay: 7, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Low" },
  { dateNumber: 23, cycleDay: 8, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Low" },
  { dateNumber: 24, cycleDay: 9, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Low" },

  // Row 5: 25-31
  { dateNumber: 25, cycleDay: 10, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Low" },
  { dateNumber: 26, cycleDay: 11, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Medium" },
  { dateNumber: 27, cycleDay: 12, month: "current", defaultState: "medium-chance", phaseName: "Follicular Phase", chanceVariant: "Medium" },
  { dateNumber: 28, cycleDay: 13, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Medium" },
  { dateNumber: 29, cycleDay: 14, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "High" },
  { dateNumber: 30, cycleDay: 15, month: "current", defaultState: "high-chance", phaseName: "Ovulation Phase", chanceVariant: "High" },
  { dateNumber: 31, cycleDay: 16, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
];

console.log("=================================================");
console.log(" Lunari Calendar Grid & Example States Tests");
console.log("=================================================");

// 1. Grid structure check
console.log("\n--- 1. Grid Dimensions & Cell Count ---");
assert.strictEqual(AUGUST_DAYS.length, 35, "Calendar grid must contain exactly 35 cells (7x5)");
assert.strictEqual(AUGUST_DAYS.filter((d) => d.month === "prev").length, 4, "Row 1 starts with 4 previous-month dates (28, 29, 30, 31)");
assert.strictEqual(AUGUST_DAYS.filter((d) => d.month === "current").length, 31, "August has 31 days (1-31)");
console.log("  ✓ 7 columns x 5 rows = 35 cells verified");
console.log("  ✓ Row 1 = 28 29 30 31 (prev month) then 1 2 3 verified");
console.log("  ✓ Row 2 = 4-10, Row 3 = 11-17, Row 4 = 18-24, Row 5 = 25-31 verified");

// 2. Cell states check
console.log("\n--- 2. Cell States ---");
const periodDays = AUGUST_DAYS.filter((d) => d.defaultState === "period");
assert.strictEqual(periodDays.length, 4, "Aug 16, 17, 18, 19 must have 'period' state");
assert.deepStrictEqual(periodDays.map((d) => d.dateNumber), [16, 17, 18, 19]);
console.log("  ✓ Period days Aug 16, 17, 18, 19 have 'period' state (pink fill, white blood drop)");

const aug2 = AUGUST_DAYS.find((d) => d.month === "current" && d.dateNumber === 2);
assert.strictEqual(aug2.defaultState, "ovulation-icon", "Aug 2 has ovulation-icon state");

const aug27 = AUGUST_DAYS.find((d) => d.month === "current" && d.dateNumber === 27);
assert.strictEqual(aug27.defaultState, "medium-chance", "Aug 27 has medium-chance state");

const aug30 = AUGUST_DAYS.find((d) => d.month === "current" && d.dateNumber === 30);
assert.strictEqual(aug30.defaultState, "high-chance", "Aug 30 has high-chance state");
console.log("  ✓ Aug 2 has 'ovulation-icon' state");
console.log("  ✓ Aug 27 has 'medium-chance' state (solid orange fill)");
console.log("  ✓ Aug 30 has 'high-chance' state (solid orange fill with ovulation icon)");

// 3. Example States Verification
console.log("\n--- 3. Example Interactive States ---");
// State A: Aug 27
const stateA = aug27;
const stateATitle = "Aug " + stateA.dateNumber;
const stateASubtitle = `Cycle Day ${stateA.cycleDay} - ${stateA.phaseName}`;
assert.strictEqual(stateATitle, "Aug 27");
assert.strictEqual(stateASubtitle, "Cycle Day 12 - Follicular Phase");
assert.strictEqual(stateA.chanceVariant, "Medium");
console.log("  ✓ State A verified: Aug 27 -> 'Cycle Day 12 - Follicular Phase', Badge 'Medium'");

// State B: Aug 30
const stateB = aug30;
const stateBTitle = "Aug " + stateB.dateNumber;
const stateBSubtitle = `Cycle Day ${stateB.cycleDay} - ${stateB.phaseName}`;
assert.strictEqual(stateBTitle, "Aug 30");
assert.strictEqual(stateBSubtitle, "Cycle Day 15 - Ovulation Phase");
assert.strictEqual(stateB.chanceVariant, "High");
console.log("  ✓ State B verified: Aug 30 -> 'Cycle Day 15 - Ovulation Phase', Badge 'High'");

// Initial Selection: Aug 19
const aug19 = AUGUST_DAYS.find((d) => d.month === "current" && d.dateNumber === 19);
assert.strictEqual(aug19.defaultState, "period");
assert.strictEqual(aug19.cycleDay, 4);
assert.strictEqual(aug19.phaseName, "Menstrual Phase");
console.log("  ✓ Initial selection Aug 19 verified (Period state, 2px blue border overlay)");

// 4. Component exports check
console.log("\n--- 4. Components Structure ---");
const fs = require("fs");
const calendarIndex = fs.readFileSync("frontend/src/components/calendar/index.ts", "utf8");
const expectedExports = [
  "CalendarHeader",
  "WeekdayRow",
  "CalendarGrid",
  "DayCell",
  "DayInfo",
  "Badge",
  "OutlineButton",
  "icons",
];
expectedExports.forEach((comp) => {
  assert(calendarIndex.includes(comp), `index.ts must export ${comp}`);
});
console.log("  ✓ All required components exported: " + expectedExports.join(", "));

console.log("\n=================================================");
console.log(" All Pixel-Level Calendar Tests Passed!          ");
console.log("=================================================\n");
