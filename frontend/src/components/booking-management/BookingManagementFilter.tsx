import React from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import FilterDrawer from "@/components/common/FilterDrawer";
import {
  BookingStatus,
  PaymentMethod,
  getBookingStatusLabel,
  getPaymentMethodLabel,
} from "@/types/bookingManagement.interface";
import { cn } from "@/lib/utils";
import { BOOKING_MANAGEMENT_TEXT } from "@/constants/bookingManagement.text";

export interface BookingManagementFilterValues {
  serviceType: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  bookedServicesRange: [number, number];
  amountRange: [number, number];
  paymentMethod: PaymentMethod | "";
  status: BookingStatus | "";
}

interface IProps {
  filters: Partial<BookingManagementFilterValues>;
  onReset: () => void;
  onFilter: (values: BookingManagementFilterValues) => void;
  serviceTypeOptions?: string[];
  paymentMethodOptions?: PaymentMethod[];
  statusOptions?: BookingStatus[];
}

const BookingManagementFilter = ({
  filters,
  onReset,
  onFilter,
  serviceTypeOptions,
  paymentMethodOptions,
  statusOptions,
}: IProps) => {
  const [open, setOpen] = React.useState(false);

  const resolvedInitialValues =
    React.useMemo<BookingManagementFilterValues>(() => {
      const defaults: BookingManagementFilterValues = {
        serviceType: "",
        date: "",
        time: "",
        bookedServicesRange: [0, 99],
        amountRange: [0, 99999],
        paymentMethod: "",
        status: "",
      };

      return {
        ...defaults,
        ...filters,
        bookedServicesRange:
          filters?.bookedServicesRange ?? defaults.bookedServicesRange,
        amountRange: filters?.amountRange ?? defaults.amountRange,
      };
    }, [filters]);

  const [draft, setDraft] = React.useState<BookingManagementFilterValues>(
    resolvedInitialValues,
  );

  React.useEffect(() => {
    if (!open) setDraft(resolvedInitialValues);
  }, [open, resolvedInitialValues]);

  return (
    <FilterDrawer
      title={BOOKING_MANAGEMENT_TEXT.filterTitle}
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setDraft(resolvedInitialValues);
        setOpen(nextOpen);
      }}
      onReset={() => {
        const isDefault =
          (!filters.serviceType || filters.serviceType === "") &&
          (!filters.date || filters.date === "") &&
          (!filters.time || filters.time === "") &&
          (!filters.bookedServicesRange || (filters.bookedServicesRange[0] === 0 && filters.bookedServicesRange[1] === 99)) &&
          (!filters.amountRange || (filters.amountRange[0] === 0 && filters.amountRange[1] === 99999)) &&
          (!filters.paymentMethod || (filters.paymentMethod as string) === "") &&
          (!filters.status || (filters.status as string) === "");

        if (!isDefault) {
          onReset();
        } else {
          setDraft(resolvedInitialValues);
        }
        setOpen(false);
      }}
      onFilter={() => {
        if (JSON.stringify(draft) === JSON.stringify(resolvedInitialValues)) {
          setOpen(false);
          return;
        }
        onFilter(draft);
        setOpen(false);
      }}
    >
      <FieldSelect
        placeholder={BOOKING_MANAGEMENT_TEXT.filterServiceType}
        value={draft.serviceType}
        options={serviceTypeOptions ?? []}
        onChange={(serviceType) =>
          setDraft((prev) => ({ ...prev, serviceType }))
        }
      />

      <DateField
        placeholder={BOOKING_MANAGEMENT_TEXT.filterDate}
        value={draft.date}
        onChange={(date) => setDraft((prev) => ({ ...prev, date }))}
      />

      <TimeField
        readOnly={!draft.date}
        placeholder={BOOKING_MANAGEMENT_TEXT.filterTime}
        value={draft.time}
        onChange={(time) => setDraft((prev) => ({ ...prev, time }))}
      />

      <RangeSection
        title={BOOKING_MANAGEMENT_TEXT.filterBookedServices}
        value={draft.bookedServicesRange}
        min={0}
        max={99}
        formatLabel={(v) => String(v)}
        onChange={(bookedServicesRange) =>
          setDraft((prev) => ({ ...prev, bookedServicesRange }))
        }
        minCaption="0"
        maxCaption="99"
      />

      <RangeSection
        title={BOOKING_MANAGEMENT_TEXT.filterAmount}
        value={draft.amountRange}
        min={0}
        max={99999}
        formatLabel={(v) => `$${v.toLocaleString()}`}
        onChange={(amountRange) =>
          setDraft((prev) => ({ ...prev, amountRange }))
        }
        minCaption="$0"
        maxCaption="$99,999"
      />

      <FieldSelect
        placeholder={BOOKING_MANAGEMENT_TEXT.filterPaymentMethod}
        value={draft.paymentMethod as string}
        options={(paymentMethodOptions ?? []).map((method) => ({
          value: method,
          label: getPaymentMethodLabel(method),
        }))}
        onChange={(paymentMethod) =>
          setDraft((prev) => ({
            ...prev,
            paymentMethod: paymentMethod as PaymentMethod | "",
          }))
        }
      />

      <FieldSelect
        placeholder={BOOKING_MANAGEMENT_TEXT.filterStatus}
        value={draft.status as string}
        options={(statusOptions ?? []).map((status) => ({
          value: status,
          label: getBookingStatusLabel(status),
        }))}
        onChange={(status) =>
          setDraft((prev) => ({
            ...prev,
            status: status as BookingStatus | "",
          }))
        }
      />
    </FilterDrawer>
  );
};

