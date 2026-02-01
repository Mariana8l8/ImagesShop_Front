import { api } from "../http";
import type { OrderItem } from "../../types";

export const orderItemsAPI = {
  getAll: () => api.get<OrderItem[]>("/OrderItems"),
  getById: (id: string) => api.get<OrderItem>(`/OrderItems/${id}`),
  getByOrderId: (orderId: string) =>
    api.get<OrderItem[]>(`/OrderItems/order/${orderId}`),
  create: (data: OrderItem) => api.post("/OrderItems", data),
  update: (id: string, data: OrderItem) => api.put(`/OrderItems/${id}`, data),
  delete: (id: string) => api.delete(`/OrderItems/${id}`),
};
