import React from "react";
import { Route } from "react-router-dom";
import { APP_ROUTES } from "@/routes/config";
import AuthGuard from "@/guards/AuthGuard";
import MainLayout from "@/components/layout/admin/mainLayout";

// Admin Pages
const AdminDashboardPage = React.lazy(() => import("@/pages/dashboard"));
const ServicePartnerManagement = React.lazy(() => import("@/pages/user-management/partner"));
const PartnerDetail = React.lazy(() => import("@/pages/user-management/partner/PartnerDetail"));
const Offers = React.lazy(() => import("@/pages/offers"));
const AdminUsersPage = React.lazy(() => import("@/pages/user-management/admin-users"));
const CustomersPage = React.lazy(() => import("@/pages/user-management/customers"));
const CustomerDetails = React.lazy(() => import("@/pages/user-management/customers/CustomerDetails"));
const MasterData = React.lazy(() => import("@/pages/master-data"));
const ServiceManagementPage = React.lazy(() => import("@/pages/service-management"));
const BookingManagementPage = React.lazy(() => import("@/pages/booking-management"));
const BookingDetailsPage = React.lazy(() => import("@/pages/booking-management/BookingDetailsPage"));
const AdminProfile = React.lazy(() => import("@/pages/my-profile/admin"));
const PaymentsPage = React.lazy(() => import("@/pages/payments"));
const PaymentDetailsPage = React.lazy(() => import("@/pages/payments/PaymentDetailsPage"));
const SupportPage = React.lazy(() => import("@/pages/support"));
const ActivityLog = React.lazy(() => import("@/pages/activity-log"));
const ServiceDetail = React.lazy(() => import("@/pages/service-management/ServiceDetail"));

const adminRoutes = (
  <Route element={<AuthGuard adminOnly={true}><MainLayout /></AuthGuard>}>
    <Route path={APP_ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
    <Route path={APP_ROUTES.ADMIN_SERVICE_PARTNER_MANAGEMENT} element={<ServicePartnerManagement />} />
    <Route path={APP_ROUTES.ADMIN_SERVICE_PARTNER_DETAILS} element={<PartnerDetail />} />
    <Route path={APP_ROUTES.ADMIN_OFFERS} element={<Offers />} />
    <Route path={APP_ROUTES.ADMIN_ADMIN_USER_MANAGEMENT} element={<AdminUsersPage />} />
    <Route path={APP_ROUTES.ADMIN_CUSTOMER_MANAGEMENT} element={<CustomersPage />} />
    <Route path={APP_ROUTES.ADMIN_CUSTOMER_DETAILS} element={<CustomerDetails />} />
    <Route path={APP_ROUTES.ADMIN_MASTER_DATA} element={<MasterData />} />
    <Route path={APP_ROUTES.ADMIN_SERVICE_MANAGEMENT} element={<ServiceManagementPage />} />
    <Route path={APP_ROUTES.ADMIN_BOOKING_MANAGEMENT} element={<BookingManagementPage />} />
    <Route path={APP_ROUTES.ADMIN_BOOKING_DETAILS} element={<BookingDetailsPage />} />
    <Route path={APP_ROUTES.ADMIN_PROFILE} element={<AdminProfile />} />
    <Route path={APP_ROUTES.ADMIN_PAYMENTS} element={<PaymentsPage />} />
    <Route path={APP_ROUTES.ADMIN_PAYMENT_DETAILS} element={<PaymentDetailsPage />} />
    <Route path={APP_ROUTES.ADMIN_SUPPORT} element={<SupportPage />} />
    <Route path={APP_ROUTES.ADMIN_LOGS} element={<ActivityLog />} />
    <Route path={APP_ROUTES.ADMIN_SERVICE_DETAILS} element={<ServiceDetail />} />
  </Route>
);

export default adminRoutes;
