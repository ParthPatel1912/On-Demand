import type { AddressFormValues, AddressLabel } from "@/types/address.interface";
import { ADDRESS_LABELS } from "@/utils/constants";
import * as Yup from "yup";

export const addressSchema = Yup.object().shape({
  houseNumber: Yup.string().trim().required("House/Flat number is required"),
  landmark: Yup.string().trim().required("Landmark is required"),
  saveAs: Yup.string().oneOf(["Home", "Other"]).required(),
  label: Yup.string()
    .trim()
    .when("saveAs", {
      is: "Other",
      then: (schema) => schema.required("Label is required for other address"),
      otherwise: (schema) => schema.optional(),
    }),
});

  export const addressModalSchema = Yup.object<AddressFormValues>({
    house: Yup.string().trim().required("House/Flat Number is required"),
    landmark: Yup.string().trim().required("Landmark is required"),
    label: Yup.mixed<AddressLabel>()
      .oneOf([...ADDRESS_LABELS])
      .required(),
    extra: Yup.string().when("label", {
      is: "Other",
      then: (s) => s.trim().required("Please enter a custom label"),
      otherwise: (s) => s.optional(),
    }),
  });
