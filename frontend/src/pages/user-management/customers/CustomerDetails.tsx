import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomTable from "@/components/common/CustomTable";
import { useEffect, useState } from "react";
import axiosInstance from "@/helper/axiosInstance";
import toast from "react-hot-toast";
import {
  changeAdminBookingExpert,
  deleteAdminBooking,
  getAdminBookingFilters,
  updateAdminBookingStatus,
} from "@/api/adminBookingManagement";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BookingDetailActionsMenu from "@/components/booking-management/BookingDetailActionsMenu";
import type {
  IBooking,
  IBookingFilter,
  ICustomerDetail,
} from "@/types/user-management/customer.interface";
import { ExpertHoverCard } from "@/components/user-management/customer/ExpertHoverCard";
import { getInitialsName } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingHistoryFilter } from "@/components/user-management/customer/BookingHistoryFilter";
import {
  BookingStatus,
  PaymentMethod,
  type BookingDetail,
} from "@/types/bookingManagement.interface";
import { APP_ROUTES } from "@/routes/config";
import StatusBadge from "@/components/common/StatusBadge";

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-sm font-normal text-ink-muted">{label}</span>
    <span className="text-base font-semibold text-ink  truncate max-w-75">
      {value || "-"}
    </span>
  </div>
);

const DEFAULT_FILTERS: IBookingFilter = {
  currentPage: 1,
  limit: 10,
  sortBy: "bookingDate",
  sortOrder: "DESC",
  date: "",
  time: "",
  minAmount: 0,
  maxAmount: 99999,
  status: "",
  totalItems: 0,
};

const ProfileSkeleton = () => (
  <div className="p-8 space-y-8 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-32" />
        </div>
      ))}
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {/* Header skeleton */}
    <div className="flex space-x-4 p-4 border-b justify-between">
      <Skeleton className="h-4 w-16" /> {/* Booking ID */}
      <Skeleton className="h-4 w-32" /> {/* Service */}
      <Skeleton className="h-4 w-28" /> {/* Service Type */}
      <Skeleton className="h-4 w-36" /> {/* Assigned Expert */}
      <Skeleton className="h-4 w-40" /> {/* Address */}
      <Skeleton className="h-4 w-28" /> {/* Date & Time */}
      <Skeleton className="h-4 w-16" /> {/* Amount */}
      <Skeleton className="h-4 w-32" /> {/* Payment Method */}
      <Skeleton className="h-4 w-24" /> {/* Status */}
      <Skeleton className="h-4 w-10" /> {/* Action */}
    </div>
    {/* Row skeletons */}
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="flex space-x-4 p-4 border-b justify-between items-center"
      >
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-28" />
        <div className="w-24">
          <Skeleton className="h-7 w-full rounded-lg" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ))}
  </div>
);