export default BookingManagementFilter;

function FieldSelect({
  placeholder,
  value,
  options,
  onChange,
}: {
  placeholder: string;
  value: string;
  options: Array<string | { value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next === "__all__" ? "" : next)}
    >
      <SelectTrigger className="w-full h-13 border-line rounded-xl">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">{BOOKING_MANAGEMENT_TEXT.filterAllOption}</SelectItem>
        {options.map((opt) => {
          const resolved =
            typeof opt === "string" ? { value: opt, label: opt } : opt;
          return (
            <SelectItem key={resolved.value} value={resolved.value}>
              {resolved.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export function DateField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = value ? parseISO(value) : undefined;
  const label =
    value && selectedDate ? format(selectedDate, "dd MMM, yyyy") : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between rounded-xl border border-line px-4 py-3.5 text-left transition-colors",
            open ? "ring-2 ring-primary/10" : "hover:bg-neutral-50",
          )}
        >
          <span
            className={cn(
              "text-sm font-normal leading-5 tracking-[0.0025em]",
              label ? "text-ink" : "text-ink-muted",
            )}
          >
            {label || placeholder}
          </span>
          <CalendarDays className="h-5 w-5 text-ink-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0 z-99">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return;
            onChange(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
          className="w-full"
        />
      </PopoverContent>
    </Popover>
  );
}

export function TimeField({
  placeholder,
  value,
  onChange,
  readOnly,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={readOnly}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border border-line px-4 py-3.5 text-left transition-colors",
            open ? "ring-2 ring-primary/10" : "hover:bg-neutral-50",
          )}
        >
          <span
            className={cn(
              "text-sm font-normal leading-5 tracking-[0.0025em]",
              value ? "text-ink" : "text-ink-muted",
            )}
          >
            {value ? to12HourTime(value) : placeholder}
          </span>
          <Clock3 className="h-5 w-5 text-ink-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-4 z-99">
        <div className="flex items-center gap-3">
          <Input
            readOnly={readOnly}
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-11 rounded-xl"
          />
          <Button
            type="button"
            className="h-11 rounded-xl bg-primary text-white hover:bg-primary-hover"
            onClick={() => setOpen(false)}
          >
            {BOOKING_MANAGEMENT_TEXT.filterDoneBtn}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RangeSection({
  title,
  value,
  min,
  max,
  minCaption,
  maxCaption,
  onChange,
  formatLabel,
}: {
  title: string;
  value: [number, number];
  min: number;
  max: number;
  minCaption: string;
  maxCaption: string;
  onChange: (value: [number, number]) => void;
  formatLabel: (value: number) => string;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-ink">{title}</h3>
      <div className="px-2">
        <Slider
          value={value}
          onValueChange={(next) => onChange(next as [number, number])}
          max={max}
          min={min}
          step={1}
          minStepsBetweenThumbs={1}
          className="mt-5"
          formatLabel={formatLabel}
        />
        <div className="flex justify-between text-xs text-ink-muted">
          <span>{minCaption}</span>
          <span>{maxCaption}</span>
        </div>
      </div>
    </div>
  );
}

const to12HourTime = (time24: string) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time24);
  if (!match) return time24;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time24;
  const period = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 || 12;
  return `${normalizedHours}:${String(minutes).padStart(2, "0")} ${period}`;
};
