const { z } = require('zod');

const updateProfileSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'Name cannot be empty.',
    })
    .trim()
    .min(1, 'Name cannot be empty.')
    .max(100, 'Name cannot exceed 100 characters.')
    .optional(),
  birthYear: z
    .preprocess(
      (val) => (val === undefined || val === null ? undefined : Number(val)),
      z
        .number({
          invalid_type_error: 'Birth year must be an integer between 1900 and 2100.',
        })
        .int('Birth year must be an integer between 1900 and 2100.')
        .min(1900, 'Birth year must be an integer between 1900 and 2100.')
        .max(2100, 'Birth year must be an integer between 1900 and 2100.')
        .optional()
    ),
  averageCycleLength: z
    .preprocess(
      (val) => (val === undefined || val === null ? undefined : Number(val)),
      z
        .number({
          invalid_type_error: 'Average cycle length must be an integer between 15 and 90 days.',
        })
        .int('Average cycle length must be an integer between 15 and 90 days.')
        .min(15, 'Average cycle length must be an integer between 15 and 90 days.')
        .max(90, 'Average cycle length must be an integer between 15 and 90 days.')
        .optional()
    ),
  averagePeriodDuration: z
    .preprocess(
      (val) => (val === undefined || val === null ? undefined : Number(val)),
      z
        .number({
          invalid_type_error: 'Average period duration must be an integer between 1 and 15 days.',
        })
        .int('Average period duration must be an integer between 1 and 15 days.')
        .min(1, 'Average period duration must be an integer between 1 and 15 days.')
        .max(15, 'Average period duration must be an integer between 1 and 15 days.')
        .optional()
    ),
  onboardingCompleted: z
    .boolean({
      invalid_type_error: 'Onboarding completed must be a boolean.',
    })
    .optional(),
});

/**
 * Validate profile update payload with Zod schema
 * @param {object} data
 * @returns {{ success: boolean, data?: object, message?: string }}
 */
function validateUpdateProfile(data) {
  const result = updateProfileSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message || 'Invalid profile data.',
    };
  }
  return {
    success: true,
    data: result.data,
  };
}

module.exports = {
  updateProfileSchema,
  validateUpdateProfile,
};
