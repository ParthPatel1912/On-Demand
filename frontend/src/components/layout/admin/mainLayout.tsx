import React, { useState, useEffect } from "react";
import { AdminDetailProvider } from "@/context/AdminDetailContext";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import AdminHeader from "./header";

const MOBILE_BREAKPOINT = 768;

const MainLayout = ({ children }: { children?: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuToggle = () => setIsMobileMenuOpen((prev) => !prev);
  const handleClose = () => setIsMobileMenuOpen(false);

  return (
    <AdminDetailProvider>
      <div className="flex h-screen bg-surface-dashboard overflow-hidden">
        <Sidebar isMobileOpen={isMobileMenuOpen} onClose={handleClose} />

        <div
          className="flex flex-col flex-1 min-w-0 overflow-hidden"
          style={{
            transition: "flex 300ms ease-in-out, width 300ms ease-in-out",
          }}
        >
          <AdminHeader onMenuToggle={handleMenuToggle} />
          <main className="flex-1 overflow-auto px-6 py-5">{children || <Outlet />}</main>
        </div>
      </div>
    </AdminDetailProvider>
  );
};

export default MainLayout;
