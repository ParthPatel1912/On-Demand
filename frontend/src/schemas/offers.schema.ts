import * as Yup from "yup";

export const couponSchema = Yup.object().shape({
  coupon_code: Yup.string()
    .required("Coupon code is required")
    .min(3, "Coupon code must be at least 3 characters")
    .max(50, "Coupon code must not exceed 50 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Coupon code must contain only letters, numbers, and underscores"
    )
    .matches(
      /[a-zA-Z]/,
      "Coupon code must contain at least one alphabet character"
    ),
  coupon_description: Yup.string()
    .trim()
    .required("Description is required")
    .max(200, "Description must not exceed 200 characters"),
  discount_percentage: Yup.number()
    .required("Discount is required")
    .min(1, "Discount percentage must be at least 1%")
    .max(90, "Discount percentage must not exceed 90%"),
  max_usage: Yup.number()
    .required("Max usage is required")
    .min(1, "Max usage must be at least 1")
    .max(1000000, "Max usage must not exceed 1000000"),
});
