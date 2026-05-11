import React from "react";
import { Route } from "react-router-dom";
import { APP_ROUTES } from "@/routes/config";
import HomePageLayout from "@/components/layout/HomePageLayout";
import AuthGuard from "@/guards/AuthGuard";

// Customer Pages
const HomePage = React.lazy(() => import("@/pages/home"));
const ServiceListingPage = React.lazy(() => import("@/pages/service-listing"));
const ContactPage = React.lazy(() => import("@/pages/contact"));
const AboutUs = React.lazy(() => import("@/pages/static/AboutUs"));
const TermsConditions = React.lazy(() => import("@/pages/static/TermsConditions"));
const PrivacyPolicy = React.lazy(() => import("@/pages/static/PrivacyPolicy"));
const Careers = React.lazy(() => import("@/pages/static/Careers"));
const Reviews = React.lazy(() => import("@/pages/static/Reviews"));
const CategoriesPage = React.lazy(() => import("@/pages/static/Categories"));
const BlogsPage = React.lazy(() => import("@/pages/static/Blogs"));
const CheckoutSuccessPage = React.lazy(() => import("@/pages/checkout/Success"));
const ServiceDetails = React.lazy(() => import("@/pages/home-services/ServiceDetails"));
const CheckoutPage = React.lazy(() => import("@/pages/checkout"));
const UserProfile = React.lazy(() => import("@/pages/my-profile/customer"));
const MyBookingsPage = React.lazy(() => import("@/pages/my-bookings"));
const ServicesPage = React.lazy(() => import("@/pages/home-services"));
const ServicePartnerSignup = React.lazy(() => import("@/pages/service-partner"));

const customerRoutes = [
  <Route element={<AuthGuard customerOnly={true}><HomePageLayout /></AuthGuard>}>
    <Route path={APP_ROUTES.PROFILE} element={<UserProfile />} />
    <Route path={APP_ROUTES.MY_BOOKINGS} element={<MyBookingsPage />} />
  </Route>,
  <Route key="customer-layout" element={<HomePageLayout />}>
    <Route path={APP_ROUTES.HOME} element={<HomePage />} />
    <Route path={APP_ROUTES.MY_BOOKINGS} element={<MyBookingsPage />} />
    <Route path={APP_ROUTES.SERVICES} element={<ServicesPage />} />
    <Route path={APP_ROUTES.SERVICE_LISTING} element={<ServiceListingPage />} />
    <Route path={APP_ROUTES.SERVICE_DETAILS} element={<ServiceDetails />} />
    <Route path={APP_ROUTES.CONTACT} element={<ContactPage />} />
    <Route path={APP_ROUTES.PROFILE} element={<UserProfile />} />
    <Route path={APP_ROUTES.ABOUT_US} element={<AboutUs />} />
    <Route path={APP_ROUTES.TERMS_AND_CONDITIONS} element={<TermsConditions />} />
    <Route path={APP_ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />} />
    <Route path={APP_ROUTES.CAREERS} element={<Careers />} />
    <Route path={APP_ROUTES.REVIEWS} element={<Reviews />} />
    <Route path={APP_ROUTES.CATEGORIES} element={<CategoriesPage />} />
    <Route path={APP_ROUTES.BLOGS} element={<BlogsPage />} />
  </Route>,
  <Route key="checkout-success" path={APP_ROUTES.CHECKOUT_SUCCESS} element={<CheckoutSuccessPage />} />,
  <Route key="checkout" path={APP_ROUTES.CHECKOUT} element={<CheckoutPage />} />,
  <Route key="partner-signup" path={APP_ROUTES.SERVICE_PARTNER_SIGNUP} element={<ServicePartnerSignup />} />
];

export default customerRoutes;
