import * as React from "react";
import { Clock } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FloatingLabelDatePicker } from "@/components/ui/date-picker";
import { FloatingLabelInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_ASSIGNED_FILTERS,
  SERVICE_PARTNER_SERVICE_STATUS,
} from "@/utils/constants";
import type { AssignedServiceFilterState } from "@/types/user-management/partner.interface";
import FilterDrawer from "@/components/common/FilterDrawer";

interface IProps {
  onFilter: (filters: AssignedServiceFilterState) => void;
  onReset: () => void;
  filters: AssignedServiceFilterState;
  setFilters: React.Dispatch<React.SetStateAction<AssignedServiceFilterState>>;
  className?: string;
}

const AssignedServiceFilterPanel = ({
  onFilter,
  onReset,
  filters,
  setFilters,
  className,
}: IProps) => {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<AssignedServiceFilterState>(filters);

  React.useEffect(() => {
    if (!open) setDraft(filters);
  }, [filters, open]);

  const handleApply = () => {
    const isSame = JSON.stringify(draft) === JSON.stringify(filters);
    if (isSame) {
      setOpen(false);
      return;
    }
    setFilters(draft);
    onFilter(draft);
    setOpen(false);
  };

  const handleReset = () => {
    const isAppliedDefault = JSON.stringify(filters) === JSON.stringify(DEFAULT_ASSIGNED_FILTERS);

    if (isAppliedDefault) {
      setDraft(DEFAULT_ASSIGNED_FILTERS);
      setOpen(false);
      return;
    }

    setFilters(DEFAULT_ASSIGNED_FILTERS);
    setDraft(DEFAULT_ASSIGNED_FILTERS);
    onReset();
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
      {/* Date */}
      <FloatingLabelDatePicker
        label="Date"
        value={draft.date}
        onChange={(val) => setDraft((f) => ({ ...f, date: val }))}
      />

      {/* Time */}
      <FloatingLabelInput
        label="Time"
        value={draft.time}
        onChange={(e) => setDraft((f) => ({ ...f, time: e.target.value }))}
        type="time"
        rightAddon={<Clock className="h-4 w-4 text-ink-muted" />}
        rightAddonClassName="bg-transparent border-none px-4"
      />

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
          <SelectItem value={SERVICE_PARTNER_SERVICE_STATUS.PENDING}>
            Pending
          </SelectItem>
          <SelectItem value={SERVICE_PARTNER_SERVICE_STATUS.CONFIRMED}>
            Confirmed
          </SelectItem>
          <SelectItem value={SERVICE_PARTNER_SERVICE_STATUS.COMPLETED}>
            Completed
          </SelectItem>
          <SelectItem value={SERVICE_PARTNER_SERVICE_STATUS.CANCELLED}>
            Cancelled
          </SelectItem>
        </SelectContent>
      </Select>
    </FilterDrawer>
  );
};

export default AssignedServiceFilterPanel;
