const { query } = require('../config/database');
const { isValidDateString, daysBetween } = require('../utils/date.utils');
const { mapDatabaseError } = require('../utils/error.utils');

/**
 * Create a new period record
 */
async function createPeriod(request, reply) {
  const userId = request.user.id;
  const { start_date, startDate, end_date, endDate, notes } = request.body || {};

  const effStartDate = start_date || startDate;
  const effEndDate = end_date !== undefined ? end_date : endDate;

  // 1. Validation
  if (!effStartDate || !isValidDateString(effStartDate)) {
    return reply.status(400).send({
      status: 'error',
      message: 'start_date is required and must be a valid date in YYYY-MM-DD format.',
    });
  }

  if (effEndDate !== undefined && effEndDate !== null) {
    if (!isValidDateString(effEndDate)) {
      return reply.status(400).send({
        status: 'error',
        message: 'end_date must be a valid date in YYYY-MM-DD format or null.',
      });
    }
    if (effEndDate < effStartDate) {
      return reply.status(400).send({
        status: 'error',
        message: 'end_date cannot precede start_date.',
      });
    }
  }

  const safeEndDate = effEndDate || null;
  const safeNotes = typeof notes === 'string' ? notes.trim() : null;

  try {
    const result = await query(
      `INSERT INTO periods (user_id, start_date, end_date, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, start_date, end_date, notes, created_at, updated_at`,
      [userId, effStartDate, safeEndDate, safeNotes]
    );

    const period = result.rows[0];

    return reply.status(201).send({
      status: 'success',
      message: 'Period created successfully.',
      data: {
        period: {
          ...period,
          id: String(period.id),
          user_id: String(period.user_id),
          duration_days: period.end_date ? daysBetween(period.start_date, period.end_date) + 1 : null,
          is_ongoing: period.end_date === null,
        },
      },
    });
  } catch (err) {
    request.log.error(err, '[period.controller] Create period failed');
    const mapped = mapDatabaseError(err, {
      periods_user_id_start_date_key: 'A period entry already exists for this start date.',
      periods_check: 'end_date cannot precede start_date.',
    });
    return reply.status(mapped.statusCode).send({
      status: 'error',
      message: mapped.message,
    });
  }
}

/**
 * List periods for authenticated user with pagination and sorting
 */
