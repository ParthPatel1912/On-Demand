import * as Yup from "yup";

export const serviceSchema = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .max(100, "Maximum 100 characters allowed"),
    price: Yup.number()
      .required("Price is required")
      .min(0, "Price must be greater than or equal to 0")
      .max(100000, "Price must be less than or equal to 100000"),
    duration: Yup.number()
      .required("Duration is required")
      .min(1, "Duration must be greater than 0")
      .max(600, "Duration must be less than or equal to 600"),
    subCategory: Yup.string()
      .required("Sub category is required"),
    commission: Yup.number()
      .required("Commission is required")
      .min(0, "Commission must be greater than or equal to 0")
      .max(100, "Commission must be less than or equal to 100"),
    availability: Yup.boolean(),
    serviceIncludes: Yup.boolean(),
    serviceExcludes: Yup.boolean(),
    inclusionPointsList: Yup.array()
      .of(Yup.string())
      .when("serviceIncludes", {
        is: true,
        then: (schema) => schema.min(1, "At least one inclusion point is required when service includes is enabled").max(10, "Maximum 10 inclusion points allowed"),
        otherwise: (schema) => schema.max(10, "Maximum 10 inclusion points allowed"),
      }),
    exclusionPointsList: Yup.array()
      .of(Yup.string())
      .when("serviceExcludes", {
        is: true,
        then: (schema) => schema.min(1, "At least one exclusion point is required when service excludes is enabled").max(10, "Maximum 10 exclusion points allowed"),
        otherwise: (schema) => schema.max(10, "Maximum 10 exclusion points allowed"),
      }),
    serviceImages: Yup.array().of(Yup.string()).max(10, "Maximum 10 images allowed"),
  });