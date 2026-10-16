const { query } = require('../config/database');
const { isValidDateString } = require('../utils/date.utils');
const { mapDatabaseError } = require('../utils/error.utils');

const ALLOWED_SYMPTOMS = [
  'cramps',
  'headache',
  'bloating',
  'back_pain',
  'breast_tenderness',
  'acne',
  'mood',
  'energy',
  'sleep',
  'appetite',
  'other',
];

/**
 * Log a symptom
 */
async function createSymptom(request, reply) {
  const userId = request.user.id;
  const { log_date, logDate, symptom_type, symptomType, severity, notes } = request.body || {};

  const effLogDate = log_date || logDate;
  const effSymptomType = symptom_type || symptomType;

  if (!effLogDate || !isValidDateString(effLogDate)) {
    return reply.status(400).send({
      status: 'error',
      message: 'log_date is required and must be a valid date in YYYY-MM-DD format.',
    });
  }

  if (!effSymptomType || typeof effSymptomType !== 'string' || !ALLOWED_SYMPTOMS.includes(effSymptomType.toLowerCase())) {
    return reply.status(400).send({
      status: 'error',
      message: `symptom_type is required and must be one of: ${ALLOWED_SYMPTOMS.join(', ')}.`,
    });
  }
  const normalizedType = effSymptomType.toLowerCase();

  let safeSeverity = null;
  if (severity !== undefined && severity !== null) {
    const sev = Number(severity);
    if (!Number.isInteger(sev) || sev < 1 || sev > 5) {
      return reply.status(400).send({
        status: 'error',
        message: 'severity must be an integer between 1 and 5.',
      });
    }
    safeSeverity = sev;
  }

  const safeNotes = typeof notes === 'string' ? notes.trim() : null;

  try {
    const result = await query(
      `INSERT INTO symptom_logs (user_id, log_date, symptom_type, severity, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, log_date, symptom_type, severity, notes, created_at, updated_at`,
      [userId, effLogDate, normalizedType, safeSeverity, safeNotes]
    );

    const log = result.rows[0];

    return reply.status(201).send({
      status: 'success',
      message: 'Symptom logged successfully.',
      data: {
        symptom: {
          ...log,
          id: String(log.id),
          user_id: String(log.user_id),
        },
      },
    });
  } catch (err) {
    request.log.error(err, '[symptom.controller] Create symptom log failed');
    const mapped = mapDatabaseError(err, {
      symptom_logs_user_id_log_date_symptom_type_key: 'This symptom has already been logged for this date.',
      symptom_logs_severity_check: 'severity must be an integer between 1 and 5.',
      symptom_logs_symptom_type_check: `symptom_type must be one of: ${ALLOWED_SYMPTOMS.join(', ')}.`,
    });
    return reply.status(mapped.statusCode).send({
      status: 'error',
      message: mapped.message,
    });
  }
}

/**
 * List symptoms with date range filtering and pagination
 */
