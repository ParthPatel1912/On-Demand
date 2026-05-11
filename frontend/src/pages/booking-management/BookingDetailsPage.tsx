import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CustomTable from "@/components/common/CustomTable";

import { APP_ROUTES } from "@/routes/config";
import {
  getAdminBookingDetails,
  getAdminBookingDetailsPageData,
} from "@/api/adminBookingManagement";
import type { AdminBookingDetails } from "@/types/adminBookingDetails.interface";
import type { BookingStatus } from "@/types/bookingManagement.interface";
import type { LogItem } from "@/types/activity-logger.interface";
import {
  CurrencySymbol,
  DATE_TIME_FORMAT,
  DEFAULT_CURRENCY_SYMBOL,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
} from "@/utils/constants";
import { cn } from "@/lib/utils";
import { detailStatusClasses } from "@/components/booking-management/BookingManagementTable";
import { normalizeString } from "@/utils";
import { formatDate } from "date-fns";
import { LogTableSkeleton } from "@/components/activity-log/LogTableSkeleton";
import { ACTIVITY_LOG_TEXT } from "@/constants/activityLog.text";
import { BOOKING_DETAILS_TEXT } from "@/constants/bookingDetails.text";
import BookingDetailsSkeleton from "../../components/booking-management/BookingDetailsSkelton";

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="min-w-0">
    <p className="text-xs text-ink-muted font-medium mb-1">{label}</p>
    <p className="text-sm text-ink font-semibold wrap-break-word">{value}</p>
  </div>
);

function formatAmount(amount: unknown, currency?: string) {
  if (amount === null || amount === undefined || amount === "")
    return BOOKING_DETAILS_TEXT.sections.fallback.empty;
  const symbol = CurrencySymbol[currency ?? ""] || DEFAULT_CURRENCY_SYMBOL;
  const asNumber = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(asNumber)) return `${symbol}${String(amount)}`;
  return `${symbol}${asNumber.toFixed(2)}`;
}

