import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuthStore } from "./store/auth";
import ErrorBoundary from "./components/ErrorBoundary";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  console.log('[App] Could not prevent splash screen auto-hide');
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize app
    const prepare = async () => {
      try {
        console.log('[App] Starting initialization...');
        
        // Try to initialize auth, but don't crash if it fails
        try {
          const initAuth = useAuthStore.getState().initialize;
          await initAuth();
          console.log('[App] Auth initialized successfully');
        } catch (authError) {
          console.error('[App] Auth initialization failed:', authError);
          // Continue anyway - user can still use the app
        }
        
        setIsReady(true);
        console.log('[App] App ready');
      } catch (e) {
        console.error("[App] Critical initialization error:", e);
        setError(String(e));
        setIsReady(true); // Still show the app
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

  // Show loading state
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading Spoodle...</Text>
      </View>
    );
  }

  // Show error state if critical error occurred
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#d32f2f' }}>
          Initialization Error
        </Text>
        <Text style={{ color: '#666', textAlign: 'center' }}>
          {error}
        </Text>
        <Text style={{ marginTop: 20, color: '#666', textAlign: 'center' }}>
          Please restart the app or contact support.
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
