import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Dog, Plus, Users } from "lucide-react-native";

export default function OnboardingScreen() {
  const router = useRouter();

  const handleCreatePet = () => {
    router.replace("/pets/add");
  };

  const handleSkip = () => {
    router.replace("/(tabs)/home");
  };

  return (
    <LinearGradient
      colors={["#4F46E5", "#7C3AED"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Spoodle!</Text>
            <Text style={styles.subtitle}>Let's get you started</Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleCreatePet}
              activeOpacity={0.9}
            >
              <View style={styles.optionIcon}>
                <Plus size={32} color="#4F46E5" />
              </View>
              <Text style={styles.optionTitle}>Add Your First Pet</Text>
              <Text style={styles.optionDescription}>
                Start by creating a profile for your furry friend
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => {}}
              activeOpacity={0.9}
            >
              <View style={styles.optionIcon}>
                <Users size={32} color="#4F46E5" />
              </View>
              <Text style={styles.optionTitle}>Manage Pet Requests</Text>
              <Text style={styles.optionDescription}>
                Accept or send requests to manage other pets
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
  },
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  optionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  optionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  skipButtonText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
});


