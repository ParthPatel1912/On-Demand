import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type DatePickerAlign = "start" | "center" | "end";

export interface FloatingLabelDatePickerProps {
  /** Label shown as the floating placeholder */
  label: string;
  /** Currently selected date as a formatted string (matches `displayFormat`) */
  value?: string;
  /** Called with the newly formatted date string, or undefined when cleared */
  onChange?: (value: string | undefined) => void;
  /** Called when the picker is opened / closed or the trigger is clicked */
  onBlur?: () => void;
  /** Show error state with a red border and message below */
  error?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Format used to display / parse the date string. Defaults to "dd/MM/yyyy" */
  displayFormat?: string;
  /** Earliest selectable year. Defaults to 1900 */
  fromYear?: number;
  /** Latest selectable year. Defaults to current year */
  toYear?: number;
  /** Disable specific dates. Return true to disable a date */
  disabledDates?: (date: Date) => boolean;
  /** Default month shown when no date is selected */
  defaultMonth?: Date;
  /** Popover alignment relative to the trigger. Defaults to "start" */
  align?: DatePickerAlign;
  /** Additional class names for the trigger wrapper */
  className?: string;
}

/**
 * FloatingLabelDatePicker
 *
 * A reusable date-picker that mirrors the style of FloatingLabelInput.
 * It uses shadcn's Popover + Calendar components internally.
 *
 * @example
 * <FloatingLabelDatePicker
 *   label="Date of Birth"
 *   value={formik.values.dob}
 *   onChange={(val) => formik.setFieldValue("dob", val)}
 *   onBlur={() => formik.setFieldTouched("dob", true)}
 *   error={formik.touched.dob && formik.errors.dob ? formik.errors.dob : undefined}
 *   fromYear={1900}
 *   toYear={new Date().getFullYear()}
 * />
 */
export function FloatingLabelDatePicker({
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  displayFormat = "dd/MM/yyyy",
  fromYear = 1900,
  toYear = new Date().getFullYear(),
  disabledDates,
  defaultMonth,
  align = "start",
  className,
}: FloatingLabelDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  /** Parse the string value back to a Date for the calendar */
  const selectedDate = React.useMemo<Date | undefined>(() => {
    if (!value) return undefined;
    const parsed = parse(value, displayFormat, new Date());
    return isValid(parsed) ? parsed : undefined;
  }, [value, displayFormat]);

  /** Resolve the default month shown in the calendar */
  const resolvedDefaultMonth = React.useMemo<Date>(() => {
    if (defaultMonth) return defaultMonth;
    if (selectedDate) return selectedDate;
    // Fall back to current month
    return new Date();
  }, [defaultMonth, selectedDate]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(format(date, displayFormat));
    } else {
      onChange?.(undefined);
    }
    setOpen(false);
  };

  const handleTriggerClick = () => {
    if (disabled) return;
    onBlur?.();
    setOpen(true);
  };

  const defaultDisabledDates = (date: Date) =>
    date > new Date() || date < new Date("1900-01-01");

  return (
    <div className="relative group">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/* Mimics the FloatingLabelInput wrapper */}
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={label}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleTriggerClick();
              }
            }}
            onClick={handleTriggerClick}
            className={cn(
              "relative flex w-full rounded-[8px] border bg-transparent transition-colors select-none",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              "border-line",
              className
            )}
          >
            {/* Value / placeholder area */}
            <div className="flex-1 px-4 py-3.5 text-sm font-normal leading-5 text-ink-heading min-h-12.5 flex items-center font-alexandria">
              {value ? (
                <span>{value}</span>
              ) : (
                <span className="text-transparent select-none">‌</span>
              )}
            </div>

            {/* Floating label */}
            <label
              className={cn(
                "pointer-events-none absolute left-4 z-10 bg-background px-1 font-alexandria font-medium leading-5 text-ink-muted transition-all duration-150",
                value || open
                  ? "top-0 -translate-y-1/2 text-xs"
                  : "top-1/2 -translate-y-1/2 text-sm",
                disabled && "opacity-50"
              )}
            >
              {label}
            </label>

            {/* Calendar icon addon */}
            <div className="flex min-w-10.25 items-center justify-center gap-2.5 rounded-r-[8px] px-4">
              <CalendarDays className="h-4 w-4 text-ink-muted" />
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0 z-99"
          align={align}
        >
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selectedDate}
            onSelect={handleSelect}
            defaultMonth={resolvedDefaultMonth}
            disabled={disabledDates ?? defaultDisabledDates}
            fromYear={fromYear}
            toYear={toYear}
            className="w-full"
          />
        </PopoverContent>
      </Popover>

      {/* Error message */}
      {error && <p className="text-xs text-red-500 mt-1 text-start">{error}</p>}
    </div>
  );
}
