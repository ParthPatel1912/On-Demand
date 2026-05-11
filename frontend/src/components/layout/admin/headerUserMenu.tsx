import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, CircleUserRound } from "lucide-react";
import toast from "react-hot-toast";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import images from "../../../assets";
import { APP_ROUTES, IMPLEMENTED_ROUTES } from "@/routes/config";
import axiosInstance from "@/helper/axiosInstance";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import { urlStrings } from "@/pages/auth/config/constant";
import { displayRole, getInitialsName } from "@/utils";
import {
  ADMIN_AUTH_TOKEN_KEY,
  PARTNER_AUTH_TOKEN_KEY,
  CUSTOMER_AUTH_TOKEN_KEY,
  PARTNER_AUTH_USER_KEY,
} from "@/utils/constants";
import {
  AdminDetailProvider,
  useAdminDetail,
} from "@/context/AdminDetailContext";
import { cn } from "@/lib/utils";

// --- Types ---

interface UserMenuProps {
  isMobile?: boolean;
  onClose?: () => void;
}

interface UserDetail {
  name: string;
  email?: string;
  role?: string;
  profileImage?: string;
  profile_image?: {
    url: string;
  };
}

type UserRole = "admin" | "partner" | "customer";

interface MenuItemConfig {
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

// --- Constants ---

interface LogoutConfigItem {
  endpoint: string;
  redirect: string;
  useLaravel: boolean;
  toastMessage?: string;
}

const LOGOUT_CONFIG: Record<UserRole, LogoutConfigItem> = {
  admin: {
    endpoint: urlStrings.adminLogout,
    redirect: APP_ROUTES.ADMIN_LOGIN,
    useLaravel: true,
  },
  partner: {
    endpoint: urlStrings.servicePartnerLogout,
    redirect: APP_ROUTES.SERVICE_PARTNER_LOGIN,
    useLaravel: false,
  },
  customer: {
    endpoint: "/v1/customer/logout",
    redirect: APP_ROUTES.LOGIN,
    useLaravel: false,
  },
} as const;

// --- Helper Functions ---

const getStoredUser = (key: string): UserDetail | null => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage`, error);
    return null;
  }
};

// --- Sub-components (Memoized) ---

const MenuItem = memo(
  ({
    onClick,
    icon,
    label,
    className = "",
  }: {
    onClick: () => void;
    icon?: string;
    label: string;
    className?: string;
  }) => (
    <Button
      variant="ghost"
      className={cn(
        "w-full flex justify-start items-center gap-3 px-4 py-2.5 text-sm cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      {icon && <img src={icon} alt={label} width={24} height={24} />}
      <Label className="text-start cursor-pointer text-black">{label}</Label>
    </Button>
  ),
);

MenuItem.displayName = "MenuItem";

const UserAvatar = memo(
  ({
    src,
    name,
    className = "",
  }: {
    src?: string;
    name: string;
    className?: string;
  }) => (
    <Avatar
      className={cn("rounded-full", className)}
    >
      <AvatarImage src={src} alt={name} />
      <AvatarFallback className="border border-line-strong text-sm font-semibold text-gray-700 rounded-full">
        {getInitialsName(name || "")}
      </AvatarFallback>
    </Avatar>
  ),
);

UserAvatar.displayName = "UserAvatar";

const MobileMenuItem = memo(
  ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button
      type="button"
      className="w-full rounded-full px-4 py-2 text-left text-sm font-medium text-foreground/80 hover:bg-foreground/5"
      onClick={onClick}
    >
      {label}
    </button>
  ),
);

MobileMenuItem.displayName = "MobileMenuItem";

// --- Main Content Component ---

const HeaderUserMenuContent = ({ isMobile, onClose }: UserMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { adminDetail } = useAdminDetail();

  const authState = useMemo(() => {
    const isAdmin = !!localStorage.getItem(ADMIN_AUTH_TOKEN_KEY);
    const isPartner = !!localStorage.getItem(PARTNER_AUTH_TOKEN_KEY);
    const isCustomer = !!localStorage.getItem(CUSTOMER_AUTH_TOKEN_KEY);

    return {
      isAdmin,
      isPartner,
      isCustomer,
      partnerDetail: isPartner ? getStoredUser(PARTNER_AUTH_USER_KEY) : null,
      role: isAdmin
        ? "admin"
        : isPartner
          ? "partner"
          : isCustomer
            ? "customer"
            : null,
    };
  }, [location.pathname]);

  const { isAdmin, isPartner, isCustomer, partnerDetail, role } = authState;

  const closeMenus = useCallback(() => {
    setDropdownOpen(false);
    setIsPopoverOpen(false);
    onClose?.();
  }, [onClose]);

  const handleNavClick = useCallback(
    (href: string) => {
      if (IMPLEMENTED_ROUTES.includes(href)) {
        navigate(href);
      } else {
        toast("Yet to be implemented");
      }
      closeMenus();
    },
    [navigate, closeMenus],
  );

  const handleLogout = useCallback(
    async (type: UserRole) => {
      const config = LOGOUT_CONFIG[type];
      try {
        const axios = config.useLaravel ? axiosInstanceLaravel : axiosInstance;
        await axios.post(config.endpoint);
        if (config.toastMessage) toast.success(config.toastMessage);
      } catch (error) {
        console.error(`${type} logout error:`, error);
      } finally {
        localStorage.clear();
        closeMenus();
        navigate(config.redirect);
      }
    },
    [navigate, closeMenus],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Menu Configurations ---

  const adminMenuItems: MenuItemConfig[] = [
    {
      label: "Dashboard",
      icon: images.dashboardSVG,
      href: APP_ROUTES.ADMIN_DASHBOARD,
    },
    {
      label: "My Profile",
      icon: images.userManagementSVG,
      href: APP_ROUTES.ADMIN_PROFILE,
    },
    {
      label: "Logout",
      icon: images.logoutSVG,
      onClick: () => handleLogout("admin"),
    },
  ];

  const partnerMenuItems: MenuItemConfig[] = [
    {
      label: "Dashboard",
      icon: images.dashboardSVG,
      href: APP_ROUTES.SERVICE_PARTNER_DASHBOARD,
    },
    {
      label: "Logout",
      icon: images.logoutSVG,
      onClick: () => handleLogout("partner"),
    },
  ];

  const customerMenuItems: MenuItemConfig[] = [
    {
      label: "My Profile",
      href: APP_ROUTES.PROFILE,
    },
    {
      label: "My Bookings",
      href: APP_ROUTES.MY_BOOKINGS,
    },
    {
      label: "Logout",
      onClick: () => handleLogout("customer"),
    },
  ];

  if (!role) {
    return (
      <Button
        className={cn(
          "rounded-full px-4 text-sm font-bold",
          isMobile ? "mt-1 w-full" : "h-10",
        )}
        onClick={() => handleNavClick(APP_ROUTES.LOGIN)}
      >
        Sign In
      </Button>
    );
  }

  const renderDesktopDropdown = (
    items: MenuItemConfig[],
    detail: UserDetail | null,
  ) => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 hover:bg-gray-50 rounded-xl transition-colors duration-200 cursor-pointer"
      >
        <UserAvatar
          src={detail?.profile_image?.url || detail?.profileImage || ""}
          name={detail?.name || ""}
          className="h-11 w-11"
        />
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold leading-5 text-ink">
            {detail?.name || ""}
          </p>
          <p className="text-xs text-ink-muted mt-px leading-sm leading-4 font-medium">
            {displayRole((detail?.role as string) || "")}
          </p>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-ink-muted h-5 w-5 transition-transform duration-200",
            dropdownOpen && "rotate-180",
          )}
        />
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-line-strong py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {items.map((item) => (
            <MenuItem
              key={item.label}
              onClick={item.onClick || (() => handleNavClick(item.href!))}
              icon={item.icon}
              label={item.label}
              className="w-full justify-start font-normal leading-5 tracking-[0.0025em] focus-visible:ring-0 focus-visible:outline-none"
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderMobileList = (items: MenuItemConfig[]) => (
    <div className="flex flex-col gap-1">
      {items.map((item) => (
        <MobileMenuItem
          key={item.label}
          onClick={item.onClick || (() => handleNavClick(item.href!))}
          label={item.label}
        />
      ))}
    </div>
  );

  if (isMobile) {
    if (isAdmin) return renderMobileList(adminMenuItems);
    if (isPartner) return renderMobileList(partnerMenuItems);
    if (isCustomer) return renderMobileList(customerMenuItems);
  }

  if (isAdmin) return renderDesktopDropdown(adminMenuItems, adminDetail);
  if (isPartner) return renderDesktopDropdown(partnerMenuItems, partnerDetail);

  if (isCustomer) {
    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Avatar className="size-7 bg-inherit cursor-pointer rounded-full">
            <CircleUserRound className="size-full text-ink-muted" />
          </Avatar>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-45 h-33 border-none p-0 shadow-2xl">
          <div className="rounded-xl overflow-hidden bg-white">
            {customerMenuItems.map((item) => (
              <MenuItem
                key={item.label}
                onClick={item.onClick || (() => handleNavClick(item.href!))}
                label={item.label}
                className="w-full justify-start px-6 py-3 font-normal leading-5 tracking-[0.0025em] focus-visible:ring-0 focus-visible:outline-none"
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return null;
};

// --- Exported Wrapper ---

const HeaderUserMenu = (props: UserMenuProps) => (
  <AdminDetailProvider>
    <HeaderUserMenuContent {...props} />
  </AdminDetailProvider>
);

export default memo(HeaderUserMenu);
