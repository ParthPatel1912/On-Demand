import * as Yup from "yup";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/utils/constants";
import { emailSchema, mobileSchema } from "@/schemas";

export const servicePartnerSchema = Yup.object().shape({
  profileImage: Yup.mixed<File>()
    .nullable()
    .test("fileSize", "Profile image must be less than 2MB", (file) => {
      if (!file) return true;
      return file.size <= MAX_FILE_SIZE;
    }),
  fullName: Yup.string()
    .trim()
    .min(2, "Full Name must be at least 2 characters")
    .required("Full Name is required"),

  dob: Yup.string().required("Date of Birth is required"),

  gender: Yup.string().required("Please select gender"),

  mobile: mobileSchema,

  email: emailSchema,

  applyingFor: Yup.array()
    .of(Yup.string().required())
    .min(1, "Please select at least one service to apply for"),

  education: Yup.array()
    .of(
      Yup.object().shape({
        school: Yup.string().trim().required("School/College name is required"),
        year: Yup.string()
          .matches(/^\d{4}$/, "Passing year must be exactly 4 digits")
          .test("not-future", "Passing year cannot be in the future", (val) => {
            if (!val) return true;
            return parseInt(val) <= new Date().getFullYear();
          })
          .required("Passing year is required"),
        marks: Yup.number()
          .typeError("Marks must be a number")
          .min(0, "Marks cannot be less than 0")
          .max(100, "Marks cannot exceed 100")
          .required("Marks are required"),
      })
    )
    .min(1, "At least one educational info is required"),

  professional: Yup.array().of(
    Yup.object().shape({
      company: Yup.string().trim().required("Company name is required"),
      role: Yup.string().trim().required("Role is required"),
      from: Yup.string()
        .matches(/^\d{4}$/, "From year must be 4 digits")
        .required("From year is required"),
      to: Yup.string()
        .matches(/^\d{4}$/, "To year must be 4 digits")
        .test("years-match", "To year must be >= From year", function (val) {
          const { from } = this.parent;
          if (!from || !val) return true;
          return parseInt(val) >= parseInt(from);
        })
        .required("To year is required"),
    })
  ),

  skills: Yup.array().min(1, "At least one skill is required"),

  servicesOffered: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one service"),

  languages: Yup.array()
    .of(
      Yup.object().shape({
        language: Yup.string().required("Language is required"),
        proficiency: Yup.string().required("Proficiency level is required"),
      })
    )
    .min(1, "At least one language is required"),

  attachments: Yup.array()
    .of(
      Yup.mixed<File>()
        .test("fileSize", "File size must be less than 2MB", (file) => {
          if (!file) return true;
          return file.size <= MAX_FILE_SIZE;
        })
        .test(
          "fileFormat",
          "Unsupported format. Allowed: PDF, DOC, DOCX, PNG, JPG, JPEG",
          (file) => {
            if (!file) return true;
            return ALLOWED_FILE_TYPES.includes(file.type);
          }
        )
    )
    .min(1, "At least one document is required"),
});
