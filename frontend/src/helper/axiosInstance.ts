import { APP_ROUTES } from "@/routes/config";
import { CUSTOMER_AUTH_TOKEN_KEY } from "@/utils/constants";
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

interface IBaseResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("partnerToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem(CUSTOMER_AUTH_TOKEN_KEY);
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const redirectTo = window.location.pathname.includes("admin")
      ? APP_ROUTES.ADMIN_LOGIN
      : window.location.pathname.includes("partner")
      ? APP_ROUTES.SERVICE_PARTNER_LOGIN
      : APP_ROUTES.LOGIN;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        isRefreshing = false;
        const errorMessage =
          (error.response?.data as IBaseResponse)?.message ||
          (error.response?.data as IBaseResponse)?.error ||
          error.message ||
          "An unexpected error occurred.";

        toast.error(errorMessage);
        localStorage.clear();
        if (errorMessage === "Forbidden: Invalid or expired token") {
          window.location.href = redirectTo;
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        localStorage.setItem("accessToken", accessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        isRefreshing = false;
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.clear();
        if (refreshError === "Forbidden: Invalid or expired token") {
          window.location.href = redirectTo;
        }
        return Promise.reject(refreshError);
      }
    }

    // Global error message handling
    const errorMessage =
      (error.response?.data as IBaseResponse)?.message ||
      (error.response?.data as IBaseResponse)?.error ||
      error.message ||
      "An unexpected error occurred.";

    if (
      error.response?.status !== 401 &&
      !(error.response?.data as IBaseResponse)?.errors
    ) {
      if (errorMessage === "Forbidden: Invalid or expired token") {
        localStorage.clear();
        window.location.href = redirectTo;
      }
      toast.error(errorMessage);
    } else if (!localStorage.getItem("refreshToken")) {
      // Only show toast if refresh token is missing and it's a 401
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
