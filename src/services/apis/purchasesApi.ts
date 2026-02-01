import { api } from "../http";
import type { PurchaseHistory } from "../../types";

export const purchasesAPI = {
  getAll: () => api.get<PurchaseHistory[]>("/Purchases"),
  getById: (id: string) => api.get<PurchaseHistory>(`/Purchases/${id}`),
  create: (data: PurchaseHistory) => api.post("/Purchases", data),
  delete: (id: string) => api.delete(`/Purchases/${id}`),
  exportXlsx: () =>
    api.get<Blob>("/Purchases/export", { responseType: "blob" }),
};
