import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Platform, Alert, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Plus, Bug, Dog } from "lucide-react-native";
import { useRouter } from "expo-router";
import { usePetStore } from "../../store/pets";
import { useUser } from '@clerk/clerk-expo';
import { getGreeting } from "../../lib/utils";
import { PetCard } from "./components/PetCard";
import { FAB } from "../../components/FAB";

export default function PetsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { pets, fetchPets, isLoading, error } = usePetStore();
  const [refreshing, setRefreshing] = useState(false);

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

  const handlePetDocuments = (petId: string) => {
    // Navigate to pet-specific docs page
    router.push(`/(tabs)/pets/${petId}/docs` as any);
  };

  // if (isLoading && pets.length === 0) {
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <View style={styles.loadingContainer}>
  //         <ActivityIndicator size="large" color="#4F46E5" />
  //         <Text style={styles.loadingText}>Loading your pets...</Text>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.firstName || "Pet Parent"}!</Text>
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
                  onPetDocuments={() => handlePetDocuments(pet.id)}
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

      {/* Bug Report FAB */}
      <FAB
        icon={<Bug size={20} color="white" />}
        onPress={() => router.push("/support")}
        style={styles.fab}
        size="small"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
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
    paddingTop: 0,
    paddingBottom: 5,
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
  subtitle: {
    fontSize: 14,
    color: "#4559A7",
    marginTop: 4,
  },
  content: {
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
  fab: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "#DC2626",
  },
});
