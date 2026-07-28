import { apiRequest } from "./client";

export const exercisesApi = {
  getAll: async (page = 1, limit = 20) => {
    return apiRequest(`/exercises?page=${page}&limit=${limit}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/exercises/${id}`);
  },
};