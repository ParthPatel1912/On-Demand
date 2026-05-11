import * as React from "react";
import FilterDrawer from "@/components/common/FilterDrawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { IBookingFilter } from "@/types/user-management/customer.interface";
import { DateField, TimeField } from "@/components/booking-management/BookingManagementFilter";
import { getBookingStatusLabel, getPaymentMethodLabel, type BookingStatus, type PaymentMethod } from "@/types/bookingManagement.interface";

interface BookingHistoryFilterProps {
  filters: IBookingFilter;
  onFilter: (updatedFilters: IBookingFilter) => void;
  onReset: () => void;
  serviceTypeOptions?: string[];
  paymentMethodOptions?: PaymentMethod[];
  statusOptions?: BookingStatus[];
}

export const BookingHistoryFilter = ({
  filters,
  onFilter,
  onReset,
  serviceTypeOptions,
  paymentMethodOptions,
  statusOptions,
}: BookingHistoryFilterProps) => {
  const [open, setOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState<IBookingFilter>(filters);

  React.useEffect(() => {
    if (!open) {
      setLocalFilters(filters);
    }
  }, [filters, open]);

  const handleApply = () => {
    onFilter(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const isDefault = 
      (!filters.serviceType || filters.serviceType === "all") &&
      !filters.date &&
      !filters.time &&
      (filters.minAmount === undefined || filters.minAmount === 0) &&
      (filters.maxAmount === undefined || filters.maxAmount === 99999) &&
      (!filters.paymentMethod || filters.paymentMethod === "all") &&
      (!filters.status || filters.status === "all");

    if (!isDefault) {
      onReset();
    } else {
      setLocalFilters(filters);
    }
    setOpen(false);
  };

  return (
    <FilterDrawer 
      onFilter={handleApply} 
      onReset={handleReset} 
      title="Filter"
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setLocalFilters(filters);
        setOpen(nextOpen);
      }}
    >
      <div className="pt-0 mt-0 space-y-6">
        {/* Service Type */}
        <Select
          value={localFilters.serviceType}
          onValueChange={(val) => setLocalFilters(prev => ({ ...prev, serviceType: val }))}
        >
          <SelectTrigger className="w-full h-13 border-line rounded-xl">
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {serviceTypeOptions?.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateField
          placeholder="Date"
          value={localFilters.date}
          onChange={(date) => setLocalFilters((prev) => ({ ...prev, date }))}
        />

        <TimeField
          placeholder="Time"
          value={localFilters.time}
          onChange={(time) => setLocalFilters((prev) => ({ ...prev, time }))}
        />

        {/* Amount Range */}
        <div className="space-y-4">
          <span className="text-sm font-bold text-ink-slate">Amount</span>
          <div className="px-0 pt-2">
            <Slider
              value={[localFilters.minAmount, localFilters.maxAmount]}
              max={99999}
              step={1}
              formatLabel={(val) => `$${val.toFixed(2)}`}
              onValueChange={(val) =>
                setLocalFilters((f) => ({
                  ...f,
                  minAmount: val[0],
                  maxAmount: val[1],
                }))
              }
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-bold text-ink-disabled">${localFilters.minAmount}</span>
              <span className="text-xs font-bold text-ink-disabled">${localFilters.maxAmount}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <Select
          value={localFilters.paymentMethod}
          onValueChange={(val) => setLocalFilters(prev => ({ ...prev, paymentMethod: val }))}
        >
          <SelectTrigger className="w-full h-13 border-line rounded-xl">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {paymentMethodOptions?.map(method => (
              <SelectItem key={method} value={method}>{getPaymentMethodLabel(method)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={localFilters.status}
          onValueChange={(val) => setLocalFilters(prev => ({ ...prev, status: val }))}
        >
          <SelectTrigger className="w-full h-13 border-line rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {statusOptions?.map(status => (
              <SelectItem key={status} value={status}>{getBookingStatusLabel(status)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </FilterDrawer>
  );
};
