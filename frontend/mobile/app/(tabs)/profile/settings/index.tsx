import { View, Text, StyleSheet, ScrollView, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { ArrowLeft, ChevronRight, Bell, Lock, HelpCircle, FileText, Info, CreditCard, Mail, Moon, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { useAuthStore } from "../../../store/auth";

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

const SettingsItem = ({ icon, title, onPress }: SettingsItemProps) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingsItemLeft}>
      {icon}
      <Text style={title === "Delete Account" ? styles.settingsItemTextDanger : styles.settingsItemText}>{title}</Text>
    </View>
    <ChevronRight size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

interface SettingsToggleItemProps {
  icon: React.ReactNode;
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const SettingsToggleItem = ({ icon, title, value, onValueChange }: SettingsToggleItemProps) => (
  <View style={styles.settingsItem}>
    <View style={styles.settingsItemLeft}>
      {icon}
      <Text style={styles.settingsItemText}>{title}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
    />
  </View>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { deleteAccount } = useAuthStore();
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone and you will lose all your data including pets, documents, and tasks.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            // Show confirmation dialog
            Alert.alert(
              "Final Confirmation",
              "This will permanently delete your account and all associated data. Are you absolutely sure?",
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                {
                  text: "Yes, Delete Forever",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteAccount();
                      // Navigate to landing page after successful deletion
                      router.replace("/(auth)/landing");
                    } catch (error) {
                      console.error("Error deleting account:", error);
                      Alert.alert(
                        "Error",
                        "Failed to delete account. Please try again."
                      );
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

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
              <SettingsToggleItem
                icon={<Mail size={20} color="#6B7280" />}
                title="Email Updates"
                value={emailUpdates}
                onValueChange={setEmailUpdates}
              />
              <SettingsToggleItem
                icon={<Moon size={20} color="#6B7280" />}
                title="Dark Mode"
                value={darkMode}
                onValueChange={setDarkMode}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.settingsGroup}>
              <SettingsItem
                icon={<CreditCard size={20} color="#6B7280" />}
                title="Billing & Subscriptions"
                onPress={() => {/* TODO: Navigate to billing settings */}}
              />
              <SettingsItem
                icon={<Lock size={20} color="#6B7280" />}
                title="Privacy & Security"
                onPress={() => {/* TODO: Navigate to privacy settings */}}
              />
              <SettingsItem
                icon={<Trash2 size={20} color="#DC2626" />}
                title="Delete Account"
                onPress={handleDeleteAccount}
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
  settingsItemTextDanger: {
    fontSize: 16,
    color: "#DC2626",
    fontWeight: "500",
  },
});
