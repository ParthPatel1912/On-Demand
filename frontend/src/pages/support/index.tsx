import { useEffect, useState } from "react";
import { format, isValid, parse } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import PageTitle from "@/components/common/PageTitle";
import CustomTable from "@/components/common/CustomTable";
import { FloatingLabelInput } from "@/components/ui/input";
import { FloatingLabelDatePicker } from "@/components/ui/date-picker";
import axiosInstance from "@/helper/axiosInstance";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ISupportTicket } from "@/types/support.interface";
import FilterDrawer from "@/components/common/FilterDrawer";
import { SUPPORT_TEXT } from "@/constants/support.text";

const DescriptionTooltip = ({ description }: { description: string }) => {
  const [open, setOpen] = useState(false);
  const isLong = description?.length > 20;

  if (!isLong) {
    return <span className="text-ink">{description}</span>;
  }

  const displayValue = `${description.substring(0, 20)}...`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <span className="text-ink cursor-default">{displayValue}</span>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="group z-1000 w-72 p-4 bg-white text-ink text-[13px] leading-relaxed rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.12)] border border-line-light pointer-events-none wrap-break-word animate-in fade-in zoom-in duration-200"
      >
        <div
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 
                        group-data-[side=top]:-bottom-1.5 group-data-[side=top]:border-b group-data-[side=top]:border-r group-data-[side=top]:border-line-light
                        group-data-[side=bottom]:-top-1.5 group-data-[side=bottom]:border-t group-data-[side=bottom]:border-l group-data-[side=bottom]:border-line-light"
        />
        {description}
      </PopoverContent>
    </Popover>
  );
};

const SupportPage = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const [supportTickets, setSupportTickets] = useState<ISupportTicket[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    userName: "",
    submissionDate: undefined as string | undefined,
  });

  const [openDrawer, setOpenDrawer] = useState(false);
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (!openDrawer) setDraft(filters);
  }, [filters, openDrawer]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    order: "ASC" | "DESC";
  }>({
    key: "id",
    order: "DESC",
  });

  const fetchSupportTickets = async (
    page = 1,
    limit = rowsPerPage,
    activeFilters = filters,
    activeSort = sortConfig
  ) => {
    try {
      setTableLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("sortBy", activeSort.key);
      params.append("sortOrder", activeSort.order);

      if (activeFilters.userName) {
        params.append("name", activeFilters.userName);
      }
      if (activeFilters.submissionDate) {
        const parsedDate = parse(
          activeFilters.submissionDate,
          "dd/MM/yyyy",
          new Date()
        );
        if (isValid(parsedDate)) {
          params.append("submissionDate", format(parsedDate, "yyyy-MM-dd"));
        }
      }

      const response = await axiosInstance.get(`contacts?${params.toString()}`);

      if (response.data?.success) {
        setSupportTickets(response.data.data || []);
        setTotalItems(response.data.pagination.totalItems || 0);
      }
    } catch (error: unknown) {
      console.error(SUPPORT_TEXT.failedToFetch, error);
      setSupportTickets([]);
      setTotalItems(0);
    } finally {
      setTableLoading(false);
    }
  };

  const handleFilterSearch = () => {
    const isSame = JSON.stringify(draft) === JSON.stringify(filters);
    if (isSame) {
      setOpenDrawer(false);
      return;
    }
    setFilters(draft);
    setCurrentPage(1);
    fetchSupportTickets(1, rowsPerPage, draft);
    setOpenDrawer(false);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      userName: "",
      submissionDate: undefined,
    };

    const isAppliedDefault = JSON.stringify(filters) === JSON.stringify(defaultFilters);

    if (isAppliedDefault) {
      setDraft(defaultFilters);
      setOpenDrawer(false);
      return;
    }

    setFilters(defaultFilters);
    setDraft(defaultFilters);
    setCurrentPage(1);
    fetchSupportTickets(1, rowsPerPage, defaultFilters);
    setOpenDrawer(false);
  };

  const handleSort = (key: string, order: "ASC" | "DESC") => {
    const newSort = { key, order };
    setSortConfig(newSort);
    fetchSupportTickets(1, rowsPerPage, filters, newSort);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchSupportTickets(currentPage, rowsPerPage, filters, sortConfig);
  }, [currentPage, rowsPerPage]);

  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setCurrentPage(1);
    setRowsPerPage(rowsPerPage);
  };

  return (
    <div className="flex flex-col">
      <PageTitle title={SUPPORT_TEXT.pageTitle}>
        <div className="flex gap-3">
          <FilterDrawer
            open={openDrawer}
            onOpenChange={(next) => {
              if (next) setDraft(filters);
              setOpenDrawer(next);
            }}
            title={SUPPORT_TEXT.filterTitle}
            onFilter={handleFilterSearch}
            onReset={handleResetFilters}
          >
            {/* User Name */}
            <div className="space-y-2">
              <FloatingLabelInput
                label={SUPPORT_TEXT.userNameLabel}
                value={draft.userName}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, userName: e.target.value }))
                }
              />
            </div>

            {/* Submission Date */}
            <div className="space-y-4">
              <FloatingLabelDatePicker
                label={SUPPORT_TEXT.submissionDateLabel}
                value={draft.submissionDate}
                onChange={(date) =>
                  setDraft((prev) => ({ ...prev, submissionDate: date }))
                }
              />
            </div>
          </FilterDrawer>
        </div>
      </PageTitle>

      <Card className="border-neutral-200 shadow-sm rounded-lg overflow-hidden py-0 gap-0">
        <CardContent className="p-0 bg-white overflow-x-auto">
          {tableLoading ? (
            <TableSkeleton />
          ) : (
            <CustomTable
              serverSide
              pagination
              headers={[
                {
                  key: "id",
                  header: SUPPORT_TEXT.ticketIdHeader,
                  sortable: true,
                },
                {
                  key: "name",
                  header: SUPPORT_TEXT.userNameHeader,
                  sortable: true,
                },
                {
                  key: "email",
                  header: SUPPORT_TEXT.emailHeader,
                  sortable: true,
                },
                {
                  key: "mobile",
                  header: SUPPORT_TEXT.mobileHeader,
                },
                {
                  key: "description",
                  header: SUPPORT_TEXT.descriptionHeader,
                  render: (row: ISupportTicket) => (
                    <DescriptionTooltip description={row.description} />
                  ),
                },
                {
                  key: "createdAt",
                  header: SUPPORT_TEXT.submissionDateHeader,
                  sortable: true,
                  render: (row: ISupportTicket) => (
                    <>
                      {row.createdAt
                        ? format(new Date(row.createdAt), "dd MMM yyyy")
                        : "N/A"}
                    </>
                  ),
                },
              ]}
              listData={supportTickets}
              totalItems={totalItems}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSort={handleSort}
              sortBy={sortConfig.key}
              sortOrder={sortConfig.order}
              notFoundText={SUPPORT_TEXT.noTicketsFound}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TableSkeleton = () => (
  <div className="space-y-3">
    {/* Header skeleton */}
    <div className="flex space-x-4 p-4 border-b justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-24" />
    </div>
    {/* Row skeletons */}
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex space-x-4 p-4 border-b justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
);

export default SupportPage;
