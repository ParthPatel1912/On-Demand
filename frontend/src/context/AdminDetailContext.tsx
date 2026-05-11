import React, { createContext, useContext, useEffect, useState } from "react";

import type { AdminDetail, AdminDetailContextType, PartnerDetail } from ".";
import axiosInstanceLaravel from "@/helper/axiosInstanceLaravel";
import { useAuth } from "@/hooks/useAuth";
import { getPartnerProfile } from "@/api/partnerProfile";

const AdminDetailContext = createContext<AdminDetailContextType | undefined>(
  undefined
);

export const AdminDetailProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [adminDetail, setAdminDetail] = useState<AdminDetail | null>(null);
  const [partnerDetail, setPartnerDetail] = useState<PartnerDetail | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const { isAdmin, isPartner } = useAuth();

  const fetchAdminDetail = async () => {
    try {
      setLoading(true);
      // const res = await axiosInstance.get("/admin/profile");
      const res = await axiosInstanceLaravel.get("/admin/profile");
      setAdminDetail(res.data.data);
    } catch (err) {
      console.error("Failed to fetch admin detail", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminDetail();
    }
  }, [isAdmin]);

  const fetchPartnerDetail = async () => {
    try {
      const res = await getPartnerProfile();
      if (res.data?.data) {
        setPartnerDetail(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch partner profile", err);
    }
  };

  useEffect(() => {
    if (isPartner) {
      fetchPartnerDetail();
    }
  }, [isPartner]);

  return (
    <AdminDetailContext.Provider
      value={{
        adminDetail,
        setAdminDetail,
        loading,
        refetchAdminDetail: fetchAdminDetail,
        partnerDetail,
        setPartnerDetail,
        refetchPartnerDetail: fetchPartnerDetail,
      }}
    >
      {children}
    </AdminDetailContext.Provider>
  );
};

export const useAdminDetail = () => {
  const context = useContext(AdminDetailContext);
  if (!context) {
    throw new Error("useAdminDetail must be used within AdminDetailProvider");
  }
  return context;
};
