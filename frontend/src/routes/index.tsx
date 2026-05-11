import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { APP_ROUTES } from "./config";
import { FullPageLoader } from "@/components/common/Loader";

// Route Modules
import adminRoutes from "./modules/AdminRoutes";
import customerRoutes from "./modules/CustomerRoutes";
import partnerRoutes from "./modules/PartnerRoutes";
import authRoutes from "./modules/AuthRoutes";

// 404 - Not Found
const NotFoundPage = React.lazy(() => import("@/components/common/NotFound"));

export default function Router() {
  return (
    <Suspense fallback={<FullPageLoader isLoading={true} />}>
      <Routes>
        {/* Auth-related Guest Routes */}
        {authRoutes}

        {/* Customer Routes (Public/Protected) */}
        {customerRoutes}

        {/* Admin Protected Routes */}
        {adminRoutes}

        {/* Service Partner Protected Routes */}
        {partnerRoutes}

        {/* Fallback */}
        <Route path={APP_ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
