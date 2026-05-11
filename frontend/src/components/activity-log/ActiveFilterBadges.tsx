// --- Sub-components ---

import { normalizeString } from "@/utils";
import { memo, useMemo } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";
import type { ActiveFilterBadgesProps } from "@/types/activity-logger.interface";
import { formatDate } from "date-fns";

export const ActiveFilterBadges = memo(
  ({
    filters,
    onRemove,
    onClearAll,
    getEventTypeName,
  }: ActiveFilterBadgesProps) => {
    const hasActiveFilters = useMemo(
      () =>
        filters.eventType ||
        filters.category ||
        filters.status ||
        filters.fromDate ||
        filters.toDate,
      [filters],
    );

    if (!hasActiveFilters) return null;

    return (
      <div className="px-0 pb-4 flex flex-wrap items-center gap-2">
        {filters.eventType && (
          <FilterBadge
            label="Event Type"
            value={normalizeString(
              getEventTypeName(filters.eventType as string),
            )}
            onRemove={() => onRemove("eventType")}
          />
        )}
        {filters.category && (
          <FilterBadge
            label="Category"
            value={normalizeString(filters.category)}
            onRemove={() => onRemove("category")}
          />
        )}
        {filters.status && (
          <FilterBadge
            label="Status"
            value={normalizeString(filters.status)}
            onRemove={() => onRemove("status")}
          />
        )}
        {filters.fromDate && (
          <FilterBadge
            label="From"
            value={formatDate(new Date(filters.fromDate), "dd MMM yyyy")}
            onRemove={() => onRemove("fromDate")}
          />
        )}
        {filters.toDate && (
          <FilterBadge
            label="To"
            value={formatDate(new Date(filters.toDate), "dd MMM yyyy")}
            onRemove={() => onRemove("toDate")}
          />
        )}

        <Button
          variant="ghost"
          onClick={onClearAll}
          className="text-sm text-neutral-500 hover:text-red-500 h-7 px-2 hover:bg-transparent"
        >
          Clear All
        </Button>
      </div>
    );
  },
);

export const FilterBadge = ({
  label,
  value,
  onRemove,
}: {
  label: string;
  value: string;
  onRemove: () => void;
}) => (
  <Badge
    variant="secondary"
    className="flex items-center gap-1 px-3 py-1 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-full"
  >
    <span className="text-xs font-medium text-neutral-500">{label}:</span>
    <span className="text-xs font-semibold">{value}</span>
    <X
      className="h-3 w-3 cursor-pointer hover:text-red-500"
      onClick={onRemove}
    />
  </Badge>
);