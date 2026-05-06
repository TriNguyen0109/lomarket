import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRootNavigationState, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import { isAuthenticated, loadAuthData } from "@/data";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [hasNavigated, setHasNavigated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth data from AsyncStorage when app starts
  useEffect(() => {
    loadAuthData().then(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    // Wait for auth data to load before navigating
    if (isLoading) return;
    if (!rootNavigationState?.key || hasNavigated) return;

    // Sử dụng setTimeout(0) để trì hoãn việc điều hướng cho đến khi Navigator đã sẵn sàng.
    // Điều này giải quyết lỗi "navigation before mounting the root layout component".
    const timeout = setTimeout(() => {
      if (!isAuthenticated()) {
        router.replace("/(auth)/login");
      } else {
        router.replace("/(tabs)");
      }
      setHasNavigated(true);
    }, 0);

    return () => clearTimeout(timeout);
  }, [rootNavigationState?.key, hasNavigated, isLoading]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
