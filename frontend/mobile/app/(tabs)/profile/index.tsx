import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/auth";
import { useRouter } from "expo-router";
import { LogOut, Settings, Mail, Phone, MapPin } from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/landing");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile/settings")}
          style={styles.settingsButton}
        >
          <Settings size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Text>
            </View>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.contactCard}>
              <View style={styles.contactItem}>
                <Mail size={20} color="#6B7280" />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactValue}>{user?.email || "alex.johnson@email.com"}</Text>
                  <Text style={styles.contactLabel}>Email</Text>
                </View>
              </View>

              <View style={styles.contactItem}>
                <Phone size={20} color="#6B7280" />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactValue}>+1 (555) 123-4567</Text>
                  <Text style={styles.contactLabel}>Phone</Text>
                </View>
              </View>

              <View style={styles.contactItem}>
                <MapPin size={20} color="#6B7280" />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactValue}>123 Pet Lane, Animal City, AC 12345</Text>
                  <Text style={styles.contactLabel}>Address</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={20} color="white" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1F2937",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    gap: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactValue: {
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 4,
  },
  contactLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});


