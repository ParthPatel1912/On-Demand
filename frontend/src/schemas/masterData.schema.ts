import * as Yup from "yup";
import { MAX_FILE_SIZE, MAX_ICON_WIDTH, ALLOWED_IMAGE_FORMATS } from "@/utils/constants";

export const serviceTypeSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Service type is required")
    .max(50, "Maximum 50 characters allowed")
    .matches(
      /^[a-zA-Z][a-zA-Z0-9\s&]*$/,
      "Must start with letter and can only contain letters, numbers, spaces, and '&'"
    ),
  image: Yup.mixed()
    .nullable()
    .test("fileSize", "File size must be less than 2MB", (value) => {
      const file = value as File;
      if (!file) return true;
      return file.size <= MAX_FILE_SIZE;
    })
    .test("fileDimensions", "Image must be 64x64", (value) => {
      const file = value as File;
      if (!file) return true;

      return new Promise<boolean>((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          resolve(
            img.width === MAX_ICON_WIDTH && img.height === MAX_ICON_WIDTH
          );
        };
      });
    }),
  bannerImage: Yup.mixed().required("Banner image is required"),
});

export const categorySchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Category Name is required")
    .max(50, "Maximum 50 characters allowed")
    .matches(
      /^[a-zA-Z][a-zA-Z0-9\s&]*$/,
      "Must start with letter and can only contain letters, numbers, spaces, and '&'"
    ),
  image: Yup.mixed()
    .required("Image is required")
    .test("fileSize", "File size must be less than 2MB", (value) => {
      if (!value || typeof value === "string") return true;
      const file = value as File;
      return file.size <= MAX_FILE_SIZE;
    })
    .test("fileFormat", "Unsupported Format. Allowed: JPEG, PNG, SVG", (value) => {
      if (!value || typeof value === "string") return true;
      const file = value as File;
      return ALLOWED_IMAGE_FORMATS.includes(file.type);
    }),
});

export const subCategorySchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Sub Category Name is required")
    .max(50, "Maximum 50 characters allowed"),
  image: Yup.mixed()
    .required("Image is required")
    .test("fileSize", "File size must be less than 2MB", (value) => {
      if (!value || typeof value === "string") return true;
      const file = value as File;
      return file.size <= MAX_FILE_SIZE;
    })
    .test("fileFormat", "Unsupported Format. Allowed: JPEG, PNG, SVG", (value) => {
      if (!value || typeof value === "string") return true;
      const file = value as File;
      return ALLOWED_IMAGE_FORMATS.includes(file.type);
    }),
});
