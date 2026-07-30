import { apiRequest } from "./client";

export const profileApi = {
  get: async () => {
    return apiRequest("/profile");
  },

  create: async (data: {
    age: number;
    weight: number;
    height: number;
    goal: string;
    level: string;
    unitSystem?: string;
    trainingDays?: string;
  }) => {
    return apiRequest("/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (data: {
    age?: number;
    weight?: number;
    height?: number;
    goal?: string;
    level?: string;
    unitSystem?: string;
    trainingDays?: string;
  }) => {
    return apiRequest("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};