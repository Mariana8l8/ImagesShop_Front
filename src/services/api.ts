import axios from "axios";
import type {
  Category,
  Image,
  User,
  Order,
  OrderItem,
  PurchaseHistory,
  Tag,
} from "../types";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const categoriesAPI = {
  getAll: () => api.get<Category[]>("/Categories"),
  getById: (id: string) => api.get<Category>(`/Categories/${id}`),
  create: (data: Category) => api.post("/Categories", data),
  update: (id: string, data: Category) => api.put(`/Categories/${id}`, data),
  delete: (id: string) => api.delete(`/Categories/${id}`),
};

export const imagesAPI = {
  getAll: () => api.get<Image[]>("/Images"),
  getById: (id: string) => api.get<Image>(`/Images/${id}`),
  create: (data: Image) => api.post("/Images", data),
  update: (id: string, data: Image) => api.put(`/Images/${id}`, data),
  delete: (id: string) => api.delete(`/Images/${id}`),
};

export const usersAPI = {
  getAll: () => api.get<User[]>("/Users"),
  getById: (id: string) => api.get<User>(`/Users/${id}`),
  create: (data: User) => api.post("/Users", data),
  update: (id: string, data: User) => api.put(`/Users/${id}`, data),
  delete: (id: string) => api.delete(`/Users/${id}`),
};

export const ordersAPI = {
  getAll: () => api.get<Order[]>("/Order"),
  getById: (id: string) => api.get<Order>(`/Order/${id}`),
  create: (data: Order) => api.post("/Order", data),
  update: (id: string, data: Order) => api.put(`/Order/${id}`, data),
  delete: (id: string) => api.delete(`/Order/${id}`),
};

export const orderItemsAPI = {
  getAll: () => api.get<OrderItem[]>("/OrderItem"),
  getById: (id: string) => api.get<OrderItem>(`/OrderItem/${id}`),
  getByOrderId: (orderId: string) =>
    api.get<OrderItem[]>(`/OrderItem/order/${orderId}`),
  create: (data: OrderItem) => api.post("/OrderItem", data),
  update: (id: string, data: OrderItem) => api.put(`/OrderItem/${id}`, data),
  delete: (id: string) => api.delete(`/OrderItem/${id}`),
};

export const purchasesAPI = {
  getAll: () => api.get<PurchaseHistory[]>("/Purchases"),
  getById: (id: string) => api.get<PurchaseHistory>(`/Purchases/${id}`),
  create: (data: PurchaseHistory) => api.post("/Purchases", data),
  delete: (id: string) => api.delete(`/Purchases/${id}`),
};

export const tagsAPI = {
  getAll: () => api.get<Tag[]>("/Tags"),
  getById: (id: string) => api.get<Tag>(`/Tags/${id}`),
  create: (data: Tag) => api.post("/Tags", data),
  update: (id: string, data: Tag) => api.put(`/Tags/${id}`, data),
  delete: (id: string) => api.delete(`/Tags/${id}`),
};

export default api;
