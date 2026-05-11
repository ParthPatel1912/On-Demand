import {
  CUSTOMER_AUTH_TOKEN_KEY,
  CUSTOMER_AUTH_USER_KEY,
  ADMIN_AUTH_TOKEN_KEY,
  ADMIN_AUTH_USER_KEY,
  PARTNER_AUTH_TOKEN_KEY,
  PARTNER_AUTH_USER_KEY,
  ACCESS_AUTH_TOKEN_KEY
} from "./constants";

export type AuthRole = "customer" | "admin" | "partner" | "default";

/** Helper to get role-specific storage keys */
export const getAuthKeys = (role: AuthRole) => {
  switch (role) {
    case "admin":
      return { token: ADMIN_AUTH_TOKEN_KEY, user: ADMIN_AUTH_USER_KEY };
    case "partner":
      return { token: PARTNER_AUTH_TOKEN_KEY, user: PARTNER_AUTH_USER_KEY };
    case "customer":
      return { token: CUSTOMER_AUTH_TOKEN_KEY, user: CUSTOMER_AUTH_USER_KEY };
    default:
      // Fallback or generic token
      return { token: ACCESS_AUTH_TOKEN_KEY, user: "userInfo" };
  }
};

/**
 * Super generic helper to save Tokens & User objects 
 * for any role across the entire app!
 */
export const saveAuthData = (role: AuthRole, token: string, user: unknown) => {
  const keys = getAuthKeys(role);
  localStorage.setItem(keys.token, token);
  localStorage.setItem(keys.user, JSON.stringify(user));
};

export const getAuthToken = (role: AuthRole) => {
  const keys = getAuthKeys(role);
  return localStorage.getItem(keys.token);
};

export const getAuthUser = (role: AuthRole) => {
  const keys = getAuthKeys(role);
  const user = localStorage.getItem(keys.user);
  return user ? JSON.parse(user) : null;
};

export const clearAuthData = (role: AuthRole) => {
  const keys = getAuthKeys(role);
  localStorage.removeItem(keys.token);
  localStorage.removeItem(keys.user);
};

export const isRoleLoggedIn = (role: AuthRole) => {
  return !!getAuthToken(role);
};

// ----------------------------------------------------
// Kept for backward compatibility to avoid breaking existing imports
// ----------------------------------------------------
export const saveCustomerAuth = (token: string, user: unknown) => saveAuthData("customer", token, user);
export const getCustomerToken = () => getAuthToken("customer");
export const getCustomerUser = () => getAuthUser("customer");
export const clearCustomerAuth = () => clearAuthData("customer");
export const isCustomerLoggedIn = () => isRoleLoggedIn("customer");