import * as SecureStore from "expo-secure-store";

export const API_URL = "https://workouttrackerapi-production.up.railway.app";

const getAccessToken = async () => {
  return await SecureStore.getItemAsync("accessToken");
};

const getRefreshToken = async () => {
  return await SecureStore.getItemAsync("refreshToken");
};

const refreshAccessToken = async () => {
  const refreshToken = await getRefreshToken();
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    throw new Error("SESSION_EXPIRED");
  }

  const data = await response.json();
  await SecureStore.setItemAsync("accessToken", data.accessToken);
  return data.accessToken;
};

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<any> => {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry) {
    try {
      const newToken = await refreshAccessToken();
      headers.Authorization = `Bearer ${newToken}`;
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
      if (!retryResponse.ok) {
        const error = await retryResponse.json();
        throw new Error(error.message ?? "Request failed");
      }
      return retryResponse.json();
    } catch {
      throw new Error("SESSION_EXPIRED");
    }
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Request failed");
  }

  if (response.status === 204) return null;

  return response.json();
};