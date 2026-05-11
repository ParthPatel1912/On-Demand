export const OTP_MESSAGES = {
  missingEmail: "Email is missing. Please go back and request OTP again.",
  verifyFailed: "Failed to verify OTP. Please try again.",
  resendFailed: "Failed to resend OTP. Please try again.",
  resendSuccess: "A new OTP has been sent.",
  loginSuccess: "Login successful!",
  somethingWentWrong: "Something went wrong",
  enterOtpTitle: "Enter OTP",
  resendOtpBtn: "Resend OTP",
  signInBtn: "Sign In",
  verifying: "Verifying...",
} as const;

export const CUSTOMER_LOGIN_MESSAGES = {
  loginFailed: "Failed to send OTP. Please try again.",
  sending: "Sending...",
  getOtp: "Get OTP",
  title: "Sign in to continue",
  acceptSignIn: "By Clicking on Sign In, I accept the",
  tearmsConditionsText: "Terms & Condition",
  privacyPolicyText: "Privacy Policy",
  areYouServicePartenerText: "Are You a Service Partner?",
  joinNowText: "Join Now",
  fourDigitText: "We have sent you a 4 digit code on",
  namePlaceholder: "Name",
  emailPlaceholder: "Email",
  enterOtpPlaceholder: "Enter OTP",
} as const;

export const AUTH_MODAL_MESSAGES = {
  signInTitle: "Sign In",
  verifyOtpTitle: "Verify OTP",
  sendOtpFailed: "Failed to send OTP.",
  verifyOtpFailed: "Failed to verify OTP.",
  resendOtpFailed: "Failed to resend OTP.",
  sending: "Sending...",
  getOtp: "Get OTP",
  verifying: "Verifying...",
  verifyAndSignIn: "Verify & Sign In",
  resending: "Resending...",
  resendOtp: "Resend OTP",
} as const;

export const PARTNER_AUTH_TEXT = {
  loginTitle: "Partner Login",
  loginSubtitle: "Sign in to manage your services",
  emailLabel: "Email Address",
  passwordLabel: "Password",
  loginBtn: "Login",
  forgotPassword: "Forgot Password?",
  noAccount: "Don't have an account?",
  joinUs: "Join as Partner",
  loginSuccess: "Login successful!",
  loginError: "Invalid email or password",
};

export const ADMIN_AUTH_TEXTS = {
  loginTitle: "Sign in to continue",
  logoAlt: "HomeCare Logo",
  somethingWentWrong: "Something went wrong. Please try again.",
  forgotPasswordTitle: "Forgot your password?",
  forgotPasswordSubtitle:
    "Enter your email address and we'll send you a link to reset your password.",
  emailSentTitle: "Check your email",
  emailSentDescription:
    "We've sent a password reset link to your email address.",
  emailSentFooter: "The link will expire in 10 minutes.",
  linkExpiredTitle: "Link Expired",
  linkExpiredSubtitle:
    "This password reset link has expired. Please request a new one.",
  passwordResetTitle: "Password Reset",
  passwordResetSubtitle: "Your password has been reset successfully!",
  resetPasswordHeaderTitle: "Reset your password",
  resetPasswordHeaderSubtitle: "Enter your new password below.",
};

export const ADMIN_AUTH_BUTTON_TEXTS = {
  signingIn: "Signing in…",
  signIn: "Sign In",
  forgotPassword: "Forgot Password?",
  backToLogin: "Back to Login",
  sending: "Sending...",
  sendResetLink: "Send Reset Link",
  requestNewLink: "Request New Link",
  goToLogin: "Go to Login",
  resetting: "Resetting...",
  resetPassword: "Reset Password",
};