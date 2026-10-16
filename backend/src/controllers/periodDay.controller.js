const { query } = require('../config/database');
const { isValidDateString } = require('../utils/date.utils');
const { mapDatabaseError } = require('../utils/error.utils');

const ALLOWED_FLOWS = ['light', 'medium', 'heavy', 'very_heavy'];

/**
 * Helper to verify that a period belongs to the authenticated user
 * @param {string} periodId
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
async function getVerifiedPeriod(periodId, userId) {
  if (!periodId || !/^\d+$/.test(periodId)) return null;
  const res = await query(
    'SELECT id, user_id, start_date, end_date FROM periods WHERE id = $1 AND user_id = $2',
    [periodId, userId]
  );
  return res.rows[0] || null;
}

/**
 * Add a daily flow log to a period
 */
async function createDayLog(request, reply) {
  const userId = request.user.id;
  const periodId = request.params.id;
  const { log_date, logDate, flow } = request.body || {};

  const effLogDate = log_date || logDate;

  // 1. Verify period ownership
  const period = await getVerifiedPeriod(periodId, userId);
  if (!period) {
    return reply.status(404).send({
      status: 'error',
      message: 'Period record not found.',
    });
  }

  // 2. Validate log_date
  if (!effLogDate || !isValidDateString(effLogDate)) {
    return reply.status(400).send({
      status: 'error',
      message: 'log_date is required and must be a valid date in YYYY-MM-DD format.',
    });
  }

  // 3. Validate flow
  if (!flow || typeof flow !== 'string' || !ALLOWED_FLOWS.includes(flow.toLowerCase())) {
    return reply.status(400).send({
      status: 'error',
      message: `flow must be one of: ${ALLOWED_FLOWS.join(', ')}.`,
    });
  }
  const normalizedFlow = flow.toLowerCase();

  // 4. Validate that log_date falls within the period bounds
  if (effLogDate < period.start_date) {
    return reply.status(400).send({
      status: 'error',
      message: `log_date (${effLogDate}) cannot precede period start_date (${period.start_date}).`,
    });
  }
  if (period.end_date !== null && effLogDate > period.end_date) {
    return reply.status(400).send({
      status: 'error',
      message: `log_date (${effLogDate}) cannot be after period end_date (${period.end_date}).`,
    });
  }

  try {
    const insertRes = await query(
      `INSERT INTO period_day_logs (period_id, log_date, flow)
       VALUES ($1, $2, $3)
       RETURNING id, period_id, log_date, flow, created_at, updated_at`,
      [period.id, effLogDate, normalizedFlow]
    );

    const log = insertRes.rows[0];

    return reply.status(201).send({
      status: 'success',
      message: 'Period flow logged successfully.',
      data: {
        dayLog: {
          ...log,
          id: String(log.id),
          period_id: String(log.period_id),
        },
      },
    });
  } catch (err) {
    request.log.error(err, '[periodDay.controller] Create day log failed');
    const mapped = mapDatabaseError(err, {
      period_day_logs_period_id_log_date_key: 'A flow entry for this date already exists for this period.',
      period_day_logs_flow_check: `Invalid flow value. Allowed values are: ${ALLOWED_FLOWS.join(', ')}.`,
    });
    return reply.status(mapped.statusCode).send({
      status: 'error',
      message: mapped.message,
    });
  }
}

/**
 * List all daily flow logs for a specific period
 */
async function getDayLogs(request, reply) {
  const userId = request.user.id;
  const periodId = request.params.id;

  const period = await getVerifiedPeriod(periodId, userId);
  if (!period) {
    return reply.status(404).send({
      status: 'error',
      message: 'Period record not found.',
    });
  }

  try {
    const logsRes = await query(
      `SELECT id, period_id, log_date, flow, created_at, updated_at
       FROM period_day_logs
       WHERE period_id = $1
       ORDER BY log_date ASC`,
      [period.id]
    );

    const days = logsRes.rows.map((d) => ({
      ...d,
      id: String(d.id),
      period_id: String(d.period_id),
    }));

    return reply.status(200).send({
      status: 'success',
      data: {
        period_id: String(period.id),
        days,
      },
    });
  } catch (err) {
    request.log.error(err, '[periodDay.controller] Get day logs failed');
    return reply.status(500).send({
      status: 'error',
      message: 'Failed to retrieve flow logs for period.',
    });
  }
}

/**
 * Update an existing daily flow log
 */
