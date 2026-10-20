const { z } = require('zod');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signupSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required and must be a valid string.',
      invalid_type_error: 'Name is required and must be a valid string.',
    })
    .trim()
    .min(1, 'Name is required and must be a valid string.')
    .max(100, 'Name cannot exceed 100 characters.'),
  email: z
    .string({
      required_error: 'A valid email address is required.',
      invalid_type_error: 'A valid email address is required.',
    })
    .trim()
    .regex(EMAIL_REGEX, 'A valid email address is required.'),
  password: z
    .string({
      required_error: 'Password is required and must be at least 6 characters long.',
      invalid_type_error: 'Password is required and must be at least 6 characters long.',
    })
    .min(6, 'Password is required and must be at least 6 characters long.'),
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
});

const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email and password are required.',
      invalid_type_error: 'Email and password are required.',
    })
    .min(1, 'Email and password are required.'),
  password: z
    .string({
      required_error: 'Email and password are required.',
      invalid_type_error: 'Email and password are required.',
    })
    .min(1, 'Email and password are required.'),
});

/**
 * Validate signup payload with Zod schema
 * @param {object} data
 * @returns {{ success: boolean, data?: object, message?: string }}
 */
function validateSignup(data) {
  const result = signupSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message || 'Invalid signup data.',
    };
  }
  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validate login payload with Zod schema
 * @param {object} data
 * @returns {{ success: boolean, data?: object, message?: string }}
 */
function validateLogin(data) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message || 'Email and password are required.',
    };
  }
  return {
    success: true,
    data: result.data,
  };
}

module.exports = {
  signupSchema,
  loginSchema,
  validateSignup,
  validateLogin,
};
