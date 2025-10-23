import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View
      style={[styles.container, { backgroundColor: "#4559A7" }]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo and Title */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../assets/images/Spoodle Logo Variations Transparent Backgrounds-02.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.subtitle}>Your Pet&apos;s Health Companion</Text>
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
    </View>
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
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
  },
  logoWrapper: {
    alignItems: "center",
    position: "relative",
  },
  logo: {
    width: 450,
    height: 450,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: -140,
    textAlign: "center",
    fontWeight: "500",
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


