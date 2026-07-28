import { apiRequest } from "./client";

export const workoutsApi = {
  getAll: async (page = 1, limit = 20) => {
    return apiRequest(`/workouts?page=${page}&limit=${limit}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/workouts/${id}`);
  },

  create: async (data: {
    name: string;
    scheduledAt?: string;
    exercises: { exerciseId: string; sets: number; reps: number; weight?: number }[];
  }) => {
    return apiRequest("/workouts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    name?: string;
    scheduledAt?: string;
    exercises?: { exerciseId: string; sets: number; reps: number; weight?: number }[];
  }) => {
    return apiRequest(`/workouts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/workouts/${id}`, { method: "DELETE" });
  },
};