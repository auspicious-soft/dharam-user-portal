import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { logout } from "@/auth/Authenticated";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("authToken");
  const hasAuthHeader =
    Boolean(
      (config.headers as { Authorization?: string | undefined })?.Authorization
    ) ||
    Boolean(
      (config.headers as { authorization?: string | undefined })?.authorization
    );
config.headers["x-user-type"] = "USER"
  if (token && !hasAuthHeader) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      logout();
    }

    return Promise.reject(error);
  }
);

export default api;
