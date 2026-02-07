import { api } from "../http";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  VerifyEmailCodeRequest,
  CompleteRegistrationRequest,
  ResendVerificationCodeRequest,
  ChangePasswordRequest,
} from "../../types";

export const authAPI = {
  register: (data: RegisterRequest) => api.post("/Auth/register", data),
  completeRegistration: (data: CompleteRegistrationRequest) =>
    api.post("/Auth/complete-registration", data),
  verifyEmail: (data: VerifyEmailCodeRequest) =>
    api.post("/Auth/verify-email", data),
  resendVerificationCode: (data: ResendVerificationCodeRequest) =>
    api.post("/Auth/resend-verification-code", data),
  login: (data: LoginRequest) => api.post<AuthResponse>("/Auth/login", data),
  refresh: () =>
    api.post<AuthResponse>("/Auth/refresh", null, { skipAuthRefresh: true }),
  logout: () => api.post("/Auth/logout", null, { skipAuthRefresh: true }),
  changePassword: (data: ChangePasswordRequest) =>
    api.post("/Auth/change-password", data),
};
