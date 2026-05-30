import axios from "axios";
import { getRefreshToken, getToken, removeToken, setRefreshToken, setToken } from "./auth";

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
  async (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    const isRefreshRequest = error.config?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !isLoginRequest && !isRefreshRequest && !error.config?._sessionRetry && getRefreshToken()) {
      error.config._sessionRetry = true;
      try {
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refresh_token: getRefreshToken(),
        });
        setToken(response.data.access_token);
        setRefreshToken(response.data.refresh_token);
        error.config.headers.Authorization = `Bearer ${response.data.access_token}`;
        return api(error.config);
      } catch {
        removeToken();
        window.location.href = "/login";
      }
    } else if (error.response?.status === 401 && !isLoginRequest) {
      removeToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