const CustomerDetails = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [customer, setCustomer] = useState<ICustomerDetail | null>(null);
  const [filters, setFilters] = useState<IBookingFilter>(DEFAULT_FILTERS);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);

  const [serviceTypeOptions, setServiceTypeOptions] = useState<string[]>([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<
    PaymentMethod[]
  >(Object.values(PaymentMethod) as PaymentMethod[]);
  const [statusOptions, setStatusOptions] = useState<BookingStatus[]>(
    Object.values(BookingStatus) as BookingStatus[],
  );

  // Build backend query params from filter state
  const buildParams = (f: IBookingFilter): Record<string, string> => {
    const params: Record<string, string> = {
      page: String(f.currentPage),
      limit: String(f.limit),
      sortBy: f.sortBy || "bookingDate",
      sortOrder: f.sortOrder || "DESC",
    };
    if (f.serviceType && f.serviceType !== "all")
      params.serviceType = f.serviceType;
    if (f.date) params.date = f.date;
    if (f.time) params.time = f.time;
    if (f.minAmount !== undefined && f.minAmount > 0)
      params.minAmount = String(f.minAmount);
    if (f.maxAmount !== undefined && f.maxAmount < 99999)
      params.maxAmount = String(f.maxAmount);
    if (f.paymentMethod && f.paymentMethod !== "all")
      params.paymentMethod = f.paymentMethod;
    if (f.status && f.status !== "all") params.status = f.status;
    return params;
  };

  const handleSort = (key: string, order: "ASC" | "DESC") => {
    setFilters((prev) => ({
      ...prev,
      sortBy: key,
      sortOrder: order,
      currentPage: 1,
    }));
  };

  const onCompleteBooking = async (bookingId: string) => {
    await updateAdminBookingStatus({
      bookingId,
      status: BookingStatus.COMPLETED,
    });
    if (customerId) await getCustomerBookings(customerId, filters);
  };

  const onCancelBooking = async (bookingId: string, reason: string) => {
    await updateAdminBookingStatus({
      bookingId,
      status: BookingStatus.CANCELLED,
      cancellationReason: reason,
    });
    if (customerId) await getCustomerBookings(customerId, filters);
  };

  const onDeleteBooking = async (bookingId: string) => {
    await deleteAdminBooking(bookingId);
    if (customerId) await getCustomerBookings(customerId, filters);
  };

  const onChangeExpert = async (
    bookingId: string,
    servicePartnerId: number,
  ) => {
    await changeAdminBookingExpert({ bookingId, servicePartnerId });
    if (customerId) await getCustomerBookings(customerId, filters);
  };

  const headers = [
    {
      key: "bookingId",
      header: "Booking ID",
      sortable: true,
      render: (row: IBooking) => row.bookingId,
    },
    {
      key: "serviceName",
      header: "Service",
      sortable: true,
      render: (row: IBooking) => row.serviceName,
    },
    {
      key: "serviceType",
      header: "Service Type",
      sortable: true,
      render: (row: IBooking) => row.serviceType,
    },
    {
      key: "assignedExpert",
      header: "Assigned Expert",
      sortable: true,
      render: (row: IBooking) => (
        <ExpertHoverCard
          expert={{
            name: row?.assignedExpert?.name || "Unknown",
            role: row?.assignedExpert?.role || `${row?.serviceType} Expert`,
            avatarUrl: row?.assignedExpert?.profileImage,
            isVerified: row?.assignedExpert?.isVerified,
          }}
          onViewDetails={() =>
            navigate(
              `${APP_ROUTES.ADMIN_SERVICE_PARTNER_MANAGEMENT}/${row?.assignedExpert?.id}`,
            )
          }
          onPhoneClick={() => {
            const phone = (row.assignedExpert as { mobileNumber?: string; mobile_number?: string })?.mobileNumber ||
                          (row.assignedExpert as { mobileNumber?: string; mobile_number?: string })?.mobile_number;
            if (phone) {
              window.location.href = `tel:${phone}`;
            } else {
              toast.error("Phone number is not available for this expert.");
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[6px] border-none flex items-center justify-center text-lg overflow-hidden shrink-0">
              <Avatar className="h-8 w-8 rounded-[8px]">
                <AvatarImage
                  src={row?.assignedExpert?.profileImage}
                  alt={row?.assignedExpert?.name}
                />
                <AvatarFallback className="bg-primary-soft text-xs text-primary">
                  {getInitialsName(row?.assignedExpert?.name || "Unknown")}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="hover:text-primary transition-colors cursor-pointer font-medium">
              {row?.assignedExpert?.name || "Unknown"}
            </span>
          </div>
        </ExpertHoverCard>
      ),
    },
    {
      key: "serviceAddress",
      header: "Address",
      sortable: true,
      render: (row: IBooking) => row.serviceAddress,
    },
    {
      key: "dateTime",
      header: "Date & Time",
      sortable: true,
      render: (row: IBooking) => row.dateTime,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (row: IBooking) => `$${row.amount ? row.amount : "0"}`,
    },
    {
      key: "paymentMethod",
      header: "Payment Method",
      sortable: true,
      render: (row: IBooking) => row.paymentMethod,
    },
    {
      key: "bookingStatus",
      header: "Status",
      sortable: true,
      headerClassName: "text-center [&>div]:justify-center",
      cellClassName: "text-center hover:!no-underline",
      render: (row: IBooking) => (
        <div className="flex justify-center w-full">
          <StatusBadge status={row.bookingStatus} />
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      headerClassName: "text-center [&>div]:justify-center",
      cellClassName: "text-center",
      render: (row: IBooking) => {
        const detailProps: BookingDetail = {
          bookingId: String(row.bookingId),
          serviceId: String(row.serviceId),
          service: row.serviceName || "Service",
          serviceType: row.serviceType || "",
          dateTime: row.dateTime,
          assignedExpert: row.assignedExpert?.name || "",
          assignedExpertId: row.assignedExpert?.id,
          assignedExpertAvatar: row.assignedExpert?.profileImage || undefined,
          status: row.bookingStatus,
        };

        return (
          <div className="flex justify-center w-full">
            <BookingDetailActionsMenu
              detail={detailProps}
              serviceTypeOptions={serviceTypeOptions}
              onComplete={() => onCompleteBooking(row.bookingId)}
              onCancel={(reason) => onCancelBooking(row.bookingId, reason)}
              onDelete={() => onDeleteBooking(row.bookingId)}
              onChangeExpert={(servicePartnerId) =>
                onChangeExpert(row.bookingId, servicePartnerId)
              }
            />
          </div>
        );
      },
    },
  ];

  const getCustomerById = async (customerId: string) => {
    try {
      setIsCustomerLoading(true);
      const response = await axiosInstance.get(`admin-customers/${customerId}`);
      setCustomer(response.data.data);
    } catch (error) {
      console.error("Failed to get customer:", error);
      toast.error("Failed to get customer");
    } finally {
      setIsCustomerLoading(false);
    }
  };

  const getCustomerBookings = async (
    customerId: string,
    currentFilters: IBookingFilter,
  ) => {
    try {
      setIsBookingsLoading(true);
      const params = buildParams(currentFilters);
      const response = await axiosInstance.get(
        `admin-customers/${customerId}/booking-services`,
        { params },
      );
      setBookings(response.data.data.bookings);
      setFilters((prev) => ({ ...prev, ...response.data.data.pagination }));
    } catch (error) {
      console.error("Failed to get customer bookings:", error);
      toast.error("Failed to get customer bookings");
    } finally {
      setIsBookingsLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const res = await getAdminBookingFilters();
      if (res?.data) {
        setServiceTypeOptions(res.data.serviceTypes);
        setPaymentMethodOptions(res.data.paymentMethods);
        setStatusOptions(res.data.bookingStatuses);
      }
    } catch (error) {
      console.error("Failed to load filter options", error);
    }
  };

  // Fetch customer info once on mount
  useEffect(() => {
    if (customerId) getCustomerById(customerId);

    void loadFilters();
  }, []);

  // Re-fetch bookings whenever any filter/sort/page changes
  useEffect(() => {
    if (customerId) getCustomerBookings(customerId, filters);
  }, [
    filters.currentPage,
    filters.limit,
    filters.sortBy,
    filters.sortOrder,
    filters.serviceType,
    filters.date,
    filters.time,
    filters.minAmount,
    filters.maxAmount,
    filters.paymentMethod,
    filters.status,
  ]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-ink-slate" />
        </Button>
        <h1 className="text-[22px] font-bold text-ink-slate">
          {isCustomerLoading ? (
            <Skeleton className="h-7 w-48" />
          ) : (
            customer?.name
          )}
        </h1>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] border-none overflow-hidden">
        {isCustomerLoading ? (
          <ProfileSkeleton />
        ) : (
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
              <InfoItem label="ID" value={customer?.id} />
              <InfoItem label="Name" value={customer?.name} />
              <InfoItem label="Mobile Number" value={customer?.mobileNumber} />
              <InfoItem label="Email" value={customer?.email} />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-normal text-ink-muted">
                Status
              </span>
              <StatusBadge status={customer?.isActive ? "Active" : "Blocked"} />
            </div>

            <div>
              <div className="flex items-center justify-between px-2 pb-3">
                <h2 className="text-md font-semibold text-ink">
                  Service Bookings
                </h2>
                <BookingHistoryFilter
                  filters={filters}
                  serviceTypeOptions={serviceTypeOptions}
                  paymentMethodOptions={paymentMethodOptions}
                  statusOptions={statusOptions}
                  onFilter={(updated: IBookingFilter) => {
                    setFilters((prev) => ({
                      ...prev,
                      ...updated,
                      currentPage: 1,
                    }));
                  }}
                  onReset={() => setFilters({ ...DEFAULT_FILTERS })}
                />
              </div>

              <div>
                {isBookingsLoading ? (
                  <TableSkeleton />
                ) : (
                  <CustomTable
                    headers={headers}
                    listData={bookings}
                    pagination={true}
                    serverSide={true}
                    totalItems={filters.totalItems}
                    currentPage={filters.currentPage}
                    rowsPerPage={filters.limit}
                    className="cursor-pointer"
                    onPageChange={(page) =>
                      setFilters((prev) => ({ ...prev, currentPage: page }))
                    }
                    onRowsPerPageChange={(limit) =>
                      setFilters((prev) => ({ ...prev, limit, currentPage: 1 }))
                    }
                    onSort={handleSort}
                    sortBy={filters.sortBy}
                    sortOrder={filters.sortOrder}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
