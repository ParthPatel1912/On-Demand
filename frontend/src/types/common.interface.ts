import type { ReactNode } from "react";

export interface IPagination {
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface IPaginationProps {
  rowsPerPage?: number;
  totalItems?: number;
  currentPage?: number;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onPageChange?: (page: number) => void;
}

export type SortOrder = "ASC" | "DESC";

export interface ISortProps {
  sortBy?: string;
  sortOrder?: SortOrder;
  onSort?: (key: string, order: SortOrder) => void;
}

export interface ICommonPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  footerClass?: string;
  onSave?: () => void;
  onCancel?: () => void;
  saveText?: string;
  cancelText?: string;
  loading?: boolean;
  isSaveDisabled?: boolean;
  footer?: React.ReactNode;
  inset?: boolean;
  bodyClassName?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  variant?: "full" | "small" | "fullWidth";
  buttonRounded?: "xl" | "full";
  onlyOneButton?: boolean;
}

export interface IDeleteableItem {
  name?: string;
  user?: {
    name: string;
  };
}

export interface IProps {
  title?: string;
  children: React.ReactNode;
  onFilter?: () => void;
  onReset?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  disableFilter?: boolean;
  disableReset?: boolean;
}

export interface IUploadProps {
  value: File | null;
  previewUrl?: string | null;
  displayPreviewOnTop?: boolean;
  className?: string;
  previewClassName?: string;
  onChange: (file: File | null) => void;
  onRemove?: () => void;
  label?: string;
}

export interface IChangeMobileProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newMobile: string) => void;
  currentMobile?: string;
  apiEndpoint?: string;
  successMessage?: string;
}
export type AddItemDialogProps = {
  trigger: ReactNode;
  title: string;
  placeholder: string;
  onSave?: (value: string) => void;
  useFormik?: boolean;
  loading?: boolean;
};

export type FormikTextFieldProps = {
  labelText?: string;
  isMandatory?: boolean;
  formik: {
    values: Record<string, unknown>;
    touched: Record<string, boolean | undefined>;
    errors: Record<string, string | string[] | undefined>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  };
  name: string;
  leftIcon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  type?: React.HTMLInputTypeAttribute;
  maxLength?: number;
  inputMode?:
    | "text"
    | "search"
    | "email"
    | "tel"
    | "url"
    | "none"
    | "numeric"
    | "decimal";
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  pattern?: string;
  disabled?: boolean;
  autoComplete?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

export type AddCustomerFormValues = {
  name: string;
  mobileNumber: string;
  email: string;
};

export interface IAddCustomerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface TitleProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
}