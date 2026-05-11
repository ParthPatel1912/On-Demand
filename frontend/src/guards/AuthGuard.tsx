import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { APP_ROUTES } from "../routes/config";
import { ROLES } from "../enums/roles.enum";

interface IProps {
  children?: React.ReactNode;
  adminOnly?: boolean;
  partnerOnly?: boolean;
  customerOnly?: boolean;
}

const AuthGuard = ({
  children,
  adminOnly = false,
  partnerOnly = false,
  customerOnly = false 
}: IProps) => {
  const location = useLocation();

  // Unified token and user info check
  const adminToken = localStorage.getItem("adminToken");
  const partnerToken = localStorage.getItem("partnerToken");
  const customerToken = localStorage.getItem("customerToken");
  const accessToken = localStorage.getItem("accessToken");
  const adminInfoRaw = localStorage.getItem("admininfo");
  const partnerInfoRaw = localStorage.getItem("partnerinfo");
  const customerInfoRaw = localStorage.getItem("userInfo");


  const token = adminToken || partnerToken || accessToken || customerToken;

  let isAdminUser = false;
  let isPartnerUser = false;
  let isCustomerUser = false;
  let user = null;

  if (adminInfoRaw) {
    try {
      user = JSON.parse(adminInfoRaw);
      isAdminUser =
        user?.role === ROLES.ADMIN ||
        user?.role === ROLES.SUPER_ADMIN ||
        Boolean(user?.is_super_admin);
      isPartnerUser = user?.role === ROLES.SERVICE_PARTNER;
    } catch {
      console.error("Invalid user info in localStorage");
    }
  } else if (partnerInfoRaw) {
    try {
      user = JSON.parse(partnerInfoRaw);
      isPartnerUser = user?.role === ROLES.SERVICE_PARTNER;
    } catch {
      console.error("Invalid partner info in localStorage");
    }
  }
  else if (customerInfoRaw) {
    try {
      user = JSON.parse(customerInfoRaw);
      isCustomerUser = user?.role === ROLES.CUSTOMER || Boolean(user?.is_verified); 
    } catch {
      console.error("Invalid customer info in localStorage");
    }
  }
  
  // 1. Not authenticated
  if (!token) {
    const isTryingAdminRoute = location.pathname.startsWith("/admin");
    const isTryingPartnerRoute = location.pathname.startsWith("/partner");

    let redirectPath = APP_ROUTES.LOGIN;
    if (isTryingAdminRoute) {
      redirectPath = APP_ROUTES.ADMIN_LOGIN;
    } else if (
      isTryingPartnerRoute &&
      location.pathname !== APP_ROUTES.SERVICE_PARTNER_SIGNUP
    ) {
      redirectPath = APP_ROUTES.SERVICE_PARTNER_LOGIN;
    }

    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // 2. Authenticated but unauthorized (Admin route requested by non-admin)
  if (adminOnly && !isAdminUser) {
    return <Navigate to={APP_ROUTES.HOME} replace />;
  }

  // 3. Authenticated but unauthorized (Partner route requested by non-partner)
  if (partnerOnly && !isPartnerUser) {
    return <Navigate to={APP_ROUTES.HOME} replace />;
  }

  // 4. Authenticated but unauthorized (Customer route requested by non-customer)
  if (customerOnly && !isCustomerUser) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  // 5. Authorized access
  return children ? <>{children}</> : <Outlet />;
};

export default React.memo(AuthGuard);
