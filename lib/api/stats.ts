import { apiRequest } from "./client";

export const statsApi = {
  get: async () => {
    return apiRequest("/stats");
  },

  useShield: async () => {
    return apiRequest("/stats/use-shield", { method: "POST" });
  },
};