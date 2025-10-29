import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Plus, Bug, Dog } from "lucide-react-native";
import { useRouter } from "expo-router";
import { usePetStore } from "../../store/pets";
import { PetCard } from "./components/PetCard";
import { FAB } from "../../components/FAB";

export default function PetsScreen() {
  const router = useRouter();
  const { pets, fetchPets, error } = usePetStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

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
          <Text style={styles.title}>My Pets</Text>
          <Text style={styles.subtitle}>Manage your pet&apos;s health and records</Text>
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
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 18,
    color: "#4559A7",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4559A7",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#4559A7",
    opacity: 0.7,
  },
  content: {
    paddingTop: 0,
  },
  errorContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ADD7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  errorText: {
    color: "#4559A7",
    fontSize: 16,
  },
  emptyState: {
    backgroundColor: "#FFF5F5",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#FED7D7",
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#E75325",
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#4559A7",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
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
    fontSize: 18,
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ADD7EB",
    borderStyle: "dashed",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addButtonText: {
    fontSize: 18,
    color: "#4559A7",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "#C62828",
  },
});
