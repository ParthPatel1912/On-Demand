import { useState, useEffect } from "react";
import { FloatingLabelSelect, SelectItem } from "@/components/ui/select";
import { FloatingLabelInput } from "@/components/ui/input";
import type { AdminUserFilterValues } from "@/types/user-management/admin.interface";
import { USER_MANAGEMENT_STATUS_OPTIONS } from "@/utils/constants";
import FilterDrawer from "@/components/common/FilterDrawer";

interface IProps {
  filters: AdminUserFilterValues;
  setAppliedFilters: (filters: AdminUserFilterValues) => void;
  onFilter: (newFilters?: AdminUserFilterValues) => void;
  onReset: () => void;
}

const AdminUserFilter = ({
  filters,
  setAppliedFilters,
  onFilter,
  onReset,
}: IProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AdminUserFilterValues>(filters);

  useEffect(() => {
    if (!open) setDraft(filters);
  }, [filters, open]);

  const handleApply = () => {
    if (JSON.stringify(draft) === JSON.stringify(filters)) {
      setOpen(false);
      return;
    }
    setAppliedFilters(draft);
    onFilter(draft);
    setOpen(false);
  };

  const handleReset = () => {
    const isDefault = 
      (!filters.search || filters.search === "") && 
      (!filters.status || filters.status === USER_MANAGEMENT_STATUS_OPTIONS.ALL);

    if (!isDefault) {
      onReset();
    } else {
      setDraft(filters);
    }
    setOpen(false);
  };

  return (
    <FilterDrawer 
      onFilter={handleApply} 
      onReset={handleReset} 
      title="Filter"
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters);
        setOpen(next);
      }}
    >
      <div className="space-y-2">
        <FloatingLabelInput
          label="Search"
          name="search"
          value={draft.search}
          onChange={(e) =>
            setDraft({
              ...draft,
              search: e.target.value,
            })
          }
        />
      </div>
      <div className="space-y-2">
        <FloatingLabelSelect
          id="status"
          label="Status"
          value={draft.status}
          onValueChange={(value) =>
            setDraft({
              ...draft,
              status: value as AdminUserFilterValues["status"],
            })
          }
        >
          <SelectItem value={USER_MANAGEMENT_STATUS_OPTIONS.ALL}>
            All
          </SelectItem>
          <SelectItem value={USER_MANAGEMENT_STATUS_OPTIONS.ACTIVE}>
            Active
          </SelectItem>
          <SelectItem value={USER_MANAGEMENT_STATUS_OPTIONS.INACTIVE}>
            Inactive
          </SelectItem>
        </FloatingLabelSelect>
      </div>
    </FilterDrawer>
  );
};

export default AdminUserFilter;
