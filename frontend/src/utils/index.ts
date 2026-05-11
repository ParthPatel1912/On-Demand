import { format } from "date-fns";
import {
  CUSTOMER_STATUS,
  SERVICE_PARTNER_SERVICE_STATUS,
  SERVICE_PARTNER_STATUS,
  SERVICE_PARTNER_VERIFICATION_STATUS,
  BOOKING_STATUS,
  BOOKING_STATUS_LABEL,
  type BookingStatus,
} from "./constants";
import { ROLES } from "@/enums/roles.enum";

export const displayRole = (role: string = "") => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return "Super Admin";
    case ROLES.ADMIN:
      return "Admin";
    case ROLES.SERVICE_PARTNER:
      return "Service Partner";
    case ROLES.CUSTOMER:
      return "Customer";
    default:
      return "";
  }
};

export const convertStringDateToGBFormat = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export const generateDefaultDates = () => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

export const generateDefaultTimes = (duration: number) => {
  const times: string[] = [];
  const startTime = 9 * 60;
  const endTime = 19 * 60;
  const buffer = Math.min(duration / 2, 60);
  const interval = duration + buffer;

  for (let time = startTime; time <= endTime; time += interval) {
    const hour = Math.floor(time / 60);
    const minute = Math.floor(time % 60);

    const period = hour >= 12 ? "PM" : "AM";
    let displayHour: number;
    if (hour > 12) {
      displayHour = hour - 12;
    } else if (hour === 0) {
      displayHour = 12;
    } else {
      displayHour = hour;
    }

    const timeStr = `${displayHour}:${minute
      .toString()
      .padStart(2, "0")} ${period}`;

    times.push(timeStr);
  }

  return times;
};

export const formatUTC = (dateString: string, formatStr: string) => {
  const date = new Date(dateString);
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return format(utcDate, formatStr);
};

export const getStatusClass = (
  status: string,
  variant?: "danger" | "inactive"
) => {
  if (
    variant === "inactive" &&
    (status === "inactive" || status === "Inactive")
  ) {
    return {
      badge: "bg-status-inactive-soft text-status-inactive",
      icon: "bg-status-inactive",
    };
  }

  switch (status) {
    case SERVICE_PARTNER_STATUS.ACTIVE:
    case SERVICE_PARTNER_SERVICE_STATUS.COMPLETED:
    case SERVICE_PARTNER_SERVICE_STATUS.CONFIRMED:
    case CUSTOMER_STATUS.ACTIVE:
      return {
        badge: "bg-status-success-soft text-status-success",
        icon: "bg-status-success",
      };
    case SERVICE_PARTNER_STATUS.INACTIVE:
    case SERVICE_PARTNER_SERVICE_STATUS.CANCELLED:
    case SERVICE_PARTNER_VERIFICATION_STATUS.REJECTED:
    case CUSTOMER_STATUS.BLOCKED:
      return {
        badge: "bg-status-danger-soft text-status-danger",
        icon: "bg-status-danger",
      };
    case SERVICE_PARTNER_STATUS.PENDING:
    case SERVICE_PARTNER_SERVICE_STATUS.PENDING:
      return {
        badge: "bg-status-warning-soft text-status-warning",
        icon: "bg-status-warning",
      };
    default:
      return { badge: "", icon: "" };
  }
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getInitials = (name?: string) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const formatBookings = (count: number): string => {
  if (count >= 1_000_000) {
    const m = (count / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return `${m}M+`;
  }
  if (count >= 1_000) {
    const k = Math.floor(count / 1_000);
    return `${k}k+`;
  }
  return `${count}`;
};

export const getInitialsName = (name?: string) => {
  if (!name) return " ";

  return name
    .trim()
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export const normalizeString = (str: unknown) => {
  if (typeof str !== "string") return "";
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const formatMinHrDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return "0 mins";

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs && mins) return `${hrs} hr ${mins} mins`;
  if (hrs) return `${hrs} hr`;
  return `${mins} mins`;
};

export const Booking_primary_color = "#4540E1";
export const getBookingStatusStyle = (status: BookingStatus) => {
  switch (status) {
    case BOOKING_STATUS.PENDING:
      return {
        className: "bg-booking-pending text-white",
        label: BOOKING_STATUS_LABEL[BOOKING_STATUS.PENDING],
      };
    case BOOKING_STATUS.CONFIRMED:
      return {
        className: "bg-booking-confirmed text-white",
        label: BOOKING_STATUS_LABEL[BOOKING_STATUS.CONFIRMED],
      };
    case BOOKING_STATUS.COMPLETED:
      return {
        className: "bg-booking-completed text-white",
        label: BOOKING_STATUS_LABEL[BOOKING_STATUS.COMPLETED],
      };
    case BOOKING_STATUS.CANCELLED:
      return {
        className: "bg-booking-cancelled text-white",
        label: BOOKING_STATUS_LABEL[BOOKING_STATUS.CANCELLED],
      };
    default:
      return { className: "bg-booking-unknown text-white", label: "Unknown" };
  }
};

const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED",
  CAD: "CA$",
  AUD: "A$",
  SGD: "S$",
};

export const getCurrencySymbol = (currency?: string): string => {
  if (!currency) return "$";
  return CURRENCY_SYMBOL_MAP[currency.toUpperCase()] ?? currency;
};
