import * as yup from "yup";
import { emailSchema, passwordSchema } from "./common.schema";

export const loginPasswordSchema = yup
  .string()
  .required("Password is required")
  .matches(/^\S*$/, "Password must not contain spaces");

// Admin Schema - START
export const authLoginSchema = yup.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export const resetPasswordSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

export const forgotPasswordSchema = yup.object({
  email: emailSchema,
});
// Admin Schema - END

// Customer Schema - START
export const customerLoginSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, "Enter a valid full name")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: emailSchema,
});

export const otpSchema = yup.object({
  otp: yup
    .string()
    .matches(/^\d{4}$/, "OTP must be 4 digits")
    .required("OTP is required"),
});
// Customer Schema - END

// Partner Schema - START
export const partnerLoginSchema = yup.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export const partnerResetPasswordSchema = yup.object({
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});
