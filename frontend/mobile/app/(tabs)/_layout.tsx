import { Tabs } from "expo-router";
import { Dog, MessageCircle, User } from "lucide-react-native";
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
        tabBarActiveTintColor: "#4559A7",
        tabBarInactiveTintColor: "#ADD7EB",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#ADD7EB",
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
        name="pets/index"
        options={{
          title: "Pets",
          href: "/(tabs)/pets",
          tabBarIcon: ({ color, size }) => <Dog size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: "Chatbot",
          href: "/(tabs)/chat",
          tabBarIcon: ({ color, size }) => <MessageCircle size={24} color={color} />,
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
        name="pets/[id]/profile"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="pets/[id]/docs/index"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="pets/[id]/docs/[category]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="pets/[id]/docs/upload"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="pets/add"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="profile/settings/index"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="profile/edit"
        options={{
          href: null, // Hide from tab bar - accessible only via pen icon
        }}
      />
    </Tabs>
  );
}


