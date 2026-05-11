import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  useState,
} from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import { type FormikProps, getIn } from "formik";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as SwitchPrimitive from "@radix-ui/react-switch";

const dynamicFormFieldStyles = {
  field: "flex flex-col gap-[24px]",
  error: "text-left text-sm text-red-500 pl-[2px] mr-auto",
  inputError: "border-red-500 focus:border-red-500 focus:ring-red-500",
  passwordToggle:
    "h-[48px] absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer",
  emailIcon:
    "h-[48px] absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400",
  defaultInput: "w-full h-[48px] text-[15px] px-[8px] pl-[12px] pr-[45px]",
} as const;

type BaseDynamicField<TFormValues> = {
  name: keyof TFormValues;
  label: string;
};

type InputDynamicField<TFormValues> = BaseDynamicField<TFormValues> & {
  fieldType?: "input";
  inputType?: InputHTMLAttributes<HTMLInputElement>["type"];
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type">;
};

type PhoneDynamicField<TFormValues> = BaseDynamicField<TFormValues> & {
  fieldType: "phone";
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type">;
};

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectDynamicField<TFormValues> = BaseDynamicField<TFormValues> & {
  fieldType: "select";
  options: SelectOption[];
  placeholder?: string;
  selectProps?: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>;
};

type TextareaDynamicField<TFormValues> = BaseDynamicField<TFormValues> & {
  fieldType: "textarea";
  textareaProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
};

type SwitchDynamicField<TFormValues> = BaseDynamicField<TFormValues> & {
  fieldType: "switch";
  switchProps?: React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>;
};

export type DynamicFormField<TFormValues> =
  | InputDynamicField<TFormValues>
  | PhoneDynamicField<TFormValues>
  | SelectDynamicField<TFormValues>
  | TextareaDynamicField<TFormValues>
  | SwitchDynamicField<TFormValues>;

type DynamicFormFieldsProps<TFormValues> = {
  fields: DynamicFormField<TFormValues>[];
  formik: FormikProps<TFormValues>;
};

function DynamicFormFields<TFormValues extends Record<string, unknown>>({
  fields,
  formik,
}: DynamicFormFieldsProps<TFormValues>) {
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});

  const handlePasswordVisibility = (fieldName: string) => {
    setVisiblePasswords((previous) => ({
      ...previous,
      [fieldName]: !previous[fieldName],
    }));
  };

  return (
    <div className={dynamicFormFieldStyles.field}>
      {fields.map((field) => {
        const fieldKey = String(field.name);
        const fieldId = fieldKey.replace(/\./g, "-");
        const isInputField =
          field.fieldType === undefined ||
          field.fieldType === "input" ||
          field.fieldType === "phone";
        const inputType =
          field.fieldType === "phone"
            ? "tel"
            : isInputField
            ? field.inputType ?? "text"
            : undefined;
        const isPassword = inputType === "password";
        const isEmail = inputType === "email";

        const isVisible = Boolean(visiblePasswords[fieldKey]);
        const error = getIn(formik.errors, fieldKey);
        const isTouched = getIn(formik.touched, fieldKey);
        const fieldValue = getIn(formik.values, fieldKey);
        const showError = Boolean(isTouched && error);

        const renderControl = () => {
          switch (field.fieldType) {
            case "textarea":
              return (
                <Textarea
                  id={fieldId}
                  name={fieldKey}
                  value={fieldValue ?? ""}
                  onChange={(e) => {
                    formik.setFieldValue(fieldKey, e.target.value);
                  }}
                  onBlur={formik.handleBlur}
                  className={cn(
                    showError && dynamicFormFieldStyles.inputError,
                    field.textareaProps?.className
                  )}
                  {...field.textareaProps}
                />
              );
            case "select":
              return (
                <Select
                  name={fieldKey}
                  value={fieldValue ?? ""}
                  onValueChange={(value) => {
                    formik.setFieldValue(fieldKey, value);
                    formik.setFieldTouched(fieldKey, true);
                  }}
                >
                  <SelectTrigger
                    id={fieldId}
                    className={cn(
                      showError && dynamicFormFieldStyles.inputError,
                      field.selectProps?.className
                    )}
                    {...field.selectProps}
                  >
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            case "switch":
              return (
                <div className="flex items-center gap-2">
                  <Switch
                    id={fieldId}
                    name={fieldKey}
                    checked={Boolean(fieldValue)}
                    onCheckedChange={(checked) => {
                      formik.setFieldValue(fieldKey, checked);
                    }}
                    {...field.switchProps}
                  />
                  {field.label && (
                    <label htmlFor={fieldId} className="text-sm font-medium">
                      {field.label}
                    </label>
                  )}
                </div>
              );
            case "phone":
            case "input":
            default:
              return (
                <div className="relative">
                  <Input
                    id={fieldId}
                    name={fieldKey}
                    type={isPassword && isVisible ? "text" : inputType}
                    value={fieldValue ?? ""}
                    onChange={(e) => {
                      formik.setFieldValue(fieldKey, e.target.value);
                    }}
                    onBlur={formik.handleBlur}
                    className={cn(
                      dynamicFormFieldStyles.defaultInput,
                      showError && dynamicFormFieldStyles.inputError,
                      (field.fieldType === "input" || field.fieldType === "phone" || field.fieldType === undefined) && field.inputProps?.className
                    )}
                    {...(field.fieldType === "phone"
                      ? { inputMode: "tel", autoComplete: "tel" }
                      : undefined)}
                    {...(isInputField ? field.inputProps : undefined)}
                  />
                  {isEmail ? (
                    <span className={dynamicFormFieldStyles.emailIcon}>
                      <Mail className="h-[20px] w-[20px]" />
                    </span>
                  ) : null}
                  {isPassword ? (
                    <button
                      type="button"
                      onClick={() => handlePasswordVisibility(fieldKey)}
                      aria-label={isVisible ? "Hide password" : "Show password"}
                      className={dynamicFormFieldStyles.passwordToggle}
                    >
                      {isVisible ? (
                        <EyeOff className="h-[22px] w-[22px]" />
                      ) : (
                        <Eye className="h-[22px] w-[22px]" />
                      )}
                    </button>
                  ) : null}
                </div>
              );
          }
        };

        return (
          <div
            key={fieldKey}
            className={cn(
              "w-full flex flex-col gap-1.5"
            )}
          >
            {field.fieldType !== "switch" && (
              <label htmlFor={fieldId} className="text-sm font-medium text-left">
                {field.label}
              </label>
            )}
            {renderControl()}
            {showError ? (
              <span className={dynamicFormFieldStyles.error}>
                {error as string}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default DynamicFormFields;
