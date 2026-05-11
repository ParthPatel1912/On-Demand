import { useEffect, useState } from "react";

import PageTitle from "@/components/common/PageTitle";
import { BookingManagementTable } from "@/components/booking-management/BookingManagementTable";
import BookingManagementFilter, {
  type BookingManagementFilterValues,
} from "@/components/booking-management/BookingManagementFilter";
import {
  BookingStatus,
  PaymentMethod,
  type BookingCustomerRow,
} from "@/types/bookingManagement.interface";
import {
  changeAdminBookingExpert,
  deleteAdminBooking,
  getAdminBookingFilters,
  getAdminBookings,
  updateAdminBookingStatus,
} from "@/api/adminBookingManagement";
import { BookingTableSkeleton } from "@/components/booking-management/BookingTableSkeleton";
import { BOOKING_MANAGEMENT_TEXT } from "@/constants/bookingManagement.text";

function createDefaultBookingManagementFilters(): BookingManagementFilterValues {
  return {
    serviceType: "",
    date: "",
    time: "",
    bookedServicesRange: [0, 99],
    amountRange: [0, 99999],
    paymentMethod: "",
    status: "",
  };
}

const BookingManagement = () => {
  const [rows, setRows] = useState<BookingCustomerRow[]>([]);
  const [filters, setFilters] = useState<BookingManagementFilterValues>(() =>
    createDefaultBookingManagementFilters()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [serviceTypeOptions, setServiceTypeOptions] = useState<string[]>([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<
    PaymentMethod[]
  >(Object.values(PaymentMethod) as PaymentMethod[]);
  const [statusOptions, setStatusOptions] = useState<BookingStatus[]>(
    Object.values(BookingStatus) as BookingStatus[]
  );

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await getAdminBookingFilters();
        if (res?.data) {
          setServiceTypeOptions(res.data.serviceTypes);
          setPaymentMethodOptions(res.data.paymentMethods);
          setStatusOptions(res.data.bookingStatuses);
        }
      } catch (error: unknown) {
        console.error(BOOKING_MANAGEMENT_TEXT.failedToLoadFilters, error);
      }
    };

    void loadFilters();
  }, []);

  const fetchRows = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminBookings({
        page,
        limit: rowsPerPage,
        serviceType: filters.serviceType || undefined,
        date: filters.date || undefined,
        time: filters.time || undefined,
        bookedMin: filters.bookedServicesRange[0] === 0 ? undefined : filters.bookedServicesRange[0],
        bookedMax: filters.bookedServicesRange[1] === 99 ? undefined : filters.bookedServicesRange[1],
        amountMin: filters.amountRange[0] === 0 ? undefined : filters.amountRange[0],
        amountMax: filters.amountRange[1] === 99999 ? undefined : filters.amountRange[1],
        paymentMethod: filters.paymentMethod || undefined,
        status: filters.status || undefined,
      });

      setRows(response.data);
      setTotalItems(response.pagination.totalItems);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, filters]);

  const onCompleteBooking = async (bookingId: string) => {
    await updateAdminBookingStatus({
      bookingId,
      status: BookingStatus.COMPLETED,
    });
    await fetchRows();
  };

  const onCancelBooking = async (bookingId: string, reason: string) => {
    await updateAdminBookingStatus({
      bookingId,
      status: BookingStatus.CANCELLED,
      cancellationReason: reason,
    });
    await fetchRows();
  };

  const onDeleteBooking = async (bookingId: string) => {
    await deleteAdminBooking(bookingId);
    await fetchRows();
  };

  const onChangeExpert = async (
    bookingId: string,
    servicePartnerId: number
  ) => {
    await changeAdminBookingExpert({ bookingId, servicePartnerId });
    await fetchRows();
  };

  return (
    <div className="font-alexandria">
      <PageTitle title={BOOKING_MANAGEMENT_TEXT.title}>
        <BookingManagementFilter
          filters={filters}
          onReset={() => {
            setFilters(createDefaultBookingManagementFilters());
            setPage(1);
          }}
          onFilter={(next) => {
            setFilters(next);
            setPage(1);
          }}
          serviceTypeOptions={serviceTypeOptions}
          paymentMethodOptions={paymentMethodOptions}
          statusOptions={statusOptions}
        />
      </PageTitle>

      {isLoading && rows.length === 0 ? (
        <BookingTableSkeleton />
      ) : (
        <BookingManagementTable
          rows={rows}
          totalItems={totalItems}
          currentPage={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(nextRowsPerPage) => {
            setRowsPerPage(nextRowsPerPage);
            setPage(1);
          }}
          onCompleteBooking={onCompleteBooking}
          onCancelBooking={onCancelBooking}
          onDeleteBooking={onDeleteBooking}
          onChangeExpert={onChangeExpert}
        />
      )}
    </div>
  );
};

export default BookingManagement;
