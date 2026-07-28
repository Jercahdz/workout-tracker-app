import { apiRequest } from "./client";

export const achievementsApi = {
  getAll: async () => {
    return apiRequest("/achievements");
  },
};