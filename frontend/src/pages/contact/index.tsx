import { useState } from "react";
import { useFormik } from "formik";
import { Phone, Mail, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/input";
import { FloatingLabelTextarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/helper/axiosInstance";
import { contactUsImage } from "@/assets";
import { contactSchema } from "@/schemas";
import { CONTACT_TEXT } from "@/constants/contact.text";

const ContactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      mobile: "",
      email: "",
      description: "",
    },
    validationSchema: contactSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { setErrors, setTouched }) => {
      const { firstName, lastName, mobile, email, description } = values;
      try {
        setIsSubmitting(true);
        const formData = new FormData();
        if (firstName) formData.append("firstName", firstName?.trim());
        if (lastName) formData.append("lastName", lastName?.trim());
        if (mobile) formData.append("mobile", mobile);
        if (email) formData.append("email", email);
        if (description) formData.append("description", description);
        await axiosInstance.post("/contacts", formData);
        toast.success(CONTACT_TEXT.successMessage);
        formik.resetForm();
      } catch (err: unknown) {
        console.error("Failed to send message:", err);
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
        setIsSubmitting(false);
      }
    },
  });

  return (
    <>
      {/* Hero Section */}
      <Container className="mt-4 md:mt-8 relative max-w-300 h-50 md:h-100 px-4 md:px-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl md:rounded-3xl mx-4 md:mx-6"
          style={{ backgroundImage: `url(${contactUsImage})` }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent flex items-center rounded-2xl md:rounded-3xl">
            <Container>
              <h1 className="text-white text-[32px] md:text-[48px] font-black text-center animate-in fade-in slide-in-from-left-10 duration-700">
                {CONTACT_TEXT.heroTitle}
              </h1>
            </Container>
          </div>
        </div>
      </Container>

      {/* Main Content */}
      <Container className="p-6 md:p-14 lg:p-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 items-start">
          {/* Left Side: Contact Info Card */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-primary to-primary-deep rounded-2xl md:rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-primary rounded-3xl px-6 py-10 md:px-10 md:py-14 text-white overflow-hidden">
              {/* Decorative circle */}
              <div className="absolute -top-90 -left-55 w-120 h-120 rounded-full bg-black/5"></div>
              <div className="absolute -bottom-80 -right-65 w-120 h-120 rounded-full bg-black/5"></div>

              <div className="space-y-10 relative z-10">
                <div className="flex items-center gap-6 mb-6">
                  <div className="size-11 rounded-md flex items-center justify-center border-2 border-white/48">
                    <Phone className="size-5 text-white" />
                  </div>
                  <p className="text-md font-medium ">
                    {CONTACT_TEXT.phoneNumber}
                  </p>
                </div>

                <Separator className="border-grey-200/16 mb-6" />

                <div className="flex items-center gap-6 mb-6">
                  <div className="size-11 rounded-md flex items-center justify-center border-2 border-white/48">
                    <Mail className="size-5 text-white" />
                  </div>
                  <p className="text-md font-medium break-all">
                    {CONTACT_TEXT.emailAddress}
                  </p>
                </div>

                <Separator className="border-grey-200/16 mb-6" />

                <div className="flex items-center gap-6">
                  <div className="size-11 rounded-md flex items-center justify-center border-2 border-white/48">
                    <MapPin className="size-5 text-white" />
                  </div>
                  <p className="text-md font-medium">
                    {CONTACT_TEXT.addressLine1}
                    <br />
                    {CONTACT_TEXT.addressLine2}
                    <br />
                    {CONTACT_TEXT.addressLine3}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-7 py-2 px-2">
            <h2 className="text-[32px] text-ink font-bold mb-6">
              {CONTACT_TEXT.formTitle}
            </h2>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingLabelInput
                  id="firstName"
                  label={CONTACT_TEXT.firstNameLabel}
                  className="h-12"
                  {...formik.getFieldProps("firstName")}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldError("firstName", undefined);
                  }}
                  error={
                    formik.touched.firstName
                      ? formik.errors.firstName
                      : undefined
                  }
                />
                <FloatingLabelInput
                  id="lastName"
                  label={CONTACT_TEXT.lastNameLabel}
                  className="h-12"
                  {...formik.getFieldProps("lastName")}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldError("lastName", undefined);
                  }}
                  error={
                    formik.touched.lastName ? formik.errors.lastName : undefined
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingLabelInput
                  id="mobile"
                  label={CONTACT_TEXT.mobileLabel}
                  className="h-12"
                  {...formik.getFieldProps("mobile")}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldError("mobile", undefined);
                  }}
                  error={
                    formik.touched.mobile ? formik.errors.mobile : undefined
                  }
                />
                <FloatingLabelInput
                  id="email"
                  label={CONTACT_TEXT.emailLabel}
                  type="email"
                  className="h-12"
                  {...formik.getFieldProps("email")}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldError("email", undefined);
                  }}
                  error={formik.touched.email ? formik.errors.email : undefined}
                />
              </div>

              <FloatingLabelTextarea
                id="description"
                label={CONTACT_TEXT.descriptionLabel}
                rows={4}
                {...formik.getFieldProps("description")}
                onChange={(e) => {
                  formik.handleChange(e);
                  formik.setFieldError("description", undefined);
                }}
                error={
                  formik.touched.description
                    ? formik.errors.description
                    : undefined
                }
                className="max-h-60"
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full px-6 -mt-2.5"
              >
                {isSubmitting ? CONTACT_TEXT.sendingBtn : CONTACT_TEXT.sendBtn}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </>
  );
};

export default ContactUs;
