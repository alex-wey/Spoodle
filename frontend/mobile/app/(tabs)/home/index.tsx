import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Plus, MessageCircle, Bug, Bell, Dog } from "lucide-react-native";
import { useRouter } from "expo-router";
import { usePetStore } from "../../store/pets";
import { useAuthStore } from "../../store/auth";
import { getGreeting } from "../../lib/utils";
import { PetCard } from "../../components/PetCard";
import { FAB } from "../../components/FAB";

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { pets, fetchPets, isLoading, error } = usePetStore();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchPets();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPets();
    setRefreshing(false);
  };

  const handlePetPress = (petId: string) => {
    router.push(`/pets/${petId}`);
  };

  const handleHealthRecords = (petId: string) => {
    router.push(`/pets/${petId}/health-records`);
  };

  const handleAppointments = (petId: string) => {
    usePetStore.getState().selectPet(petId);
    router.push("/(tabs)/appointments");
  };

  if (isLoading && pets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading your pets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4F46E5"]}
            tintColor="#4F46E5"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.firstName || "Pet Parent"}!</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/notifications")}
              style={styles.notificationsButton}
            >
              <Bell size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>How are your pets doing today?</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {pets.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Dog size={64} color="#E5E7EB" />
              </View>
              <Text style={styles.emptyTitle}>No pets yet</Text>
              <Text style={styles.emptyDescription}>
                Add your first pet to get started with tracking their health
              </Text>
              <TouchableOpacity
                style={styles.addFirstPetButton}
                onPress={() => router.push("/pets/add")}
              >
                <Plus size={20} color="white" />
                <Text style={styles.addFirstPetButtonText}>Add Your First Pet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {pets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  onPress={() => handlePetPress(pet.id)}
                  onHealthRecords={() => handleHealthRecords(pet.id)}
                  onAppointments={() => handleAppointments(pet.id)}
                />
              ))}

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push("/pets/add")}
                activeOpacity={0.7}
              >
                <Plus size={24} color="#4F46E5" />
                <Text style={styles.addButtonText}>Add New Pet</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={[styles.fabContainer, { bottom: Platform.OS === "ios" ? 76 + Math.max(insets.bottom - 2, 6) : 80 }]}>
        <FAB
          icon={<Bug size={20} color="#6B7280" />}
          onPress={() => router.push("/support")}
          style={styles.fabSecondary}
          size="small"
        />
        <FAB
          icon={<MessageCircle size={24} color="white" />}
          onPress={() => router.push("/chat")}
          style={styles.fabPrimary}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: "#6B7280",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
  },
  notificationsButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  addFirstPetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addFirstPetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: 16,
    color: "#4F46E5",
    fontWeight: "600",
  },
  fabContainer: {
    position: "absolute",
    bottom: 80,
    right: 20,
    gap: 12,
  },
  fabPrimary: {
    backgroundColor: "#4F46E5",
  },
  fabSecondary: {
    backgroundColor: "white",
  },
});
