import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronUp, ChevronDown, X as XIcon } from "lucide-react";
import images from "../../../assets";
import { useAuth } from "@/hooks/useAuth";
import { APP_ROUTES, IMPLEMENTED_ROUTES } from "@/routes/config";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { UI_COLORS } from "@/constants/colors";

interface ChildRoute {
  path: string;
  label: string;
  adminOnly?: boolean;
  partnerOnly?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  path?: string;
  image: string;
  children?: ChildRoute[];
  adminOnly?: boolean;
  partnerOnly?: boolean;
}

interface IProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

const PRIMARY = UI_COLORS.primary;
const TEXT_DEFAULT = UI_COLORS.inkMuted;

const NAV_ITEMS: NavItem[] = [
  {
    id: "admin_dashboard",
    label: "Dashboard",
    path: APP_ROUTES.ADMIN_DASHBOARD,
    image: "dashboard.svg",
    adminOnly: true,
  },
  {
    id: "partner_dashboard",
    label: "Dashboard",
    path: APP_ROUTES.SERVICE_PARTNER_DASHBOARD,
    image: "dashboard.svg",
    partnerOnly: true,
  },
  {
    id: "admin_service",
    label: "Service Management",
    path: APP_ROUTES.ADMIN_SERVICE_MANAGEMENT,
    image: "service-management.svg",
    adminOnly: true,
  },
  {
    id: "partner_service",
    label: "Service Management",
    path: APP_ROUTES.SERVICE_PARTNER_SERVICE_MANAGEMENT,
    image: "service-management.svg",
    partnerOnly: true,
  },
  {
    id: "user",
    label: "User Management",
    image: "user-management.svg",
    adminOnly: true,
    children: [
      {
        path: APP_ROUTES.ADMIN_CUSTOMER_MANAGEMENT,
        label: "Customers",
        adminOnly: true,
      },
      {
        path: APP_ROUTES.ADMIN_SERVICE_PARTNER_MANAGEMENT,
        label: "Service Partners",
        adminOnly: true,
      },
      {
        path: APP_ROUTES.ADMIN_ADMIN_USER_MANAGEMENT,
        label: "Admin Users",
        adminOnly: true,
      },
    ],
  },
  {
    id: "booking",
    label: "Booking Management",
    path: APP_ROUTES.ADMIN_BOOKING_MANAGEMENT,
    image: "booking-management.svg",
    adminOnly: true,
  },
  {
    id: "offers",
    label: "Offers",
    path: APP_ROUTES.ADMIN_OFFERS,
    image: "offers.svg",
    adminOnly: true,
  },
  {
    id: "payments",
    label: "Payments & Transactio...",
    path: APP_ROUTES.ADMIN_PAYMENTS,
    image: "payments.svg",
    adminOnly: true,
  },
  {
    id: "master",
    label: "Master Data",
    path: APP_ROUTES.ADMIN_MASTER_DATA,
    image: "master-data.svg",
    adminOnly: true,
  },
  {
    id: "logs",
    label: "Activity Log",
    path: APP_ROUTES.ADMIN_LOGS,
    image: "activity-log.svg",
    adminOnly: true,
  },
  {
    id: "support",
    label: "Support",
    path: APP_ROUTES.ADMIN_SUPPORT,
    image: "support.svg",
    adminOnly: true,
  },
];

const MOBILE_BREAKPOINT = 768;

