import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "./store/auth";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const initAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize auth state and hide splash screen
    const prepare = async () => {
      try {
        console.log('[App] Starting initialization...');
        await initAuth();
        console.log('[App] Auth initialized successfully');
      } catch (e) {
        console.error("Failed to initialize auth:", e);
        // Don't crash the app, just continue without auth
        console.log('[App] Continuing without auth initialization');
      } finally {
        try {
          await SplashScreen.hideAsync();
          console.log('[App] Splash screen hidden');
        } catch (splashError) {
          console.error('[App] Error hiding splash:', splashError);
        }
      }
    };

    prepare();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
