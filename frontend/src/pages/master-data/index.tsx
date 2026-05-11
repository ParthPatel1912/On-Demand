import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axiosInstance from "@/helper/axiosInstance";
import PageTitle from "@/components/common/PageTitle";
import CustomTable from "@/components/common/CustomTable";
import ServicePopup from "../../components/master-data/ServicePopup";
import ServiceTypeForm from "../../components/master-data/ServiceTypeForm";
import DeleteConfirmPopup from "@/components/common/DeleteConfirmPopup";
import { ConfiguredValues } from "../../components/master-data/ConfiguredValues";
import { DEFAULT_ICON } from "@/utils/constants";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Skeleton } from "@/components/ui/skeleton";
import type { IServiceType, ModalType } from "@/types/masterData.interface";
import { MASTER_DATA_TEXT } from "@/constants/masterData.text";
import type { IPagination } from "@/types/common.interface";

const MasterData = () => {
  const [tableLoading, setTableLoading] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<IServiceType[]>([]);
  const [modal, setModal] = useState<{
    type: ModalType;
    data: IServiceType | null;
  }>({
    type: null,
    data: null,
  });
  const [pagination, setPagination] = useState<IPagination>({
    totalItems: 0,
    limit: 10,
    currentPage: 1,
    totalPages: 0,
  });

  const fetchServices = async (
    page = pagination.currentPage,
    perPage = pagination.limit
  ) => {
    try {
      setTableLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", (perPage || pagination.limit).toString());
      const response = await axiosInstance.get(
        `service-types?${params.toString()}`
      );
      if (response.data) {
        setServiceTypes(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setPagination((prev) => ({ ...prev, totalItems: 0, currentPage: 1 }));
      }
    } catch (error: unknown) {
      console.error(MASTER_DATA_TEXT.failedToFetch, error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const closeModal = useCallback(() => {
    setModal({ type: null, data: null });
  }, []);

  const openModal = async (
    type: ModalType,
    data: IServiceType | null = null
  ) => {
    setModal({ type, data });
  };

  const handleServiceSubmit = async (
    values: { name: string; image: File | null; bannerImage: File | null },
    isEdit: boolean
  ) => {
    try {
      const formData = new FormData();
      if (values.name) formData.append("name", values.name?.trim());
      if (values.image) {
        formData.append("image", values.image);
      }
      if (values.bannerImage) {
        formData.append("bannerImage", values.bannerImage);
      }

      if (isEdit && modal.data) {
        const response = await axiosInstance.put(
          `service-types/${modal.data.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        setServiceTypes((prev) =>
          prev.map((item) =>
            item.id === modal.data?.id ? response.data.data : item
          )
        );
        toast.success(MASTER_DATA_TEXT.serviceTypeUpdated);
      } else {
        const response = await axiosInstance.post("service-types", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setServiceTypes((prev) => [...prev, response.data.data]);
        toast.success(MASTER_DATA_TEXT.serviceTypeAdded);
      }
    } catch (error: unknown) {
      console.error(error);
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!modal.data) return;

    try {
      const response = await axiosInstance.delete(
        `service-types/${modal.data.id}`
      );
      if (response.data.success) {
        fetchServices();
        toast.success(MASTER_DATA_TEXT.serviceTypeDeleted);
        closeModal();
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    fetchServices(page);
  };

  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setPagination((prev) => ({ ...prev, limit: rowsPerPage, currentPage: 1 }));
    fetchServices(1, rowsPerPage);
  };

  return (
    <>
      <PageTitle title={MASTER_DATA_TEXT.title} />

      {/* Add/Edit Service Popup */}
      <ServiceTypeForm
        open={modal.type === "add" || modal.type === "edit"}
        service={modal.type === "edit" ? modal.data : null}
        onClose={closeModal}
        onSuccess={handleServiceSubmit}
      />

      {/* Delete Confirmation Popup */}
      <DeleteConfirmPopup
        open={modal.type === "delete"}
        item={modal.data}
        onClose={closeModal}
        onConfirm={handleDeleteConfirm}
      />

      {/* Manage Services Popup */}
      <ServicePopup
        serviceType={modal.data}
        open={modal.type === "manage"}
        setOpen={(isOpen) => !isOpen && closeModal()}
      />

      {/* Master Data Table */}
      <Card className="border-neutral-200 shadow-sm rounded-lg overflow-hidden py-0 gap-0 mb-6">
        <Accordion type="single" collapsible defaultValue="service-types">
          <AccordionItem value="service-types">
            <AccordionTrigger className="border-b border-line bg-white px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-md font-semibold text-ink">
                  {MASTER_DATA_TEXT.serviceTypes}
                </CardTitle>
                <div className="flex items-center gap-2 mr-4">
                  <Button
                    className="px-4 py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal("add");
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    {MASTER_DATA_TEXT.addBtn}
                  </Button>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="p-0 bg-white">
                {tableLoading ? (
                  <TableSkeleton />
                ) : (
                  <CustomTable
                    serverSide
                    pagination
                    totalItems={pagination.totalItems}
                    currentPage={pagination.currentPage}
                    rowsPerPage={pagination.limit}
                    headers={[
                      {
                        key: "name",
                        header: MASTER_DATA_TEXT.headerName,
                        render: (row) => (
                          <div className="flex items-center gap-3">
                            {row.image ? (
                              <img
                                src={row.image}
                                alt={row.name}
                                className="h-[24px] w-[24px] object-cover"
                              />
                            ) : (
                              <span className="h-[24px] w-[24px] text-xl">
                                {DEFAULT_ICON}
                              </span>
                            )}
                            <span className="text-ink font-regular break-all">
                              {row.name}
                            </span>
                          </div>
                        ),
                      },
                      {
                        key: "action",
                        header: MASTER_DATA_TEXT.headerAction,
                        className: "text-center w-[100px]",
                        render: (row: IServiceType) => (
                          <ActionMenu
                            onManage={() => openModal("manage", row)}
                            onEdit={() => openModal("edit", row)}
                            onDelete={() => openModal("delete", row)}
                          />
                        ),
                      },
                    ]}
                    listData={serviceTypes}
                    notFoundText={MASTER_DATA_TEXT.noServiceTypes}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                  />
                )}
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      <ConfiguredValues />
    </>
  );
};

const TableSkeleton = () => (
  <div className="space-y-3">
    {/* Header skeleton */}
    <div className="flex space-x-4 p-4 border-b justify-between">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
    {/* Row skeletons */}
    <div className="flex space-x-4 p-4 border-b justify-between">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-8" />
    </div>
  </div>
);

export default MasterData;
