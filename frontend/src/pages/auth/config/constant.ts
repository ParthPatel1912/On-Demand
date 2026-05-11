import type { DynamicFormField } from "@/components/common/DynamicFormFields";
import type {
  IAdminLogin,
  IForgotPassword,
  IPartnerResetPassword,
  IResetPassword,
} from "@/types/auth/index.interface";



export const urlStrings = {
  adminLogin: "/admin/login",
  adminForgotPassword: "/admin/forgot-password",
  adminVerifyResetToken: "/admin/verify-reset-token",
  adminResetPassword: "/admin/reset-password",
  adminLogout: "/admin/logout",

  customerLogin: "/customer/send-otp",
  customerVerifyOtp:"/customer/verify-otp",
  customerResendOtp:"/customer/resend-otp",

  servicePartnerLogin: "/auth/partner/login",
  servicePartnerForgotPassword: "/auth/partner/forgot-password",
  servicePartnerVerifyResetToken: "/auth/partner/verify-reset-token",
  servicePartnerResetPassword: "/auth/partner/reset-password",
  servicePartnerLogout: "/auth/partner/logout",
};

export const adminLoginFields: DynamicFormField<IAdminLogin>[] = [
  {
    name: "email",
    label: "Email",
    fieldType: "input",
    inputType: "email",
    inputProps: {
      autoComplete: "email",
      placeholder: "Email",
      required: true,
    },
  },
  {
    name: "password",
    label: "Password",
    fieldType: "input",
    inputType: "password",
    inputProps: {
      autoComplete: "current-password",
      placeholder: "Password",
      required: true,
    },
  },
];

export const forgotPasswordFields: DynamicFormField<IForgotPassword>[] = [
  {
    name: "email",
    label: "Email",
    fieldType: "input",
    inputType: "email",
    inputProps: {
      autoComplete: "email",
      placeholder: "Enter your email address",
      required: true,
    },
  },
];

export const resetPasswordFields: DynamicFormField<IResetPassword>[] = [
  {
    name: "email",
    label: "Email",
    fieldType: "input",
    inputType: "email",
    inputProps: {
      autoComplete: "email",
      placeholder: "Email address",
      required: true,
      disabled: true,
    },
  },
  {
    name: "password",
    label: "New Password",
    fieldType: "input",
    inputType: "password",
    inputProps: {
      autoComplete: "new-password",
      placeholder: "Enter new password",
      required: true,
    },
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    fieldType: "input",
    inputType: "password",
    inputProps: {
      autoComplete: "new-password",
      placeholder: "Confirm new password",
      required: true,
    },
  },
];

export const partnerResetPasswordFields: DynamicFormField<IPartnerResetPassword>[] =
  [
    {
      name: "password",
      label: "New Password",
      fieldType: "input",
      inputType: "password",
      inputProps: {
        autoComplete: "new-password",
        placeholder: "Enter new password",
        required: true,
      },
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      fieldType: "input",
      inputType: "password",
      inputProps: {
        autoComplete: "new-password",
        placeholder: "Confirm new password",
        required: true,
      },
    },
  ];
