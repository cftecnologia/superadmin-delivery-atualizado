import axios from "axios";
import { getToken, removeToken } from "./auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://mercado-backend-309216499283.southamerica-east1.run.app/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      removeToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
