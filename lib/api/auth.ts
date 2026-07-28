import { apiRequest } from "./client";

export const authApi = {
  register: async (email: string, password: string) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  login: async (email: string, password: string) => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async (refreshToken: string) => {
    return apiRequest("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  getMe: async () => {
    return apiRequest("/users/me");
  },
};