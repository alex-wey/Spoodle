import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TextInput, TouchableOpacity, Platform, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Weight, Save, X, Dna, Syringe } from "lucide-react-native";
import { clerkApiClient } from "../../../lib/api";
import { getSafeImageSource } from "../../../lib/imageUtils";
import { usePetStore } from "../../../store/pets";
import DateTimePicker from '@react-native-community/datetimepicker';
import { InfoRow } from "./components/InfoRow";
import { SpeciesSelector, getSpeciesIcon } from "./components/SpeciesSelector";
import { BiologicalSexSelector, getBiologicalSexIcon } from "./components/BiologicalSexSelector";
import { EditableList, TagList } from "./components/EditableList";

interface PetProfile {
  petId: string;
  ownerId: string;
  name: string;
  species?: 'dog' | 'cat' | 'other';
  breed?: string;
  age?: number;
  dateOfBirth?: string;
  biologicalSex?: 'male' | 'female';
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
    species: 'dog' as 'dog' | 'cat' | 'other',
    breed: '',
    weight: '',
    biologicalSex: 'male' as 'male' | 'female',
    dateOfBirth: new Date(),
    spayedNeutered: false,
    allergies: [] as string[],
    dietaryRestrictions: [] as string[],
  });

  const loadPetProfile = React.useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    loadPetProfile();
    // Reset edit mode when component mounts or pet ID changes
    setIsEditing(false);
    setNewAllergy('');
    setNewDietaryRestriction('');
  }, [id, loadPetProfile]);

  useEffect(() => {
    if (pet) {
      setEditedPet({
        name: pet.name,
        species: (pet.species?.toLowerCase() || 'dog') as 'dog' | 'cat' | 'other',
        breed: pet.breed || '',
        weight: pet.weight?.toString() || '',
        biologicalSex: pet.biologicalSex || 'male',
        dateOfBirth: pet.dateOfBirth ? new Date(pet.dateOfBirth) : new Date(),
        spayedNeutered: pet.spayedNeutered || false,
        allergies: pet.allergies || [],
        dietaryRestrictions: pet.dietaryRestrictions || [],
      });
    }
  }, [pet]);

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
        species: editedPet.species,
        breed: editedPet.breed.trim() || undefined,
        weight: weight,
        biologicalSex: editedPet.biologicalSex,
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
        species: (pet.species?.toLowerCase() || 'dog') as 'dog' | 'cat' | 'other',
        breed: pet.breed || '',
        weight: pet.weight?.toString() || '',
        biologicalSex: pet.biologicalSex || 'male',
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
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#4559A7" />
          </TouchableOpacity>
          <Text style={styles.title}>Pet Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4559A7" />
        </View>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#4559A7" />
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#4559A7" />
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
        </View>

        {/* Pet Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pet Details</Text>
          
          <InfoRow
            icon={getSpeciesIcon(pet.species)}
            label="Species"
            value={isEditing ? (
              <SpeciesSelector
                selectedSpecies={editedPet.species}
                onSelect={(species) => setEditedPet(prev => ({ ...prev, species }))}
              />
            ) : (
              pet.species ? pet.species.charAt(0).toUpperCase() + pet.species.slice(1).toLowerCase() : 'Unknown'
            )}
          />

          <InfoRow
            icon={getBiologicalSexIcon(pet.biologicalSex)}
            label="Biological Sex"
            value={isEditing ? (
              <BiologicalSexSelector
                selectedSex={editedPet.biologicalSex}
                onSelect={(sex) => setEditedPet(prev => ({ ...prev, biologicalSex: sex }))}
              />
            ) : (
              pet.biologicalSex ? pet.biologicalSex.charAt(0).toUpperCase() + pet.biologicalSex.slice(1) : 'Unknown'
            )}
          />

          <InfoRow
            icon={<Dna size={20} color="#4559A7" />}
            label="Breed"
            value={isEditing ? (
              <TextInput
                style={styles.infoEditInput}
                value={editedPet.breed}
                onChangeText={(text) => setEditedPet(prev => ({ ...prev, breed: text }))}
                placeholder="Breed"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              pet.breed || 'Unknown'
            )}
          />
        </View>

        {/* Basic Info Section */}
        <View style={[styles.section, styles.reducedTopPadding]}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {pet.dateOfBirth && (
            <InfoRow
              icon={<Calendar size={20} color="#4559A7" />}
              label="Date of Birth"
              value={isEditing ? (
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {editedPet.dateOfBirth.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ) : (
                new Date(pet.dateOfBirth).toLocaleDateString()
              )}
            />
          )}

          {pet.weight !== undefined && (
            <InfoRow
              icon={<Weight size={20} color="#4559A7" />}
              label="Weight"
              value={isEditing ? (
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
                `${pet.weight} lbs`
              )}
            />
          )}

          {pet.spayedNeutered !== undefined && (
            <InfoRow
              icon={<Syringe size={20} color="#4559A7" />}
              label="Spayed/Neutered"
              value={isEditing ? (
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
                pet.spayedNeutered ? "Yes" : "No"
              )}
            />
          )}
        </View>

        {/* Allergies Section */}
        <View style={[styles.section, styles.reducedTopPadding]}>
          <Text style={styles.sectionTitle}>Allergies</Text>
          {isEditing ? (
            <EditableList
              items={editedPet.allergies}
              newItem={newAllergy}
              onNewItemChange={setNewAllergy}
              onAddItem={addAllergy}
              onRemoveItem={removeAllergy}
              placeholder="Add new allergy"
              emptyMessage="No allergies recorded"
              tagStyle="allergy"
            />
          ) : (
            <TagList
              items={pet.allergies || []}
              tagStyle="allergy"
              emptyMessage="No allergies recorded"
            />
          )}
        </View>

        {/* Dietary Restrictions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
          {isEditing ? (
            <EditableList
              items={editedPet.dietaryRestrictions}
              newItem={newDietaryRestriction}
              onNewItemChange={setNewDietaryRestriction}
              onAddItem={addDietaryRestriction}
              onRemoveItem={removeDietaryRestriction}
              placeholder="Add new dietary restriction"
              emptyMessage="No dietary restrictions recorded"
              tagStyle="diet"
            />
          ) : (
            <TagList
              items={pet.dietaryRestrictions || []}
              tagStyle="diet"
              emptyMessage="No dietary restrictions recorded"
            />
          )}
        </View>

        {/* System Information Section */}
        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>System Information</Text>
          
          <View style={styles.systemInfoContainer}>
            <View style={styles.systemInfoRow}>
              <Text style={styles.systemInfoLabel}>Created</Text>
              <Text style={styles.systemInfoValue}>
                {new Date(pet.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
            
            <View style={styles.systemInfoDivider} />
            
            <View style={styles.systemInfoRow}>
              <Text style={styles.systemInfoLabel}>Last Updated</Text>
              <Text style={styles.systemInfoValue}>
                {new Date(pet.updatedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
          </View>
        </View>

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
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ADD7EB",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4559A7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: "#DCEBF5",
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  petName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4559A7",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  reducedTopPadding: {
    paddingTop: 8,
  },
  lastSection: {
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4559A7",
    marginBottom: 20,
  },
  // Editing mode styles
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4559A7",
  },
  saveButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#3BB272",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nameInput: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4559A7",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 200,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#ADD7EB",
  },
  weightInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  weightInput: {
    fontSize: 18,
    color: "#4559A7",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: 80,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#ADD7EB",
  },
  weightUnit: {
    fontSize: 18,
    color: "#6B7280",
  },
  // Additional editing styles
  dateButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ADD7EB",
  },
  dateButtonText: {
    fontSize: 18,
    color: "#4559A7",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switchLabel: {
    fontSize: 18,
    color: "#4559A7",
    fontWeight: "600",
  },
  // System Information styles
  systemInfoContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#ADD7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  systemInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  systemInfoLabel: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  systemInfoValue: {
    fontSize: 16,
    color: "#4559A7",
    fontWeight: "600",
  },
  systemInfoDivider: {
    height: 1,
    backgroundColor: "#ADD7EB",
  },
  infoEditInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 18,
    color: "#4559A7",
    borderWidth: 1,
    borderColor: "#ADD7EB",
    fontWeight: "600",
  },
});
