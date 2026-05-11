import React from "react";
import { Route } from "react-router-dom";
import { APP_ROUTES } from "@/routes/config";
import AuthGuard from "@/guards/AuthGuard";
import MainLayout from "@/components/layout/admin/mainLayout";
import ServiceDetail from "@/pages/service-management/ServiceDetail";

// Partner Pages
const PartnerServiceManagement = React.lazy(() => import("@/pages/service-management/PartnerServiceManagement"));
const PartnerDashboardPage = React.lazy(() => import("@/pages/dashboard/PartnerDashboardPage"));
const PartnerProfile = React.lazy(() => import("@/pages/my-profile/partner"));
const partnerRoutes = (
  <Route element={<AuthGuard partnerOnly={true}><MainLayout /></AuthGuard>}>
    <Route path={APP_ROUTES.SERVICE_PARTNER_SERVICE_MANAGEMENT} element={<PartnerServiceManagement />} />
    <Route path={APP_ROUTES.SERVICE_PARTNER_DASHBOARD} element={<PartnerDashboardPage />} />
    <Route path={APP_ROUTES.SERVICE_PARTNER_SERVICE_DETAILS} element={<ServiceDetail />} />
    <Route path={APP_ROUTES.SERVICE_PARTNER_PROFILE} element={<PartnerProfile />} />
  </Route>
);

export default partnerRoutes;
