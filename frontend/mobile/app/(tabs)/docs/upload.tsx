import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Upload, FileText, Calendar, MapPin, StickyNote } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';
import { useDocumentStore } from '../../store/documents';
import { usePetStore } from '../../store/pets';

export default function UploadDocumentScreen() {
  const [selectedPet, setSelectedPet] = useState(null);
  const [category, setCategory] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuthStore();
  const { pets, fetchPets } = usePetStore();
  const { uploadDocument } = useDocumentStore();

  const categories = [
    { id: 'past_appointments', title: 'Past Appointments', color: '#3BB272' },
    { id: 'x_ray_documents', title: 'X-Ray Documents', color: '#E75325' },
    { id: 'diagnostic_reports', title: 'Diagnostic Reports', color: '#4559A7' },
    { id: 'blood_test_reports', title: 'Blood Test Reports', color: '#ADD7EB' },
    { id: 'vaccination_history', title: 'Vaccination History', color: '#4559A7' },
  ];

  React.useEffect(() => {
    fetchPets();
  }, []);

  const handleSubmit = async () => {
    if (!selectedPet || !category || !hospitalName) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock file upload - in real app, you'd use document picker
      const mockFile = {
        uri: 'file://mock-document.pdf',
        type: 'application/pdf',
        name: 'document.pdf',
      };

      await uploadDocument({
        petId: selectedPet.id,
        category,
        hospitalName,
        date: date || new Date().toISOString(),
        notes,
        file: mockFile,
      });

      Alert.alert('Success', 'Document uploaded successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#4559A7" />
          </TouchableOpacity>
          <Text style={styles.title}>Upload Document</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.form}>
          {/* Pet Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Pet</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petsScroll}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petCard,
                    selectedPet?.id === pet.id && styles.selectedPetCard
                  ]}
                  onPress={() => setSelectedPet(pet)}
                >
                  <View style={styles.petAvatar}>
                    <Text style={styles.petInitial}>{pet.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.petName}>{pet.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document Category</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: cat.color },
                    category === cat.id && styles.selectedCategory
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={styles.categoryText}>{cat.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Hospital Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hospital/Clinic Name *</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#4559A7" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter hospital or clinic name"
                value={hospitalName}
                onChangeText={setHospitalName}
                placeholderTextColor="#ADD7EB"
              />
            </View>
          </View>

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color="#4559A7" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (optional)"
                value={date}
                onChangeText={setDate}
                placeholderTextColor="#ADD7EB"
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <View style={styles.inputContainer}>
              <StickyNote size={20} color="#4559A7" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional notes (optional)"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                placeholderTextColor="#ADD7EB"
              />
            </View>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.uploadButton, isSubmitting && styles.uploadButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Upload size={20} color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>
              {isSubmitting ? 'Uploading...' : 'Upload Document'}
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
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ADD7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4559A7',
  },
  placeholder: {
    width: 40,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 16,
  },
  petsScroll: {
    flexDirection: 'row',
  },
  petCard: {
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#ADD7EB',
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  selectedPetCard: {
    backgroundColor: '#4559A7',
  },
  petAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4559A7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  petInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  petName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4559A7',
    textAlign: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  selectedCategory: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4559A7',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ADD7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#4559A7',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3BB272',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ADD7EB',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
