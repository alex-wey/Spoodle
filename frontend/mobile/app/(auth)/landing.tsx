import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Dog, Heart, Calendar, MessageCircle } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function LandingScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#4F46E5", "#7C3AED"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo and Title */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Dog size={60} color="white" />
            </View>
            <Text style={styles.title}>Spoodle</Text>
            <Text style={styles.subtitle}>Your Pet&apos;s Health Companion</Text>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <View style={styles.feature}>
                <Heart size={24} color="white" />
                <Text style={styles.featureText}>Health Records</Text>
              </View>
              <View style={styles.feature}>
                <Calendar size={24} color="white" />
                <Text style={styles.featureText}>Appointments</Text>
              </View>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.feature}>
                <MessageCircle size={24} color="white" />
                <Text style={styles.featureText}>AI Assistant</Text>
              </View>
              <View style={styles.feature}>
                <Dog size={24} color="white" />
                <Text style={styles.featureText}>Pet Profiles</Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/(auth)/login")}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/(auth)/signup")}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
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
    justifyContent: "space-between",
    padding: 24,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
  },
  features: {
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  feature: {
    alignItems: "center",
    width: width * 0.35,
  },
  featureText: {
    color: "white",
    marginTop: 8,
    fontSize: 14,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#4F46E5",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  termsText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
  },
});


