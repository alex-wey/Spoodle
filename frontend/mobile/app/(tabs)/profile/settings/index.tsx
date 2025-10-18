import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { ArrowLeft, ChevronRight, Bell, Lock, HelpCircle, FileText, Info } from "lucide-react-native";

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

const SettingsItem = ({ icon, title, onPress }: SettingsItemProps) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingsItemLeft}>
      {icon}
      <Text style={styles.settingsItemText}>{title}</Text>
    </View>
    <ChevronRight size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Settings Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.settingsGroup}>
              <SettingsItem
                icon={<Bell size={20} color="#6B7280" />}
                title="Notifications"
                onPress={() => router.push("/(tabs)/notifications")}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.settingsGroup}>
              <SettingsItem
                icon={<Lock size={20} color="#6B7280" />}
                title="Privacy & Security"
                onPress={() => {/* TODO: Navigate to privacy settings */}}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.settingsGroup}>
              <SettingsItem
                icon={<HelpCircle size={20} color="#6B7280" />}
                title="Help & Support"
                onPress={() => router.push("/support")}
              />
              <SettingsItem
                icon={<FileText size={20} color="#6B7280" />}
                title="Terms & Conditions"
                onPress={() => {/* TODO: Navigate to terms */}}
              />
              <SettingsItem
                icon={<Info size={20} color="#6B7280" />}
                title="About"
                onPress={() => {/* TODO: Navigate to about */}}
              />
            </View>
          </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingsGroup: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsItemText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
});
