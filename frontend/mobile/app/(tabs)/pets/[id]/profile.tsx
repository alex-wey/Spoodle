import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TextInput, TouchableOpacity, Platform, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Weight, Syringe, AlertCircle, Heart, Save, X, Plus, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { clerkApiClient } from "../../../lib/api";
import { getPetAgeString, getGenderSymbol, calculateAge } from "../../../lib/utils";
import { getSafeImageSource } from "../../../lib/imageUtils";
import { usePetStore } from "../../../store/pets";
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const { updatePet, fetchPets } = usePetStore();
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newDietaryRestriction, setNewDietaryRestriction] = useState('');
  const [editedPet, setEditedPet] = useState({
    name: '',
    breed: '',
    weight: '',
    gender: 'male' as 'male' | 'female',
    dateOfBirth: new Date(),
    spayedNeutered: false,
    allergies: [] as string[],
    dietaryRestrictions: [] as string[],
  });

  useEffect(() => {
    loadPetProfile();
  }, [id]);

  useEffect(() => {
    if (pet) {
      setEditedPet({
        name: pet.name,
        breed: pet.breed || '',
        weight: pet.weight?.toString() || '',
        gender: pet.gender || 'male',
        dateOfBirth: pet.dateOfBirth ? new Date(pet.dateOfBirth) : new Date(),
        spayedNeutered: pet.spayedNeutered || false,
        allergies: pet.allergies || [],
        dietaryRestrictions: pet.dietaryRestrictions || [],
      });
    }
  }, [pet]);

  const loadPetProfile = async () => {
    try {
      setLoading(true);
      const response = await clerkApiClient.getPet(id);
      if (response.success) {
        setPet(response.data as unknown as PetProfile);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load pet profile");
      console.error("Error loading pet profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (!editedPet.name.trim()) {
        Alert.alert('Error', 'Pet name is required');
        return;
      }

      // Convert weight to number if provided
      const weight = editedPet.weight ? parseFloat(editedPet.weight) : undefined;
      
      // Prepare updated data
      const updatedData = {
        name: editedPet.name.trim(),
        breed: editedPet.breed.trim() || undefined,
        weight: weight,
        gender: editedPet.gender,
        dateOfBirth: editedPet.dateOfBirth,
        spayedNeutered: editedPet.spayedNeutered,
        allergies: editedPet.allergies,
        dietaryRestrictions: editedPet.dietaryRestrictions,
      };

      await updatePet(id, updatedData);
      await fetchPets(); // Refresh the pets list
      setIsEditing(false);
      
      if (Platform.OS === 'web') {
        alert('Pet updated successfully!');
      } else {
        Alert.alert('Success', 'Pet updated successfully!');
      }
    } catch (error) {
      console.error('Error saving pet:', error);
      if (Platform.OS === 'web') {
        alert(`Error saving pet: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } else {
        Alert.alert('Error', `Failed to save pet: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (pet) {
      setEditedPet({
        name: pet.name,
        breed: pet.breed || '',
        weight: pet.weight?.toString() || '',
        gender: pet.gender || 'male',
        dateOfBirth: pet.dateOfBirth ? new Date(pet.dateOfBirth) : new Date(),
        spayedNeutered: pet.spayedNeutered || false,
        allergies: pet.allergies || [],
        dietaryRestrictions: pet.dietaryRestrictions || [],
      });
    }
    setIsEditing(false);
    setNewAllergy('');
    setNewDietaryRestriction('');
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setEditedPet(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setEditedPet(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const addDietaryRestriction = () => {
    if (newDietaryRestriction.trim()) {
      setEditedPet(prev => ({
        ...prev,
        dietaryRestrictions: [...prev.dietaryRestrictions, newDietaryRestriction.trim()]
      }));
      setNewDietaryRestriction('');
    }
  };

  const removeDietaryRestriction = (index: number) => {
    setEditedPet(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.filter((_, i) => i !== index)
    }));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditedPet(prev => ({ ...prev, dateOfBirth: selectedDate }));
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
        {isEditing ? (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Save size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
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
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={editedPet.name}
                onChangeText={(text) => setEditedPet(prev => ({ ...prev, name: text }))}
                placeholder="Pet Name"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text style={styles.petName}>{pet.name}</Text>
            )}
            {isEditing ? (
              <TouchableOpacity
                style={[styles.genderBadge, { backgroundColor: `${genderColor}15` }]}
                onPress={() => setEditedPet(prev => ({ 
                  ...prev, 
                  gender: prev.gender === 'male' ? 'female' : 'male' 
                }))}
              >
                <Text style={[styles.genderText, { color: genderColor }]}>
                  {getGenderSymbol(editedPet.gender)}
                </Text>
              </TouchableOpacity>
            ) : (
              pet.gender && (
                <View style={[styles.genderBadge, { backgroundColor: `${genderColor}15` }]}>
                  <Text style={[styles.genderText, { color: genderColor }]}>
                    {getGenderSymbol(pet.gender)}
                  </Text>
                </View>
              )
            )}
          </View>
          {isEditing ? (
            <TextInput
              style={styles.breedInput}
              value={editedPet.breed}
              onChangeText={(text) => setEditedPet(prev => ({ ...prev, breed: text }))}
              placeholder="Breed"
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            pet.breed && <Text style={styles.breed}>{pet.breed}</Text>
          )}
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
                {isEditing ? (
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {editedPet.dateOfBirth.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.infoValue}>{getPetAgeString(pet.age)}</Text>
                )}
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
                {isEditing ? (
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {editedPet.dateOfBirth.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.infoValue}>
                    {new Date(pet.dateOfBirth).toLocaleDateString()}
                  </Text>
                )}
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
                {isEditing ? (
                  <View style={styles.weightInputContainer}>
                    <TextInput
                      style={styles.weightInput}
                      value={editedPet.weight}
                      onChangeText={(text) => setEditedPet(prev => ({ ...prev, weight: text }))}
                      placeholder="Weight"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                    <Text style={styles.weightUnit}>lbs</Text>
                  </View>
                ) : (
                  <Text style={styles.infoValue}>{pet.weight} lbs</Text>
                )}
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
                {isEditing ? (
                  <View style={styles.switchContainer}>
                    <Switch
                      value={editedPet.spayedNeutered}
                      onValueChange={(value) => setEditedPet(prev => ({ ...prev, spayedNeutered: value }))}
                      trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                      thumbColor={editedPet.spayedNeutered ? '#FFFFFF' : '#FFFFFF'}
                    />
                    <Text style={styles.switchLabel}>
                      {editedPet.spayedNeutered ? "Yes" : "No"}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.infoValue}>
                    {pet.spayedNeutered ? "Yes" : "No"}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Allergies Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertCircle size={20} color="#EF4444" />
            <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Allergies</Text>
          </View>
          
          {isEditing ? (
            <View style={styles.editableListContainer}>
              {/* Add new allergy */}
              <View style={styles.addItemContainer}>
                <TextInput
                  style={styles.addItemInput}
                  value={newAllergy}
                  onChangeText={setNewAllergy}
                  placeholder="Add new allergy"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addAllergy}
                >
                  <Plus size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              {/* List of allergies */}
              {editedPet.allergies.map((allergy, index) => (
                <View key={index} style={styles.editableItem}>
                  <Text style={styles.editableItemText}>{allergy}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeAllergy(index)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            pet.allergies && pet.allergies.length > 0 ? (
              <View style={styles.tagContainer}>
                {pet.allergies.map((allergy, index) => (
                  <View key={index} style={[styles.tag, styles.allergyTag]}>
                    <Text style={styles.allergyTagText}>{allergy}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noItemsText}>No allergies recorded</Text>
            )
          )}
        </View>

        {/* Dietary Restrictions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Syringe size={20} color="#10B981" />
            <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Dietary Restrictions</Text>
          </View>
          
          {isEditing ? (
            <View style={styles.editableListContainer}>
              {/* Add new dietary restriction */}
              <View style={styles.addItemContainer}>
                <TextInput
                  style={styles.addItemInput}
                  value={newDietaryRestriction}
                  onChangeText={setNewDietaryRestriction}
                  placeholder="Add new dietary restriction"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addDietaryRestriction}
                >
                  <Plus size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              {/* List of dietary restrictions */}
              {editedPet.dietaryRestrictions.map((restriction, index) => (
                <View key={index} style={styles.editableItem}>
                  <Text style={styles.editableItemText}>{restriction}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeDietaryRestriction(index)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            pet.dietaryRestrictions && pet.dietaryRestrictions.length > 0 ? (
              <View style={styles.tagContainer}>
                {pet.dietaryRestrictions.map((restriction, index) => (
                  <View key={index} style={[styles.tag, styles.dietTag]}>
                    <Text style={styles.dietTagText}>{restriction}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noItemsText}>No dietary restrictions recorded</Text>
            )
          )}
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
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
      
      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={editedPet.dateOfBirth}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
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
  // Editing mode styles
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
  },
  saveButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#10B981",
  },
  cancelButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#EF4444",
  },
  nameInput: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 150,
    textAlign: "center",
  },
  breedInput: {
    fontSize: 16,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    minWidth: 150,
    textAlign: "center",
  },
  weightInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  weightInput: {
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 80,
    textAlign: "center",
  },
  weightUnit: {
    fontSize: 16,
    color: "#6B7280",
  },
  // Additional editing styles
  dateButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#1F2937",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  editableListContainer: {
    gap: 12,
  },
  addItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  editableItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  editableItemText: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  removeButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#FEF2F2",
  },
  noItemsText: {
    fontSize: 16,
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16,
  },
});
