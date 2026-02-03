import { api } from "../http";
import type { Category } from "../../types";

export const categoriesAPI = {
  getAll: () => api.get<Category[]>("/Categories"),
  getById: (id: string) => api.get<Category>(`/Categories/${id}`),
  create: (data: Pick<Category, "name">) => api.post("/Categories", data),
  update: (id: string, data: Category) => api.put(`/Categories/${id}`, data),
  delete: (id: string) => api.delete(`/Categories/${id}`),
};
