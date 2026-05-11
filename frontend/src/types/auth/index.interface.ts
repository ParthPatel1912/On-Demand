export interface IAdminLogin {
  email: string;
  password: string;
}

export interface IResetPassword {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IForgotPassword {
  email: string;
}

export interface IPartnerResetPassword {
  password: string;
  confirmPassword: string;
}

export interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { name: string; email: string }) => void;
}

export interface VerifyOtpProps {
  open: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  receivedText: string;
  apiEndpoint?: string;
  payloadKey?: string;
  successMessage?: string;
}

export interface IChangePasswordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onSave: (
    currentPassword: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  onCancel: () => void;
}

