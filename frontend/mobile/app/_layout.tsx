import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { clerkApiClient } from './lib/api';
import Constants from 'expo-constants';

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

// Component to initialize API client with auth token
function ApiInitializer({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set up the API client with the token getter from Clerk
    if (getToken) {
      clerkApiClient.setTokenGetter(getToken);
    }
  }, [getToken]);

  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a short delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Read Clerk publishable key from env, with fallback to app config
  const clerkPublishableKey =
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    (Constants?.expoConfig?.extra as any)?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    // Final fallback to the provided key to unblock dev if env/config fail
    'pk_test_aW50ZXJuYWwtaGVycmluZy00MS5jbGVyay5hY2NvdW50cy5kZXYk';

  if (!clerkPublishableKey) {
    // Helpful diagnostic in dev
    console.warn('[Clerk] Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY at runtime');
  } else {
    // Minimal confirmation without leaking the full key
    console.log('[Clerk] Publishable key loaded:', clerkPublishableKey.slice(0, 12) + '...');
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <ApiInitializer>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </ApiInitializer>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
