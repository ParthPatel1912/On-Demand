import * as Yup from "yup";
import { emailSchema, mobileSchema } from "./common.schema";

export const contactSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .required("First name is required")
    .matches(/^[a-zA-Z\s]+$/, "Invalid input"),
  lastName: Yup.string()
    .trim()
    .required("Last name is required")
    .matches(/^[a-zA-Z\s]+$/, "Invalid input"),
  mobile: mobileSchema,
  email: emailSchema,
  description: Yup.string()
    .trim()
    .min(10, "Description must be longer than 10 characters")
    .max(500, "Description cannot exceed 500 characters")
    .required("Please provide a description"),
});
