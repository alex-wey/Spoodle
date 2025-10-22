import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Platform, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Plus, Bug, LogOut, Dog } from "lucide-react-native";
import { useRouter } from "expo-router";
import { usePetStore } from "../../store/pets";
import { useAuthStore } from "../../store/auth";
import { useTaskStore } from "../../store/tasks";
import { useDocumentStore } from "../../store/documents";
import { getGreeting } from "../../lib/utils";
import { PetCard } from "./[id]/components/PetCard";
import { FAB } from "../../components/FAB";

export default function PetsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuthStore();
  const { pets, fetchPets, isLoading, error, clearPets } = usePetStore();
  const { clearTasks } = useTaskStore();
  const { clearDocuments } = useDocumentStore();
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
    router.push(`/pets/${petId}/profile`);
  };

  const handlePetRecords = (petId: string) => {
    // Navigate to docs page (medical records)
    router.push(`/(tabs)/docs`);
  };

  const handleEditPet = (petId: string) => {
    // Navigate to add pet page in edit mode
    router.push(`/pets/add?editId=${petId}`);
  };

  const handleLogout = () => {
    console.log('🔴 LOGOUT BUTTON CLICKED - handleLogout function called');
    
    // For testing - direct logout without confirmation
    console.log('🚪 Starting direct logout process...');
    
    // Clear all stores first
    clearPets();
    clearTasks();
    clearDocuments();
    console.log('✅ All stores cleared');
    
    // Clear auth data
    logout().then(() => {
      console.log('✅ Auth logout completed');
      // Force redirect to landing page
      console.log('🚪 Redirecting to landing page...');
      // Try multiple redirect methods to ensure it works
      setTimeout(() => {
        router.replace("/(auth)/landing");
      }, 100);
    }).catch((error) => {
      console.error('❌ Logout error:', error);
      // Even if logout fails, force redirect
      setTimeout(() => {
        router.replace("/(auth)/landing");
      }, 100);
    });
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
              onPress={() => {
                console.log('🔴 LOGOUT TOUCHABLE OPACITY PRESSED');
                handleLogout();
              }}
              style={styles.logoutButton}
              activeOpacity={0.5}
            >
              <LogOut size={24} color="#6B7280" />
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
                  onPetRecords={() => handlePetRecords(pet.id)}
                  onEditPet={() => handleEditPet(pet.id)}
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

      {/* Floating Action Button */}
      <View style={[styles.fabContainer, { bottom: Platform.OS === "ios" ? 76 + Math.max(insets.bottom - 2, 6) : 80 }]}>
        <FAB
          icon={<Bug size={24} color="#FFFFFF" />}
          onPress={() => router.push("/support")}
          style={styles.fabBug}
          size="large"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4559A7",
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
    color: "#4559A7",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4559A7",
  },
  logoutButton: {
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  subtitle: {
    fontSize: 14,
    color: "#4559A7",
    marginTop: 4,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  errorContainer: {
    backgroundColor: "#ADD7EB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#4559A7",
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
    backgroundColor: "#ADD7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4559A7",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#4559A7",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  addFirstPetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4559A7",
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
    borderColor: "#ADD7EB",
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: 16,
    color: "#4559A7",
    fontWeight: "600",
  },
  fabContainer: {
    position: "absolute",
    bottom: 80,
    right: 20,
  },
  fabSecondary: {
    backgroundColor: "white",
  },
  fabBug: {
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: 64,
    height: 64,
  },
});
