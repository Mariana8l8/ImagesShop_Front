import { api } from "../http";
import type { Order } from "../../types";

export const ordersAPI = {
  getAll: () => api.get<Order[]>("/Orders"),
  getById: (id: string) => api.get<Order>(`/Orders/${id}`),
  create: (data: Order) => api.post("/Orders", data),
  update: (id: string, data: Order) => api.put(`/Orders/${id}`, data),
  delete: (id: string) => api.delete(`/Orders/${id}`),
  buyImage: (imageId: string) => api.post(`/Orders/buy/${imageId}`),
};
