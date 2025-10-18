import { Tabs } from "expo-router";
import { Home, Dog, Calendar, User } from "lucide-react-native";
import { useAuthStore } from "../store/auth";
import { Redirect } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const insets = useSafeAreaInsets();

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/landing" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          // Slightly reduced padding for iPhone while respecting safe area
          paddingBottom: Platform.OS === "ios" ? Math.max(insets.bottom - 2, 6) : 8,
          paddingTop: 6,
          height: Platform.OS === "ios" ? 56 + Math.max(insets.bottom - 2, 6) : 68,
        },
        headerShown: false,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Home",
          href: "/(tabs)/home",
          tabBarIcon: ({ color, size }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pets/index"
        options={{
          title: "Pets",
          href: "/(tabs)/pets",
          tabBarIcon: ({ color, size }) => <Dog size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments/index"
        options={{
          title: "Appointments",
          href: "/(tabs)/appointments",
          tabBarIcon: ({ color, size }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          href: "/(tabs)/profile",
          tabBarIcon: ({ color, size }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}