export default function BookingDetailsPage() {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();

  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<AdminBookingDetails | null>(null);

  const [logsLoading, setLogsLoading] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(PAGINATION_DEFAULT_PAGE);
  const [logsLimit, setLogsLimit] = useState(PAGINATION_DEFAULT_LIMIT);

  const booking_details = useMemo<AdminBookingDetails | null>(() => {
    if (!bookingId) return null;

    const basic_details: AdminBookingDetails = {
      bookingId,
      status: details?.status,
      serviceId: details?.serviceId,
      serviceName: details?.serviceName,
      serviceType: details?.serviceType,
      scheduledAt: details?.scheduledAt,
      cancellationReason: details?.cancellationReason,
      customer: details?.customer
        ? {
            name: details.customer.name,
            phone: details.customer.phone,
            email: details.customer.email,
          }
        : undefined,
      payment: details?.payment
        ? { paymentMethod: details?.payment.paymentMethod }
        : undefined,
    };

    return {
      ...basic_details,
      ...(details ?? {}),
      payment: {
        ...(basic_details.payment ?? {}),
        ...(details?.payment ?? {}),
      },
      customer: {
        ...(basic_details.customer ?? {}),
        ...(details?.customer ?? {}),
      },
      servicePartner: { ...(details?.servicePartner ?? {}) },
      charges: { ...(details?.charges ?? {}) },
      customerPayment: { ...(details?.customerPayment ?? {}) },
    };
  }, [bookingId, details]);

  const loadDetails = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await getAdminBookingDetails(bookingId);
      setDetails(res?.data ?? null);
    } catch (e) {
      console.error("Failed to fetch booking details", e);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  const loadBookingLogs = useCallback(async () => {
    if (!bookingId) return;
    setLogsLoading(true);
    try {
      const res = await getAdminBookingDetailsPageData({
        bookingId,
        page: logsPage,
        limit: logsLimit,
        sortBy: "createdAt",
        sortOrder: "DESC",
      });

      const payload = res?.data ?? {};

      setLogs(Array.isArray(payload.logs) ? (payload.logs as LogItem[]) : []);
      setLogsTotal(payload.logsPagination?.totalItems ?? 0);
    } catch (e) {
      console.error("Failed to fetch booking page data", e);
      setLogs([]);
      setLogsTotal(0);
    } finally {
      setLogsLoading(false);
    }
  }, [bookingId, logsLimit, logsPage]);

  useEffect(() => {
    if (!bookingId) return;
    void loadDetails();
    void loadBookingLogs();
  }, [bookingId, logsPage, logsLimit, loadBookingLogs]);

  if (!bookingId) {
    return (
      <div className="p-6 font-alexandria">
        <p className="text-sm text-ink-muted">
          {BOOKING_DETAILS_TEXT.sections.fallback.missingBookingId}
        </p>
      </div>
    );
  }

  const status = booking_details?.status
    ? String(booking_details.status).toUpperCase()
    : "";
  const currency =
    booking_details?.charges?.currency ||
    booking_details?.customerPayment?.currency ||
    undefined;

  return (
    <div className="flex flex-col gap-6 font-alexandria bg-surface-dashboard min-h-screen">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(APP_ROUTES.ADMIN_BOOKING_MANAGEMENT)}
          className="p-2 hover:bg-grey-200 rounded-full transition-colors"
          aria-label={BOOKING_DETAILS_TEXT.header.backAriaLabel}
        >
          <ArrowLeft size={20} className="text-ink-muted" />
        </button>
        <div className="min-w-0 flex items-center gap-3">
          <h1 className="text-start font-alexandria text-xl font-semibold text-ink truncate max-w-full">
            {BOOKING_DETAILS_TEXT.header.title}
          </h1>
          <Badge
            className={cn(
              "rounded-lg px-3 py-1 border",
              detailStatusClasses[status.toUpperCase() as BookingStatus] ??
                "bg-grey-100 text-ink-muted border-transparent",
            )}
          >
            {normalizeString(status) ||
              BOOKING_DETAILS_TEXT.sections.fallback.empty}
          </Badge>
        </div>
      </div>

      {loading ? (
        <BookingDetailsSkeleton />
      ) : (
        <>
          <Card className="border-line-light shadow-sm rounded-xl overflow-hidden bg-white">
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12">
                <InfoItem
                  label={BOOKING_DETAILS_TEXT.sections.basicInfo.bookingId}
                  value={booking_details?.bookingId ?? bookingId}
                />
                <InfoItem
                  label={BOOKING_DETAILS_TEXT.sections.basicInfo.service}
                  value={
                    booking_details?.serviceName ??
                    BOOKING_DETAILS_TEXT.sections.fallback.empty
                  }
                />
                <InfoItem
                  label={BOOKING_DETAILS_TEXT.sections.basicInfo.serviceId}
                  value={
                    booking_details?.serviceId ??
                    BOOKING_DETAILS_TEXT.sections.fallback.empty
                  }
                />
                <InfoItem
                  label={BOOKING_DETAILS_TEXT.sections.basicInfo.serviceType}
                  value={
                    booking_details?.serviceType ??
                    BOOKING_DETAILS_TEXT.sections.fallback.empty
                  }
                />
                <InfoItem
                  label={BOOKING_DETAILS_TEXT.sections.basicInfo.scheduledAt}
                  value={
                    booking_details?.scheduledAt ??
                    BOOKING_DETAILS_TEXT.sections.fallback.empty
                  }
                />
                <InfoItem
                  label={BOOKING_DETAILS_TEXT.sections.basicInfo.customer}
                  value={
                    booking_details?.customer?.name ??
                    BOOKING_DETAILS_TEXT.sections.fallback.empty
                  }
                />
                <InfoItem
                  label={BOOKING_DETAILS_TEXT.sections.basicInfo.customerPhone}
                  value={
                    booking_details?.customer?.phone ??
                    BOOKING_DETAILS_TEXT.sections.fallback.empty
                  }
                />
                <InfoItem
                  label={BOOKING_DETAILS_TEXT.sections.basicInfo.customerEmail}
                  value={
                    booking_details?.customer?.email ??
                    BOOKING_DETAILS_TEXT.sections.fallback.empty
                  }
                />
              </div>

              {booking_details?.cancellationReason ? (
                <div className="mt-6 rounded-lg border border-line bg-surface-faint p-4">
                  <p className="text-xs text-ink-muted font-medium mb-1">
                    {BOOKING_DETAILS_TEXT.sections.basicInfo.cancellationReason}
                  </p>
                  <p className="text-sm text-ink font-semibold wrap-break-word">
                    {booking_details?.cancellationReason}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-line-light shadow-sm rounded-xl overflow-hidden bg-white">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-base font-semibold text-ink mb-4">
                  {BOOKING_DETAILS_TEXT.sections.payment.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem
                    label={BOOKING_DETAILS_TEXT.sections.payment.status}
                    value={
                      booking_details?.payment?.paymentStatus ??
                      BOOKING_DETAILS_TEXT.sections.fallback.empty
                    }
                  />
                  <InfoItem
                    label={BOOKING_DETAILS_TEXT.sections.payment.method}
                    value={
                      booking_details?.payment?.paymentMethod ??
                      BOOKING_DETAILS_TEXT.sections.fallback.empty
                    }
                  />
                  <InfoItem
                    label={BOOKING_DETAILS_TEXT.sections.payment.gateway}
                    value={
                      booking_details?.payment?.paymentGateway ??
                      BOOKING_DETAILS_TEXT.sections.fallback.empty
                    }
                  />
                  <InfoItem
                    label={BOOKING_DETAILS_TEXT.sections.payment.transactionId}
                    value={
                      booking_details?.payment?.transactionId ??
                      BOOKING_DETAILS_TEXT.sections.fallback.empty
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-line-light shadow-sm rounded-xl overflow-hidden bg-white">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-base font-semibold text-ink mb-4">
                  {BOOKING_DETAILS_TEXT.sections.partnerCharges.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem
                    label={
                      BOOKING_DETAILS_TEXT.sections.partnerCharges
                        .partnerCharges
                    }
                    value={formatAmount(
                      booking_details?.charges?.servicePartnerCharges,
                      currency,
                    )}
                  />
                  <InfoItem
                    label={
                      BOOKING_DETAILS_TEXT.sections.partnerCharges
                        .commissionAmount
                    }
                    value={formatAmount(
                      booking_details?.charges?.commissionAmount,
                      currency,
                    )}
                  />
                  <InfoItem
                    label={
                      BOOKING_DETAILS_TEXT.sections.partnerCharges
                        .commissionPercent
                    }
                    value={
                      booking_details?.charges?.commissionPercent !== undefined
                        ? `${booking_details?.charges?.commissionPercent}%`
                        : BOOKING_DETAILS_TEXT.sections.fallback.empty
                    }
                  />
                  <InfoItem
                    label={
                      BOOKING_DETAILS_TEXT.sections.partnerCharges.partnerPayout
                    }
                    value={formatAmount(
                      booking_details?.charges?.partnerPayout,
                      currency,
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-line-light shadow-sm rounded-xl overflow-hidden bg-white">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-semibold text-ink">
                  {BOOKING_DETAILS_TEXT.sections.customerPayment.title}
                </h2>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <InfoItem
                  label={BOOKING_DETAILS_TEXT.sections.customerPayment.subtotal}
                  value={formatAmount(
                    booking_details?.customerPayment?.subtotal,
                    currency,
                  )}
                />
                <InfoItem
                  label={BOOKING_DETAILS_TEXT.sections.customerPayment.tax}
                  value={formatAmount(
                    booking_details?.customerPayment?.tax,
                    currency,
                  )}
                />
                <InfoItem
                  label={BOOKING_DETAILS_TEXT.sections.customerPayment.discount}
                  value={formatAmount(
                    booking_details?.customerPayment?.discount,
                    currency,
                  )}
                />
                <InfoItem
                  label={BOOKING_DETAILS_TEXT.sections.customerPayment.total}
                  value={formatAmount(
                    booking_details?.customerPayment?.total,
                    currency,
                  )}
                />
                <InfoItem
                  label={BOOKING_DETAILS_TEXT.sections.customerPayment.paid}
                  value={formatAmount(
                    booking_details?.customerPayment?.paid,
                    currency,
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="border-line-light shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-base font-semibold text-ink">
              {BOOKING_DETAILS_TEXT.sections.logs.title}
            </h2>
            <span className="text-xs text-ink-muted">
              {logsTotal
                ? BOOKING_DETAILS_TEXT.sections.logs.logsCount(logsTotal)
                : BOOKING_DETAILS_TEXT.sections.logs.noLogs}
            </span>
          </div>

          <div className="rounded-xl overflow-hidden">
            {logsLoading ? (
              <LogTableSkeleton />
            ) : (
              <CustomTable
                headerWrapperClassName="bg-white border-b border-line-light"
                headers={[
                  {
                    key: "createdAt",
                    header: ACTIVITY_LOG_TEXT.dateHeader,
                    className:
                      "text-left text-ink-disabled text-sm min-w-[180px]",
                    render: (row: LogItem) => (
                      <span className="text-ink text-sm whitespace-nowrap">
                        {formatDate(
                          new Date(row.createdAt),
                          DATE_TIME_FORMAT,
                        ) || BOOKING_DETAILS_TEXT.sections.fallback.empty}
                      </span>
                    ),
                  },
                  {
                    key: "eventType",
                    header: ACTIVITY_LOG_TEXT.eventType,
                    className:
                      "text-ink-disabled text-left text-sm min-w-[160px]",
                    render: (row: LogItem) => normalizeString(row.eventType),
                  },
                  {
                    key: "status",
                    header: ACTIVITY_LOG_TEXT.status,
                    className:
                      "text-ink-disabled text-left text-sm min-w-[120px]",
                    render: (row: LogItem) => (
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium inline-block",
                          row.status === "SUCCESS"
                            ? "bg-green-100 text-green-800"
                            : row.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800",
                        )}
                      >
                        {normalizeString(row.status)}
                      </span>
                    ),
                  },
                  {
                    key: "message",
                    header: ACTIVITY_LOG_TEXT.description,
                    className: "text-ink-disabled text-left text-sm",
                    render: (row: LogItem) => (
                      <span
                        className="text-ink text-sm line-clamp-2"
                        title={row.message}
                      >
                        {row.message}
                      </span>
                    ),
                  },
                ]}
                listData={logs}
                pagination
                serverSide
                totalItems={logsTotal}
                currentPage={logsPage}
                rowsPerPage={logsLimit}
                onPageChange={(p) => setLogsPage(p)}
                onRowsPerPageChange={(l) => {
                  setLogsLimit(l);
                  setLogsPage(PAGINATION_DEFAULT_PAGE);
                }}
                getRowId={(row) => row.id}
                rowClassName={() =>
                  "border-b border-line hover:bg-surface-elevated"
                }
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
