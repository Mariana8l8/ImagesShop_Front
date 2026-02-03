import { api } from "../http";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../../types";

export const authAPI = {
  register: (data: RegisterRequest) => api.post("/Auth/register", data),
  login: (data: LoginRequest) => api.post<AuthResponse>("/Auth/login", data),
  refresh: () =>
    api.post<AuthResponse>("/Auth/refresh", null, { skipAuthRefresh: true }),
  logout: () => api.post("/Auth/logout", null, { skipAuthRefresh: true }),
};
