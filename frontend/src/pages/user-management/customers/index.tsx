import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ban, Check, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { Card, CardContent } from "@/components/ui/card";
import PageTitle from "@/components/common/PageTitle";
import CustomTable from "@/components/common/CustomTable";
import { ActionMenu } from "@/components/common/ActionMenu";
import axiosInstance from "@/helper/axiosInstance";
import FilterPanel from "../../../components/user-management/customer/FilterPanel";
import AddCustomerModal from "../../../components/user-management/customer/AddCustomerModal";
import DeleteConfirmPopup from "@/components/common/DeleteConfirmPopup";
import type {
  ICustomer,
  IFilterState,
  IModalState,
} from "@/types/user-management/customer.interface";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmPopup from "@/components/common/ConfirmPopup";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/routes/config";
import StatusBadge from "@/components/common/StatusBadge";
import { CUSTOMER_STATUS } from "@/utils/constants";
import { USER_MANAGEMENT_TEXT } from "@/constants/userManagement.text";

const DEFAULT_FILTERS: IFilterState = {
  status: "",
  minBookings: 0,
  maxBookings: 999,
  page: 1,
  limit: 10,
  sortBy: "id",
  sortOrder: "ASC",
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [filters, setFilters] = useState<IFilterState>(DEFAULT_FILTERS);

  const [totalItems, setTotalItems] = useState(0);

  const navigate = useNavigate();

  const [modal, setModal] = useState<IModalState>({
    isOpen: false,
    type: null,
    customerId: null,
    customerName: "",
  });

  const fetchCustomers = useCallback(async (currentFilters = filters) => {
    try {
      setTableLoading(true);
      const params = new URLSearchParams();
      params.append("page", (currentFilters.page || 1).toString());
      params.append("limit", (currentFilters.limit || 10).toString());

      if (currentFilters.status && currentFilters.status !== "all") {
        params.append("status", currentFilters.status);
      }

      if (currentFilters.minBookings !== undefined && currentFilters.minBookings !== 0) {
        params.append("minBookings", currentFilters.minBookings.toString());
      }

      if (currentFilters.maxBookings !== undefined && currentFilters.maxBookings !== 999) {
        params.append("maxBookings", currentFilters.maxBookings.toString());
      }

      if (currentFilters.sortBy) {
        params.append("sort_by", currentFilters.sortBy);
      }

      if (currentFilters.sortOrder) {
        params.append("sort_order", currentFilters.sortOrder);
      }

      const response = await axiosInstance.get(
        `admin-customers?${params.toString()}`
      );

      if (response.data?.success) {
        // Handle potential variations in API response structure
        const data = response.data.data;
        const list = Array.isArray(data) ? data : data.customers || [];
        const total = response.data.pagination?.totalItems || data.totalCount || 0;

        setCustomers(list);
        setTotalItems(total);
      }
    } catch (error: unknown) {
      console.error(USER_MANAGEMENT_TEXT.errorFetchingCustomers, error);
      toast.error(USER_MANAGEMENT_TEXT.failedToFetchCustomers);
    } finally {
      setTableLoading(false);
    }
  },
    [filters]
  );

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleFilter = (updatedFilters?: IFilterState) => {
    const newFilters = { ...(updatedFilters || filters), page: 1 };
    if (JSON.stringify(newFilters) === JSON.stringify(filters)) return;
    setFilters(newFilters);
  };

  const handleReset = () => {
    if (JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS)) return;
    setFilters(DEFAULT_FILTERS);
  };

  const handleSort = (key: string, order: "ASC" | "DESC") => {
    setFilters((prev) => ({ ...prev, sortBy: key, sortOrder: order, page: 1 }));
  };

  const handleAction = async () => {
    if (!modal.customerId || !modal.type) return;

    try {
      if (modal.type === "delete") {
        await axiosInstance.delete(
          `admin-customers/delete-customer/${modal.customerId}`
        );
        toast.success("Customer deleted successfully");
      } else if (modal.type === "status_change") {
        await axiosInstance.patch(
          `admin-customers/block-customer/${modal.customerId}`,
          {
            isActive: modal.targetStatus === CUSTOMER_STATUS.ACTIVE,
          }
        );
        toast.success(`Customer status updated to ${modal.targetStatus}`);
      }
      setModal({ isOpen: false, type: null, customerId: null });
      fetchCustomers();
    } catch (error: unknown) {
      console.error(`Error during ${modal.type}:`, error);
      toast.error(
        `Failed to ${modal.type === "delete" ? USER_MANAGEMENT_TEXT.deleteBtn.toLowerCase() : "update status"}`
      );
    }
  };

  const handleRowClick = (row: ICustomer) => {
    navigate(
      APP_ROUTES.ADMIN_CUSTOMER_DETAILS.replace(
        ":customerId",
        row.id.toString()
      )
    );
  };

  const headers = [
    {
      header: USER_MANAGEMENT_TEXT.idHeader,
      key: "id",
      sortable: true,
      cellClassName: "hover:!no-underline",
      render: (row: ICustomer) => (
        <span className="font-semibold">{row.id}</span>
      ),
    },
    {
      header: USER_MANAGEMENT_TEXT.customerNameHeader,
      key: "name",
      sortable: true,
      cellClassName: "hover:!no-underline",
      render: (row: ICustomer) => `${row.name}`,
    },
    {
      header: USER_MANAGEMENT_TEXT.mobileNumberHeader,
      key: "mobileNumber",
      sortable: true,
      cellClassName: "hover:!no-underline",
      render: (row: ICustomer) => row.mobileNumber ?? "-",
    },
    {
      header: USER_MANAGEMENT_TEXT.emailHeader,
      key: "email",
      sortable: true,
      cellClassName: "hover:!no-underline",
    },
    {
      header: USER_MANAGEMENT_TEXT.pendingBookingsHeader,
      key: "pendingBookings",
      sortable: true,
      cellClassName: "hover:!no-underline",
      render: (row: ICustomer) => row.pendingBookings ?? 0,
    },
    {
      header: USER_MANAGEMENT_TEXT.totalBookingsHeader,
      key: "totalBookings",
      sortable: true,
      cellClassName: "hover:!no-underline",
      render: (row: ICustomer) => row.totalBookings ?? 0,
    },
    {
      header: USER_MANAGEMENT_TEXT.statusHeader,
      key: "isActive",
      sortable: true,
      headerClassName: "text-center [&>div]:justify-center",
      cellClassName: "text-center hover:!no-underline",
      render: (row: ICustomer) => (
        <div className="flex justify-center w-full">
          <StatusBadge status={row.isActive ? CUSTOMER_STATUS.ACTIVE : CUSTOMER_STATUS.BLOCKED} />
        </div>
      ),
    },
    {
      header: USER_MANAGEMENT_TEXT.actionHeader,
      key: "action",
      headerClassName: "text-center [&>div]:justify-center",
      cellClassName: "text-center",
      render: (row: ICustomer) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-center w-full">
          <ActionMenu
            onDelete={() =>
              setModal({
                isOpen: true,
                type: "delete",
                customerId: row.id,
                customerName: row.name,
              })
            }
            extraActions={[
              {
                label: row.isActive ? "Block" : "Unblock",
                icon: row.isActive ? <Ban className="w-5! h-5! text-ink-muted" /> : <Check className="w-5! h-5! text-ink-muted" />,
                onClick: () =>
                  setModal({
                    isOpen: true,
                    type: "status_change",
                    customerId: row.id,
                    customerName: row.name,
                    targetStatus: row.isActive ? CUSTOMER_STATUS.BLOCKED : CUSTOMER_STATUS.ACTIVE,
                  }),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <PageTitle title={USER_MANAGEMENT_TEXT.customersPageTitle}>
        <div className="flex gap-3">
          <FilterPanel
            onFilter={handleFilter}
            onReset={handleReset}
            filters={filters}
          />
          <Button
            size="sm"
            onClick={() => setModal({ ...modal, isOpen: true, type: "add" })}
          >
            <Plus className="w-5 h-5" />
            {USER_MANAGEMENT_TEXT.addBtn}
          </Button>
        </div>
      </PageTitle>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {tableLoading ? (
            <TableSkeleton />
          ) : (
            <CustomTable
              headers={headers}
              listData={customers}
              pagination={true}
              serverSide={true}
              totalItems={totalItems}
              currentPage={filters.page}
              rowsPerPage={filters.limit}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              onRowsPerPageChange={(limit) => setFilters((prev) => ({ ...prev, limit, page: 1 }))}
              onSort={handleSort}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onRowClick={handleRowClick}
              rowClassName={() => "cursor-pointer"}
            />
          )}
        </CardContent>
      </Card>

      <DeleteConfirmPopup
        open={modal.isOpen && modal.type === "delete"}
        item={{ name: modal.customerName }}
        onClose={() => setModal({ ...modal, isOpen: false, type: null })}
        onConfirm={handleAction}
      />

      <ConfirmPopup
        open={modal.isOpen && modal.type === "status_change"}
        title={
          modal.targetStatus === CUSTOMER_STATUS.BLOCKED
            ? USER_MANAGEMENT_TEXT.blockCustomerTitle
            : USER_MANAGEMENT_TEXT.unblockCustomerTitle
        }
        message={`${USER_MANAGEMENT_TEXT.areUSuretxt} ${
          modal.targetStatus === CUSTOMER_STATUS.BLOCKED 
            ? USER_MANAGEMENT_TEXT.blockMsg 
            : USER_MANAGEMENT_TEXT.unblockMsg
        } "${modal.customerName}"?`}
        onClose={() => setModal({ ...modal, isOpen: false, type: null })}
        onConfirm={handleAction}
        saveText={modal.targetStatus === CUSTOMER_STATUS.BLOCKED 
          ? USER_MANAGEMENT_TEXT.blockBtn 
          : USER_MANAGEMENT_TEXT.unblockBtn}
      />

      <AddCustomerModal
        open={modal.isOpen && modal.type === "add"}
        onClose={() => setModal({ ...modal, isOpen: false, type: null })}
        onSuccess={() => {
          fetchCustomers();
        }}
      />

    </div>
  );
};

const TableSkeleton = () => (
  <div className="space-y-3">
    {/* Header skeleton */}
    <div className="flex space-x-4 p-4 border-b justify-between">
      <Skeleton className="h-4 w-12" /> {/* ID */}
      <Skeleton className="h-4 w-32" /> {/* Name */}
      <Skeleton className="h-4 w-32" /> {/* Mobile */}
      <Skeleton className="h-4 w-40" /> {/* Email */}
      <Skeleton className="h-4 w-28" /> {/* Pending */}
      <Skeleton className="h-4 w-28" /> {/* Total */}
      <Skeleton className="h-4 w-24" /> {/* Status */}
      <Skeleton className="h-4 w-10" /> {/* Action */}
    </div>
    {/* Row skeletons */}
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className="flex space-x-4 p-4 border-b justify-between items-center"
      >
        <Skeleton className="h-4 w-8" /> {/* ID */}
        <Skeleton className="h-4 w-28" /> {/* Name */}
        <Skeleton className="h-4 w-28" /> {/* Mobile */}
        <Skeleton className="h-4 w-36" /> {/* Email */}
        <Skeleton className="h-4 w-20" /> {/* Pending */}
        <Skeleton className="h-4 w-20" /> {/* Total */}
        <div className="w-24">
          <Skeleton className="h-6 w-full rounded-md" /> {/* Status pill */}
        </div>
        <Skeleton className="h-8 w-8 rounded-full" /> {/* Action Button */}
      </div>
    ))}
  </div>
);

export default CustomersPage;
