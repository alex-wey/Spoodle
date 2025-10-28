import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Save, Camera, X } from "lucide-react-native";
import { useState, useEffect } from "react";
import { usePetStore } from "../../store/pets";
import * as ImagePicker from 'expo-image-picker';

const INITIAL_FORM_STATE = {
  name: '',
  species: '',
  breed: '',
  biologicalSex: '',
  dateOfBirth: '',
  weight: '',
  spayedNeutered: false,
  allergies: '',
  dietaryRestrictions: ''
};

export default function AddPetScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams();
  const { addPet, updatePet, pets } = usePetStore();
  
  const isEditMode = !!editId;
  const existingPet = isEditMode ? pets.find(pet => pet.id === editId) : null;
  
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [petImage, setPetImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing pet data or reset form
  useEffect(() => {
    if (isEditMode && existingPet) {
      // Convert ISO date to MM/DD/YYYY
      let formattedDate = '';
      if (existingPet.dateOfBirth) {
        const date = existingPet.dateOfBirth instanceof Date 
          ? existingPet.dateOfBirth 
          : new Date(existingPet.dateOfBirth);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        formattedDate = `${month}/${day}/${year}`;
      }

      setFormData({
        name: existingPet.name || '',
        species: existingPet.species || '',
        breed: existingPet.breed || '',
        biologicalSex: existingPet.biologicalSex || '',
        dateOfBirth: formattedDate,
        weight: existingPet.weight?.toString() || '',
        spayedNeutered: existingPet.spayedNeutered || false,
        allergies: existingPet.allergies?.join(', ') || '',
        dietaryRestrictions: existingPet.dietaryRestrictions?.join(', ') || ''
      });
      setPetImage(existingPet.imageUrl || null);
    } else {
      // Reset form completely for new pet
      setFormData(INITIAL_FORM_STATE);
      setPetImage(null);
    }
  }, [isEditMode, existingPet]);

  // Additional reset when component mounts for new pet
  useEffect(() => {
    if (!isEditMode) {
      setFormData(INITIAL_FORM_STATE);
      setPetImage(null);
    }
  }, [isEditMode]);

  // Reset form function
  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setPetImage(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!isEditMode) {
        resetForm();
      }
    };
  }, [isEditMode]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true, // Request base64 encoding
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // If base64 is available, use it as a data URL; otherwise use the URI for preview
      if (asset.base64) {
        const base64Image = `data:image/jpeg;base64,${asset.base64}`;
        setPetImage(base64Image);
      } else {
        // Fallback to URI if base64 is not available (shouldn't happen with base64: true)
        setPetImage(asset.uri);
      }
    }
  };

  const handleDateChange = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format as MM/DD/YYYY
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    
    setFormData({ ...formData, dateOfBirth: formatted });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your pet\'s name');
      return;
    }
    if (!formData.species.trim()) {
      Alert.alert('Error', 'Please select your pet\'s species');
      return;
    }
    if (!formData.biologicalSex.trim()) {
      Alert.alert('Error', 'Please select your pet\'s biological sex');
      return;
    }
    if (!formData.breed.trim()) {
      Alert.alert('Error', 'Please enter your pet\'s breed');
      return;
    }
    if (!formData.dateOfBirth.trim()) {
      Alert.alert('Error', 'Please enter your pet\'s date of birth');
      return;
    }
    if (!formData.weight.trim()) {
      Alert.alert('Error', 'Please enter your pet\'s weight');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert MM/DD/YYYY to ISO format
      let dateOfBirthISO = new Date().toISOString();
      if (formData.dateOfBirth) {
        const [month, day, year] = formData.dateOfBirth.split('/');
        if (month && day && year) {
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) {
            dateOfBirthISO = date.toISOString();
          }
        }
      }

      const petData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || 'Mixed Breed',
        biologicalSex: formData.biologicalSex as 'male' | 'female',
        dateOfBirth: dateOfBirthISO,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        spayedNeutered: formData.spayedNeutered,
        allergies: formData.allergies.split(',').map(a => a.trim()).filter(Boolean),
        dietaryRestrictions: formData.dietaryRestrictions.split(',').map(d => d.trim()).filter(Boolean),
        imageUrl: petImage || undefined
      };

      if (isEditMode && existingPet) {
        await updatePet(existingPet.id, petData);
        router.back();
      } else {
        await addPet(petData);
        // Reset form after successful creation
        resetForm();
        router.back();
      }
    } catch {
      const message = isEditMode ? 'Failed to update pet' : 'Failed to add pet';
      Alert.alert('Error', `${message}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditMode ? 'Edit Pet' : 'Add New Pet'}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Pet Image Upload */}
          <View style={styles.section}>
            <View style={styles.imageUploadContainer}>
              {petImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: petImage }} style={styles.petImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton} 
                    onPress={() => setPetImage(null)}
                  >
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
                  <Camera size={32} color="#4559A7" />
                  <Text style={styles.imageUploadText}>Add Pet Photo</Text>
                  <Text style={styles.imageUploadSubtext}>Tap to upload</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Required Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pet Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter your pet's name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Species *</Text>
              <View style={styles.speciesContainer}>
                {['Dog', 'Cat', 'Other'].map((species) => (
                  <TouchableOpacity
                    key={species}
                    style={[
                      styles.speciesButton,
                      formData.species === species && styles.speciesButtonSelected
                    ]}
                    onPress={() => setFormData({ ...formData, species })}
                  >
                    <Text style={[
                      styles.speciesButtonText,
                      formData.species === species && styles.speciesButtonTextSelected
                    ]}>
                      {species}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Biological Sex *</Text>
              <View style={styles.speciesContainer}>
                {[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' }
                ].map((sex) => (
                  <TouchableOpacity
                    key={sex.value}
                    style={[
                      styles.speciesButton,
                      formData.biologicalSex === sex.value && styles.speciesButtonSelected
                    ]}
                    onPress={() => setFormData({ ...formData, biologicalSex: sex.value })}
                  >
                    <Text style={[
                      styles.speciesButtonText,
                      formData.biologicalSex === sex.value && styles.speciesButtonTextSelected
                    ]}>
                      {sex.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Breed *</Text>
              <TextInput
                style={styles.input}
                value={formData.breed}
                onChangeText={(text) => setFormData({ ...formData, breed: text })}
                placeholder="Enter breed"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth *</Text>
              <TextInput
                style={styles.input}
                value={formData.dateOfBirth}
                onChangeText={handleDateChange}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (lbs) *</Text>
              <TextInput
                style={styles.input}
                value={formData.weight}
                onChangeText={(text) => setFormData({ ...formData, weight: text })}
                placeholder="Enter weight in pounds"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Health Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Spayed/Neutered</Text>
              <View style={styles.speciesContainer}>
                {[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value.toString()}
                    style={[
                      styles.speciesButton,
                      formData.spayedNeutered === option.value && styles.speciesButtonSelected
                    ]}
                    onPress={() => setFormData({ ...formData, spayedNeutered: option.value })}
                  >
                    <Text style={[
                      styles.speciesButtonText,
                      formData.spayedNeutered === option.value && styles.speciesButtonTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Allergies</Text>
              <TextInput
                style={styles.input}
                value={formData.allergies}
                onChangeText={(text) => setFormData({ ...formData, allergies: text })}
                placeholder="Enter allergies (comma separated)"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dietary Restrictions</Text>
              <TextInput
                style={styles.input}
                value={formData.dietaryRestrictions}
                onChangeText={(text) => setFormData({ ...formData, dietaryRestrictions: text })}
                placeholder="Enter dietary restrictions (comma separated)"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Save size={20} color="white" />
            <Text style={styles.submitButtonText}>
              {isSubmitting 
                ? (isEditMode ? 'Updating Pet...' : 'Adding Pet...') 
                : (isEditMode ? 'Update Pet' : 'Add Pet')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ADD7EB",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#4559A7",
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#4559A7",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 17,
    fontWeight: "500",
    color: "#4559A7",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ADD7EB",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    color: "#4559A7",
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  speciesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  speciesButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#ADD7EB",
    backgroundColor: "white",
  },
  speciesButtonSelected: {
    backgroundColor: "#3BB272",
    borderColor: "#3BB272",
  },
  speciesButtonText: {
    fontSize: 16,
    color: "#4559A7",
    fontWeight: "600",
  },
  speciesButtonTextSelected: {
    color: "white",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#3BB272",
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#ADD7EB",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  imageUploadContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  imageUploadButton: {
    width: 140,
    height: 140,
    borderWidth: 3,
    borderColor: "#ADD7EB",
    borderStyle: "dashed",
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
  },
  imagePreviewContainer: {
    position: "relative",
  },
  petImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#DC2626",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  imageUploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4559A7",
    marginTop: 10,
    textAlign: "center",
  },
  imageUploadSubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
});
