import { apiRequest } from "./client";

export const sessionsApi = {
  getAll: async (page = 1, limit = 20) => {
    return apiRequest(`/sessions?page=${page}&limit=${limit}`);
  },

  create: async (data: { workoutId: string; completedAt?: string; notes?: string }) => {
    return apiRequest("/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};