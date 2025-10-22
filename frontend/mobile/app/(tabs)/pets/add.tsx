import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
import { useState } from "react";
import { usePetStore } from "../../store/pets";

export default function AddPetScreen() {
  const router = useRouter();
  const { addPet } = usePetStore();
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    dateOfBirth: '',
    weight: '',
    microchipId: '',
    allergies: '',
    dietaryRestrictions: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your pet\'s name');
      return;
    }

    if (!formData.species.trim()) {
      Alert.alert('Error', 'Please select your pet\'s species');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const petData = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        allergies: formData.allergies.split(',').map(a => a.trim()).filter(a => a),
        dietaryRestrictions: formData.dietaryRestrictions.split(',').map(d => d.trim()).filter(d => d)
      };

      await addPet(petData);
      Alert.alert('Success', 'Pet added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add pet. Please try again.');
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
        <Text style={styles.title}>Add New Pet</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
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
              {isSubmitting ? 'Adding Pet...' : 'Add Pet'}
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
});
