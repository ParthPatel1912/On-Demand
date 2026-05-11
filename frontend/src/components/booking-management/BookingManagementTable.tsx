import { useMemo, useRef, useState } from "react";
import {
  ChevronUpCircle,
  ChevronDownCircle,
  Phone,
  CheckCircle2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CustomTable from "@/components/common/CustomTable";
import {
  BookingStatus,
  getBookingStatusLabel,
  getPaymentMethodLabel,
  type BookingCustomerRow,
  type BookingDetail,
} from "@/types/bookingManagement.interface";
import BookingDetailActionsMenu from "@/components/booking-management/BookingDetailActionsMenu";
import { getInitialsName } from "@/utils";
import { Badge } from "../ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "@/routes/config";
import { BOOKING_MANAGEMENT_TEXT } from "@/constants/bookingManagement.text";

export const detailStatusClasses: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]:
    "bg-status-warning-soft hover:bg-status-warning-soft text-status-warning",
  [BookingStatus.CONFIRMED]: "bg-primary/10 hover:bg-primary/10 text-primary",
  [BookingStatus.COMPLETED]:
    "bg-status-success-soft hover:bg-status-success-soft text-status-success",
  [BookingStatus.CANCELLED]:
    "bg-status-danger-soft hover:bg-status-danger-soft text-status-danger",
};

const detailStatusDotClasses: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "bg-status-warning hover:bg-status-warning",
  [BookingStatus.CONFIRMED]: "bg-primary hover:bg-primary",
  [BookingStatus.COMPLETED]: "bg-status-success hover:bg-status-success",
  [BookingStatus.CANCELLED]: "bg-status-danger hover:bg-status-danger",
};

const getExpertRoleLabel = (serviceType: string) => {
  const normalized = serviceType.trim().toLowerCase();
  if (normalized === "cleaning") return BOOKING_MANAGEMENT_TEXT.houseCleanerLabel;
  if (normalized === "repair") return BOOKING_MANAGEMENT_TEXT.repairExpertLabel;
  return `${serviceType}${BOOKING_MANAGEMENT_TEXT.expertSuffix}`;
};

