import { apiRequest } from "./client";

export const aiApi = {
  generateRoutine: async () => {
    const response = await apiRequest("/ai/generate-routine", { method: "POST" });
    try {
      let text = typeof response.routine === "string"
        ? response.routine
        : JSON.stringify(response.routine);

      const thinkEnd = text.lastIndexOf("</think>");
      if (thinkEnd !== -1) {
        text = text.substring(thinkEnd + 8);
      }

      text = text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/gi, "")
        .trim();

      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        text = text.substring(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(text);
      return { routine: parsed, raw: response.routine };
    } catch {
      return { routine: null, raw: response.routine };
    }
  },
};