const Sidebar = ({ isMobileOpen, onClose }: IProps) => {
  const location = useLocation();
  const { isAdmin, isPartner } = useAuth();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    if (!IMPLEMENTED_ROUTES.includes(path)) {
      e.preventDefault();
      toast("Yet to be implemented");
    }
  };

  const getIconUrl = (filename: string): string =>
    new URL(`../../../assets/images/${filename}`, import.meta.url).href;

  const getActiveIconUrl = (filename: string): string => {
    if (!filename) return "";
    const name = filename.split(".")[0];
    const ext = filename.split(".")[1];
    return new URL(
      `../../../assets/images/${name}-active.${ext}`,
      import.meta.url
    ).href;
  };

  const visibleNavItems = NAV_ITEMS.filter(
    (item) =>
      (item.adminOnly ? isAdmin : true) && (item.partnerOnly ? isPartner : true)
  ).filter(
    (item) =>
      (isAdmin && !item.partnerOnly) ||
      (isPartner && !item.adminOnly) ||
      (!item.adminOnly && !item.partnerOnly)
  );

  const getActiveParents = (): string[] =>
    visibleNavItems
      .filter((item) =>
        item.children?.some((c) => location.pathname.startsWith(c.path))
      )
      .map((item) => item.id);

  const [expandedMenus, setExpandedMenus] =
    useState<string[]>(getActiveParents);

  useEffect(() => {
    const active = getActiveParents();
    setExpandedMenus((prev) => Array.from(new Set([...prev, ...active])));
  }, [location.pathname]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      onClose();
    }
  }, [location.pathname]);

  // On resize: if going back to desktop keep sidebar state; if shrinking to mobile close it
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        onClose();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onClose]);

  const toggleExpand = (id: string) =>
    setExpandedMenus((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );

  const hasActiveChild = (item: NavItem): boolean =>
    item.children?.some((c) => location.pathname.startsWith(c.path)) ?? false;

  const isRouteActive = (to: string): boolean => {
    const cur = location.pathname;
    if (cur.includes("/details")) return cur.split("/details")[0] === to;
    if (cur.includes("/add")) return cur.split("/add")[0] === to;
    return cur === to || cur.startsWith(to + "/");
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          // Layout
          "w-70 bg-white border-r border-line-light flex flex-col shrink-0 h-full select-none font-alexandria",
          // Desktop: always visible, static in flow
          "md:relative md:translate-x-0 md:z-auto md:flex",
          // Mobile: fixed overlay drawer, slide in/out
          "fixed top-0 left-0 z-50 md:static",
          "transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="h-18 flex items-center px-4 shrink-0 justify-between">
          <NavLink
            to={
              isAdmin
                ? APP_ROUTES.ADMIN_DASHBOARD
                : isPartner
                ? APP_ROUTES.SERVICE_PARTNER_DASHBOARD
                : APP_ROUTES.HOME
            }
            onClick={(e) =>
              handleNavClick(
                e,
                isAdmin
                  ? APP_ROUTES.ADMIN_DASHBOARD
                  : isPartner
                  ? APP_ROUTES.SERVICE_PARTNER_DASHBOARD
                  : APP_ROUTES.HOME
              )
            }
            className="flex items-center leading-none"
            title="HomeCare"
          >
            <img
              src={images.icLogoSVG}
              alt="HomeCare"
              width={220}
              height={36}
            />
          </NavLink>

          {/* X close button — mobile only */}
          <Button
            onClick={onClose}
            variant={"ghost"}
            className="md:hidden p-2"
            aria-label="Close sidebar"
          >
            <XIcon className="w-5! h-5!" />
          </Button>
        </div>

        <nav className="flex-1 px-3 pb-3 overflow-y-auto">
          <ul className="flex flex-col gap-0.5">
            {visibleNavItems.map((item) => {
              const isExpanded = expandedMenus.includes(item.id);
              const childActive = hasActiveChild(item);
              const iconUrl = getIconUrl(item.image);
              const activeIconUrl = getActiveIconUrl(item.image);

              if (item.children) {
                const visibleChildren = item.children.filter(
                  (child) => !child.adminOnly || isAdmin
                );
                if (visibleChildren.length === 0) return null;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className={[
                        "w-full flex items-center gap-3 p-3 font-medium rounded-[10px]",
                        "text-left transition-colors duration-150 cursor-pointer",
                        !childActive && "hover:bg-primary/5",
                        childActive ? "bg-primary/10" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <img
                        src={childActive ? activeIconUrl : iconUrl}
                        alt={item.label}
                        width={24}
                        height={24}
                        className="shrink-0"
                      />
                      <span
                        className="flex-1 text-sm leading-5 transition-colors duration-150"
                        style={{ color: childActive ? PRIMARY : TEXT_DEFAULT }}
                      >
                        {item.label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp
                          size={15}
                          strokeWidth={2.2}
                          className="shrink-0"
                          style={{
                            color: childActive ? PRIMARY : UI_COLORS.grey400,
                          }}
                        />
                      ) : (
                        <ChevronDown
                          size={15}
                          strokeWidth={2.2}
                          className="shrink-0"
                          style={{
                            color: childActive ? PRIMARY : UI_COLORS.grey400,
                          }}
                        />
                      )}
                    </button>

                    {isExpanded && (
                      <ul className="mt-0.5 ml-8.5 flex flex-col gap-px">
                        {visibleChildren.map((child) => {
                          const active = isRouteActive(child.path);
                          return (
                            <li key={child.path}>
                              <NavLink
                                to={child.path}
                                onClick={(e) => handleNavClick(e, child.path)}
                                className={[
                                  "flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] cursor-pointer",
                                  "font-alexandria text-[13.5px] leading-5 font-medium tracking-[0.0025em]",
                                  "transition-colors duration-150",
                                ].join(" ")}
                                style={{
                                  color: active ? PRIMARY : TEXT_DEFAULT,
                                }}
                              >
                                <span
                                  className="w-1.25 h-1.25 rounded-full shrink-0 transition-colors duration-150"
                                  style={{
                                    background: active ? PRIMARY : UI_COLORS.grey300,
                                  }}
                                />
                                {child.label}
                              </NavLink>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path!}
                    onClick={(e) => handleNavClick(e, item.path!)}
                    className={({ isActive }) =>
                      [
                        "w-full flex items-center gap-3 p-3 rounded-[10px] font-medium",
                        "text-left transition-colors duration-150 cursor-pointer",
                        isActive ? "bg-primary/10" : "hover:bg-primary/5",
                      ]
                        .filter(Boolean)
                        .join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <img
                          src={isActive ? activeIconUrl : iconUrl}
                          alt={item.label}
                          width={24}
                          height={24}
                          className="shrink-0"
                        />
                        <span
                          className="flex-1 font-alexandria text-sm leading-5 font-medium tracking-[0.0025em]"
                          style={{ color: isActive ? PRIMARY : TEXT_DEFAULT }}
                        >
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
