import axios from "axios";
import { getRefreshToken, getToken, removeToken, setRefreshToken, setToken } from "./auth";

let refreshRequest: Promise<string> | null = null;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://mercado-backend-309216499283.southamerica-east1.run.app/api",
});

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Refresh token unavailable");
  }

  if (!refreshRequest) {
    refreshRequest = axios.post(`${api.defaults.baseURL}/auth/refresh`, {
      refresh_token: refreshToken,
    }).then((response) => {
      if (!response.data?.access_token) {
        throw new Error("Invalid refreshed session");
      }

      setToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
      return response.data.access_token as string;
    }).finally(() => {
      refreshRequest = null;
    });
  }

  return refreshRequest;
}

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
        const accessToken = await refreshAccessToken();
        error.config.headers.Authorization = `Bearer ${accessToken}`;
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
