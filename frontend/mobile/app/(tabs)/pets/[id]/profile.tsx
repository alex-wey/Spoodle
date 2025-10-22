import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { ArrowLeft, Calendar, Weight, Syringe, AlertCircle, Heart, Edit } from "lucide-react-native";
import { useEffect, useState } from "react";
import { apiClient } from "../../../lib/api";
import { getPetAgeString, getGenderSymbol } from "../../../lib/utils";
import { getSafeImageSource } from "../../../lib/imageUtils";

interface PetProfile {
  petId: string;
  ownerId: string;
  name: string;
  breed?: string;
  age?: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  spayedNeutered?: boolean;
  weight?: number;
  allergies?: string[];
  dietaryRestrictions?: string[];
  profilePhoto?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PetProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPetProfile();
  }, [id]);

  const loadPetProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPet(id);
      if (response.success) {
        setPet(response.data as PetProfile);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load pet profile");
      console.error("Error loading pet profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Pet Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Pet Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Pet not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const genderColor = pet.gender === "female" ? "#EC4899" : "#3B82F6";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Pet Profile</Text>
        <TouchableOpacity onPress={() => {/* TODO: Navigate to edit screen */}}>
          <Edit size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Pet Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={getSafeImageSource(pet.imageUrl || pet.profilePhoto, pet.name)}
            style={styles.profileImage}
            onError={(error) => {
              console.log('Image load error:', error);
            }}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.petName}>{pet.name}</Text>
            {pet.gender && (
              <View style={[styles.genderBadge, { backgroundColor: `${genderColor}15` }]}>
                <Text style={[styles.genderText, { color: genderColor }]}>
                  {getGenderSymbol(pet.gender)}
                </Text>
              </View>
            )}
          </View>
          {pet.breed && <Text style={styles.breed}>{pet.breed}</Text>}
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          {pet.age !== undefined && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Calendar size={20} color="#4F46E5" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{getPetAgeString(pet.age)}</Text>
              </View>
            </View>
          )}

          {pet.dateOfBirth && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Calendar size={20} color="#4F46E5" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>
                  {new Date(pet.dateOfBirth).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          {pet.weight !== undefined && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Weight size={20} color="#4F46E5" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>{pet.weight} lbs</Text>
              </View>
            </View>
          )}

          {pet.spayedNeutered !== undefined && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Heart size={20} color="#4F46E5" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Spayed/Neutered</Text>
                <Text style={styles.infoValue}>
                  {pet.spayedNeutered ? "Yes" : "No"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Allergies Section */}
        {pet.allergies && pet.allergies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertCircle size={20} color="#EF4444" />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Allergies</Text>
            </View>
            <View style={styles.tagContainer}>
              {pet.allergies.map((allergy, index) => (
                <View key={index} style={[styles.tag, styles.allergyTag]}>
                  <Text style={styles.allergyTagText}>{allergy}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Dietary Restrictions Section */}
        {pet.dietaryRestrictions && pet.dietaryRestrictions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Syringe size={20} color="#10B981" />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Dietary Restrictions</Text>
            </View>
            <View style={styles.tagContainer}>
              {pet.dietaryRestrictions.map((restriction, index) => (
                <View key={index} style={[styles.tag, styles.dietTag]}>
                  <Text style={styles.dietTagText}>{restriction}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Record Information</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>
                {new Date(pet.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>
                {new Date(pet.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: "white",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    marginBottom: 16,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  petName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
  },
  genderBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genderText: {
    fontSize: 16,
    fontWeight: "600",
  },
  breed: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    backgroundColor: "white",
    marginTop: 12,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  allergyTag: {
    backgroundColor: "#FEE2E2",
  },
  allergyTagText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
  },
  dietTag: {
    backgroundColor: "#D1FAE5",
  },
  dietTagText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "500",
  },
});
