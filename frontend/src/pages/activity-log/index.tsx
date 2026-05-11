import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import PageTitle from "@/components/common/PageTitle";
import CustomTable from "@/components/common/CustomTable";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingLabelSelect, SelectItem } from "@/components/ui/select";
import { FloatingLabelDatePicker } from "@/components/ui/date-picker";
import FilterDrawer from "@/components/common/FilterDrawer";

import { fetchActivityLog, fetchLogEventTypes } from "@/api/activityLog";
import type {
  LogFilterParams,
  LogItem,
  TSortOrder,
} from "@/types/activity-logger.interface";
import { cn } from "@/lib/utils";
import {
  formatDate,
  parse,
  isBefore,
  isAfter,
  isValid,
  startOfDay,
} from "date-fns";
import { normalizeString } from "@/utils";
import { DATE_TIME_FORMAT, DESCENDING, logCategories, logStatuses, PAGINATION_DEFAULT_LIMIT, PAGINATION_DEFAULT_PAGE } from "@/utils/constants";
import { LogTableSkeleton } from "@/components/activity-log/LogTableSkeleton";
import { ActiveFilterBadges } from "@/components/activity-log/ActiveFilterBadges";
import { ACTIVITY_LOG_TEXT } from "@/constants/activityLog.text";

const ActivityLogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial state from URL params
  const initialParams = useMemo<LogFilterParams>(
    () => ({
      page: Number(searchParams.get("page")) || PAGINATION_DEFAULT_PAGE,
      limit: Number(searchParams.get("limit")) || PAGINATION_DEFAULT_LIMIT,
      eventType: searchParams.get("eventType") || undefined,
      category: searchParams.get("category") || undefined,
      status: searchParams.get("status") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as TSortOrder) || DESCENDING,
      fromDate: searchParams.get("fromDate") || undefined,
      toDate: searchParams.get("toDate") || undefined,
    }),
    [searchParams],
  );

  const [logs, setLogs] = useState<LogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState<
    { value: string; label: string }[]
  >([]);
  const [filters, setFilters] = useState<LogFilterParams>(initialParams);
  const [tempFilters, setTempFilters] =
    useState<LogFilterParams>(initialParams);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setTempFilters(filters);
    }
  }, [filters, open]);

  // --- API Functions ---

  const loadEventTypes = useCallback(async (category?: string) => {
    try {
      const data = await fetchLogEventTypes(category);
      setEventTypes(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error(ACTIVITY_LOG_TEXT.failedToFetchEventTypes, error);
      setEventTypes([]);
    }
  }, []);

  const loadLogs = useCallback(async (params: LogFilterParams) => {
    setLoading(true);
    try {
      const data = await fetchActivityLog(params);
      setLogs(data.data);
      setTotal(data.pagination.totalItems);
    } catch (error) {
      console.error(ACTIVITY_LOG_TEXT.failedToFetchLogs, error);
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Effects ---

  // Initial mount load
  useEffect(() => {
    loadLogs(initialParams);
  }, [loadLogs, initialParams]);

  // Update URL params when filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (key === "page" && value === PAGINATION_DEFAULT_PAGE) return;
        if (key === "limit" && value === PAGINATION_DEFAULT_LIMIT) return;

        params[key] = value.toString();
      }
    });

    const currentParams = Object.fromEntries(searchParams.entries());
    const hasParamsChanged = JSON.stringify(currentParams) !== JSON.stringify(params);

    if (hasParamsChanged) {
      setSearchParams(params, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  // Refresh event types when category in popover changes
  useEffect(() => {
    loadEventTypes(tempFilters.category);
  }, [tempFilters.category, loadEventTypes]);

  // Sync tempFilters when applied filters change (no need for a separate effect if we sync in handlers, but keeping it simple for now)
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  // --- Handlers ---

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => {
      const next = { ...prev, page };
      loadLogs(next);
      return next;
    });
  }, [loadLogs]);

  const handleRowsPerPageChange = useCallback((limit: number) => {
    setFilters((prev) => {
      const next = { ...prev, limit, page: PAGINATION_DEFAULT_PAGE };
      loadLogs(next);
      return next;
    });
  }, [loadLogs]);

  const handleSort = useCallback(
    (sortBy: string, sortOrder: TSortOrder) => {
      setFilters((prev) => {
        const next = { ...prev, sortBy, sortOrder };
        loadLogs(next);
        return next;
      });
    },
    [loadLogs],
  );

  const clearFilters = useCallback(() => {
    const resetFilters: LogFilterParams = {
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      sortBy: "createdAt",
      sortOrder: DESCENDING,
      fromDate: undefined,
      toDate: undefined,
      category: undefined,
      eventType: undefined,
      status: undefined,
    };
    if (JSON.stringify(filters) === JSON.stringify(resetFilters)) return;
    setFilters(resetFilters);
    setTempFilters(resetFilters);
    loadLogs(resetFilters);
  }, [filters, loadLogs]);

  const handleApplyFilters = useCallback(() => {
    const isFiltersSame = 
      tempFilters.category === filters.category &&
      tempFilters.eventType === filters.eventType &&
      tempFilters.status === filters.status &&
      tempFilters.fromDate === filters.fromDate &&
      tempFilters.toDate === filters.toDate;

    if (isFiltersSame) {
      setOpen(false);
      return;
    }
    setFilters((prev) => {
      const next = {
        ...tempFilters,
        page: PAGINATION_DEFAULT_PAGE,
        sortBy: prev.sortBy,
        sortOrder: prev.sortOrder,
      };
      // loadLogs(next);
      return next;
    });
    setOpen(false);
  }, [tempFilters, filters, loadLogs]);

  const handleResetFilters = useCallback(() => {
    const defaultFilters: LogFilterParams = {
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      sortBy: "createdAt",
      sortOrder: DESCENDING,
      fromDate: undefined,
      toDate: undefined,
      category: undefined,
      eventType: undefined,
      status: undefined,
    };

    const isActuallyEmpty = 
      !filters.category && !filters.eventType && !filters.status && !filters.fromDate && !filters.toDate;
      
    if (isActuallyEmpty) {
      setTempFilters(defaultFilters);
      setOpen(false);
      return;
    }

    setFilters(defaultFilters);
    setTempFilters(defaultFilters);
    loadLogs(defaultFilters);
    setOpen(false);
  }, [filters, loadLogs]);

  const handleRemoveFilter = useCallback((key: keyof LogFilterParams) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: undefined, page: PAGINATION_DEFAULT_PAGE };
      if (key === "category") newFilters.eventType = undefined;
      loadLogs(newFilters);
      return newFilters;
    });
  }, [loadLogs]);

  const getEventTypeName = useCallback(
    (value: string) =>
      eventTypes.find((t) => t.value === value)?.label || value,
    [eventTypes],
  );

  // --- Helpers ---

  const tableHeaders = useMemo(
    () => [
      { key: "user.email", header: ACTIVITY_LOG_TEXT.actionBy, className: "cursor-default" },
      {
        key: "eventType",
        header: ACTIVITY_LOG_TEXT.eventType,
        className: "min-w-[180px] w-fit cursor-default",
        render: (row: LogItem) =>
          normalizeString(getEventTypeName(row.eventType)),
      },
      {
        key: "message",
        header: ACTIVITY_LOG_TEXT.description,
        className: "max-w-md cursor-default",
        render: (row: LogItem) => (
          <div className="line-clamp-2" title={row.message}>
            {row.message}
          </div>
        ),
      },
      {
        key: "category",
        header: ACTIVITY_LOG_TEXT.category,
        className: "min-w-[180px] w-fit cursor-default",
        render: (row: LogItem) => normalizeString(row.category),
      },
      {
        key: "status",
        header: ACTIVITY_LOG_TEXT.status,
        className: "w-fit text-center cursor-default",
        render: (row: LogItem) => (
          <span
            className={cn(
              "h-7 flex flex-row w-max flex-nowrap items-center gap-1 px-2 py-1 rounded text-sm font-medium",
              row.status === "SUCCESS"
                ? "bg-green-100 text-green-800"
                : row.status === "FAILED"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800",
            )}
          >
            <b className="text-xl">&middot;</b> {normalizeString(row.status)}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: ACTIVITY_LOG_TEXT.dateHeader,
        sortable: true,
        className: "max-w-[200px]",
        render: (row: LogItem) => (
          <div className="cursor-default">
            {formatDate(new Date(row.createdAt), DATE_TIME_FORMAT)}
          </div>
        ),
      },
    ],
    [getEventTypeName],
  );

  const renderCategoryFilter = () => {
    const isLogCategoriesEmpty = logCategories.length === 0;
    return (
      <div className="space-y-2">
        <FloatingLabelSelect
          id="category"
          label={ACTIVITY_LOG_TEXT.category}
          value={tempFilters.category || ""}
          onValueChange={(val) =>
            setTempFilters((prev) => ({
              ...prev,
              category: val,
              eventType: undefined,
            }))
          }
        >
          {!isLogCategoriesEmpty ? (
            logCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {normalizeString(cat)}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              {ACTIVITY_LOG_TEXT.noCategoryFound}
            </SelectItem>
          )}
        </FloatingLabelSelect>
      </div>
    );
  };

  const renderEventTypeFilter = () => {
    return (
      <div className="space-y-2">
        <FloatingLabelSelect
          id="eventType"
          label={ACTIVITY_LOG_TEXT.eventType}
          value={(tempFilters.eventType as string) || ""}
          disabled={!tempFilters.category}
          onValueChange={(val) =>
            setTempFilters((prev) => ({ ...prev, eventType: val }))
          }
        >
          {eventTypes.length > 0 ? (
            eventTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              {ACTIVITY_LOG_TEXT.noEventTypeFound}
            </SelectItem>
          )}
        </FloatingLabelSelect>
      </div>
    );
  };

  const renderStatusFilter = () => {
    return (
      <div className="space-y-2">
        <FloatingLabelSelect
          id="status"
          label={ACTIVITY_LOG_TEXT.status}
          value={tempFilters.status || ""}
          onValueChange={(val) =>
            setTempFilters((prev) => ({ ...prev, status: val }))
          }
        >
          {logStatuses.length > 0 ? (
            logStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {normalizeString(status)}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              {ACTIVITY_LOG_TEXT.noStatusFound}
            </SelectItem>
          )}
        </FloatingLabelSelect>
      </div>
    );
  };

  const renderFromDate = () => {
    return (
      <div className="space-y-2">
        <FloatingLabelDatePicker
          label={ACTIVITY_LOG_TEXT.fromDate}
          value={tempFilters.fromDate}
          displayFormat="yyyy-MM-dd"
          disabledDates={(date) => {
            const isFuture = isAfter(startOfDay(date), startOfDay(new Date()));
            if (isFuture) return true;
            if (!tempFilters.toDate) return false;
            const to = parse(tempFilters.toDate, "yyyy-MM-dd", new Date());
            return isValid(to) && isAfter(startOfDay(date), startOfDay(to));
          }}
          onChange={(val) =>
            setTempFilters((prev) => ({ ...prev, fromDate: val }))
          }
        />
      </div>
    );
  };

  const renderToDate = () => {
    return (
      <div className="space-y-2">
        <FloatingLabelDatePicker
          label={ACTIVITY_LOG_TEXT.toDate}
          value={tempFilters.toDate}
          displayFormat="yyyy-MM-dd"
          disabledDates={(date) => {
            const isFuture = isAfter(startOfDay(date), startOfDay(new Date()));
            if (isFuture) return true;
            if (!tempFilters.fromDate) return false;
            const from = parse(tempFilters.fromDate, "yyyy-MM-dd", new Date());
            return (
              isValid(from) && isBefore(startOfDay(date), startOfDay(from))
            );
          }}
          onChange={(val) =>
            setTempFilters((prev) => ({ ...prev, toDate: val }))
          }
        />
      </div>
    );
  };

  return (
    <div className="bg-surface-dashboard min-h-screen">
      <PageTitle title={ACTIVITY_LOG_TEXT.activityLog} className="pb-4">
        <div className="flex items-center gap-3">
          <FilterDrawer
            open={open}
            onOpenChange={(next) => {
              if (next) setTempFilters(filters);
              setOpen(next);
            }}
            onFilter={handleApplyFilters}
            onReset={handleResetFilters}
            title={ACTIVITY_LOG_TEXT.filters}
          >
            <div className="space-y-6">
              {renderCategoryFilter()}
              {renderEventTypeFilter()}
              {renderStatusFilter()}
              {renderFromDate()}
              {renderToDate()}
            </div>
          </FilterDrawer>
        </div>
      </PageTitle>

      <ActiveFilterBadges
        filters={filters}
        onRemove={handleRemoveFilter}
        onClearAll={clearFilters}
        getEventTypeName={getEventTypeName}
      />

      <Card className="border-neutral-200 shadow-sm rounded-lg overflow-hidden py-0 gap-0">
        <CardContent className="p-0 bg-white">
          {loading ? (
            <LogTableSkeleton limit={filters.limit} />
          ) : (
            <CustomTable
              headers={tableHeaders}
              listData={logs}
              pagination
              serverSide
              totalItems={total}
              currentPage={filters.page}
              rowsPerPage={filters.limit}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSort={handleSort}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              notFoundText={ACTIVITY_LOG_TEXT.noLogFound}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogPage;
