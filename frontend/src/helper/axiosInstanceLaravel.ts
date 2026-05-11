import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { APP_ROUTES } from "@/routes/config";

const API_URL_LARAVEL =
  import.meta.env.VITE_LARAVEL_API_URL || "http://localhost:8000/api";

interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

interface IBaseResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

const axiosInstanceLaravel = axios.create({
  baseURL: API_URL_LARAVEL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
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

axiosInstanceLaravel.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("customerToken") ||
      localStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstanceLaravel.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstanceLaravel(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken =
        localStorage.getItem("adminRefreshToken") ||
        localStorage.getItem("customerRefreshToken") ||
        localStorage.getItem("refreshToken");

      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        // Only clear if we were expecting a token-based session
        if (localStorage.getItem("adminToken") || localStorage.getItem("customerToken")) {
          localStorage.clear();
          window.location.href = APP_ROUTES.LOGIN;
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL_LARAVEL}/auth/refresh-token`, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        localStorage.setItem("adminToken", accessToken);
        localStorage.setItem("customerToken", accessToken);
        if (newRefreshToken) {
          localStorage.setItem("adminRefreshToken", newRefreshToken);
          localStorage.setItem("customerRefreshToken", newRefreshToken);
        }

        axiosInstanceLaravel.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        isRefreshing = false;
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosInstanceLaravel(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.clear();
        window.location.href = APP_ROUTES.LOGIN;
        return Promise.reject(refreshError);
      }
    }

    // Global error message handling
    const errorMessage =
      (error.response?.data as IBaseResponse)?.message ||
      (error.response?.data as IBaseResponse)?.error ||
      error.message ||
      "An unexpected error occurred.";

    if (error.response?.status !== 401 && !(error.response?.data as IBaseResponse)?.errors) {
      toast.error(errorMessage);
    } else if (
      !localStorage.getItem("adminRefreshToken") &&
      !localStorage.getItem("customerRefreshToken") &&
      !localStorage.getItem("refreshToken")
    ) {
      // Only show toast if refresh token is missing and it's a 401
    }

    return Promise.reject(error);
  }
);

export default axiosInstanceLaravel;