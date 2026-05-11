import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Card, CardContent } from "@/components/ui/card";
import PageTitle from "@/components/common/PageTitle";
import CustomTable from "@/components/common/CustomTable";
import { ActionMenu } from "@/components/common/ActionMenu";
import {
  FilterPanel,
  DEFAULT_FILTERS,
} from "@/components/user-management/partner/FilterPanel";
import { JobPopover } from "@/components/user-management/partner/JobPopover";
import { APP_ROUTES } from "@/routes/config";
import ConfirmPopup from "@/components/common/ConfirmPopup";
import DeleteConfirmPopup from "@/components/common/DeleteConfirmPopup";
import axiosInstance from "@/helper/axiosInstance";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  FilterState,
  IServicePartner,
  ModalType,
} from "@/types/user-management/partner.interface";
import { SERVICE_PARTNER_STATUS, SERVICE_PARTNER_VERIFICATION_STATUS } from "@/utils/constants";
import StatusBadge from "@/components/common/StatusBadge";
import images from "@/assets";

const ServicePartnerManagement = () => {
  const navigate = useNavigate();
  const [tableLoading, setTableLoading] = useState(false);
  const [servicePartners, setServicePartners] = useState<IServicePartner[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(DEFAULT_FILTERS);

  const [modal, setModal] = useState<{
    type: ModalType;
    data: IServicePartner | null;
  }>({
    type: null,
    data: null,
  });

  const fetchServicePartners = async (
    page = currentPage,
    limit = rowsPerPage,
    activeFilters = appliedFilters,
    activeSort = { key: sortBy, order: sortOrder }
  ) => {
    try {
      setTableLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("sortBy", activeSort.key);
      params.append("sortOrder", activeSort.order);
      params.append("minJobs", activeFilters.minJobs.toString());
      params.append("maxJobs", activeFilters.maxJobs.toString());

      if (
        activeFilters.serviceTypeId &&
        activeFilters.serviceTypeId !== "all"
      ) {
        params.append("serviceTypeId", activeFilters.serviceTypeId);
      }

      if (activeFilters.status && activeFilters.status !== "all") {
        params.append("status", activeFilters.status);
      }

      const response = await axiosInstance.get(
        `service-partners?${params.toString()}`
      );

      if (response.data?.success) {
        setServicePartners(response.data.data || []);
        setTotalItems(response.data.pagination.totalItems || 0);
      }
    } catch (err) {
      console.error("Failed to fetch service partners:", err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchServicePartners();
  }, [currentPage, rowsPerPage, appliedFilters, sortBy, sortOrder]);

  const openModal = (type: ModalType, row: IServicePartner) => {
    setModal({ type, data: row });
  };

  const closeModal = useCallback(() => {
    setModal({ type: null, data: null });
  }, []);

  const handleToggleStatus = async () => {
    if (!modal.data) return;
    try {
      const newStatus = !modal.data.user.isActive;
      await axiosInstance.patch(`service-partners/${modal.data.id}/status`);

      setServicePartners((prev) =>
        prev.map((p) =>
          p.id === modal.data?.id
            ? { ...p, user: { ...p.user, isActive: newStatus } }
            : p
        )
      );
      toast.success(
        `Service partner ${
          newStatus ? "activated" : "deactivated"
        } successfully!`
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      closeModal();
    }
  };

  const handleDelete = async () => {
    if (!modal.data) return;
    try {
      await axiosInstance.delete(`service-partners/${modal.data.id}`);
      fetchServicePartners();
      setTotalItems((prev) => prev - 1);
      toast.success("Service partner removed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete service partner");
    } finally {
      closeModal();
    }
  };

  const handleFilterSearch = (newFilters: FilterState) => {
    const isSame = JSON.stringify(newFilters) === JSON.stringify(appliedFilters);
    if (isSame) {
      return;
    }
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const isAppliedDefault = JSON.stringify(appliedFilters) === JSON.stringify(DEFAULT_FILTERS);

    if (isAppliedDefault) {
      setFilters(DEFAULT_FILTERS);
      return;
    }

    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  const handleSort = (key: string, order: "ASC" | "DESC") => {
    setSortBy(key);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setCurrentPage(1);
    setRowsPerPage(rowsPerPage);
  };

  return (
    <>
      <PageTitle title="Service Partners">
        <FilterPanel
          onFilter={handleFilterSearch}
          onReset={handleResetFilters}
          filters={filters}
          setFilters={setFilters}
        />
      </PageTitle>

      {/* Status Toggle Confirmation */}
      <ConfirmPopup
        open={modal.type === "status"}
        title={
          modal.data?.user.isActive ? "Deactivate Partner" : "Activate Partner"
        }
        message={`Are you sure you want to ${
          modal.data?.user.isActive ? "deactivate" : "activate"
        } "${modal.data?.user.name}"?`}
        onClose={closeModal}
        onConfirm={handleToggleStatus}
        saveText={modal.data?.user.isActive ? "Deactivate" : "Activate"}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmPopup
        open={modal.type === "delete"}
        item={modal.data}
        onClose={closeModal}
        onConfirm={handleDelete}
      />

      <Card className="border-neutral-200 shadow-sm rounded-lg overflow-hidden py-0 gap-0">
        <CardContent className="p-0 bg-white">
          {tableLoading ? (
            <TableSkeleton />
          ) : (
            <CustomTable
              serverSide
              pagination
              totalItems={totalItems}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onRowClick={(row) => {
                if (row.id) {
                  navigate(
                    `${APP_ROUTES.ADMIN_SERVICE_PARTNER_MANAGEMENT}/${row.id}`
                  );
                }
              }}
              headers={[
                {
                  key: "id",
                  header: "ID",
                  sortable: true,
                  render: (row: IServicePartner) => row.id || "-",
                },
                {
                  key: "name",
                  header: "Name",
                  sortable: true,
                  render: (row: IServicePartner) => row.user?.name || "-",
                },
                {
                  key: "mobileNumber",
                  header: "Mobile Number",
                  render: (row: IServicePartner) => row.user?.mobileNumber || "-",
                },
                {
                  key: "email",
                  header: "Email",
                  render: (row: IServicePartner) => row.user?.email || "-",
                },
                {
                  key: "address",
                  header: "Address",
                  render: (row: IServicePartner) =>
                    row.permanentAddress || row.residentialAddress || "-",
                },
                {
                  key: "job",
                  header: "Job",
                  render: (row: IServicePartner) =>
                    <JobPopover serviceTypes={row.serviceTypes} />,
                },
                {
                  key: "jobsCompleted",
                  header: "Jobs Completed",
                  sortable: true,
                  render: (row: IServicePartner) => row.jobsCompleted || "-",
                },
                {
                  key: "status",
                  header: "Status",
                  sortable: false,
                  className: "text-center",
                  render: (row: IServicePartner) => (
                    <StatusBadge
                      status={row.displayedStatus}
                      variant="inactive"
                    />
                  ),
                },
                {
                  key: "action",
                  header: "Action",
                  headerClassName: "text-center [&>div]:justify-center",
                  cellClassName: "text-center",
                  render: (row: IServicePartner) => (
                    <div className="flex justify-center">
                      <ActionMenu
                        extraActions={
                          row.verificationStatus ===
                          SERVICE_PARTNER_VERIFICATION_STATUS.VERIFIED
                            ? [
                                {
                                  label: row.user?.isActive
                                    ? SERVICE_PARTNER_STATUS.INACTIVE
                                    : SERVICE_PARTNER_STATUS.ACTIVE,
                                  icon: row.user?.isActive ? (
                                    <img
                                      src={images.userInactiveSVG}
                                      className="h-5 w-5"
                                    />
                                  ) : (
                                    <img
                                      src={images.userActiveSVG}
                                      className="h-5 w-5"
                                    />
                                  ),
                                  onClick: () => openModal("status", row),
                                },
                              ]
                            : []
                        }
                        onDelete={() => openModal("delete", row)}
                      />
                    </div>
                  ),
                },
              ]}
              listData={servicePartners}
              notFoundText="No service partners found."
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};

const TableSkeleton = () => (
  <div className="space-y-3">
    {/* Header skeleton */}
    <div className="flex space-x-4 p-4 border-b justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-24" />
    </div>
    {/* Row skeletons */}
    {[...Array(10)].map((_, i) => (
      <div key={i} className="flex space-x-4 p-4 border-b justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
);

export default ServicePartnerManagement;
