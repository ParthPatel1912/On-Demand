import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import { AxiosError } from "axios";
import {
  ArrowLeft,
  Image as ImageIcon,
  Mail,
  Phone,
  Plus,
  Trash2,
  Upload,
  X,
  File as FileIcon,
  Percent,
} from "lucide-react";

import Logo from "@/components/common/Logo";
import { FullPageLoader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/input";
import { FloatingLabelSelect, FloatingLabelMultiSelect } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FloatingLabelTextarea } from "@/components/ui/textarea";
import { FloatingLabelDatePicker } from "@/components/ui/date-picker";
import { servicePartnerSchema } from "@/schemas";
import type {
  IHeading,
  IHelperText,
  ICategory,
  IServicePartnerForm,
  ISubCategory,
  IEducationForm,
  IProfessionalForm,
  ILanguageForm,
} from "@/types/servicePartner.interface";
import {
  ALLOWED_FILE_TYPES,
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  MAX_FILE_SIZE,
  PROFICIENCY_OPTIONS,
  ALLOWED_IMAGE_FORMATS,
} from "@/utils/constants";
import images from "@/assets";
import { APP_ROUTES } from "@/routes/config";
import axiosInstance from "@/helper/axiosInstance";
import type { IServiceType } from "@/types/masterData.interface";
import { SERVICE_PARTNER_TEXT } from "@/constants/servicePartner.text";

