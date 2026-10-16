const { query } = require('../config/database');
const { getTodayUtcString, daysBetween, addDays } = require('../utils/date.utils');

/**
 * Calculate cycle information and predictions from actual user history and profile
 */
async function getCycle(request, reply) {
  const userId = request.user.id;

  try {
    const profileRes = await query(
      'SELECT average_cycle_length, average_period_duration FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    const profile = profileRes.rows[0] || {
      average_cycle_length: 28,
      average_period_duration: 5,
    };

    const avgCycleLength = profile.average_cycle_length || 28;
    const avgPeriodDuration = profile.average_period_duration || 5;

    const periodsRes = await query(
      `SELECT id, start_date, end_date, notes
       FROM periods
       WHERE user_id = $1
       ORDER BY start_date DESC`,
      [userId]
    );

    const periods = periodsRes.rows;

    if (periods.length === 0) {
      return reply.status(200).send({
        status: 'success',
        data: {
          latest_period_start_date: null,
          latest_period_end_date: null,
          is_ongoing: false,
          current_cycle_day: null,
          average_cycle_length: avgCycleLength,
          average_period_duration: avgPeriodDuration,
          estimated_next_period_start_date: null,
          estimated_period_end_date: null,
          is_estimate: true,
          disclaimer:
            'Predictions are estimates based on your logged history and standard cycle averages, not medical diagnoses.',
        },
      });
    }

    const latest = periods[0];
    const isOngoing = latest.end_date === null;
    const today = getTodayUtcString();

    let currentCycleDay = null;
    if (today >= latest.start_date) {
      currentCycleDay = daysBetween(latest.start_date, today) + 1;
    }

    let calculatedCycleLength = avgCycleLength;
    if (periods.length >= 2) {
      const cycleIntervals = [];
      for (let i = 0; i < Math.min(periods.length - 1, 6); i++) {
        const diff = daysBetween(periods[i + 1].start_date, periods[i].start_date);
        if (diff >= 15 && diff <= 90) {
          cycleIntervals.push(diff);
        }
      }
      if (cycleIntervals.length > 0) {
        calculatedCycleLength = Math.round(
          cycleIntervals.reduce((a, b) => a + b, 0) / cycleIntervals.length
        );
      }
    }

    const estimatedNextStart = addDays(latest.start_date, calculatedCycleLength);
    let estimatedPeriodEnd;

    if (isOngoing) {
      estimatedPeriodEnd = addDays(latest.start_date, avgPeriodDuration - 1);
    } else {
      estimatedPeriodEnd = addDays(estimatedNextStart, avgPeriodDuration - 1);
    }

    return reply.status(200).send({
      status: 'success',
      data: {
        latest_period_start_date: latest.start_date,
        latest_period_end_date: latest.end_date,
        is_ongoing: isOngoing,
        current_cycle_day: currentCycleDay,
        average_cycle_length: calculatedCycleLength,
        average_period_duration: avgPeriodDuration,
        estimated_next_period_start_date: estimatedNextStart,
        estimated_period_end_date: estimatedPeriodEnd,
        is_estimate: true,
        disclaimer:
          'Predictions are estimates based on your logged history and standard cycle averages, not medical diagnoses.',
      },
    });
  } catch (err) {
    request.log.error(err, '[cycle.controller] Get cycle failed');
    return reply.status(500).send({
      status: 'error',
      message: 'Failed to calculate cycle statistics.',
    });
  }
}

module.exports = {
  getCycle,
};
