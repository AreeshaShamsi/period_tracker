/**
 * Timezone-safe date utility functions for Lunari Period Tracker.
 * All functions operate strictly on YYYY-MM-DD date strings in UTC to prevent timezone shifts.
 */

const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Validates whether a string matches YYYY-MM-DD and is a real calendar date
 * @param {string} str
 * @returns {boolean}
 */
function isValidDateString(str) {
  if (typeof str !== 'string' || !DATE_REGEX.test(str)) {
    return false;
  }
  const [year, month, day] = str.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Validates whether a string matches YYYY-MM format
 * @param {string} str
 * @returns {boolean}
 */
function isValidMonthString(str) {
  return typeof str === 'string' && MONTH_REGEX.test(str);
}

/**
 * Returns today's date formatted as YYYY-MM-DD (UTC)
 * @returns {string}
 */
function getTodayUtcString() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adds an integer number of days to a YYYY-MM-DD date string.
 * @param {string} dateStr
 * @param {number} days
 * @returns {string}
 */
function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Computes difference in calendar days between two YYYY-MM-DD strings (end - start).
 * @param {string} startDateStr
 * @param {endDateStr} endDateStr
 * @returns {number}
 */
function daysBetween(startDateStr, endDateStr) {
  const [y1, m1, d1] = startDateStr.split('-').map(Number);
  const [y2, m2, d2] = endDateStr.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((utc2 - utc1) / MS_PER_DAY);
}

/**
 * Returns first and last date of a given YYYY-MM month.
 * @param {string} monthStr
 * @returns {{ start: string, end: string }}
 */
function getMonthDateRange(monthStr) {
  const [year, month] = monthStr.split('-').map(Number);
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  // Day 0 of next month is the last day of this month
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

module.exports = {
  isValidDateString,
  isValidMonthString,
  getTodayUtcString,
  addDays,
  daysBetween,
  getMonthDateRange,
};
