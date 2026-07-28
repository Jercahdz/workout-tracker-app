import { apiRequest } from "./client";

export const aiApi = {
  generateRoutine: async () => {
    return apiRequest("/ai/generate-routine", { method: "POST" });
  },
};