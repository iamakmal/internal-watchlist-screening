import { z } from "zod";

const signupFields = {
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(254, "Email must be 254 characters or fewer")
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be 128 characters or fewer")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
};

export const signupSchema = z
  .object({
    ...signupFields,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const signupRequestSchema = z.object(signupFields);

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(254, "Email must be 254 characters or fewer")
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(1, "Password is required")
    .max(1024, "Password must be 1024 characters or fewer"),
});

export const confirmSignupSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(254, "Email must be 254 characters or fewer")
    .transform((value) => value.toLowerCase()),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit confirmation code"),
});

export const resendConfirmationSchema = confirmSignupSchema.pick({
  email: true,
});
