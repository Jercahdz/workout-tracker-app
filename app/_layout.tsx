import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/authStore";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { authApi } from "../lib/api/auth";
import * as SecureStore from "expo-secure-store";

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, loadAuth, setUser, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const init = async () => {
      await loadAuth();
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        try {
          const user = await authApi.getMe();
          setUser(user);
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <RootLayoutNav />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}