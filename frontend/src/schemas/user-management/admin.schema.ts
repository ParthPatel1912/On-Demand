import * as Yup from "yup";
import { emailSchema, mobileSchema, passwordSchema } from "..";

export const addSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: emailSchema,
  mobile: mobileSchema,
  password: passwordSchema,
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("password")], "Passwords do not match"),
});

export const editSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: emailSchema,
  mobile: mobileSchema,
  isActive: Yup.boolean(),
  // password not required on edit — handled by Change Password popup
  password: Yup.string().notRequired(),
  confirmPassword: Yup.string().notRequired(),
});

export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("newPassword")], "Passwords do not match"),
});
