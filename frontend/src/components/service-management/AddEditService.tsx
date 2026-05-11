import { useState, useEffect } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { X, Plus, Trash2 } from "lucide-react";
import { AxiosError } from "axios";

import axiosInstance from "@/helper/axiosInstance";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FloatingLabelInput } from "@/components/ui/input";
import {
  FloatingLabelSelect,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FullPageLoader } from "../common/Loader";
import { serviceSchema } from "@/schemas";
import type { IServiceFormValues, ISubCateogyEditProps, SubCategoryEdit } from "@/types/service.interface";
import { SERVICE_MANAGEMENT_TEXT } from "@/constants/serviceManagement.text";


export const AddEditService = ({
  open = false,
  onOpenChange,
  initialData,
  isEdit = false,
  onSave,
}: ISubCateogyEditProps = {}) => {
  const [inclusionPoints, setInclusionPoints] = useState("");
  const [exclusionPoints, setExclusionPoints] = useState("");
  const [imageError, setImageError] = useState<string>("");
  const [subCategories, setSubCategories] = useState<SubCategoryEdit[]>([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  const formik = useFormik<IServiceFormValues>({
    initialValues: {
      id: initialData?.id,
      name: initialData?.name || "",
      price: initialData?.price || "",
      duration: initialData?.duration || "",
      subCategory: initialData?.subCategory || "",
      commission: initialData?.commission || "",
      availability: initialData?.availability || false,
      serviceIncludes: initialData?.serviceIncludes || false,
      serviceExcludes: initialData?.serviceExcludes || false,
      inclusionPointsList: initialData?.inclusionPointsList || [],
      exclusionPointsList: initialData?.exclusionPointsList || [],
      serviceImages: initialData?.serviceImages || [],
      categoryId: initialData?.categoryId || "",
      serviceImagesIds: initialData?.serviceImagesIds || [],
      deletedImages: [],
    },
    validationSchema: serviceSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { resetForm, setErrors, setTouched }) => {
      try {
        const formData = new FormData();

        if (values.name) formData.append("name", values.name);
        if (values.price) formData.append("price", values.price.toString());
        if (values.commission)
          formData.append("commission", values.commission.toString());
        if (values.availability !== undefined) {
          formData.append("availability", values.availability.toString());
        }
        if (values.duration)
          formData.append("duration", values.duration.toString());

        if (values.serviceIncludes && values.inclusionPointsList.length > 0) {
          values.inclusionPointsList.forEach((point) => {
            formData.append(`includeServices`, point);
          });
        }

        if (!values.serviceIncludes) {
          formData.append("includeServices", JSON.stringify([]));
        }

        if (values.serviceExcludes && values.exclusionPointsList.length > 0) {
          values.exclusionPointsList.forEach((point) => {
            formData.append(`excludeServices`, point);
          });
        }

        if (!values.serviceExcludes) {
          formData.append("excludeServices", JSON.stringify([]));
        }

        for (let i = 0; i < values.serviceImages.length; i++) {
          const base64Data = values.serviceImages[i];

          if (base64Data.startsWith("data:image/")) {
            const base64Content = base64Data.split(",")[1];
            if (base64Content) {
              const byteCharacters = atob(base64Content);
              const byteNumbers = new Array(byteCharacters.length);
              for (let j = 0; j < byteCharacters.length; j++) {
                byteNumbers[j] = byteCharacters.charCodeAt(j);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: "image/jpeg" });
              const file = new File([blob], `service_image_${i + 1}.jpg`, {
                type: "image/jpeg",
              });
              formData.append("images", file);
            }
          }
        }

        if (values.deletedImages && values.deletedImages.length > 0) {
          values.deletedImages.forEach((imageUrl) => {
            formData.append("deletedImages", imageUrl);
          });
        }

        if (isEdit && initialData?.id) {
          formData.append("subCategoryId", values.subCategory);
          await axiosInstance.put(`/services/${initialData.id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          toast.success("Service updated successfully!");
        } else {
          await axiosInstance.post(
            `/categories/${values.categoryId}/subcategories/${values.subCategory}/services`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          toast.success("Service created successfully!");
        }

        if (onSave) {
          onSave(values);
        }

        if (!isEdit) {
          resetForm();
          setInclusionPoints("");
          setExclusionPoints("");
          setImageError("");
        }

        if (onOpenChange) {
          onOpenChange(false);
        }
      } catch (error: unknown) {
        console.error("Failed to create service:", error);
        const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>;
        if (axiosError.response?.data?.errors) {
          const backendErrors = axiosError.response.data.errors;
          const formikErrors: Record<string, string> = {};
          const formikTouched: Record<string, boolean> = {};
          Object.keys(backendErrors).forEach((key) => {
            formikErrors[key] = backendErrors[key][0];
            formikTouched[key] = true;
          });
          setErrors(formikErrors);
          setTouched(formikTouched);
        }
      }
    },
    enableReinitialize: true,
  });

  const handleInclusionPointsKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInclusionPoint();
    }
  };

  const handleInclusionPointsBlur = () => {
    addInclusionPoint();
  };

  const addInclusionPoint = () => {
    if (inclusionPoints.trim()) {
      const trimmedPoint = inclusionPoints.trim();
      if (
        !formik.values.inclusionPointsList.includes(trimmedPoint) &&
        formik.values.inclusionPointsList.length < 10
      ) {
        formik.setFieldValue("inclusionPointsList", [
          ...formik.values.inclusionPointsList,
          trimmedPoint,
        ]);
        formik.setFieldError("inclusionPointsList", undefined);
      }
      setInclusionPoints("");
    }
  };

  const handleExclusionPointsKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addExclusionPoint();
    }
  };

  const handleExclusionPointsBlur = () => {
    addExclusionPoint();
  };

  const addExclusionPoint = () => {
    if (exclusionPoints.trim()) {
      const trimmedPoint = exclusionPoints.trim();
      if (
        !formik.values.exclusionPointsList.includes(trimmedPoint) &&
        formik.values.exclusionPointsList.length < 10
      ) {
        formik.setFieldValue("exclusionPointsList", [
          ...formik.values.exclusionPointsList,
          trimmedPoint,
        ]);
        formik.setFieldError("exclusionPointsList", undefined);
      }
      setExclusionPoints("");
    }
  };

  const handleRemoveInclusionPoint = (index: number) => {
    formik.setFieldValue(
      "inclusionPointsList",
      formik.values.inclusionPointsList.filter((_, i) => i !== index)
    );
    formik.setFieldError("inclusionPointsList", undefined);
  };

  const handleRemoveExclusionPoint = (index: number) => {
    formik.setFieldValue(
      "exclusionPointsList",
      formik.values.exclusionPointsList.filter((_, i) => i !== index)
    );
    formik.setFieldError("exclusionPointsList", undefined);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setImageError("");

    const validFiles = Array.from(files).slice(
      0,
      10 - formik.values.serviceImages.length,
    );

    const readers = validFiles.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          if (!file.type.startsWith("image/")) {
            reject(`"${file.name}" is not a valid image file.`);
            return;
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    );

    Promise.allSettled(readers).then((results) => {
      const newImages: string[] = [];

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          newImages.push(result.value);
        } else {
          setImageError(result.reason);
        }
      });

      const updatedImages = [
        ...formik.values.serviceImages,
        ...newImages.filter(
          (img) => !formik.values.serviceImages.includes(img),
        ),
      ];

      formik.setFieldValue("serviceImages", updatedImages);
      formik.setFieldError("serviceImages", undefined);
    });

    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const imageToRemove = formik.values.serviceImages[index];
    const imageId = formik.values.serviceImagesIds[index];

    const updatedImages = formik.values.serviceImages.filter(
      (_, i) => i !== index
    );
    const updatedImageIds = formik.values.serviceImagesIds.filter(
      (_, i) => i !== index
    );

    if (imageToRemove && !imageToRemove.startsWith("data:image/")) {
      const updatedDeletedImages = [
        ...(formik.values.deletedImages || []),
        imageId,
      ];
      formik.setFieldValue("deletedImages", updatedDeletedImages);
    }

    formik.setFieldValue("serviceImages", updatedImages);
    formik.setFieldValue("serviceImagesIds", updatedImageIds);
    setImageError("");
  };

  const handleCancel = () => {
    formik.resetForm();
    setInclusionPoints("");
    setExclusionPoints("");
    setImageError("");
    setSubCategories([]);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleDialogOpenChange = () => {
    handleCancel();
  };

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!open || !initialData?.categoryId) return;

      setLoadingSubCategories(true);
      try {
        const response = await axiosInstance.get(
          `/categories/${initialData.categoryId}/subcategories`
        );
        const subCategoriesData =
          response.data?.data?.map((item: { id: number | string; name: string }) => ({
            id: item.id.toString(),
            name: item.name,
          })) || [];
        setSubCategories(subCategoriesData);
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
        setSubCategories([]);
      } finally {
        setLoadingSubCategories(false);
      }
    };

    fetchSubCategories();
  }, [open, initialData?.categoryId]);

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <FullPageLoader isLoading={formik.isSubmitting} />
      <DialogContent className="max-w-200! w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? SERVICE_MANAGEMENT_TEXT.editServiceTitle : SERVICE_MANAGEMENT_TEXT.addServiceTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[65vh] overflow-y-auto px-1 pt-1.5 flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <div className="space-y-1 w-full">
              <FloatingLabelInput
                id="service-name"
                label={SERVICE_MANAGEMENT_TEXT.nameLabel}
                name="name"
                value={formik.values.name}
                onChange={(e) => {
                  formik.handleChange(e);
                  formik.setFieldError("name", undefined);
                }}
                error={
                  formik.touched.name && formik.errors.name
                    ? formik.errors.name
                    : undefined
                }
              />
            </div>
            <div className="space-y-1 w-full">
              <FloatingLabelSelect
                id="service-category"
                label={SERVICE_MANAGEMENT_TEXT.subCategoryLabel}
                name="subCategory"
                placeholder=" "
                value={formik.values.subCategory}
                onValueChange={(value: string) => {
                  formik.setFieldValue("subCategory", value);
                  formik.setFieldError("subCategory", undefined);
                }}
                error={
                  formik.touched.subCategory && formik.errors.subCategory
                    ? formik.errors.subCategory
                    : undefined
                }
                disabled={loadingSubCategories}
              >
                <SelectGroup>
                  {loadingSubCategories ? (
                    <SelectItem value="loading" disabled>
                      {SERVICE_MANAGEMENT_TEXT.loadingSubcategories}
                    </SelectItem>
                  ) : subCategories.length > 0 ? (
                    subCategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      {SERVICE_MANAGEMENT_TEXT.noSubcategories}
                    </SelectItem>
                  )}
                </SelectGroup>
              </FloatingLabelSelect>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <div className="space-y-1 w-full">
              <FloatingLabelInput
                id="service-duration"
                type="number"
                label={SERVICE_MANAGEMENT_TEXT.durationLabel}
                name="duration"
                rightAddon={SERVICE_MANAGEMENT_TEXT.durationAddon}
                value={formik.values.duration}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? "" : Number(e.target.value);
                  formik.setFieldValue("duration", value);
                  formik.setFieldError("duration", undefined);
                }}
                error={
                  formik.touched.duration && formik.errors.duration
                    ? formik.errors.duration
                    : undefined
                }
              />
            </div>
            <div className="space-y-1 w-full">
              <FloatingLabelInput
                id="service-price"
                type="number"
                label={SERVICE_MANAGEMENT_TEXT.priceLabel}
                name="price"
                rightAddon={SERVICE_MANAGEMENT_TEXT.priceAddon}
                value={formik.values.price}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? "" : Number(e.target.value);
                  formik.setFieldValue("price", value);
                  formik.setFieldError("price", undefined);
                }}
                error={
                  formik.touched.price && formik.errors.price
                    ? formik.errors.price
                    : undefined
                }
              />
            </div>
            <div className="space-y-1 w-full">
              <FloatingLabelInput
                id="service-commission"
                type="number"
                label={SERVICE_MANAGEMENT_TEXT.commissionLabel}
                name="commission"
                rightAddon={SERVICE_MANAGEMENT_TEXT.commissionAddon}
                value={formik.values.commission}
                min={0}
                max={100}
                step={1}
                inputMode="numeric"
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    formik.setFieldValue("commission", "");
                    return;
                  }
                  const parsed = Number(raw);
                  if (Number.isNaN(parsed)) return;
                  formik.setFieldValue(
                    "commission",
                    Math.min(100, Math.max(0, parsed))
                  );
                  formik.setFieldError("commission", undefined);
                }}
                error={
                  formik.touched.commission && formik.errors.commission
                    ? formik.errors.commission
                    : undefined
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="service-images">{SERVICE_MANAGEMENT_TEXT.serviceImagesLabel}</Label>
              <label className="flex items-center justify-center w-6 h-6 text-primary border-[1.5px] border-primary rounded-full cursor-pointer">
                <Plus className="w-4 h-4" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={formik.values.serviceImages.length >= 10}
                />
              </label>
            </div>

            {formik.values.serviceImages.length > 0 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                {formik.values.serviceImages.map((image, index) => (
                  <div key={index} className="relative shrink-0 group">
                    <img
                      src={image}
                      alt={`Service image ${index + 1}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute inset-0 flex items-center justify-center text-white rounded-lg bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imageError && <p className="text-red-500 text-xs">{imageError}</p>}

            {formik.touched.serviceImages && formik.errors.serviceImages && (
              <p className="text-red-500 text-xs">
                {formik.errors.serviceImages}
              </p>
            )}
          </div>

          <Separator />

          <div className="flex flex-row gap-2 justify-between items-center w-full">
            <Label htmlFor="service-availability">{SERVICE_MANAGEMENT_TEXT.availabilityLabel}</Label>
            <Switch
              id="service-availability"
              checked={formik.values.availability}
              onCheckedChange={(checked) =>
                formik.setFieldValue("availability", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex flex-row gap-2 justify-between items-center w-full">
            <Label htmlFor="service-service-includes">{SERVICE_MANAGEMENT_TEXT.serviceIncludesLabel}</Label>
            <Switch
              id="service-service-includes"
              checked={formik.values.serviceIncludes}
              onCheckedChange={(checked) => {
                formik.setFieldValue("serviceIncludes", checked);
                if (!checked) {
                  formik.setFieldValue("inclusionPointsList", []);
                  setInclusionPoints("");
                }
              }}
            />
          </div>

          {formik.values.serviceIncludes && (
            <div className="space-y-2 w-full">
              <FloatingLabelInput
                id="service-inclusion-points"
                label={SERVICE_MANAGEMENT_TEXT.inclusionPointsLabel}
                value={inclusionPoints}
                onChange={(e) => setInclusionPoints(e.target.value)}
                onKeyDown={handleInclusionPointsKeyDown}
                onBlur={handleInclusionPointsBlur}
                error={
                  formik.touched.inclusionPointsList &&
                  formik.errors.inclusionPointsList
                    ? (formik.errors.inclusionPointsList as string)
                    : undefined
                }
              />
              <div className="flex flex-wrap gap-2">
                {formik.values.inclusionPointsList.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-[4px] w-fit border border-line gap-1.5 pt-1 pr-1.5 pb-1 pl-2 font-normal text-xs leading-4 tracking-[0.4%] text-ink"
                  >
                    {point}{" "}
                    <X
                      className="h-4 w-4 text-ink-muted cursor-pointer"
                      onClick={() => handleRemoveInclusionPoint(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex flex-row gap-2 justify-between items-center w-full">
            <Label htmlFor="service-service-excludes">{SERVICE_MANAGEMENT_TEXT.serviceExcludesLabel}</Label>
            <Switch
              id="service-service-excludes"
              checked={formik.values.serviceExcludes}
              onCheckedChange={(checked) => {
                formik.setFieldValue("serviceExcludes", checked);
                if (!checked) {
                  formik.setFieldValue("exclusionPointsList", []);
                  setExclusionPoints("");
                }
              }}
            />
          </div>

          {formik.values.serviceExcludes && (
            <div className="space-y-2 w-full">
              <FloatingLabelInput
                id="service-exclusion-points"
                label={SERVICE_MANAGEMENT_TEXT.exclusionPointsLabel}
                value={exclusionPoints}
                onChange={(e) => setExclusionPoints(e.target.value)}
                onKeyDown={handleExclusionPointsKeyDown}
                onBlur={handleExclusionPointsBlur}
                error={
                  formik.touched.exclusionPointsList &&
                  formik.errors.exclusionPointsList
                    ? (formik.errors.exclusionPointsList as string)
                    : undefined
                }
              />
              <div className="flex flex-wrap gap-2">
                {formik.values.exclusionPointsList.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-[4px] w-fit border border-line gap-1.5 pt-1 pr-1.5 pb-1 pl-2 font-normal text-xs leading-4 tracking-[0.4%] text-ink"
                  >
                    {point}{" "}
                    <X
                      className="h-4 w-4 text-ink-muted cursor-pointer"
                      onClick={() => handleRemoveExclusionPoint(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />
        </div>

        <DialogFooter>
          <Button variant="secondary" type="button" onClick={handleCancel}>
            {SERVICE_MANAGEMENT_TEXT.cancelBtn}
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              formik.handleSubmit();
            }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? SERVICE_MANAGEMENT_TEXT.loadingSubcategories : isEdit ? SERVICE_MANAGEMENT_TEXT.updateBtn : SERVICE_MANAGEMENT_TEXT.saveBtn}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
