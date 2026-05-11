import { useState, useEffect } from "react";

import { ROLES } from "@/enums/roles.enum";

export const useAuth = () => {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const partnerToken = localStorage.getItem("partnerToken");
    const accessToken = localStorage.getItem("accessToken");
    const adminInfoRaw = localStorage.getItem("admininfo");
    const partnerInfoRaw = localStorage.getItem("partnerinfo");

    const token = adminToken || partnerToken || accessToken;

    if (token) {
      setIsAuthenticated(true);

      if (adminInfoRaw) {
        try {
          const userData = JSON.parse(adminInfoRaw);
          setUser(userData);
          setIsAdmin(
            userData?.role === ROLES.ADMIN ||
              userData?.role === ROLES.SUPER_ADMIN ||
              Boolean(userData?.is_super_admin)
          );
          setIsPartner(userData?.role === ROLES.SERVICE_PARTNER);
        } catch (err) {
          console.error("Failed to parse admin info", err);
        }
      } else if (partnerInfoRaw) {
        try {
          const userData = JSON.parse(partnerInfoRaw);
          setUser(userData);
          setIsPartner(userData?.role === ROLES.SERVICE_PARTNER);
        } catch (err) {
          console.error("Failed to parse partner info", err);
        }
      }
    }
  }, []);

  return { user, isAdmin, isPartner, isAuthenticated };
};
