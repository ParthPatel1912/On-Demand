import type { PropsWithChildren } from "react";

import { Outlet } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

const HomePageLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <Header />
      {children || <Outlet />}
      <Footer />
    </div>
  );
};

export default HomePageLayout;
