import React, { type ReactNode, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../routes/config";

interface IProps {
  children?: ReactNode;
}

const GuestGuard = ({ children }: IProps) => {
  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");
  const customerToken = localStorage.getItem("customerToken");
  const partnerToken = localStorage.getItem("partnerToken");
  const isAuthenticated = Boolean(adminToken || customerToken || partnerToken);

  useEffect(() => {
    if (isAuthenticated) {
      // If admin, go to admin dashboard/master data, else go to home
      if (adminToken) {
        navigate(APP_ROUTES.ADMIN_DASHBOARD);
      } else if (partnerToken) {
        navigate(APP_ROUTES.SERVICE_PARTNER_DASHBOARD);
      } else {
        navigate(APP_ROUTES.HOME);
      }
    }
  }, [isAuthenticated, adminToken, partnerToken, navigate]);

  return children ? <>{children}</> : <Outlet />;
};

export default React.memo(GuestGuard);
