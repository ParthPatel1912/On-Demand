import * as Yup from "yup";
import { emailSchema, mobileSchema, passwordSchema } from "@/schemas";

const phoneRegex = /^[6-9]\d{9}$/;
const MAX_FILE_SIZE = 1024 * 1024 * 2;
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

export const contactEditSchema = Yup.object({
  mobile_number: Yup.string()
    .transform((value) => value?.trim())
    .required("Mobile Number is required")
    .matches(phoneRegex, "Enter valid 10-digit mobile number"),
  email: emailSchema,
  address: Yup.string()
    .transform((value) => value?.trim())
    .required("Address is required")
    .min(3, "Address is too short"),
});

export const updatePasswordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

export const profileImageSchema = Yup.object({
  avatar: Yup.mixed()
    .required("Profile image is required")
    .test("fileSize", "File size must be less than 2MB", (value) => {
      const file = value as File;
      if (!file) return false;
      return file.size <= MAX_FILE_SIZE;
    })
    .test("fileFormat", "Unsupported file format", (value) => {
      const file = value as File;
      if (!file) return false;
      return SUPPORTED_FORMATS.includes(file.type);
    }),
});

export const profileMobileSchema = Yup.object({
  mobile: mobileSchema,
});

export const profileEmailSchema = Yup.object({
  email: emailSchema,
});


export const servicePartnerContactEditSchema = Yup.object({
  mobile_number: Yup.string()
    .transform((value) => value?.trim())
    .required("Mobile Number is required")
    .matches(phoneRegex, "Enter valid 10-digit mobile number"),
  email: emailSchema,
  permanent_address: Yup.string()
    .transform((value) => value?.trim())
    .required("Permanent Address is required")
    .min(3, "Permanent Address is too short"),
  residential_address: Yup.string()
    .transform((value) => value?.trim())
    .required("Residential Address is required")
    .min(3, "Residential Address is too short"),
});