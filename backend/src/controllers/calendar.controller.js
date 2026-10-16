const { query } = require('../config/database');
const { isValidMonthString, getMonthDateRange, addDays } = require('../utils/date.utils');

/**
 * Retrieve calendar tracking entries, symptoms, flow logs, and estimated dates for a month
 */
async function getCalendar(request, reply) {
  const userId = request.user.id;
  const { month } = request.query || {};

  if (!month || !isValidMonthString(month)) {
    return reply.status(400).send({
      status: 'error',
      message: 'month query parameter is required and must be in YYYY-MM format (e.g. 2026-10).',
    });
  }

  const { start: monthStart, end: monthEnd } = getMonthDateRange(month);

  try {
    const periodsRes = await query(
      `SELECT id, user_id, start_date, end_date, notes, created_at, updated_at
       FROM periods
       WHERE user_id = $1
         AND start_date <= $2
         AND (end_date IS NULL OR end_date >= $3)
       ORDER BY start_date ASC`,
      [userId, monthEnd, monthStart]
    );

    const periods = periodsRes.rows.map((p) => ({
      ...p,
      id: String(p.id),
      user_id: String(p.user_id),
      is_ongoing: p.end_date === null,
    }));

    const daysRes = await query(
      `SELECT dl.id, dl.period_id, dl.log_date, dl.flow, dl.created_at, dl.updated_at
       FROM period_day_logs dl
       JOIN periods p ON dl.period_id = p.id
       WHERE p.user_id = $1
         AND dl.log_date >= $2
         AND dl.log_date <= $3
       ORDER BY dl.log_date ASC`,
      [userId, monthStart, monthEnd]
    );

    const dailyFlows = daysRes.rows.map((d) => ({
      ...d,
      id: String(d.id),
      period_id: String(d.period_id),
    }));

    const symptomsRes = await query(
      `SELECT id, user_id, log_date, symptom_type, severity, notes, created_at, updated_at
       FROM symptom_logs
       WHERE user_id = $1
         AND log_date >= $2
         AND log_date <= $3
       ORDER BY log_date ASC, id ASC`,
      [userId, monthStart, monthEnd]
    );

    const symptoms = symptomsRes.rows.map((s) => ({
      ...s,
      id: String(s.id),
      user_id: String(s.user_id),
    }));

    const profileRes = await query(
      'SELECT average_cycle_length, average_period_duration FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    const profile = profileRes.rows[0] || { average_cycle_length: 28, average_period_duration: 5 };
    const avgCycleLength = profile.average_cycle_length || 28;
    const avgPeriodDuration = profile.average_period_duration || 5;

    const latestOverallRes = await query(
      `SELECT start_date, end_date FROM periods WHERE user_id = $1 ORDER BY start_date DESC LIMIT 1`,
      [userId]
    );

    const estimatedPeriods = [];

    if (latestOverallRes.rows.length > 0) {
      const latestOverall = latestOverallRes.rows[0];
      let cursorStart = latestOverall.start_date;

      for (let i = 0; i < 6; i++) {
        cursorStart = addDays(cursorStart, avgCycleLength);
        const cursorEnd = addDays(cursorStart, avgPeriodDuration - 1);

        if (cursorStart <= monthEnd && cursorEnd >= monthStart) {
          const hasActualPeriod = periods.some(
            (p) => p.start_date <= cursorEnd && (p.end_date === null || p.end_date >= cursorStart)
          );
          if (!hasActualPeriod) {
            estimatedPeriods.push({
              estimated_start_date: cursorStart,
              estimated_end_date: cursorEnd,
              is_estimate: true,
            });
          }
        }
        if (cursorStart > monthEnd) {
          break;
        }
      }
    }

    return reply.status(200).send({
      status: 'success',
      data: {
        month,
        date_range: {
          start: monthStart,
          end: monthEnd,
        },
        periods,
        daily_flows: dailyFlows,
        symptoms,
        estimated_periods: estimatedPeriods,
        disclaimer:
          'Predictions are estimates based on your logged history and standard cycle averages, not medical diagnoses.',
      },
    });
  } catch (err) {
    request.log.error(err, '[calendar.controller] Get calendar failed');
    return reply.status(500).send({
      status: 'error',
      message: 'Failed to retrieve calendar data.',
    });
  }
}

module.exports = {
  getCalendar,
};
