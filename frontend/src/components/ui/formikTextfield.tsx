import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FormikTextFieldProps } from "@/types/common.interface";


const FormikTextField: React.FC<FormikTextFieldProps> = ({
  labelText,
  isMandatory = false,
  formik,
  name,
  placeholder,
  className,
  onChange,
  onBlur,
  leftIcon,
  type = "text",
  maxLength,
  inputMode,
  inputProps,
  pattern,
  disabled = false,
  autoComplete,
  ...rest
}) => {
  const isInvalid = !!(formik.touched[name] && formik.errors[name]);

  return (
    <div className="w-full space-y-1 overflow-hidden">
      {/* Label */}
      {labelText && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700 flex items-center gap-1"
        >
          {labelText}
          {isMandatory && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input with Icon */}
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-disabled pointer-events-none">
            {leftIcon}
          </div>
        )}

        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={(formik.values[name] as string | number | undefined) ?? ""}
          onChange={onChange || formik.handleChange}
          onBlur={onBlur || formik.handleBlur}
          maxLength={maxLength}
          inputMode={inputMode}
          pattern={pattern}
          disabled={disabled}
          autoComplete={autoComplete}
          className={cn(
            "w-full h-12 rounded-[8px] border bg-white transition-all",
            "px-4 py-3.5",
            "text-sm leading-5 font-alexandria",
            "placeholder:font-alexandria placeholder:text-sm placeholder:tracking-[0.25%] placeholder:text-ink-muted",
            "focus:outline-none focus:ring-0 focus:border-primary",
            leftIcon ? "pr-10" : "",
            isInvalid && "border-red-500",
            className,
          )}
          {...inputProps}
          {...rest}
        />
      </div>

      {/* Error Message */}
      {isInvalid && (
        <p className="text-xs text-red-500 mt-1 pl-1">
          {formik.errors[name] as string}
        </p>
      )}
    </div>
  );
};

export default FormikTextField;
