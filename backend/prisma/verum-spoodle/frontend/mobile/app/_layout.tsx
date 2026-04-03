import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { View, Text } from "react-native";
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
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      console.log('[DEBUG] ApiInitializer - Waiting for Clerk to load...');
      return;
    }
    
    if (!isSignedIn) {
      console.log('[DEBUG] ApiInitializer - User not signed in, clearing token getter');
      clerkApiClient.clearTokenGetter();
      return;
    }
    
    if (getToken) {
      const tokenGetter = async (): Promise<string | null> => {
        try {
          const token = await getToken();
          if (token) {
            return token;
          }
        } catch (error) {
          console.error('[DEBUG] Token retrieval failed:', error);
        }
        return null;
      };
      clerkApiClient.setTokenGetter(tokenGetter);
      console.log('[DEBUG] ApiInitializer - Token getter configured');
      
      // Test token retrieval
      tokenGetter().then((token) => {
        console.log('[DEBUG] Token test result:', token ? `Token exists (length: ${token.length})` : 'Token is NULL');
      }).catch((error) => {
        console.error('[DEBUG] Token test failed:', error);
      });
    } else {
      console.warn('[DEBUG] ApiInitializer - getToken is not available');
      clerkApiClient.clearTokenGetter();
    }
  }, [getToken, isSignedIn, isLoaded]);

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
    (Constants?.expoConfig?.extra as any)?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Read optional custom Clerk frontend API domain
  const clerkFrontendApi =
    process.env.EXPO_PUBLIC_CLERK_FRONTEND_API ||
    (Constants?.expoConfig?.extra as any)?.EXPO_PUBLIC_CLERK_FRONTEND_API;

  if (!clerkPublishableKey) {
    // Helpful diagnostic in dev
    console.error('[Clerk] Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY at runtime - app will not work');
    // Return an error view instead of crashing
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#E75325', textAlign: 'center' }}>
          Configuration Error: Missing Clerk publishable key.{'\n'}
          Please check your .env file.
        </Text>
      </View>
    );
  }

  // Log configuration in development only
  if (__DEV__) {
    console.log('[Clerk] Publishable key loaded:', clerkPublishableKey.slice(0, 12) + '...');
    if (clerkFrontendApi) {
      console.log('[Clerk] Using custom frontend API:', clerkFrontendApi);
    }
  }

  // Prepare Clerk provider options
  const clerkOptions: any = {
    publishableKey: clerkPublishableKey,
    tokenCache: tokenCache,
  };

  // Add frontendApi if custom domain is configured
  if (clerkFrontendApi) {
    clerkOptions.frontendApi = clerkFrontendApi;
  }

  return (
    <ClerkProvider {...clerkOptions}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <ApiInitializer>
            <StatusBar style="dark" />
            <Stack 
              screenOptions={{ 
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' }
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="support/index" />
            </Stack>
          </ApiInitializer>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
