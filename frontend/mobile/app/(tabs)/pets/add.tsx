import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Save, Camera, X } from "lucide-react-native";
import { useState, useEffect } from "react";
import { usePetStore } from "../../store/pets";
import * as ImagePicker from 'expo-image-picker';

export default function AddPetScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams();
  const { addPet, updatePet, pets } = usePetStore();
  
  const isEditMode = !!editId;
  const existingPet = isEditMode ? pets.find(pet => pet.id === editId) : null;
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    gender: '',
    dateOfBirth: '',
    weight: '',
    microchipId: '',
    allergies: '',
    dietaryRestrictions: '',
    notes: ''
  });
  
  const [petImage, setPetImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      species: '',
      breed: '',
      gender: '',
      dateOfBirth: '',
      weight: '',
      microchipId: '',
      allergies: '',
      dietaryRestrictions: '',
      notes: ''
    });
    setPetImage(null);
  };

  // Populate form with existing pet data when in edit mode, or reset for new pet
  useEffect(() => {
    if (isEditMode && existingPet) {
      setFormData({
        name: existingPet.name || '',
        species: existingPet.species || '',
        breed: existingPet.breed || '',
        gender: existingPet.gender || '',
        dateOfBirth: existingPet.dateOfBirth ? (typeof existingPet.dateOfBirth === 'string' ? existingPet.dateOfBirth.split('T')[0] : existingPet.dateOfBirth.toISOString().split('T')[0]) : '',
        weight: existingPet.weight ? existingPet.weight.toString() : '',
        microchipId: existingPet.microchipId || '',
        allergies: existingPet.allergies ? existingPet.allergies.join(', ') : '',
        dietaryRestrictions: existingPet.dietaryRestrictions ? existingPet.dietaryRestrictions.join(', ') : '',
        notes: existingPet.notes || ''
      });
      setPetImage(existingPet.imageUrl || null);
    } else {
      // Reset form for new pet
      resetForm();
    }
  }, [isEditMode, existingPet]);

  // Reset form when component mounts for adding a new pet
  useEffect(() => {
    if (!isEditMode) {
      resetForm();
    }
  }, []);

  const convertUriToBase64 = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting URI to base64:', error);
      return uri; // Return original URI if conversion fails
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      
      // Convert blob URL to base64 for web platform
      if (Platform.OS === 'web' && imageUri.startsWith('blob:')) {
        try {
          const base64Image = await convertUriToBase64(imageUri);
          setPetImage(base64Image);
        } catch (error) {
          console.error('Error converting image to base64:', error);
          // Don't set the blob URL as it will cause errors later
          setPetImage(null);
          Alert.alert('Image Error', 'Failed to process the selected image. Please try again.');
        }
      } else {
        setPetImage(imageUri);
      }
    }
  };

  const removeImage = () => {
    setPetImage(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your pet\'s name');
      return;
    }

    if (!formData.species.trim()) {
      Alert.alert('Error', 'Please select your pet\'s species');
      return;
    }

    if (!formData.gender.trim()) {
      Alert.alert('Error', 'Please select your pet\'s gender');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Ensure we have a valid image URL (base64 or null)
      let finalImageUrl = null;
      if (petImage) {
        if (petImage.startsWith('data:image/')) {
          // Already base64, use as is
          finalImageUrl = petImage;
        } else if (petImage.startsWith('blob:') && Platform.OS === 'web') {
          // Convert blob to base64
          try {
            finalImageUrl = await convertUriToBase64(petImage);
          } catch (error) {
            console.error('Error converting blob to base64:', error);
            Alert.alert('Image Error', 'Failed to process the selected image. Please try again.');
            setIsSubmitting(false);
            return;
          }
        } else {
          // Regular URL or mobile URI
          finalImageUrl = petImage;
        }
      }

      const petData = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        allergies: formData.allergies.split(',').map(a => a.trim()).filter(a => a),
        dietaryRestrictions: formData.dietaryRestrictions.split(',').map(d => d.trim()).filter(d => d),
        imageUrl: finalImageUrl
      };

      if (isEditMode && existingPet) {
        await updatePet(existingPet.id, petData);
        Alert.alert('Success', 'Pet updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        await addPet(petData);
        Alert.alert('Success', 'Pet added successfully!', [
          { text: 'OK', onPress: () => {
            resetForm(); // Reset form after successful addition
            router.back();
          }}
        ]);
      }
    } catch (error) {
      Alert.alert('Error', isEditMode ? 'Failed to update pet. Please try again.' : 'Failed to add pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.sectionTitle}>Pet Photo</Text>
            <View style={styles.imageUploadContainer}>
              {petImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: petImage }} style={styles.petImage} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
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

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
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
                {['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'].map((species) => (
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
              <Text style={styles.label}>Breed</Text>
              <TextInput
                style={styles.input}
                value={formData.breed}
                onChangeText={(text) => setFormData({ ...formData, breed: text })}
                placeholder="Enter breed"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender *</Text>
              <View style={styles.speciesContainer}>
                {[
                  { value: 'male', label: 'Male ♂', icon: '♂' },
                  { value: 'female', label: 'Female ♀', icon: '♀' }
                ].map((gender) => (
                  <TouchableOpacity
                    key={gender.value}
                    style={[
                      styles.speciesButton,
                      formData.gender === gender.value && styles.speciesButtonSelected
                    ]}
                    onPress={() => setFormData({ ...formData, gender: gender.value })}
                  >
                    <Text style={[
                      styles.speciesButtonText,
                      formData.gender === gender.value && styles.speciesButtonTextSelected
                    ]}>
                      {gender.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                value={formData.dateOfBirth}
                onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={formData.weight}
                onChangeText={(text) => setFormData({ ...formData, weight: text })}
                placeholder="Enter weight"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Health Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Microchip ID</Text>
              <TextInput
                style={styles.input}
                value={formData.microchipId}
                onChangeText={(text) => setFormData({ ...formData, microchipId: text })}
                placeholder="Enter microchip ID"
                placeholderTextColor="#9CA3AF"
              />
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Additional Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Any additional information about your pet"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
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
    fontSize: 18,
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4559A7",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4559A7",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ADD7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#4559A7",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  speciesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  speciesButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ADD7EB",
    backgroundColor: "white",
  },
  speciesButtonSelected: {
    backgroundColor: "#3BB272",
    borderColor: "#3BB272",
  },
  speciesButtonText: {
    fontSize: 14,
    color: "#4559A7",
    fontWeight: "500",
  },
  speciesButtonTextSelected: {
    color: "white",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3BB272",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: "#ADD7EB",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  imageUploadContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  imageUploadButton: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: "#ADD7EB",
    borderStyle: "dashed",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
  },
  imagePreviewContainer: {
    position: "relative",
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#DC2626",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  imageUploadText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4559A7",
    marginTop: 8,
    textAlign: "center",
  },
  imageUploadSubtext: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
});
