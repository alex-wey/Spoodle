import { Redirect } from "expo-router";
import { useAuthStore } from "./store/auth";

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }
  
  return <Redirect href="/(auth)/landing" />;
}
