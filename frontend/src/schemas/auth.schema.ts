import { z } from "zod";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Signup form validation schema
 */
export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Please enter your name.")
      .max(100, "Name cannot exceed 100 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Please enter your email address.")
      .regex(EMAIL_REGEX, "Please enter a valid email address."),
    password: z
      .string()
      .min(1, "Please enter a password.")
      .min(6, "Password must be at least 6 characters long."),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password."),
    agreed: z
      .boolean()
      .refine((val) => val === true, {
        message: "Please agree to the Terms & Conditions.",
      }),
    birthYear: z
      .number()
      .int("Birth year must be a valid integer.")
      .min(1900, "Birth year must be between 1900 and 2100.")
      .max(2100, "Birth year must be between 1900 and 2100.")
      .optional(),
    averageCycleLength: z
      .number()
      .int("Average cycle length must be a valid integer.")
      .min(15, "Average cycle length must be between 15 and 90 days.")
      .max(90, "Average cycle length must be between 15 and 90 days.")
      .optional(),
    averagePeriodDuration: z
      .number()
      .int("Average period duration must be a valid integer.")
      .min(1, "Average period duration must be between 1 and 15 days.")
      .max(15, "Average period duration must be between 1 and 15 days.")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Sign In / Login validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .regex(EMAIL_REGEX, "Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Please enter your password."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Extracts the first user-friendly error message from a ZodError
 */
export function getFirstZodError(error: z.ZodError, fallback = "Please check your inputs."): string {
  if (error.issues && error.issues.length > 0) {
    return error.issues[0].message;
  }
  return fallback;
}