async function getPeriods(request, reply) {
  const userId = request.user.id;
  const { page = 1, limit = 20, sort = 'desc' } = request.query || {};

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;
  const sortDirection = String(sort).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  try {
    const countRes = await query(
      'SELECT COUNT(*) FROM periods WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const listRes = await query(
      `SELECT id, user_id, start_date, end_date, notes, created_at, updated_at
       FROM periods
       WHERE user_id = $1
       ORDER BY start_date ${sortDirection}, id ${sortDirection}
       LIMIT $2 OFFSET $3`,
      [userId, limitNum, offset]
    );

    const periods = listRes.rows.map((p) => ({
      ...p,
      id: String(p.id),
      user_id: String(p.user_id),
      duration_days: p.end_date ? daysBetween(p.start_date, p.end_date) + 1 : null,
      is_ongoing: p.end_date === null,
    }));

    return reply.status(200).send({
      status: 'success',
      data: {
        periods,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (err) {
    request.log.error(err, '[period.controller] Get periods failed');
    return reply.status(500).send({
      status: 'error',
      message: 'Failed to retrieve period records.',
    });
  }
}

/**
 * Get single period by ID including its daily flow logs
 */
async function getPeriodById(request, reply) {
  const userId = request.user.id;
  const periodId = request.params.id;

  if (!periodId || !/^\d+$/.test(periodId)) {
    return reply.status(400).send({
      status: 'error',
      message: 'Invalid period ID format.',
    });
  }

  try {
    const periodRes = await query(
      `SELECT id, user_id, start_date, end_date, notes, created_at, updated_at
       FROM periods
       WHERE id = $1 AND user_id = $2`,
      [periodId, userId]
    );

    if (periodRes.rows.length === 0) {
      return reply.status(404).send({
        status: 'error',
        message: 'Period record not found.',
      });
    }

    const period = periodRes.rows[0];

    const daysRes = await query(
      `SELECT id, period_id, log_date, flow, created_at, updated_at
       FROM period_day_logs
       WHERE period_id = $1
       ORDER BY log_date ASC`,
      [periodId]
    );

    const dayLogs = daysRes.rows.map((d) => ({
      ...d,
      id: String(d.id),
      period_id: String(d.period_id),
    }));

    return reply.status(200).send({
      status: 'success',
      data: {
        period: {
          ...period,
          id: String(period.id),
          user_id: String(period.user_id),
          duration_days: period.end_date ? daysBetween(period.start_date, period.end_date) + 1 : null,
          is_ongoing: period.end_date === null,
          days: dayLogs,
        },
      },
    });
  } catch (err) {
    request.log.error(err, '[period.controller] Get period by ID failed');
    return reply.status(500).send({
      status: 'error',
      message: 'Failed to retrieve period details.',
    });
  }
}

/**
 * Update an existing period
 */
async function updatePeriod(request, reply) {
  const userId = request.user.id;
  const periodId = request.params.id;
  const { start_date, startDate, end_date, endDate, notes } = request.body || {};

  if (!periodId || !/^\d+$/.test(periodId)) {
    return reply.status(400).send({
      status: 'error',
      message: 'Invalid period ID format.',
    });
  }

  const effStartDate = start_date !== undefined ? start_date : startDate;
  const effEndDate = end_date !== undefined ? end_date : endDate;

  try {
    const existingRes = await query(
      'SELECT id, start_date, end_date, notes FROM periods WHERE id = $1 AND user_id = $2',
      [periodId, userId]
    );

    if (existingRes.rows.length === 0) {
      return reply.status(404).send({
        status: 'error',
        message: 'Period record not found.',
      });
    }

    const current = existingRes.rows[0];

    const targetStartDate = effStartDate !== undefined ? effStartDate : current.start_date;
    const targetEndDate = effEndDate !== undefined ? effEndDate : current.end_date;

    if (effStartDate !== undefined && !isValidDateString(effStartDate)) {
      return reply.status(400).send({
        status: 'error',
        message: 'start_date must be a valid date in YYYY-MM-DD format.',
      });
    }

    if (effEndDate !== undefined && effEndDate !== null) {
      if (!isValidDateString(effEndDate)) {
        return reply.status(400).send({
          status: 'error',
          message: 'end_date must be a valid date in YYYY-MM-DD format or null.',
        });
      }
    }

    if (targetEndDate && targetEndDate < targetStartDate) {
      return reply.status(400).send({
        status: 'error',
        message: 'end_date cannot precede start_date.',
      });
    }

    const safeNotes = notes !== undefined ? (typeof notes === 'string' ? notes.trim() : null) : current.notes;

    const updateRes = await query(
      `UPDATE periods
       SET start_date = $1, end_date = $2, notes = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, start_date, end_date, notes, created_at, updated_at`,
      [targetStartDate, targetEndDate, safeNotes, periodId, userId]
    );

    const updated = updateRes.rows[0];

    return reply.status(200).send({
      status: 'success',
      message: 'Period updated successfully.',
      data: {
        period: {
          ...updated,
          id: String(updated.id),
          user_id: String(updated.user_id),
          duration_days: updated.end_date ? daysBetween(updated.start_date, updated.end_date) + 1 : null,
          is_ongoing: updated.end_date === null,
        },
      },
    });
  } catch (err) {
    request.log.error(err, '[period.controller] Update period failed');
    const mapped = mapDatabaseError(err, {
      periods_user_id_start_date_key: 'A period entry already exists for this start date.',
      periods_check: 'end_date cannot precede start_date.',
    });
    return reply.status(mapped.statusCode).send({
      status: 'error',
      message: mapped.message,
    });
  }
}

/**
 * Delete a period record
 */
async function deletePeriod(request, reply) {
  const userId = request.user.id;
  const periodId = request.params.id;

  if (!periodId || !/^\d+$/.test(periodId)) {
    return reply.status(400).send({
      status: 'error',
      message: 'Invalid period ID format.',
    });
  }

  try {
    const deleteRes = await query(
      'DELETE FROM periods WHERE id = $1 AND user_id = $2 RETURNING id',
      [periodId, userId]
    );

    if (deleteRes.rows.length === 0) {
      return reply.status(404).send({
        status: 'error',
        message: 'Period record not found.',
      });
    }

    return reply.status(200).send({
      status: 'success',
      message: 'Period deleted successfully.',
    });
  } catch (err) {
    request.log.error(err, '[period.controller] Delete period failed');
    return reply.status(500).send({
      status: 'error',
      message: 'Failed to delete period record.',
    });
  }
}

module.exports = {
  createPeriod,
  getPeriods,
  getPeriodById,
  updatePeriod,
  deletePeriod,
};
