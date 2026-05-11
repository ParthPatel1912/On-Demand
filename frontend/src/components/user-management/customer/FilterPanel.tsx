import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { IFilterState } from "@/types/user-management/customer.interface";
import FilterDrawer from "@/components/common/FilterDrawer";

const minBookings = 0;
const maxBookings = 999;

interface IProps {
  filters: IFilterState;
  onFilter: (updatedFilters: IFilterState) => void;
  onReset: () => void;
}

const FilterPanel = ({ filters, onFilter, onReset }: IProps) => {
  const [open, setOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState<IFilterState>(filters);

  // Sync local filters when opening
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
      filters.minBookings === minBookings && 
      filters.maxBookings === maxBookings && 
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
      {/* Bookings Range Filter */}
      <div className="space-y-3">
        <span className="text-sm font-semibold text-ink-slate">Bookings</span>
        <div className="px-1 pt-6">
          {" "}
          {/* Added top padding for labels */}
          <Slider
            value={[
              localFilters.minBookings ?? minBookings,
              localFilters.maxBookings ?? maxBookings,
            ]}
            max={maxBookings}
            step={1}
            formatLabel={(val) => `${val}`}
            onValueChange={(val) =>
              setLocalFilters((f) => ({
                ...f,
                minBookings: val[0],
                maxBookings: val[1],
              }))
            }
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-bold text-ink-disabled">
              {minBookings}
            </span>
            <span className="text-xs font-bold text-ink-disabled">
              {maxBookings}
            </span>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <Select
          value={localFilters.status}
          onValueChange={(value) =>
            setLocalFilters((f) => ({
              ...f,
              status: value,
            }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterDrawer>
  );
};

export default FilterPanel;
