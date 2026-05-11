import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import axiosInstance from "@/helper/axiosInstance";
import type { FilterState } from "@/types/user-management/partner.interface";
import type { IServiceType } from "@/types/masterData.interface";
import FilterDrawer from "@/components/common/FilterDrawer";
import {
  SERVICE_PARTNER_STATUS,
  SERVICE_PARTNER_VERIFICATION_STATUS,
} from "@/utils/constants";

const MIN_JOBS_COMPLETED = 0;
const MAX_JOBS_COMPLETED = 1000;

export const DEFAULT_FILTERS: FilterState = {
  serviceTypeId: "",
  minJobs: MIN_JOBS_COMPLETED,
  maxJobs: MAX_JOBS_COMPLETED,
  status: "",
};

interface IProps {
  onFilter: (filters: FilterState) => void;
  onReset: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  className?: string;
}

export function FilterPanel({
  onFilter,
  onReset,
  filters,
  setFilters,
  className,
}: IProps) {
  const [serviceTypes, setServiceTypes] = React.useState<IServiceType[]>([]);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<FilterState>(filters);

  React.useEffect(() => {
    if (!open) setDraft(filters);
  }, [filters, open]);

  const fetchServiceTypes = async (limit?: number) => {
    try {
      const url = limit ? `service-types?limit=${limit}` : "service-types";
      const response = await axiosInstance.get(url);
      if (response.data?.data) {
        setServiceTypes(response.data.data);
      }
      if (response.data?.pagination?.totalItems) {
        setTotalItems(response.data.pagination.totalItems);
      }
    } catch (err) {
      console.error("Failed to fetch service types:", err);
    }
  };

  React.useEffect(() => {
    fetchServiceTypes();
  }, []);

  const handleApply = () => {
    setFilters(draft);
    onFilter(draft);
    setOpen(false);
  };

  const handleReset = () => {
    const isDefault = JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS);
    if (!isDefault) {
      setFilters(DEFAULT_FILTERS);
      onReset();
    } else {
      setDraft(DEFAULT_FILTERS);
    }
    setOpen(false);
  };

  return (
    <FilterDrawer
      onFilter={handleApply}
      onReset={handleReset}
      title="Filter"
      className={cn(className)}
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters);
        setOpen(next);
      }}
    >
      {/* Job */}
      <Select
        value={draft.serviceTypeId}
    
        onValueChange={(val) =>
          setDraft((f) => ({ ...f, serviceTypeId: val }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Job" />
        </SelectTrigger>
        <SelectContent className="max-h-100" hideArrows>
          <SelectItem value="all">All</SelectItem>
          {serviceTypes.map((service) => (
            <SelectItem key={service.id} value={service.id.toString()}>
              {service.name}
            </SelectItem>
          ))}
          {totalItems > serviceTypes.length && (
            <div
              className="px-3 py-2.5 text-sm text-center text-primary cursor-pointer hover:bg-primary-soft transition-colors font-medium border-t border-surface-faintAlt"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                fetchServiceTypes(totalItems);
              }}
              onPointerDown={(e) => {
                // Prevent radix from closing the dropdown on pointer down
                e.stopPropagation();
              }}
            >
              Load more
            </div>
          )}
        </SelectContent>
      </Select>

      {/* Jobs Completed */}
      <div className="">
        <span className="text-sm font-semibold text-ink-slate">
          Jobs Completed
        </span>
        <div className="px-1 pt-3">
          <Slider
            value={[draft.minJobs, draft.maxJobs]}
            max={MAX_JOBS_COMPLETED}
            step={1}
            formatLabel={(val) => `${val}`}
            onValueChange={(val) =>
              setDraft((f) => ({
                ...f,
                minJobs: val[0],
                maxJobs: val[1],
              }))
            }
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-bold text-ink-disabled">
              {MIN_JOBS_COMPLETED}
            </span>
            <span className="text-xs font-bold text-ink-disabled">
              {MAX_JOBS_COMPLETED}
            </span>
          </div>
        </div>
      </div>

      {/* Status */}
      <Select
        value={draft.status}
        onValueChange={(val) => setDraft((f) => ({ ...f, status: val }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value={SERVICE_PARTNER_STATUS.PENDING}>
            {SERVICE_PARTNER_STATUS.PENDING}
          </SelectItem>
          <SelectItem value={SERVICE_PARTNER_STATUS.ACTIVE}>
            {SERVICE_PARTNER_STATUS.ACTIVE}
          </SelectItem>
          <SelectItem value={SERVICE_PARTNER_STATUS.INACTIVE}>
            {SERVICE_PARTNER_STATUS.INACTIVE}
          </SelectItem>
          <SelectItem value={SERVICE_PARTNER_VERIFICATION_STATUS.REJECTED}>
            {SERVICE_PARTNER_VERIFICATION_STATUS.REJECTED}
          </SelectItem>
        </SelectContent>
      </Select>
    </FilterDrawer>
  );
}
