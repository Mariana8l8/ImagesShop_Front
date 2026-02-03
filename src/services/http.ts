import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { AuthResponse, AuthTokens } from "../types";

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    _retry?: boolean;
  }
  interface InternalAxiosRequestConfig {
    skipAuthRefresh?: boolean;
    _retry?: boolean;
  }
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7147/api";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let inMemoryTokens: AuthTokens | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let logoutHandler: (() => void) | null = null;

const ACCESS_KEY = "imageshop_access_token";
const REFRESH_KEY = "imageshop_refresh_token";

const persistTokens = (tokens: AuthTokens | null) => {
  if (!tokens?.accessToken) {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    return;
  }
  sessionStorage.setItem(ACCESS_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    sessionStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  } else {
    sessionStorage.removeItem(REFRESH_KEY);
  }
};

export const loadPersistedTokens = (): AuthTokens | null => {
  const accessToken = sessionStorage.getItem(ACCESS_KEY);
  const refreshToken = sessionStorage.getItem(REFRESH_KEY);
  if (accessToken) {
    inMemoryTokens = { accessToken, refreshToken };
    return inMemoryTokens;
  }
  return null;
};

export const setAuthTokens = (tokens: AuthTokens | null) => {
  inMemoryTokens = tokens;
  persistTokens(tokens);
};

export const registerLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

const getAccessToken = () => inMemoryTokens?.accessToken ?? null;
const getRefreshToken = () => inMemoryTokens?.refreshToken ?? null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (isRefreshing) return refreshPromise;

  isRefreshing = true;
  refreshPromise = api
    .post<AuthResponse>("/Auth/refresh", null, { skipAuthRefresh: true })
    .then((res) => {
      const data = (res.data ?? {}) as Partial<AuthResponse>;
      const accessToken = data.accessToken ?? null;
      if (!accessToken) return null;
      const nextTokens: AuthTokens = {
        accessToken,
        refreshToken: data.refreshToken ?? getRefreshToken() ?? null,
      };
      setAuthTokens(nextTokens);
      return accessToken;
    })
    .catch((err) => {
      setAuthTokens(null);
      logoutHandler?.();
      console.error("Refresh token failed", err);
      return null;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = getAccessToken();
  if (accessToken && config.headers) {
    if (config.headers.set) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    } else if (!config.headers.Authorization) {
      config.headers = {
        ...(config.headers as Record<string, unknown>),
        Authorization: `Bearer ${accessToken}`,
      } as InternalAxiosRequestConfig["headers"];
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as AxiosError;
    const originalRequest = (axiosError.config ??
      {}) as InternalAxiosRequestConfig;
    const isUnauthorized = axiosError.response?.status === 401;
    const alreadyRetried = originalRequest._retry;
    const skipRefresh = originalRequest.skipAuthRefresh;

    if (isUnauthorized && !alreadyRetried && !skipRefresh) {
      originalRequest._retry = true;
      const newAccess = await refreshAccessToken();
      if (newAccess) {
        if (originalRequest.headers?.set) {
          originalRequest.headers.set("Authorization", `Bearer ${newAccess}`);
        } else {
          originalRequest.headers = {
            ...(originalRequest.headers ?? {}),
            Authorization: `Bearer ${newAccess}`,
          } as InternalAxiosRequestConfig["headers"];
        }
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export { api };
