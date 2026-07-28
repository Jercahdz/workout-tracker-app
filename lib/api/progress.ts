import { apiRequest } from "./client";

export const progressApi = {
  getAll: async (page = 1, limit = 20) => {
    return apiRequest(`/progress?page=${page}&limit=${limit}`);
  },

  log: async (data: { weight: number; date?: string; notes?: string }) => {
    return apiRequest("/progress/log", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};