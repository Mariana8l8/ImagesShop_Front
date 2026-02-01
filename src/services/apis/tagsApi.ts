import { api } from "../http";
import type { Tag } from "../../types";

export const tagsAPI = {
  getAll: () => api.get<Tag[]>("/Tags"),
  getById: (id: string) => api.get<Tag>(`/Tags/${id}`),
  create: (data: Tag) => api.post("/Tags", data),
  update: (id: string, data: Tag) => api.put(`/Tags/${id}`, data),
  delete: (id: string) => api.delete(`/Tags/${id}`),
};
