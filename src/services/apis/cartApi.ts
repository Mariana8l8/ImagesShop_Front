import { api } from "../http";
import type { AddToCartRequest, CartResponse } from "../../types";

export const cartAPI = {
  get: () => api.get<CartResponse>("/Cart"),
  clear: () => api.delete("/Cart"),
  addItem: (imageId: string) =>
    api.post("/Cart/items", { imageId } as AddToCartRequest),
  removeItem: (imageId: string) => api.delete(`/Cart/items/${imageId}`),
};