const ThankYouView = ({ navigate }: { navigate: (path: string) => void }) => {
  return (
    <div className="flex min-h-screen flex-col bg-white font-alexandria">
      <header className="border-b sticky top-0 z-50">
        <div className="max-w-340 mx-auto flex h-15 items-center bg-white px-4 md:px-10">
          <Logo />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-xl">
          <h2 className="text-lg md:text-xl text-ink-rich mb-3 font-bold">
            {SERVICE_PARTNER_TEXT.thankYouMessage}
          </h2>
          <p className="text-base text-ink-muted mb-8 font-medium">
            {SERVICE_PARTNER_TEXT.reviewNotification}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="rounded-full px-10 py-2 font-bold text-primary border-2"
              onClick={() => navigate(APP_ROUTES.SERVICES)}
            >
              {SERVICE_PARTNER_TEXT.viewServicesBtn}
            </Button>
            <Button
              className="rounded-full px-12 py-1"
              onClick={() => navigate(APP_ROUTES.HOME)}
            >
              {SERVICE_PARTNER_TEXT.goToHomeBtn}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

const ServicePartner = () => {
  const [submitted, setSubmitted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<IServiceType[]>([]);
  const [totalServiceTypes, setTotalServiceTypes] = useState<number>(0);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const fetchServiceTypes = async (limit?: number) => {
    try {
      const url = limit ? `service-types?limit=${limit}` : "service-types";
      const response = await axiosInstance.get(url);
      if (response.data?.data) {
        setServiceTypes(response.data.data);
      }
      if (response.data?.pagination?.totalItems) {
        setTotalServiceTypes(response.data.pagination.totalItems);
      }
    } catch (err: unknown) {
      console.error(SERVICE_PARTNER_TEXT.failedToFetchServiceTypes, err);
    }
  };

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goBack = () => {
    navigate(-1); // Go back
  };

  const validateFiles = (files: File[]): File[] => {
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(
          `"${file.name}" ${SERVICE_PARTNER_TEXT.unsupportedFormat}`
        );
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" ${SERVICE_PARTNER_TEXT.exceedsSizeLimit}`);
      } else {
        valid.push(file);
      }
    }

    if (errors.length) {
      setFileError(errors.join(" "));
    } else {
      setFileError(null);
    }

    return valid;
  };

  const formik = useFormik<IServicePartnerForm>({
    initialValues: {
      fullName: "",
      dob: "",
      gender: "",
      mobile: "",
      email: "",
      applyingFor: [] as number[],
      permanentAddress: "",
      residentialAddress: "",
      education: [{ school: "", year: "", marks: "" }],
      professional: [],
      skills: [] as number[],
      servicesOffered: [] as number[],
      languages: [{ language: "", proficiency: "" }],
      profileImage: null as File | null,
      attachments: [] as File[],
    },
    validationSchema: servicePartnerSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (
      values: IServicePartnerForm,
      { setErrors, setTouched }
    ) => {
      try {
        setLoading(true);
        const {
          profileImage,
          fullName,
          dob,
          gender,
          mobile,
          email,
          applyingFor,
          permanentAddress,
          residentialAddress,
          education,
          professional,
          skills,
          servicesOffered,
          languages,
          attachments,
        } = values;
        const formData = new FormData();

        // Append simple fields
        if (fullName) formData.append("fullName", fullName);
        if (dob) formData.append("dob", dob);
        if (gender) formData.append("gender", gender);
        if (mobile) formData.append("mobile", mobile);
        if (email) formData.append("email", email);
        if (applyingFor.length) formData.append("applyingFor", JSON.stringify(applyingFor));
        if (permanentAddress)
          formData.append("permanentAddress", permanentAddress);
        if (residentialAddress)
          formData.append("residentialAddress", residentialAddress);

        // Serialize complex arrays as JSON
        formData.append("education", JSON.stringify(education));
        if (professional.length)
          formData.append("professional", JSON.stringify(professional));
        if (skills.length) formData.append("skills", JSON.stringify(skills));
        if (servicesOffered.length)
          formData.append("servicesOffered", JSON.stringify(servicesOffered));
        formData.append("languages", JSON.stringify(languages));

        // Append files
        if (profileImage) {
          formData.append("profileImage", profileImage);
        }

        attachments.forEach((file) => {
          formData.append("attachments", file);
        });

        const response = await axiosInstance.post(
          "service-partners",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (response.data?.success) {
          toast.success(SERVICE_PARTNER_TEXT.successSubmit);
          setSubmitted(true);
        }
      } catch (err: unknown) {
        console.error("Submission failed:", err);
        const axiosError = err as AxiosError<{ errors?: Record<string, string[]> }>;
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
      } finally {
        setLoading(false);
      }
    },
  });

  const fetchCategories = async (selectedIds: number[]) => {
    if (!selectedIds.length) return;
    try {
      const response = await axiosInstance.get(
        `categories/by-service-types?ids=${selectedIds.join(',')}`
      );
      const data = response.data.data || [];
      setCategories(data);
    } catch (error: unknown) {
      console.error(SERVICE_PARTNER_TEXT.failedToFetchCategories, error);
    }
  };

  // Dynamically compute available sub-services based on selected skills
  const availableSubServices: ISubCategory[] = categories
    .filter((cat) => formik.values.skills.includes(cat.id))
    .flatMap((cat) => cat.subcategories || []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const validFiles = validateFiles(Array.from(e.dataTransfer.files));
      if (validFiles.length) {
        formik.setFieldValue("attachments", [
          ...formik.values.attachments,
          ...validFiles,
        ]);
      } else {
        formik.setFieldTouched("attachments", true);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const validFiles = validateFiles(Array.from(e.target.files));
      if (validFiles.length) {
        // setFieldValue triggers its own validation — don't also call setFieldTouched
        formik.setFieldValue("attachments", [
          ...formik.values.attachments,
          ...validFiles,
        ]);
      } else {
        // No valid files: mark touched so the Yup/inline error is visible
        formik.setFieldTouched("attachments", true);
      }
      // Reset the input so the same file can be re-selected after removal
      e.target.value = "";
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!ALLOWED_IMAGE_FORMATS.includes(file.type)) {
        toast.error("Only image files are allowed");
        // Reset the input so the user can try again
        e.target.value = "";
        return;
      }
      formik.setFieldValue("profileImage", file);
    }
  };

  if (submitted) {
    return <ThankYouView navigate={navigate} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white font-alexandria">
      <FullPageLoader isLoading={loading} />
      {/* Header */}
      <header className="border-b sticky top-0 z-50 ">
        <div className="max-w-340 mx-auto flex h-15 items-center bg-white px-4 md:px-10">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="link" className="p-0 w-6.5" onClick={goBack}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-[17px] md:text-lg font-bold text-ink-rich line-clamp-1">
              {SERVICE_PARTNER_TEXT.fillDetailsHeading}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto py-8">
        <div className="mx-auto max-w-225 px-4">
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col md:flex-row gap-10"
          >
            {/* Left Column: Profile Picture */}
            <div className="flex flex-col items-center gap-4 md:w-30 shrink-0">
              <div
                className={cn(
                  "relative flex h-30 w-30 items-center justify-center rounded-full border-2 border-dashed transition-colors",
                  "border-primary bg-primary-soft"
                )}
              >
                {formik.values.profileImage ? (
                  <img
                    src={URL.createObjectURL(formik.values.profileImage)}
                    alt="Profile Preview"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-primary">
                    <ImageIcon className="mb-1 h-8 w-8 opacity-60" />
                    <span className="text-xs font-semibold opacity-60">
                      {SERVICE_PARTNER_TEXT.profileImage}
                    </span>
                  </div>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                ref={profileInputRef}
                accept="image/*"
                onChange={handleProfileChange}
              />
              <Button
                type="button"
                variant="outline"
                className="md:w-full h-10 px-4 py-2 text-sm font-bold rounded-full text-primary border-2 w-auto"
                onClick={() => profileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {SERVICE_PARTNER_TEXT.uploadBtn}
              </Button>
              {formik.errors.profileImage && (
                <p className="text-sm text-red-500">
                  {formik.errors.profileImage}
                </p>
              )}
            </div>

            {/* Right Column: Forms */}
            <div className="flex-1 space-y-10">
              {/* Personal Information */}
              <section>
                <Heading title={SERVICE_PARTNER_TEXT.personalInfoHeading} />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <FloatingLabelInput
                      id="fullName"
                      label={SERVICE_PARTNER_TEXT.labelFullName}
                      error={
                        formik.touched.fullName && formik.errors.fullName
                          ? formik.errors.fullName
                          : undefined
                      }
                      {...formik.getFieldProps("fullName")}
                      onChange={(e) => {
                        formik.handleChange(e);
                        formik.setFieldError("fullName", undefined);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <FloatingLabelDatePicker
                      label={SERVICE_PARTNER_TEXT.labelDOB}
                      value={formik.values.dob}
                      onChange={(val) => {
                        formik.setFieldValue("dob", val ?? "");
                        formik.setFieldError("dob", undefined);
                      }}
                      onBlur={() => formik.setFieldTouched("dob", true)}
                      error={
                        formik.touched.dob && formik.errors.dob
                          ? formik.errors.dob
                          : undefined
                      }
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </div>
                  <div className="space-y-1">
                    <FloatingLabelSelect
                      id="gender"
                      label={SERVICE_PARTNER_TEXT.labelGender}
                      value={formik.values.gender}
                      error={
                        formik.touched.gender && formik.errors.gender
                          ? formik.errors.gender
                          : undefined
                      }
                      onValueChange={(v) => {
                        formik.setFieldValue("gender", v);
                        formik.setFieldError("gender", undefined);
                      }}
                    >
                      {Object.values(GENDER_OPTIONS).map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </FloatingLabelSelect>
                  </div>
                  <div className="space-y-1">
                    <FloatingLabelInput
                      id="mobile"
                      label={SERVICE_PARTNER_TEXT.labelMobileNumber}
                      rightAddon={<Phone className="h-4 w-4 text-ink-muted" />}
                      rightAddonClassName="bg-inherit"
                      error={
                        formik.touched.mobile && formik.errors.mobile
                          ? formik.errors.mobile
                          : undefined
                      }
                      {...formik.getFieldProps("mobile")}
                      onChange={(e) => {
                        formik.handleChange(e);
                        formik.setFieldError("mobile", undefined);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <FloatingLabelInput
                      id="email"
                      label={SERVICE_PARTNER_TEXT.labelEmail}
                      rightAddon={<Mail className="h-4 w-4 text-ink-muted" />}
                      rightAddonClassName="bg-inherit"
                      error={
                        formik.touched.email && formik.errors.email
                          ? formik.errors.email
                          : undefined
                      }
                      {...formik.getFieldProps("email")}
                      onChange={(e) => {
                        formik.handleChange(e);
                        formik.setFieldError("email", undefined);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <FloatingLabelMultiSelect
                      id="applyingFor"
                      label={SERVICE_PARTNER_TEXT.labelApplyingFor}
                      maxCount={3}
                      options={serviceTypes
                        .filter((s) => s.id != null)
                        .map((s) => ({
                          value: s.id,
                          label: s.name,
                        }))}
                      value={formik.values.applyingFor}
                      error={
                        formik.touched.applyingFor && formik.errors.applyingFor
                          ? Array.isArray(formik.errors.applyingFor)
                            ? formik.errors.applyingFor.join(", ")
                            : (formik.errors.applyingFor as string)
                          : undefined
                      }
                      onChange={(selected) => {
                        const numericSelected = selected.map(Number);
                        formik.setFieldValue("applyingFor", numericSelected);
                        formik.setFieldValue("skills", []);
                        formik.setFieldValue("servicesOffered", []);
                        formik.setFieldError("applyingFor", undefined);
                        if (numericSelected.length > 0) {
                          fetchCategories(numericSelected);
                        } else {
                          setCategories([]);
                        }
                      }}
                      hasMore={totalServiceTypes > serviceTypes.length}
                      onLoadMore={() => fetchServiceTypes(totalServiceTypes)}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-1">
                    <FloatingLabelTextarea
                      id="permanentAddress"
                      label={SERVICE_PARTNER_TEXT.labelPermanentAddress}
                      rows={3}
                      {...formik.getFieldProps("permanentAddress")}
                      onChange={(e) => {
                        formik.handleChange(e);
                        formik.setFieldError("permanentAddress", undefined);
                      }}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-1">
                    <FloatingLabelTextarea
                      id="residentialAddress"
                      label={SERVICE_PARTNER_TEXT.labelResidentialAddress}
                      rows={3}
                      {...formik.getFieldProps("residentialAddress")}
                      onChange={(e) => {
                        formik.handleChange(e);
                        formik.setFieldError("residentialAddress", undefined);
                      }}
                    />
                  </div>
                </div>
              </section>

              <Separator className="bg-line-muted h-0.5" />

              {/* Educational Information */}
              <section>
                <Heading
                  title={SERVICE_PARTNER_TEXT.educationInfoHeading}
                  onAddClick={() =>
                    formik.setFieldValue("education", [
                      ...formik.values.education,
                      { school: "", year: "", marks: "" },
                    ])
                  }
                />
                <div className="space-y-6">
                  {formik.values.education.map((_edu, index) => (
                    <div key={index} className="relative group">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-11 items-start">
                        <div className="md:col-span-5 space-y-1">
                          <FloatingLabelInput
                            label={SERVICE_PARTNER_TEXT.labelSchoolCollege}
                            error={
                              formik.touched.education?.[index]?.school &&
                              formik.errors.education &&
                              Array.isArray(formik.errors.education) &&
                              typeof formik.errors.education[index] !== "string"
                                ? (
                                    formik.errors.education[
                                      index
                                    ] as IEducationForm
                                  )?.school
                                : undefined
                            }
                            {...formik.getFieldProps(
                              `education.${index}.school`
                            )}
                            onChange={(e) => {
                              formik.handleChange(e);
                              formik.setFieldError("education", undefined);
                            }}
                          />
                        </div>
                        <div className="md:col-span-3 space-y-1">
                          <FloatingLabelInput
                            label={SERVICE_PARTNER_TEXT.labelPassingYear}
                            maxLength={4}
                            error={
                              formik.touched.education?.[index]?.year &&
                              formik.errors.education &&
                              Array.isArray(formik.errors.education) &&
                              typeof formik.errors.education[index] !== "string"
                                ? (
                                    formik.errors.education[
                                      index
                                    ] as IEducationForm
                                  )?.year
                                : undefined
                            }
                            {...formik.getFieldProps(`education.${index}.year`)}
                            onChange={(e) => {
                              formik.handleChange(e);
                              formik.setFieldError("education", undefined);
                            }}
                          />
                        </div>
                        <div className="md:col-span-3 space-y-1">
                          <FloatingLabelInput
                            label={SERVICE_PARTNER_TEXT.labelTotalPercentage}
                            type="number"
                            min={0}
                            max={100}
                            rightAddon={
                              <Percent className="h-4 w-4 text-ink-muted" />
                            }
                            rightAddonClassName="bg-inherit"
                            error={
                              formik.touched.education?.[index]?.marks &&
                              formik.errors.education &&
                              Array.isArray(formik.errors.education) &&
                              typeof formik.errors.education[index] !== "string"
                                ? (
                                    formik.errors.education[
                                      index
                                    ] as IEducationForm
                                  )?.marks
                                : undefined
                            }
                            {...formik.getFieldProps(
                              `education.${index}.marks`
                            )}
                            onChange={(e) => {
                              formik.handleChange(e);
                              formik.setFieldError("education", undefined);
                            }}
                          />
                        </div>
                      </div>
                      {index > 0 && (
                        <div className="md:absolute md:-right-10 top-1/2 md:-translate-y-1/2 flex justify-center mt-2 md:mt-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full text-primary hover:text-red-500 border-neutral-200"
                            onClick={() => {
                              const newEdu = [...formik.values.education];
                              newEdu.splice(index, 1);
                              formik.setFieldValue("education", newEdu);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <Separator className="bg-line-muted h-0.5" />

              {/* Professional Information */}
              <section>
                <Heading
                  title={SERVICE_PARTNER_TEXT.professionalInfoHeading}
                  onAddClick={() =>
                    formik.setFieldValue("professional", [
                      ...formik.values.professional,
                      { company: "", role: "", from: "", to: "" },
                    ])
                  }
                />
                <div className="space-y-6">
                  {formik.values.professional.map((_prof, index) => (
                    <div key={index} className="relative group">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 items-start">
                        <div className="md:col-span-4 space-y-1">
                          <FloatingLabelInput
                            label={SERVICE_PARTNER_TEXT.labelOrganizationName}
                            error={
                              formik.touched.professional?.[index]?.company &&
                              formik.errors.professional &&
                              Array.isArray(formik.errors.professional) &&
                              typeof formik.errors.professional[index] !==
                                "string"
                                ? (
                                    formik.errors.professional[
                                      index
                                    ] as IProfessionalForm
                                  )?.company
                                : undefined
                            }
                            {...formik.getFieldProps(
                              `professional.${index}.company`
                            )}
                            onChange={(e) => {
                              formik.handleChange(e);
                              formik.setFieldError("professional", undefined);
                            }}
                          />
                        </div>
                        <div className="md:col-span-4 space-y-1">
                          <FloatingLabelInput
                            label={SERVICE_PARTNER_TEXT.labelJobRole}
                            error={
                              formik.touched.professional?.[index]?.role &&
                              formik.errors.professional &&
                              Array.isArray(formik.errors.professional) &&
                              typeof formik.errors.professional[index] !==
                                "string"
                                ? (
                                    formik.errors.professional[
                                      index
                                    ] as IProfessionalForm
                                  )?.role
                                : undefined
                            }
                            {...formik.getFieldProps(
                              `professional.${index}.role`
                            )}
                            onChange={(e) => {
                              formik.handleChange(e);
                              formik.setFieldError("professional", undefined);
                            }}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <FloatingLabelInput
                            label={SERVICE_PARTNER_TEXT.labelFrom}
                            maxLength={4}
                            error={
                              formik.touched.professional?.[index]?.from &&
                              formik.errors.professional &&
                              Array.isArray(formik.errors.professional) &&
                              typeof formik.errors.professional[index] !==
                                "string"
                                ? (
                                    formik.errors.professional[
                                      index
                                    ] as IProfessionalForm
                                  )?.from
                                : undefined
                            }
                            {...formik.getFieldProps(
                              `professional.${index}.from`
                            )}
                            onChange={(e) => {
                              formik.handleChange(e);
                              formik.setFieldError("professional", undefined);
                            }}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <FloatingLabelInput
                            label={SERVICE_PARTNER_TEXT.labelTo}
                            maxLength={4}
                            error={
                              formik.touched.professional?.[index]?.to &&
                              formik.errors.professional &&
                              Array.isArray(formik.errors.professional) &&
                              typeof formik.errors.professional[index] !==
                                "string"
                                ? (
                                    formik.errors.professional[
                                      index
                                    ] as IProfessionalForm
                                  )?.to
                                : undefined
                            }
                            {...formik.getFieldProps(
                              `professional.${index}.to`
                            )}
                            onChange={(e) => {
                              formik.handleChange(e);
                              formik.setFieldError("professional", undefined);
                            }}
                          />
                        </div>
                      </div>
                      <div className="md:absolute md:-right-10 top-1/2 md:-translate-y-1/2 flex justify-center mt-2 md:mt-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full text-primary hover:text-red-500 border-neutral-200"
                          onClick={() => {
                            const newProf = [...formik.values.professional];
                            newProf.splice(index, 1);
                            formik.setFieldValue("professional", newProf);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <Separator className="bg-line-muted h-0.5" />

              {/* Skills & Expertise */}
              <section>
                <Heading title={SERVICE_PARTNER_TEXT.skillsExpertiseHeading} />
                <div className="space-y-2 relative" ref={suggestionsRef}>
                  <FloatingLabelInput
                    id="skills-input"
                    label=""
                    placeholder="E.g. Deep Cleaning, Carpet Cleaning"
                    value={skillInput}
                    onChange={(e) => {
                      setSkillInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    error={
                      formik.touched.skills && formik.errors.skills
                        ? typeof formik.errors.skills === "string"
                          ? formik.errors.skills
                          : undefined
                        : undefined
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = skillInput.trim();
                        // Only add if it's in the categories list AND not already added
                        const matched = categories.find(
                          (cat) => cat.name.toLowerCase() === val.toLowerCase()
                        );
                        if (
                          matched &&
                          !formik.values.skills.includes(matched.id)
                        ) {
                          formik.setFieldValue("skills", [
                            ...formik.values.skills,
                            matched.id,
                          ]);
                          formik.setFieldError("skills", undefined);
                          setSkillInput("");
                          setShowSuggestions(false);
                        }
                      }
                    }}
                  />

                  {/* Autocomplete Suggestions */}
                  {showSuggestions && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-line rounded-[8px] shadow-lg max-h-60 overflow-auto">
                      {categories
                        .filter(
                          (cat) =>
                            (skillInput === "" ||
                              cat.name
                                .toLowerCase()
                                .includes(skillInput.toLowerCase())) &&
                            !formik.values.skills.includes(cat.id)
                        )
                        .map((cat) => (
                          <div
                            key={cat.id}
                            className="px-4 py-3 hover:bg-primary-soft cursor-pointer text-ink text-sm font-medium transition-colors border-b border-surface-faintAlt last:border-0"
                            onClick={() => {
                              formik.setFieldValue("skills", [
                                ...formik.values.skills,
                                cat.id,
                              ]);
                              formik.setFieldError("skills", undefined);
                              setSkillInput("");
                              setShowSuggestions(false);
                            }}
                          >
                            {cat.name}
                          </div>
                        ))}
                      {categories.filter(
                        (cat) =>
                          (skillInput === "" ||
                            cat.name
                              .toLowerCase()
                              .includes(skillInput.toLowerCase())) &&
                          !formik.values.skills.includes(cat.id)
                      ).length === 0 && (
                        <div className="px-4 py-3 text-ink-muted text-sm italic">
                          {SERVICE_PARTNER_TEXT.noMatchingSkills}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    {formik.values.skills.map((skillId) => {
                      const category = categories.find((c) => c.id === skillId);
                      if (!category) return null;
                      return (
                        <div
                          key={skillId}
                          className="flex items-center gap-2 rounded-full bg-surface-subtle px-3 py-1.5 text-sm font-medium text-ink-muted"
                        >
                          {category.name}
                          <X
                            className="h-4 w-4 cursor-pointer text-ink-muted hover:text-primary"
                            onClick={() => {
                              const newSkills = formik.values.skills.filter(
                                (id) => id !== skillId
                              );
                              formik.setFieldValue("skills", newSkills);
                              formik.setFieldError("skills", undefined);

                              // Clean up services offered if they belong to this category
                              const subIds = (category.subcategories || []).map(
                                (s: ISubCategory) => s.id
                              );
                              formik.setFieldValue(
                                "servicesOffered",
                                formik.values.servicesOffered.filter(
                                  (id) => !subIds.includes(id)
                                )
                              );
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <Separator className="bg-line-muted h-0.5" />

              {/* Services Offered */}
              <section>
                <Heading
                  title={SERVICE_PARTNER_TEXT.servicesOfferedHeading}
                  description="Select the services which you can offer to our users."
                />
                <HelperText
                  isError={
                    !!(
                      formik.touched.servicesOffered &&
                      formik.errors.servicesOffered
                    )
                  }
                  error={
                    typeof formik.errors.servicesOffered === "string"
                      ? formik.errors.servicesOffered
                      : undefined
                  }
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableSubServices.map((sub) => (
                    <Button
                      key={sub.id}
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const current = formik.values.servicesOffered;
                        if (current.includes(sub.id)) {
                          formik.setFieldValue(
                            "servicesOffered",
                            current.filter((id) => id !== sub.id)
                          );
                        } else {
                          formik.setFieldValue("servicesOffered", [
                            ...current,
                            sub.id,
                          ]);
                        }
                        formik.setFieldError("servicesOffered", undefined);
                      }}
                      className={cn(
                        "rounded-full px-4 py-2 font-medium transition-colors",
                        formik.values.servicesOffered.includes(sub.id)
                          ? "bg-primary text-white hover:bg-primary/80 hover:text-white"
                          : "bg-surface-faintAlt text-ink-muted hover:bg-neutral-200"
                      )}
                    >
                      {sub.name}
                    </Button>
                  ))}
                  {availableSubServices.length === 0 && (
                    <p className="text-sm text-ink-muted italic mt-2">
                      {SERVICE_PARTNER_TEXT.selectSkillsMessage}
                    </p>
                  )}
                </div>
              </section>

              <Separator className="bg-line-muted h-0.5" />

              {/* Languages */}
              <section>
                <Heading
                  title={SERVICE_PARTNER_TEXT.languagesHeading}
                  onAddClick={() =>
                    formik.setFieldValue("languages", [
                      ...formik.values.languages,
                      { language: "", proficiency: "" },
                    ])
                  }
                />
                <div className="space-y-6">
                  {formik.values.languages.map((lang, index) => (
                    <div key={index} className="relative group">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <FloatingLabelSelect
                            id={lang.language}
                            label={SERVICE_PARTNER_TEXT.labelLanguage}
                            value={formik.values.languages[index].language}
                            error={
                              formik.touched?.languages?.[index]?.language &&
                              formik.errors?.languages &&
                              Array.isArray(formik.errors?.languages) &&
                              typeof formik.errors?.languages[index] !== "string"
                                ? (
                                    formik.errors?.languages[
                                      index
                                    ] as ILanguageForm
                                  )?.language
                                : undefined
                            }
                            onValueChange={(v) => {
                              formik.setFieldValue(
                                `languages.${index}.language`,
                                v
                              );
                              formik.setFieldError("languages", undefined);
                            }}
                          >
                            {Object.values(LANGUAGE_OPTIONS).map((value) => {
                              const isAlreadySelected =
                                formik.values.languages.some(
                                  (l, i) => l.language === value && i !== index
                                );
                              return (
                                <SelectItem
                                  key={value}
                                  value={value}
                                  disabled={isAlreadySelected}
                                >
                                  {value}
                                </SelectItem>
                              );
                            })}
                          </FloatingLabelSelect>
                        </div>
                        <div className="space-y-1">
                          <FloatingLabelSelect
                            id={`${lang.language}-proficiency`}
                            label={SERVICE_PARTNER_TEXT.labelProficiency}
                            value={formik.values.languages[index].proficiency}
                            error={
                              formik.touched?.languages?.[index]?.proficiency &&
                              formik.errors?.languages &&
                              Array.isArray(formik.errors?.languages) &&
                              typeof formik.errors?.languages[index] !== "string"
                                ? (
                                    formik.errors.languages[
                                      index
                                    ] as ILanguageForm
                                  )?.proficiency
                                : undefined
                            }
                            onValueChange={(v) => {
                              formik.setFieldValue(
                                `languages.${index}.proficiency`,
                                v
                              );
                              formik.setFieldError("languages", undefined);
                            }}
                          >
                            {Object.values(PROFICIENCY_OPTIONS).map((value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </FloatingLabelSelect>
                        </div>
                      </div>
                      {index > 0 && (
                        <div className="md:absolute md:-right-10 top-1/2 md:-translate-y-1/2 flex justify-center mt-2 md:mt-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full text-primary hover:text-red-500 border-neutral-200"
                            onClick={() => {
                              const newLangs = [...formik.values.languages];
                              newLangs.splice(index, 1);
                              formik.setFieldValue("languages", newLangs);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <Separator className="bg-line-muted h-0.5" />

              {/* Attachments */}
              <section>
                <Heading title={SERVICE_PARTNER_TEXT.attachmentsHeading} />
                <div
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 px-6 text-center transition-all cursor-pointer",
                    dragActive
                      ? "border-primary bg-primary-soft shadow-inner"
                      : "border-primary-soft bg-surface-tint",
                    formik.values.attachments.length > 0
                      ? "border-solid"
                      : "border-dashed"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    multiple
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                    onChange={handleFileChange}
                  />
                  <Upload className="h-10 w-10 text-primary mb-2" />
                  <p className="text-base font-semibold text-ink-rich">
                    {SERVICE_PARTNER_TEXT.dragDropText}{" "}
                    <span className="text-primary hover:underline">
                      {SERVICE_PARTNER_TEXT.chooseFileText}
                    </span>
                  </p>
                  <p className="text-xs font-medium text-ink-muted">
                    {SERVICE_PARTNER_TEXT.attachmentEgText}
                  </p>
                  <p className="mt-2 text-xxs text-ink-muted tracking-wider uppercase font-bold">
                    {SERVICE_PARTNER_TEXT.maxSizeText}
                  </p>
                </div>

                <div className="mt-2">
                  {fileError && (
                    <p className="text-start text-xs text-red-500">
                      {fileError}
                    </p>
                  )}
                  <HelperText
                    isError={
                      !!(
                        formik.touched.attachments && formik.errors.attachments
                      )
                    }
                    error={
                      typeof formik.errors.attachments === "string"
                        ? formik.errors.attachments
                        : Array.isArray(formik.errors.attachments)
                        ? (formik.errors.attachments as string[]).find(
                            (e): e is string => typeof e === "string"
                          )
                        : undefined
                    }
                  />
                </div>

                {/* File List */}
                {formik.values.attachments.length > 0 && (
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formik.values.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 bg-white shadow-sm"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileIcon className="h-5 w-5 text-primary shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xxs text-neutral-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-neutral-400 hover:text-red-500 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            formik.setFieldValue(
                              "attachments",
                              formik.values.attachments.filter(
                                (_, i) => i !== idx
                              )
                            );
                            formik.setFieldError("attachments", undefined);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Final Actions */}
              <div className="flex flex-col md:flex-row gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 rounded-full text-primary border-primary border-2 font-bold"
                  onClick={() => {
                    formik.resetForm();
                    goBack();
                  }}
                >
                  {SERVICE_PARTNER_TEXT.cancelBtn}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 rounded-full bg-primary font-bold"
                  disabled={loading}
                >
                  {loading ? SERVICE_PARTNER_TEXT.applyingText : SERVICE_PARTNER_TEXT.applyBtn}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 px-4 md:px-10">
        <div className="mx-auto flex max-w-340 flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-ink-muted font-medium">
            {SERVICE_PARTNER_TEXT.footerCopyright}
          </p>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-ink-muted"
            >
              <img
                src={images.facebookSVG}
                alt="Facebook"
                className="h-6 w-6"
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-ink-muted"
            >
              <img
                src={images.instagramSVG}
                alt="Instagram"
                className="h-6 w-6"
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-ink-muted"
            >
              <img
                src={images.linkedinSVG}
                alt="LinkedIn"
                className="h-6 w-6"
              />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Heading = ({ title, description, onAddClick }: IHeading) => (
  <div className="flex flex-row items-center justify-between text-start mb-4 gap-2">
    <div className="text-start flex-1">
      <h2 className="text-base md:text-md font-bold text-ink-rich">
        {title}
      </h2>
      {description && (
        <p className="text-xs md:text-sm text-ink-muted">
          {description}
        </p>
      )}
    </div>
    {onAddClick && (
      <Button
        type="button"
        variant="outline"
        className="px-3 md:px-4 py-1.5 h-8 md:h-9 text-xs md:text-sm font-bold rounded-full text-primary border-2 hover:text-primary-deep flex items-center gap-1 shrink-0"
        onClick={onAddClick}
      >
        <Plus className="h-3.5 w-3.5" />
        {SERVICE_PARTNER_TEXT.addBtn}
      </Button>
    )}
  </div>
);

const HelperText = ({ isError, error }: IHelperText) =>
  isError ? (
    <p className="text-start text-xs text-red-500">{error || SERVICE_PARTNER_TEXT.requiredError}</p>
  ) : null;

export default ServicePartner;
