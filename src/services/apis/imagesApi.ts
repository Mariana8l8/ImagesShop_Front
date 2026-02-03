import { api } from "../http";
import type { Image } from "../../types";

export const imagesAPI = {
  getAll: () => api.get<Image[]>("/Images"),
  getById: (id: string) => api.get<Image>(`/Images/${id}`),
  create: (data: Omit<Image, "id">) => api.post("/Images", data),
  update: (id: string, data: Image) => api.put(`/Images/${id}`, data),
  delete: (id: string) => api.delete(`/Images/${id}`),
};