async function getSymptoms(request, reply) {
  const userId = request.user.id;
  const {
    start_date,
    startDate,
    end_date,
    endDate,
    symptom_type,
    symptomType,
    page = 1,
    limit = 50,
  } = request.query || {};

  const effStartDate = start_date || startDate;
  const effEndDate = end_date || endDate;
  const effSymptomType = symptom_type || symptomType;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const offset = (pageNum - 1) * limitNum;

  const whereClauses = ['user_id = $1'];
  const params = [userId];
  let paramIdx = 2;

  if (effStartDate) {
    if (!isValidDateString(effStartDate)) {
      return reply.status(400).send({
        status: 'error',
        message: 'start_date must be in YYYY-MM-DD format.',
      });
    }
    whereClauses.push(`log_date >= $${paramIdx++}`);
    params.push(effStartDate);
  }

  if (effEndDate) {
    if (!isValidDateString(effEndDate)) {
      return reply.status(400).send({
        status: 'error',
        message: 'end_date must be in YYYY-MM-DD format.',
      });
    }
    whereClauses.push(`log_date <= $${paramIdx++}`);
    params.push(effEndDate);
  }

  if (effSymptomType) {
    whereClauses.push(`symptom_type = $${paramIdx++}`);
    params.push(effSymptomType.toLowerCase());
  }

  try {
    const whereSql = whereClauses.join(' AND ');

    const countRes = await query(
      `SELECT COUNT(*) FROM symptom_logs WHERE ${whereSql}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const listRes = await query(
      `SELECT id, user_id, log_date, symptom_type, severity, notes, created_at, updated_at
       FROM symptom_logs
       WHERE ${whereSql}
       ORDER BY log_date DESC, id DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limitNum, offset]
    );

    const symptoms = listRes.rows.map((s) => ({
      ...s,
      id: String(s.id),
      user_id: String(s.user_id),
    }));

    return reply.status(200).send({
      status: 'success',
      data: {
        symptoms,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (err) {
    request.log.error(err, '[symptom.controller] Get symptoms failed');
    return reply.status(500).send({
      status: 'error',
      message: 'Failed to retrieve symptom logs.',
    });
  }
}

/**
 * Update an existing symptom log
 */
async function updateSymptom(request, reply) {
  const userId = request.user.id;
  const symptomId = request.params.id;
  const { log_date, logDate, symptom_type, symptomType, severity, notes } = request.body || {};

  if (!symptomId || !/^\d+$/.test(symptomId)) {
    return reply.status(400).send({
      status: 'error',
      message: 'Invalid symptom log ID format.',
    });
  }

  try {
    const existingRes = await query(
      'SELECT id, user_id, log_date, symptom_type, severity, notes FROM symptom_logs WHERE id = $1 AND user_id = $2',
      [symptomId, userId]
    );

    if (existingRes.rows.length === 0) {
      return reply.status(404).send({
        status: 'error',
        message: 'Symptom log record not found.',
      });
    }

    const current = existingRes.rows[0];

    const effLogDate = log_date !== undefined ? log_date : (logDate !== undefined ? logDate : current.log_date);
    const effSymptomType = symptom_type !== undefined ? symptom_type : (symptomType !== undefined ? symptomType : current.symptom_type);
    const effSeverity = severity !== undefined ? severity : current.severity;
    const effNotes = notes !== undefined ? (typeof notes === 'string' ? notes.trim() : null) : current.notes;

    if (log_date !== undefined || logDate !== undefined) {
      if (!isValidDateString(effLogDate)) {
        return reply.status(400).send({
          status: 'error',
          message: 'log_date must be a valid date in YYYY-MM-DD format.',
        });
      }
    }

    if (symptom_type !== undefined || symptomType !== undefined) {
      if (!effSymptomType || !ALLOWED_SYMPTOMS.includes(effSymptomType.toLowerCase())) {
        return reply.status(400).send({
          status: 'error',
          message: `symptom_type must be one of: ${ALLOWED_SYMPTOMS.join(', ')}.`,
        });
      }
    }

    if (severity !== undefined && severity !== null) {
      const sev = Number(severity);
      if (!Number.isInteger(sev) || sev < 1 || sev > 5) {
        return reply.status(400).send({
          status: 'error',
          message: 'severity must be an integer between 1 and 5.',
        });
      }
    }

    const updateRes = await query(
      `UPDATE symptom_logs
       SET log_date = $1, symptom_type = $2, severity = $3, notes = $4, updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING id, user_id, log_date, symptom_type, severity, notes, created_at, updated_at`,
      [effLogDate, effSymptomType.toLowerCase(), effSeverity === null ? null : Number(effSeverity), effNotes, symptomId, userId]
    );

    const updated = updateRes.rows[0];

    return reply.status(200).send({
      status: 'success',
      message: 'Symptom log updated successfully.',
      data: {
        symptom: {
          ...updated,
          id: String(updated.id),
          user_id: String(updated.user_id),
        },
      },
    });
  } catch (err) {
    request.log.error(err, '[symptom.controller] Update symptom failed');
    const mapped = mapDatabaseError(err, {
      symptom_logs_user_id_log_date_symptom_type_key: 'This symptom has already been logged for this date.',
      symptom_logs_severity_check: 'severity must be an integer between 1 and 5.',
    });
    return reply.status(mapped.statusCode).send({
      status: 'error',
      message: mapped.message,
    });
  }
}

/**
 * Delete a symptom log
 */
async function deleteSymptom(request, reply) {
  const userId = request.user.id;
  const symptomId = request.params.id;

  if (!symptomId || !/^\d+$/.test(symptomId)) {
    return reply.status(400).send({
      status: 'error',
      message: 'Invalid symptom log ID format.',
    });
  }

  try {
    const deleteRes = await query(
      'DELETE FROM symptom_logs WHERE id = $1 AND user_id = $2 RETURNING id',
      [symptomId, userId]
    );

    if (deleteRes.rows.length === 0) {
      return reply.status(404).send({
        status: 'error',
        message: 'Symptom log record not found.',
      });
    }

    return reply.status(200).send({
      status: 'success',
      message: 'Symptom log deleted successfully.',
    });
  } catch (err) {
    request.log.error(err, '[symptom.controller] Delete symptom failed');
    return reply.status(500).send({
      status: 'error',
      message: 'Failed to delete symptom log.',
    });
  }
}

module.exports = {
  createSymptom,
  getSymptoms,
  updateSymptom,
  deleteSymptom,
};
