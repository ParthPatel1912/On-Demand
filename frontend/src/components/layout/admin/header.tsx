import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu as MenuIcon } from "lucide-react";
import toast from "react-hot-toast";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import images from "../../../assets";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { APP_ROUTES, IMPLEMENTED_ROUTES } from "@/routes/config";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import { urlStrings } from "@/pages/auth/config/constant";
import { useAdminDetail } from "@/context/AdminDetailContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axiosInstance from "@/helper/axiosInstance";
import { displayRole, getInitialsName } from "@/utils";

interface IProps {
  onMenuToggle?: () => void;
}

const AdminHeader = ({ onMenuToggle }: IProps) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const { adminDetail, partnerDetail } = useAdminDetail();
  const navigate = useNavigate();
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

  const dropdownRef = useRef<HTMLDivElement>(null);
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate(APP_ROUTES.ADMIN_PROFILE);
  };

  const handleLogoutClick = async () => {
    try {
      await axiosInstanceLaravel.post(urlStrings.adminLogout);
    } catch {
      // Silently ignore API errors (e.g. 401 Unauthenticated / expired token).
      // We still want to clear the session and redirect to login.
    } finally {
      localStorage.clear();
      setDropdownOpen(false);
      navigate(APP_ROUTES.ADMIN_LOGIN);
    }
  };

  const handlePartnerLogout = async () => {
    try {
      await axiosInstance.post(urlStrings.servicePartnerLogout);
      toast.success("Logged out successfully");
      localStorage.clear();
      navigate(APP_ROUTES.SERVICE_PARTNER_LOGIN);
    } catch (error: unknown) {
      console.error("Partner logout error:", error);
    }
  };

  return (
    <header className="bg-white border-b border-line-strong h-18 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-1 md:hidden">
        <Button onClick={onMenuToggle} variant={"ghost"} className="p-2">
          <MenuIcon className="w-5! h-5!" />
        </Button>

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
          <img src={images.icLogoSVG} alt="HomeCare" width={180} height={30} />
        </NavLink>
      </div>

      <div className="hidden md:flex flex-1" />
      {!isPartner ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors duration-200 cursor-pointer"
          >
            <Avatar className="w-11 h-11 rounded-full">
              <AvatarImage
                src={adminDetail?.profile_image?.url}
                alt="Super Admin"
              />
              <AvatarFallback className="text-sm border border-line-strong font-semibold text-gray-700 rounded-full">
                {getInitialsName(adminDetail?.name || "")}
              </AvatarFallback>
            </Avatar>

            {/* Name + role: hidden on mobile */}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-ink leading-5">
                {adminDetail?.name}
              </p>
              <p className="text-xs text-ink-muted mt-px leading-4 font-medium">
                {displayRole(adminDetail?.role)}
              </p>
            </div>

            {/* Chevron: hidden on mobile */}
            <ChevronDown
              size={16}
              className={`text-ink-muted w-5 h-5 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-line-strong py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <Button
                variant="ghost"
                className="w-full flex justify-start items-center gap-3 px-4 py-2.5 text-sm  cursor-pointer"
                onClick={handleProfileClick}
              >
                <img
                  src={images.userManagementSVG}
                  alt="HomeCare"
                  width={24}
                  height={24}
                />
                <Label className="text-start cursor-pointer">My Profile</Label>
              </Button>

              <Button
                variant="ghost"
                className="w-full flex justify-start items-center gap-3 px-4 py-2.5 text-sm cursor-pointer"
                onClick={handleLogoutClick} // Handle click to logout
              >
                <img
                  src={images.logoutSVG}
                  alt="HomeCare"
                  width={24}
                  height={24}
                />
                <Label className="text-start cursor-pointer">Logout</Label>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors duration-200 cursor-pointer"
          >
            <Avatar className="border-2 border-line-strong rounded-full">
              <AvatarImage
                src={partnerDetail?.profile_image?.url}
                alt="Service Partner"
              />
              <AvatarFallback className="text-sm font-semibold text-gray-700 rounded-full">
                {getInitialsName(partnerDetail?.name || "")}
              </AvatarFallback>
            </Avatar>

            {/* Name + role: hidden on mobile */}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-ink leading-6">
                {partnerDetail?.name}
              </p>
              <p className="text-xs text-ink-muted leading-4 font-medium">
                {displayRole(partnerDetail?.role)}
              </p>
            </div>

            {/* Chevron: hidden on mobile */}
            <ChevronDown
              size={16}
              className={`text-ink-muted transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-line-strong py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <Button
                variant="ghost"
                className="w-full flex justify-start items-center gap-3 px-4 py-2.5 text-sm  cursor-pointer"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate(APP_ROUTES.SERVICE_PARTNER_PROFILE);
                }}
              >
                <img
                  src={images.userManagementSVG}
                  alt="HomeCare"
                  width={24}
                  height={24}
                />
                <Label className="text-start cursor-pointer">My Profile</Label>
              </Button>

              <Button
                variant="ghost"
                className="w-full flex justify-start items-center gap-3 px-4 py-2.5 text-sm cursor-pointer"
                onClick={handlePartnerLogout}
              >
                <img
                  src={images.logoutSVG}
                  alt="HomeCare"
                  width={24}
                  height={24}
                />
                <Label className="text-start cursor-pointer">Logout</Label>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default AdminHeader;
