import * as React from "react";

import { FloatingLabelInput } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { Subcategory } from "@/types/masterData.interface";
import FilterDrawer from "../common/FilterDrawer";

export type FilterState = {
  subCategoryId: string;
  priceMin: number;
  priceMax: number;
  availability: string;
  commission: string;
};

export const DEFAULT_FILTERS: FilterState = {
  subCategoryId: "all",
  priceMin: 0,
  priceMax: 99999,
  availability: "all",
  commission: "",
};

interface IProps {
  subCategories: Subcategory[];
  onFilter: (filters: FilterState) => void;
  className?: string;
}

export const FilterPanel = ({ subCategories, onFilter, className }: IProps) => {
  const [open, setOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState<FilterState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = React.useState<FilterState>(DEFAULT_FILTERS);

  React.useEffect(() => {
    if (!open) setLocalFilters(appliedFilters);
  }, [appliedFilters, open]);

  const handleApply = () => {
    const isSame = JSON.stringify(localFilters) === JSON.stringify(appliedFilters);
    if (isSame) {
      setOpen(false);
      return;
    }
    setAppliedFilters(localFilters);
    onFilter(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const isDefault = JSON.stringify(appliedFilters) === JSON.stringify(DEFAULT_FILTERS);
    if (!isDefault) {
      setAppliedFilters(DEFAULT_FILTERS);
      setLocalFilters(DEFAULT_FILTERS);
      onFilter(DEFAULT_FILTERS);
    } else {
      setLocalFilters(DEFAULT_FILTERS);
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
        if (next) setLocalFilters(appliedFilters);
        setOpen(next);
      }}
    >
      {/* Sub Category */}
      <div className="space-y-2">
        <Select
          value={localFilters.subCategoryId}
          onValueChange={(val) =>
            setLocalFilters((f) => ({ ...f, subCategoryId: val }))
          }
        >
          <SelectTrigger className="w-full h-14 border-line rounded-xl text-[15px]">
            <SelectValue placeholder="Sub Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              All Sub Categories
            </SelectItem>
            {subCategories.map((sub) => (
              <SelectItem
                className="cursor-pointer"
                key={sub.id}
                value={sub.id.toString()}
              >
                {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <span className="text-sm font-bold text-ink-slate">Price</span>
        <div className="px-1 pt-2">
          <Slider
            value={[localFilters.priceMin, localFilters.priceMax]}
            max={99999}
            step={1}
            formatLabel={(val) => `$${val.toFixed(2)}`}
            onValueChange={(val) =>
              setLocalFilters((f) => ({
                ...f,
                priceMin: val[0],
                priceMax: val[1],
              }))
            }
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-bold text-ink-disabled">
              ${localFilters.priceMin}
            </span>
            <span className="text-xs font-bold text-ink-disabled">
              ${localFilters.priceMax}
            </span>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <Select
          value={localFilters.availability}
          onValueChange={(val) =>
            setLocalFilters((f) => ({ ...f, availability: val }))
          }
        >
          <SelectTrigger className="w-full h-14 border-line rounded-xl text-[15px] focus:ring-0">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Select Availability</SelectItem>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Commission */}
      <div className="space-y-2">
        <FloatingLabelInput
          label="Commission"
          value={localFilters.commission}
          onChange={(e) => {
            let value = e.target.value;

            if (value === "") {
              setLocalFilters((f) => ({ ...f, commission: "" }));
              return;
            }
            let num = Number(value);
            if (num < 0) num = 0;
            if (num > 100) num = 100;

            setLocalFilters((f) => ({ ...f, commission: String(num) }));
          }}
          type="number"
          min={0}
          max={100}
        />
      </div>
    </FilterDrawer>
  );
};
