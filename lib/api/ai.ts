import { apiRequest } from "./client";

export const aiApi = {
  generateRoutine: async () => {
    const response = await apiRequest("/ai/generate-routine", { method: "POST" });
    try {
      const parsed = typeof response.routine === "string"
        ? JSON.parse(response.routine)
        : response.routine;
      return { routine: parsed, raw: response.routine };
    } catch {
      return { routine: null, raw: response.routine };
    }
  },
};