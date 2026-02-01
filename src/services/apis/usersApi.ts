import { api } from "../http";
import type { User } from "../../types";

export const usersAPI = {
  getAll: () => api.get<User[]>("/Users"),
  getById: (id: string) => api.get<User>(`/Users/${id}`),
  create: (data: User) => api.post("/Users", data),
  update: (id: string, data: User) => api.put(`/Users/${id}`, data),
  delete: (id: string) => api.delete(`/Users/${id}`),
  me: () => api.get<User>("/Users/me"),
  topUp: (amount: number) => api.post<User>("/Users/topup", { amount }),
};