async function updateDayLog(request, reply) {
  const userId = request.user.id;
  const { id: periodId, dayLogId } = request.params;
  const { log_date, logDate, flow } = request.body || {};

  if (!dayLogId || !/^\d+$/.test(dayLogId)) {
    return reply.status(400).send({
      status: 'error',
      message: 'Invalid day log ID format.',
    });
  }

  const period = await getVerifiedPeriod(periodId, userId);
  if (!period) {
    return reply.status(404).send({
      status: 'error',
      message: 'Period record not found.',
    });
  }

  try {
    const existingRes = await query(
      'SELECT id, period_id, log_date, flow FROM period_day_logs WHERE id = $1 AND period_id = $2',
      [dayLogId, period.id]
    );

    if (existingRes.rows.length === 0) {
      return reply.status(404).send({
        status: 'error',
        message: 'Daily flow log not found for this period.',
      });
    }

    const current = existingRes.rows[0];
    const effLogDate = log_date !== undefined ? log_date : (logDate !== undefined ? logDate : current.log_date);
    const effFlow = flow !== undefined ? flow.toLowerCase() : current.flow;

    if (log_date !== undefined || logDate !== undefined) {
      if (!isValidDateString(effLogDate)) {
        return reply.status(400).send({
          status: 'error',
          message: 'log_date must be a valid date in YYYY-MM-DD format.',
        });
      }
      if (effLogDate < period.start_date) {
        return reply.status(400).send({
          status: 'error',
          message: `log_date (${effLogDate}) cannot precede period start_date (${period.start_date}).`,
        });
      }
      if (period.end_date !== null && effLogDate > period.end_date) {
        return reply.status(400).send({
          status: 'error',
          message: `log_date (${effLogDate}) cannot be after period end_date (${period.end_date}).`,
        });
      }
    }

    if (flow !== undefined && !ALLOWED_FLOWS.includes(effFlow)) {
      return reply.status(400).send({
        status: 'error',
        message: `flow must be one of: ${ALLOWED_FLOWS.join(', ')}.`,
      });
    }

    const updateRes = await query(
      `UPDATE period_day_logs
       SET log_date = $1, flow = $2, updated_at = NOW()
       WHERE id = $3 AND period_id = $4
       RETURNING id, period_id, log_date, flow, created_at, updated_at`,
      [effLogDate, effFlow, dayLogId, period.id]
    );

    const updated = updateRes.rows[0];

    return reply.status(200).send({
      status: 'success',
      message: 'Daily flow log updated successfully.',
      data: {
        dayLog: {
          ...updated,
          id: String(updated.id),
          period_id: String(updated.period_id),
        },
      },
    });
  } catch (err) {
    request.log.error(err, '[periodDay.controller] Update day log failed');
    const mapped = mapDatabaseError(err, {
      period_day_logs_period_id_log_date_key: 'A flow entry for this date already exists for this period.',
      period_day_logs_flow_check: `Invalid flow value. Allowed values are: ${ALLOWED_FLOWS.join(', ')}.`,
    });
    return reply.status(mapped.statusCode).send({
      status: 'error',
      message: mapped.message,
    });
  }
}

/**
 * Delete a daily flow log
 */
async function deleteDayLog(request, reply) {
  const userId = request.user.id;
  const { id: periodId, dayLogId } = request.params;

  if (!dayLogId || !/^\d+$/.test(dayLogId)) {
    return reply.status(400).send({
      status: 'error',
      message: 'Invalid day log ID format.',
    });
  }

  const period = await getVerifiedPeriod(periodId, userId);
  if (!period) {
    return reply.status(404).send({
      status: 'error',
      message: 'Period record not found.',
    });
  }

  try {
    const deleteRes = await query(
      'DELETE FROM period_day_logs WHERE id = $1 AND period_id = $2 RETURNING id',
      [dayLogId, period.id]
    );

    if (deleteRes.rows.length === 0) {
      return reply.status(404).send({
        status: 'error',
        message: 'Daily flow log not found for this period.',
      });
    }

    return reply.status(200).send({
      status: 'success',
      message: 'Daily flow log deleted successfully.',
    });
  } catch (err) {
    request.log.error(err, '[periodDay.controller] Delete day log failed');
    return reply.status(500).send({
      status: 'error',
      message: 'Failed to delete daily flow log.',
    });
  }
}

module.exports = {
  createDayLog,
  getDayLogs,
  updateDayLog,
  deleteDayLog,
};
