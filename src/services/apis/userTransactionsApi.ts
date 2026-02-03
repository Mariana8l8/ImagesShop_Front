import { api } from "../http";
import type { UserTransaction } from "../../types";

export const userTransactionsAPI = {
  getMine: () => api.get<UserTransaction[]>("/UserTransactions/me"),
};
