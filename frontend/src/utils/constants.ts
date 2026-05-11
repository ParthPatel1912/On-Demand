import type { LogCategory, LogStatus } from "@/types/activity-logger.interface";
import type {
  IPaymentGatewayValue,
  IPaymentMethodValue,
} from "@/types/service-checkout/serviceBooking.interface";
import type { AssignedServiceFilterState } from "@/types/user-management/partner.interface";

// Static Categories & Subcategories
export const CATEGORIES = [
  "Full Home Cleaning",
  "Bathroom & Kitchen Cleaning",
  "Sofa & Carpet Cleaning",
  "Window & Glass Cleaning",
  "Floor Cleaning & Polishing",
  "Mattress Cleaning",
];

export const SUBCATEGORIES = [
  "Furnished Apartment",
  "Unfurnished Apartment",
  "Occupied Independent Apartment",
];

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_ICON_WIDTH = 64; // 64px
export const ALLOWED_IMAGE_FORMATS = ["image/jpeg", "image/png", "image/svg+xml"];

// Global Default ServiceType Icon
export const DEFAULT_ICON = "🆕";

// Constants for Service Partner Signup Form - START
export const GENDER_OPTIONS = {
  MALE: "Male",
  FEMALE: "Female",
} as const;

export const LANGUAGE_OPTIONS = {
  ENGLISH: "English",
  HINDI: "Hindi",
  GUJARATI: "Gujarati",
  SPANISH: "Spanish",
} as const;

export const PROFICIENCY_OPTIONS = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  EXPERT: "Expert",
} as const;

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

// Constants for Service Partner Signup Form - END

export const PROFILE_UPDATE_TYPE = {
  CONTACT: "contact",
  PASSWORD: "password",
  IMAGE: "image",
} as const;

// Constants for Service Partner Management - START

export const DEFAULT_ASSIGNED_FILTERS: AssignedServiceFilterState = {
  date: undefined,
  time: "",
  status: "",
};

export const SERVICE_PARTNER_STATUS = {
  PENDING: "Pending",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
} as const;

export const SERVICE_PARTNER_SERVICE_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const SERVICE_PARTNER_VERIFICATION_STATUS = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
} as const;

export const SERVICE_PARTNERS_ADMIN_ACTION = {
  APPROVE: "approve",
  REJECT: "reject",
} as const;

// Constants for Service Partner Management - END

// Constants for User Management - START
export const CUSTOMER_STATUS = {
  ACTIVE: "Active",
  BLOCKED: "Blocked",
} as const;

export const ADMIN_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
} as const;
// Constants for User Management - END

// Constants for Roles - START

export const USER_MANAGEMENT_STATUS_OPTIONS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ALL: "all",
} as const;

// Constants for Roles - END

// contants for auth - START

export const CUSTOMER_AUTH_TOKEN_KEY = "customerToken";
export const CUSTOMER_AUTH_USER_KEY = "userInfo";
export const ADMIN_AUTH_TOKEN_KEY = "adminToken";
export const ADMIN_AUTH_USER_KEY = "admininfo";
export const PARTNER_AUTH_TOKEN_KEY = "partnerToken";
export const PARTNER_AUTH_USER_KEY = "partnerinfo";
export const ACCESS_AUTH_TOKEN_KEY = "accessToken";

// Constants for auth -END

// Constants for address model - START

/**
 * Constants for the Nominatim (OpenStreetMap) geocoding API
 * used in the checkout address selection flow.
 */

export const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

export const NOMINATIM_HEADERS: HeadersInit = {
  "User-Agent": "OnDemand-Checkout-Address-App",
  "Accept-Language": "en",
};

/** Max results to show in the autocomplete dropdown */
export const NOMINATIM_SEARCH_LIMIT = 5;

/** Debounce delay (ms) for reverse-geocoding after map pan/drag */
export const MAP_REVERSE_GEOCODE_DEBOUNCE_MS = 500;

/** Debounce delay (ms) for the forward-geocoding search input */
export const SEARCH_DEBOUNCE_MS = 400;

/** Minimum coordinate difference to trigger a map re-center (prevents infinite loop) */
export const MAP_CENTER_THRESHOLD = 0.0001;

/** Default map coordinates (New York City) when no address is pre-selected */
export const DEFAULT_MAP_COORDS = {
  latitude: 40.7127,
  longitude: -74.0061,
} as const;

/** Label options for saved addresses */
export const ADDRESS_LABELS = ["Home", "Office", "Other"] as const;

// Constants for address model - END

// login const start
export const OTP_LENGTH = 4;
export const OTP_EMAIL_KEY = "customerOtpEmail";
// login const end

export const logCategories: LogCategory[] = [
  "PAYMENT",
  "SERVICE_PROVIDER",
  "BOOKING",
  "SERVICE",
  "CUSTOMER",
];
export const logStatuses: LogStatus[] = ["SUCCESS", "INITIATED", "FAILED"];

//Constant for booking - START
export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  [BOOKING_STATUS.PENDING]: "Pending",
  [BOOKING_STATUS.CONFIRMED]: "Confirmed",
  [BOOKING_STATUS.CANCELLED]: "Cancelled",
  [BOOKING_STATUS.COMPLETED]: "Completed",
};

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export const PAYMENT_METHOD = {
  CARD: "CARD",
  CASH: "CASH",
} as const;

export const PAYMENT_GATEWAY = {
  STRIPE: "STRIPE",
  RAZORPAY: "RAZORPAY",
} as const;

export const PAYMENT_METHOD_OPTIONS: IPaymentMethodValue[] = [
  { title: "Debit/Credit Card", value: PAYMENT_METHOD.CARD },
  { title: "Cash", value: PAYMENT_METHOD.CASH },
];

export const PAYMENT_GATEWAY_OPTIONS: IPaymentGatewayValue[] = [
  { title: "Stripe", value: PAYMENT_GATEWAY.STRIPE },
  { title: "Razorpay", value: PAYMENT_GATEWAY.RAZORPAY },
];

export const ASCENDING = "ASC";
export const DESCENDING = "DESC";

export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_CURRENCY_SYMBOL = "$";

export const PAGINATION_DEFAULT_LIMIT = 10;
export const PAGINATION_DEFAULT_PAGE = 1;

export const DATE_TIME_FORMAT = "dd MMM yyyy, hh:mm:ss a";

export const CurrencySymbol: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  AED: "AED",
  CAD: "CA$",
  AUD: "A$",
  SGD: "S$",
};

