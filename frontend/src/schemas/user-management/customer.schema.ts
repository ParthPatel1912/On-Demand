import * as yup from "yup";
import { emailSchema } from "..";

export const addCustomerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters long"),
  mobileNumber: yup
    .string()
    .trim()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  email: emailSchema,
});