const ExpertHoverCard = ({
  expertId,
  expertName,
  expertAvatar,
  serviceType,
  expertMobileNumber,
}: {
  expertId?: number;
  expertName: string;
  expertAvatar?: string;
  serviceType: string;
  expertMobileNumber?: string;
}) => {
  const [open, setOpen] = useState(false);
  const isHoveringTrigger = useRef(false);
  const isHoveringContent = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const clearTimeoutRef = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleOpen = () => {
    clearTimeoutRef();
    setOpen(true);
  };

  const handleClose = () => {
    clearTimeoutRef();
    timeoutRef.current = window.setTimeout(() => {
      if (!isHoveringTrigger.current && !isHoveringContent.current) {
        setOpen(false);
      }
    }, 100);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 text-left"
          onClick={(e) => e.stopPropagation()}
          onPointerEnter={() => {
            isHoveringTrigger.current = true;
            handleOpen();
          }}
          onPointerLeave={() => {
            isHoveringTrigger.current = false;
            handleClose();
          }}
        >
          <Avatar className="h-8 w-8 rounded-[8px]!">
            <AvatarImage src={expertAvatar} alt={expertName} />
            <AvatarFallback className="bg-primary-soft text-xs text-primary">
              {getInitialsName(expertName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-normal leading-5 text-ink">
            {expertName}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="top"
        sideOffset={10}
        className="w-55 rounded-[18px] border border-line bg-white p-3 shadow-[0px_10px_30px_rgba(0,0,0,0.15)]"
        onPointerEnter={() => {
          isHoveringContent.current = true;
          handleOpen();
        }}
        onPointerLeave={() => {
          isHoveringContent.current = false;
          handleClose();
        }}
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8 rounded-[8px]">
            <AvatarImage src={expertAvatar} alt={expertName} />
            <AvatarFallback className="bg-primary-soft text-xs text-primary">
              {getInitialsName(expertName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {expertName}
            </p>
            <div className="flex items-center gap-2 text-xs font-normal text-ink-muted">
              <span className="truncate">
                {getExpertRoleLabel(serviceType)}
              </span>
              <CheckCircle2 className="h-3 w-3 text-primary" />
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <Link
            to={
              expertId
                ? APP_ROUTES.ADMIN_SERVICE_PARTNER_DETAILS.replace(
                    ":partnerId",
                    expertId ? String(expertId) : "",
                  )
                : ""
            }
          >
            <Button
              type="button"
              disabled={!expertId}
              className="h-10 flex-1 rounded-[8px] text-sm focus-visible:ring-0"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {BOOKING_MANAGEMENT_TEXT.viewDetailsBtn}
            </Button>
          </Link>
          <Button
            type="button"
            disabled={!expertMobileNumber || !expertId}
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-[8px] bg-primary-soft text-primary hover:bg-primary-soft/80"
            aria-label={
              expertMobileNumber
                ? BOOKING_MANAGEMENT_TEXT.callExpertAria
                : BOOKING_MANAGEMENT_TEXT.noPhoneAria
            }
            onClick={(e) => {
              e.stopPropagation();
              if (expertMobileNumber) {
                const cleanNumber = expertMobileNumber?.replace(/\s+/g, "");
                window.location.href = `tel:${cleanNumber}`;
              }
            }}
          >
            <Phone className="h-6 w-6" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface IProps {
  rows: BookingCustomerRow[];
  totalItems: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onCompleteBooking: (bookingId: string) => Promise<void> | void;
  onCancelBooking: (bookingId: string, reason: string) => Promise<void> | void;
  onDeleteBooking: (bookingId: string) => Promise<void> | void;
  onChangeExpert: (
    bookingId: string,
    servicePartnerId: number,
  ) => Promise<void> | void;
}

export const BookingManagementTable = ({
  rows,
  totalItems,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onCompleteBooking,
  onCancelBooking,
  onDeleteBooking,
  onChangeExpert,
}: IProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    rows[0]?.id ?? null,
  );

  const serviceTypeOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) =>
      row.details.forEach((detail) => set.add(detail.serviceType)),
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-white">
      <CustomTable
        tableClassName="min-w-[1100px] font-alexandria"
        pagination
        serverSide
        totalItems={totalItems}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onRowClick={(row: BookingCustomerRow) => {
          setExpandedId((prev) => (prev === row.id ? null : row.id));
        }}
        headers={[
          {
            key: "expander",
            header: "",
            headerClassName: "w-16",
            cellClassName: "w-16 hover:!no-underline",
            render: (row) => {
              const isExpanded = expandedId === row.id;
              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(isExpanded ? null : row.id);
                  }}
                  className="grid cursor-pointer h-8 w-8 place-items-center rounded-full text-ink hover:bg-surface-card"
                  aria-label={isExpanded ? "Collapse row" : "Expand row"}
                >
                  {isExpanded ? (
                    <ChevronUpCircle className="h-4 w-4" />
                  ) : (
                    <ChevronDownCircle className="h-4 w-4" />
                  )}
                </button>
              );
            },
          },
          {
            key: "customerName",
            header: BOOKING_MANAGEMENT_TEXT.tableHeaderUser,
            headerClassName:
              "text-sm font-semibold leading-4 text-ink-disabled",
            cellClassName:
              "text-sm font-normal text-ink hover:!no-underline",
            render: (row) => row.customerName,
          },
          {
            key: "phone",
            header: BOOKING_MANAGEMENT_TEXT.tableHeaderMobileNumber,
            headerClassName:
              "text-sm font-semibold leading-4 text-ink-disabled",
            cellClassName:
              "text-sm font-normal text-ink hover:!no-underline",
            render: (row) => row.phone || "-",
          },
          {
            key: "email",
            header: BOOKING_MANAGEMENT_TEXT.tableHeaderEmail,
            headerClassName:
              "text-sm font-semibold leading-4 text-ink-disabled",
            cellClassName:
              "text-sm font-normal text-ink hover:!no-underline",
            render: (row) => row.email,
          },
          {
            key: "totalBookings",
            header: BOOKING_MANAGEMENT_TEXT.tableHeaderBookedServices,
            headerClassName:
              "text-sm font-semibold leading-4 text-ink-disabled text-center",
            cellClassName:
              "text-sm font-normal text-ink text-center hover:!no-underline",
            render: (row) => row.details.length,
          },
          {
            key: "address",
            header: BOOKING_MANAGEMENT_TEXT.tableHeaderAddress,
            headerClassName:
              "text-sm font-semibold leading-4 text-ink-disabled",
            cellClassName:
              "text-sm font-normal text-ink hover:!no-underline",
            render: (row) => row.address,
          },
          {
            key: "totalAmount",
            header: BOOKING_MANAGEMENT_TEXT.tableHeaderAmount,
            headerClassName:
              "text-sm font-semibold leading-4 text-ink-disabled",
            cellClassName:
              "text-sm font-normal text-ink hover:!no-underline",
            render: (row) => row.totalAmount,
          },
          {
            key: "paymentMethod",
            header: BOOKING_MANAGEMENT_TEXT.tableHeaderPaymentMethod,
            headerClassName:
              "text-sm font-semibold leading-4 text-ink-disabled",
            cellClassName:
              "text-sm font-normal text-ink hover:!no-underline",
            render: (row) => getPaymentMethodLabel(row.paymentMethod),
          },
          // {
          //   key: "action",
          //   header: "Action",
          //   headerClassName:
          //     "text-sm font-semibold leading-4 text-ink-disabled text-right w-20",
          //   cellClassName: "text-right w-20 hover:!no-underline",
          //   render: () => (
          //     <button
          //       type="button"
          //       onClick={(e) => e.stopPropagation()}
          //       className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-surface-card"
          //       aria-label="Delete customer row"
          //     >
          //       <Trash2 className="h-4 w-4" />
          //     </button>
          //   ),
          // },
        ]}
        listData={rows}
        rowClassName={() => "border-b border-line hover:bg-surface-elevated"}
        renderExpandedRow={(row: BookingCustomerRow) => (
          <div className="max-w-[90%] mx-auto">
            <BookingDetailsTable
              details={row.details}
              serviceTypeOptions={serviceTypeOptions}
              onCompleteBooking={onCompleteBooking}
              onCancelBooking={onCancelBooking}
              onDeleteBooking={onDeleteBooking}
              onChangeExpert={onChangeExpert}
            />
          </div>
        )}
        isRowExpanded={(row) => expandedId === row.id}
        expandedRowClassName="bg-surface-faint hover:bg-surface-faint"
        expandedRowCellClassName="px-0 border-b-0"
      />
    </div>
  );
};

