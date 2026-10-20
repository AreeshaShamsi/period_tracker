const { query, pool } = require('../config/database');
const { mapDatabaseError } = require('../utils/error.utils');
const { validateUpdateProfile } = require('../validators/profile.validator');

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

    const prof = result.rows[0];
    const isOnboarded = Boolean(prof.onboarding_completed);

    return reply.status(200).send({
      status: 'success',
      data: {
        profile: {
          ...prof,
          onboarding_completed: isOnboarded,
          onboardingCompleted: isOnboarded,
        },
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

  // Zod Schema Validation
  const validation = validateUpdateProfile({
    name,
    birthYear: effBirthYear,
    averageCycleLength: effCycleLength,
    averagePeriodDuration: effPeriodDuration,
    onboardingCompleted: effOnboarding,
  });

  if (!validation.success) {
    return reply.status(400).send({
      status: 'error',
      message: validation.message,
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

    const prof = result.rows[0];
    const isOnboarded = Boolean(prof.onboarding_completed);

    return reply.status(200).send({
      status: 'success',
      message: 'Profile updated successfully.',
      data: {
        profile: {
          ...prof,
          onboarding_completed: isOnboarded,
          onboardingCompleted: isOnboarded,
        },
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
 * Complete onboarding and persist profile and initial period logs transactionally
 */
async function completeOnboarding(request, reply) {
  const userId = request.user.id;
  const {
    name,
    birth_year,
    birthYear,
    average_cycle_length,
    averageCycleLength,
    average_period_duration,
    averagePeriodDuration,
    last_period_days,
    lastPeriodDays,
  } = request.body || {};

  const effName = typeof name === 'string' && name.trim() ? name.trim() : undefined;
  const effBirthYear = birth_year !== undefined ? birth_year : birthYear;
  const effCycleLength = average_cycle_length !== undefined ? average_cycle_length : averageCycleLength;
  const effPeriodDuration = average_period_duration !== undefined ? average_period_duration : averagePeriodDuration;
  const rawPeriodDays = last_period_days || lastPeriodDays;

  // Zod Schema Validation
  const validation = validateUpdateProfile({
    name: effName,
    birthYear: effBirthYear,
    averageCycleLength: effCycleLength,
    averagePeriodDuration: effPeriodDuration,
  });

  if (!validation.success) {
    return reply.status(400).send({
      status: 'error',
      message: validation.message,
    });
  }

  const parsedBirthYear = effBirthYear !== undefined && effBirthYear !== null ? Number(effBirthYear) : null;
  const parsedCycleLength = effCycleLength !== undefined && effCycleLength !== null ? Number(effCycleLength) : 28;
  const parsedPeriodDuration = effPeriodDuration !== undefined && effPeriodDuration !== null ? Number(effPeriodDuration) : 4;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update user name if given
    if (effName) {
      await client.query('UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2', [effName, userId]);
    }

    // 2. Upsert user_profiles with onboarding_completed = true
    await client.query(
      `INSERT INTO user_profiles (user_id, birth_year, average_cycle_length, average_period_duration, onboarding_completed, created_at, updated_at)
       VALUES ($1, $2, $3, $4, TRUE, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET birth_year = COALESCE($2, user_profiles.birth_year),
           average_cycle_length = COALESCE($3, user_profiles.average_cycle_length),
           average_period_duration = COALESCE($4, user_profiles.average_period_duration),
           onboarding_completed = TRUE,
           updated_at = NOW()`,
      [userId, parsedBirthYear, parsedCycleLength, parsedPeriodDuration]
    );

    // 3. If lastPeriodDays provided, insert initial period record safely
    if (Array.isArray(rawPeriodDays) && rawPeriodDays.length > 0) {
      const validDates = rawPeriodDays
        .filter((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
        .sort();

      if (validDates.length > 0) {
        const startDate = validDates[0];
        const endDate = validDates[validDates.length - 1];

        const existingPeriod = await client.query(
          'SELECT id FROM periods WHERE user_id = $1 AND (start_date = $2 OR (start_date <= $2 AND end_date >= $2))',
          [userId, startDate]
        );

        let periodId;
        if (existingPeriod.rows.length === 0) {
          const insertPeriod = await client.query(
            `INSERT INTO periods (user_id, start_date, end_date, notes, created_at, updated_at)
             VALUES ($1, $2, $3, 'Initial period from onboarding', NOW(), NOW())
             RETURNING id`,
            [userId, startDate, endDate]
          );
          periodId = insertPeriod.rows[0].id;
        } else {
          periodId = existingPeriod.rows[0].id;
        }

        // Insert daily logs for each selected period day
        for (const logDate of validDates) {
          await client.query(
            `INSERT INTO period_day_logs (period_id, log_date, flow, created_at, updated_at)
             VALUES ($1, $2, 'medium', NOW(), NOW())
             ON CONFLICT (period_id, log_date) DO NOTHING`,
            [periodId, logDate]
          );
        }
      }
    }

    await client.query('COMMIT');

    const fullUserRes = await query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.google_id,
              p.birth_year, p.average_cycle_length, p.average_period_duration, p.onboarding_completed,
              p.created_at, p.updated_at
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [userId]
    );

    const row = fullUserRes.rows[0];
    const isOnboarded = Boolean(row.onboarding_completed);

    return reply.status(200).send({
      status: 'success',
      message: 'Onboarding completed successfully.',
      data: {
        user: {
          id: String(row.id),
          name: row.name,
          email: row.email,
          has_password: Boolean(row.password_hash),
          is_google_linked: Boolean(row.google_id),
          onboarding_completed: isOnboarded,
          onboardingCompleted: isOnboarded,
          profile: {
            birth_year: row.birth_year,
            average_cycle_length: row.average_cycle_length,
            average_period_duration: row.average_period_duration,
            onboarding_completed: isOnboarded,
            onboardingCompleted: isOnboarded,
          },
        },
        profile: {
          user_id: row.id,
          name: row.name,
          email: row.email,
          birth_year: row.birth_year,
          average_cycle_length: row.average_cycle_length,
          average_period_duration: row.average_period_duration,
          onboarding_completed: isOnboarded,
          onboardingCompleted: isOnboarded,
          created_at: row.created_at,
          updated_at: row.updated_at,
        },
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    request.log.error(err, '[profile.controller] completeOnboarding failed');
    return reply.status(500).send({
      status: 'error',
      message: 'Failed to save onboarding information.',
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
  completeOnboarding,
  getNotificationPreferences,
  updateNotificationPreferences,
};
