import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/common/PageTitle";
import CustomTable from "@/components/common/CustomTable";
import { APP_ROUTES } from "@/routes/config";
import { Card, CardContent } from "@/components/ui/card";
import axiosInstance from "@/helper/axiosInstance";
import { Skeleton } from "@/components/ui/skeleton";
import type { ITransaction } from "@/types/payments.interface";
import type { IPagination } from "@/types/common.interface";
import FilterDrawer from "@/components/common/FilterDrawer";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCurrencySymbol } from "@/utils";
import { PAYMENTS_TEXT } from "@/constants/payments.text";

const PaymentsPage = () => {
  const navigate = useNavigate();
  const [tableLoading, setTableLoading] = useState(false);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [pagination, setPagination] = useState<IPagination>({
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<{
    minAmount: number;
    maxAmount: number;
    paymentMethod?: string;
  }>({
    minAmount: 0,
    maxAmount: 99999,
    paymentMethod: "",
  });

  const [openDrawer, setOpenDrawer] = useState(false);
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (!openDrawer) setDraft(filters);
  }, [filters, openDrawer]);

  const fetchTransactions = useCallback(
    async (
      page = 1,
      limit = 10,
      currentFilters = {},
      currentSort = { sortBy: "createdAt", sortOrder: "ASC" },
    ) => {
      try {
        setTableLoading(true);
        const response = await axiosInstance.get("/transactions", {
          params: {
            page,
            limit,
            ...currentFilters,
            sortBy: currentSort.sortBy,
            sortOrder: currentSort.sortOrder,
          },
        });

        if (response.data.success && response.data.data) {
          setTransactions(response.data.data);
          if (response.data.pagination) {
            setPagination((prev) => ({
              ...prev,
              ...response.data.pagination,
              limit,
            }));
            setCurrentPage(response.data.pagination.currentPage);
          }
        } else {
          setTransactions([]);
          setPagination((prev) => ({
            ...prev,
            totalItems: 0,
            currentPage: 1,
          }));
          setCurrentPage(1);
        }
      } catch (error: unknown) {
        console.error(PAYMENTS_TEXT.failedToFetch, error);
        setTransactions([]);
        setPagination((prev) => ({
          ...prev,
          totalItems: 0,
          currentPage: 1,
        }));
        setCurrentPage(1);
      } finally {
        setTableLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchTransactions(page, pagination.limit, {
        ...filters,
        paymentMethod:
          filters.paymentMethod === "all" ? undefined : filters.paymentMethod,
      });
    },
    [fetchTransactions, pagination.limit, filters],
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setPagination((prev) => ({ ...prev, limit: newRowsPerPage }));
      setCurrentPage(1);
      fetchTransactions(1, newRowsPerPage, {
        ...filters,
        paymentMethod:
          filters.paymentMethod === "all" ? undefined : filters.paymentMethod,
      });
    },
    [fetchTransactions, filters],
  );

  const handleApplyFilters = useCallback(async () => {
    const isSame = JSON.stringify(draft) === JSON.stringify(filters);
    if (isSame) {
      setOpenDrawer(false);
      return;
    }
    setFilters(draft);
    setCurrentPage(1);
    await fetchTransactions(1, pagination.limit, {
      ...draft,
      paymentMethod:
        draft.paymentMethod === "all" ? undefined : draft.paymentMethod,
    });
    setOpenDrawer(false);
  }, [fetchTransactions, pagination.limit, draft, filters]);

  const handleResetFilters = useCallback(async () => {
    const resetFilters = {
      minAmount: 0,
      maxAmount: 99999,
      paymentMethod: "",
    };

    const isAppliedDefault = JSON.stringify(filters) === JSON.stringify(resetFilters);

    if (isAppliedDefault) {
      setDraft(resetFilters);
      setOpenDrawer(false);
      return;
    }

    setFilters(resetFilters);
    setDraft(resetFilters);
    setCurrentPage(1);
    await fetchTransactions(1, pagination.limit, {});
    setOpenDrawer(false);
  }, [filters, fetchTransactions, pagination.limit]);

  const handleRowClick = (row: ITransaction) => {
    navigate(APP_ROUTES.ADMIN_PAYMENT_DETAILS.replace(":id", row.id));
  };

  const TableSkeleton = () => (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex space-x-4 justify-between border-b pb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <PageTitle title="Payments & Transactions">
        <FilterDrawer
          title="Filter"
          open={openDrawer}
          onOpenChange={(next) => {
            if (next) setDraft(filters);
            setOpenDrawer(next);
          }}
          onFilter={handleApplyFilters}
          onReset={handleResetFilters}
        >
          {/* Amount Range */}
          <div>
            <h3
              className="font-medium leading-[20px] font-[14px] tracking-[0.1%] text-[#1C2434]"
            >
              Amount
            </h3>
            <div className="px-1">
              <Slider
                value={[draft.minAmount, draft.maxAmount]}
                onValueChange={([min, max]) =>
                  setDraft((prev) => ({
                    ...prev,
                    minAmount: min,
                    maxAmount: max,
                  }))
                }
                max={99999}
                step={1}
                minStepsBetweenThumbs={1}
                className="mt-6"
                formatLabel={(v) => `$${v.toLocaleString()}`}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-bold text-ink-disabled">
                  $0
                </span>
                <span className="text-xs font-bold text-ink-disabled">
                  $99,999
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <Select
              value={draft.paymentMethod}
              onValueChange={(value) =>
                setDraft((prev) => ({ ...prev, paymentMethod: value }))
              }
            >
              <SelectTrigger className="w-full h-13 border-line rounded-xl">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterDrawer>
      </PageTitle>

      <Card className="border-neutral-200 shadow-sm rounded-lg overflow-hidden">
        <CardContent className="p-0 bg-white">
          {tableLoading ? (
            <TableSkeleton />
          ) : (
            <CustomTable
              headers={[
                {
                  key: "userName",
                  header: PAYMENTS_TEXT.headerUser,
                  className: "text-left",
                  render: (row: ITransaction) => (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(row);
                      }}
                      className="cursor-pointer hover:underline text-ink"
                    >
                      {row.userName}
                    </span>
                  ),
                },
                {
                  key: "transactionId",
                  header: PAYMENTS_TEXT.headerTransactionID,
                  className:
                    "text-left max-w-[150px] sm:max-w-[200px] xl:max-w-[250px] truncate",
                  render: (row) => (
                    <span title={row.transactionId} className="truncate block">
                      {row.transactionId}
                    </span>
                  ),
                },
                {
                  key: "mobileNumber",
                  header: PAYMENTS_TEXT.headerMobileNumber,
                  className: "text-left",
                },
                {
                  key: "serviceName",
                  header: PAYMENTS_TEXT.headerService,
                  className: "text-left",
                },
                {
                  key: "amount",
                  header: PAYMENTS_TEXT.headerAmount,
                  className: "text-left",
                  render: (row: ITransaction) => (
                    <span
                      className="text-sm text-ink-currency whitespace-nowrap"
                    >
                      +{getCurrencySymbol(row.currency)}{row.amount.toFixed(2)}
                    </span>
                  ),
                },
                {
                  key: "paymentMethod",
                  header: PAYMENTS_TEXT.headerPaymentMethod,
                  className: "text-left",
                },
              ]}
              listData={transactions}
              pagination
              serverSide
              totalItems={pagination.totalItems}
              currentPage={currentPage}
              rowsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default PaymentsPage;
