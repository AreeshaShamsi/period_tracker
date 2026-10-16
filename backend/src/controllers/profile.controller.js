const { query, pool } = require('../config/database');
const { mapDatabaseError } = require('../utils/error.utils');

/**
 * Get profile of authenticated user
 */
async function getProfile(request, reply) {
  const userId = request.user.id;

  try {
    const result = await query(
      `SELECT u.id AS user_id, u.name, u.email,
              p.birth_year, p.average_cycle_length, p.average_period_duration,
              p.onboarding_completed, p.created_at, p.updated_at
       FROM user_profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({
        status: 'error',
        message: 'Profile not found.',
      });
    }

    return reply.status(200).send({
      status: 'success',
      data: {
        profile: result.rows[0],
      },
    });
  } catch (err) {
    request.log.error(err, '[profile.controller] Error retrieving profile');
    return reply.status(500).send({
      status: 'error',
      message: 'Failed to retrieve profile.',
    });
  }
}

/**
 * Update profile of authenticated user (updates only supplied fields)
 */
async function updateProfile(request, reply) {
  const userId = request.user.id;
  const {
    name,
    birth_year,
    birthYear,
    average_cycle_length,
    averageCycleLength,
    average_period_duration,
    averagePeriodDuration,
    onboarding_completed,
    onboardingCompleted,
  } = request.body || {};

  const effBirthYear = birth_year !== undefined ? birth_year : birthYear;
  const effCycleLength = average_cycle_length !== undefined ? average_cycle_length : averageCycleLength;
  const effPeriodDuration = average_period_duration !== undefined ? average_period_duration : averagePeriodDuration;
  const effOnboarding = onboarding_completed !== undefined ? onboarding_completed : onboardingCompleted;

  // Validation
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return reply.status(400).send({
        status: 'error',
        message: 'Name cannot be empty.',
      });
    }
    if (name.trim().length > 100) {
      return reply.status(400).send({
        status: 'error',
        message: 'Name cannot exceed 100 characters.',
      });
    }
  }

  if (effBirthYear !== undefined && effBirthYear !== null) {
    const by = Number(effBirthYear);
    if (!Number.isInteger(by) || by < 1900 || by > 2100) {
      return reply.status(400).send({
        status: 'error',
        message: 'Birth year must be an integer between 1900 and 2100.',
      });
    }
  }

  if (effCycleLength !== undefined && effCycleLength !== null) {
    const acl = Number(effCycleLength);
    if (!Number.isInteger(acl) || acl < 15 || acl > 90) {
      return reply.status(400).send({
        status: 'error',
        message: 'Average cycle length must be an integer between 15 and 90 days.',
      });
    }
  }

  if (effPeriodDuration !== undefined && effPeriodDuration !== null) {
    const apd = Number(effPeriodDuration);
    if (!Number.isInteger(apd) || apd < 1 || apd > 15) {
      return reply.status(400).send({
        status: 'error',
        message: 'Average period duration must be an integer between 1 and 15 days.',
      });
    }
  }

  if (effOnboarding !== undefined && typeof effOnboarding !== 'boolean') {
    return reply.status(400).send({
      status: 'error',
      message: 'Onboarding completed must be a boolean.',
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (name !== undefined) {
      await client.query(
        'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2',
        [name.trim(), userId]
      );
    }

    const updates = [];
    const values = [];
    let paramIdx = 1;

    if (effBirthYear !== undefined) {
      updates.push(`birth_year = $${paramIdx++}`);
      values.push(effBirthYear === null ? null : Number(effBirthYear));
    }
    if (effCycleLength !== undefined) {
      updates.push(`average_cycle_length = $${paramIdx++}`);
      values.push(Number(effCycleLength));
    }
    if (effPeriodDuration !== undefined) {
      updates.push(`average_period_duration = $${paramIdx++}`);
      values.push(Number(effPeriodDuration));
    }
    if (effOnboarding !== undefined) {
      updates.push(`onboarding_completed = $${paramIdx++}`);
      values.push(Boolean(effOnboarding));
    }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      values.push(userId);
      const updateSql = `
        UPDATE user_profiles
        SET ${updates.join(', ')}
        WHERE user_id = $${paramIdx}
      `;
      await client.query(updateSql, values);
    }

    await client.query('COMMIT');

    const result = await query(
      `SELECT u.id AS user_id, u.name, u.email,
              p.birth_year, p.average_cycle_length, p.average_period_duration,
              p.onboarding_completed, p.created_at, p.updated_at
       FROM user_profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1`,
      [userId]
    );

    return reply.status(200).send({
      status: 'success',
      message: 'Profile updated successfully.',
      data: {
        profile: result.rows[0],
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    request.log.error(err, '[profile.controller] Update profile failed');
    const mapped = mapDatabaseError(err);
    return reply.status(mapped.statusCode).send({
      status: 'error',
      message: mapped.message,
    });
  } finally {
    client.release();
  }
}

/**
 * Notification preferences placeholder (omitted per user instruction)
 */
async function getNotificationPreferences(request, reply) {
  return reply.status(501).send({
    status: 'error',
    message: 'Notification preferences are not configured in the database schema for this phase.',
  });
}

async function updateNotificationPreferences(request, reply) {
  return reply.status(501).send({
    status: 'error',
    message: 'Notification preferences are not configured in the database schema for this phase.',
  });
}

module.exports = {
  getProfile,
  updateProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
};
