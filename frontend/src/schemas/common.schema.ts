import * as yup from "yup";

export const passwordSchema = yup
  .string()
  .required("Password is required")
  .test("len", "Password must be between 8 and 15 characters", (val) => {
    if (!val) return false;
    return val.length >= 8 && val.length <= 15;
  })
  .matches(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
    "Password must include letters, numbers and a special character"
  )
  .matches(/^\S*$/, "Password must not contain spaces");

export const emailSchema = yup
  .string()
  .trim()
  .required("Email is required")
  .matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "Please enter a valid email address"
  )
  .test(
    "no-consecutive-dots",
    "Please enter a valid email address",
    (value) => !value || !value.includes("..")
  )
  .test(
    "no-leading-trailing-dot",
    "Please enter a valid email address",
    (value) => !value || (!/^\./.test(value) && !/\.$/.test(value))
  );

export const mobileSchema = yup
  .string()
  .trim()
  .required("Mobile number is required")
  .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits");