const BookingDetailsTable = ({
  details,
  serviceTypeOptions,
  onCompleteBooking,
  onCancelBooking,
  onDeleteBooking,
  onChangeExpert,
}: {
  details: BookingDetail[];
  serviceTypeOptions: string[];
  onCompleteBooking: (bookingId: string) => Promise<void> | void;
  onCancelBooking: (bookingId: string, reason: string) => Promise<void> | void;
  onDeleteBooking: (bookingId: string) => Promise<void> | void;
  onChangeExpert: (
    bookingId: string,
    servicePartnerId: number,
  ) => Promise<void> | void;
}) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[98%] mx-auto">
      <CustomTable
        tableClassName="max-w-full"
        notFoundText={BOOKING_MANAGEMENT_TEXT.detailsTableNoBookings}
        onRowClick={(d: BookingDetail) => {
          navigate(
            APP_ROUTES.ADMIN_BOOKING_DETAILS.replace(
              ":bookingId",
              String(d.bookingId),
            ),
          );
        }}
        headers={[
          {
            key: "serviceId",
            header: BOOKING_MANAGEMENT_TEXT.detailsHeaderServiceID,
            headerClassName: "text-sm font-semibold text-ink-disabled",
            cellClassName: "text-sm font-normal text-ink hover:!no-underline",
            render: (d: BookingDetail) => d.serviceId,
          },
          {
            key: "service",
            header: BOOKING_MANAGEMENT_TEXT.detailsHeaderService,
            headerClassName: "text-sm font-semibold text-ink-disabled",
            cellClassName: "text-sm font-normal text-ink hover:!no-underline",
            render: (d: BookingDetail) => d.service,
          },
          {
            key: "serviceType",
            header: BOOKING_MANAGEMENT_TEXT.detailsHeaderServiceType,
            headerClassName: "text-sm font-semibold text-ink-disabled",
            cellClassName: "text-sm font-normal text-ink hover:!no-underline",
            render: (d: BookingDetail) => d.serviceType,
          },
          {
            key: "dateTime",
            header: BOOKING_MANAGEMENT_TEXT.detailsHeaderDateTime,
            headerClassName: "text-sm font-semibold text-ink-disabled",
            cellClassName: "text-sm font-normal text-ink hover:!no-underline",
            render: (d: BookingDetail) => d.dateTime,
          },
          {
            key: "assignedExpert",
            header: BOOKING_MANAGEMENT_TEXT.detailsHeaderAssignedExpert,
            headerClassName: "text-sm font-semibold text-ink-disabled",
            cellClassName: "text-sm font-normal text-ink hover:!no-underline",
            render: (d: BookingDetail) => (
              <ExpertHoverCard
                expertId={d.assignedExpertId}
                expertName={d.assignedExpert}
                expertAvatar={d.assignedExpertAvatar}
                serviceType={d.serviceType}
                expertMobileNumber={d.assignedExpertMobileNumber}
              />
            ),
          },
          {
            key: "status",
            header: BOOKING_MANAGEMENT_TEXT.detailsHeaderStatus,
            headerClassName:
              "text-sm font-semibold text-center text-ink-disabled",
            cellClassName:
              "text-sm border-0! font-normal justify-center items-center flex text-ink hover:!no-underline",
            render: (d: BookingDetail) => (
              <Badge
                className={`border-none px-3 py-1 text-sm font-medium rounded-lg flex items-center gap-2 w-fit ${
                  detailStatusClasses[d.status.toUpperCase() as BookingStatus]
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    detailStatusDotClasses[
                      d.status.toUpperCase() as BookingStatus
                    ]
                  }`}
                />
                {getBookingStatusLabel(d.status)}
              </Badge>
            ),
          },
          {
            key: "action",
            header: "",
            headerClassName: "w-14 text-right",
            cellClassName: "text-right w-14 hover:!no-underline",
            render: (d: BookingDetail) => (
              <div onClick={(e) => e.stopPropagation()}>
                <BookingDetailActionsMenu
                  detail={d}
                  serviceTypeOptions={serviceTypeOptions}
                  onComplete={() => onCompleteBooking(d.bookingId)}
                  onCancel={(reason) => onCancelBooking(d.bookingId, reason)}
                  onDelete={() => onDeleteBooking(d.bookingId)}
                  onChangeExpert={(servicePartnerId) =>
                    onChangeExpert(d.bookingId, servicePartnerId)
                  }
                />
              </div>
            ),
          },
        ]}
        listData={details}
        getRowId={(d: BookingDetail) => d.bookingId}
        rowClassName={() => "border-b border-line hover:bg-surface-elevated"}
      />
    </div>
  );
};
