import { Tabs, Redirect } from "expo-router";
import { Dog, BotMessageSquare, User, Calendar } from "lucide-react-native";
import { useAuth } from '@clerk/clerk-expo';
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const insets = useSafeAreaInsets();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return null;
  }

  // Redirect to auth if not authenticated
  if (!isSignedIn) {
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
          tabBarIcon: ({ color }) => <Dog size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: "Chat",
          href: "/(tabs)/chat",
          tabBarIcon: ({ color }) => <BotMessageSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks/index"
        options={{
          title: "Tasks",
          href: "/(tabs)/tasks",
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          href: "/(tabs)/profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pets/[id]/profile"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="pets/[id]/docs/index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="pets/[id]/docs/[category]"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="pets/[id]/docs/upload"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="pets/add"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile/edit"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />
    </Tabs>
  );
}


