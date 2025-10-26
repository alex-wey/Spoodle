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
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Upload, FileText, Calendar, MapPin, StickyNote, ChevronDown, Trash2 } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@clerk/clerk-expo';
import { usePetStore } from '../../../../store/pets';

export default function UploadDocumentScreen() {
  // Get category and petId from URL params
  const params = useLocalSearchParams<{ category?: string; id: string }>();
  const preselectedCategory = params.category || '';
  const petId = params.id;
  
  const [step, setStep] = useState(preselectedCategory ? 2 : 1); // Skip to step 2 if category provided
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [category, setCategory] = useState(preselectedCategory);
  const [hospitalName, setHospitalName] = useState('');
  const [fileName, setFileName] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [fileType, setFileType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Reset form when component mounts
  React.useEffect(() => {
    // Only reset if no preselected category (coming from general upload)
    if (!preselectedCategory) {
      setSelectedPet(null);
      setCategory('');
      setHospitalName('');
      setFileName('');
      setCustomFileName('');
      setFileUri('');
      setFileType('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setStep(1);
    }
  }, []);

  const { getToken } = useAuth();
  const { pets, fetchPets } = usePetStore();

  // Function to reset the form
  const resetForm = () => {
    setSelectedPet(null);
    setCategory('');
    setHospitalName('');
    setFileName('');
    setCustomFileName('');
    setFileUri('');
    setFileType('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setStep(1);
    setIsSubmitting(false);
  };

  const categories = [
    { id: 'past_appointments', title: 'Past Appointments', color: '#3BB272' },
    { id: 'x_ray_documents', title: 'X-Ray Documents', color: '#E75325' },
    { id: 'diagnostic_reports', title: 'Diagnostic Reports', color: '#FF5D91' },
    { id: 'blood_test_reports', title: 'Blood Test Reports', color: '#4559A7' },
    { id: 'vaccination_history', title: 'Vaccination History', color: '#E75325' },
  ];

  React.useEffect(() => {
    fetchPets(getToken);
  }, []);

  // Auto-select the pet based on petId from URL
  React.useEffect(() => {
    if (petId && pets.length > 0) {
      const pet = pets.find((p: any) => p.id === petId);
      if (pet) {
        setSelectedPet(pet);
      }
    }
  }, [petId, pets]);

  const handleCategorySelect = (catId: string) => {
    setCategory(catId);
    setShowCategoryDropdown(false);
  };

  const handleNext = () => {
    if (!category) {
      Alert.alert('Missing Information', 'Please select a document category.');
      return;
    }
    setStep(2);
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('📁 File selected:', file);
        setFileName(file.name);
        setFileUri(file.uri);
        setFileType(file.mimeType || 'application/octet-stream');
        console.log('✅ File state updated:', {
          name: file.name,
          uri: file.uri,
          type: file.mimeType || 'application/octet-stream'
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    if (!selectedPet || !category || !hospitalName || !fileName || !fileUri) {
      Alert.alert('Missing Information', 'Please fill in all required fields and select a file.');
      return;
    }

    console.log('📤 Starting upload...');
    console.log('  Pet:', selectedPet.id);
    console.log('  Category:', category);
    console.log('  Hospital:', hospitalName);
    console.log('  File:', fileName);
    console.log('  File URI:', fileUri);
    console.log('  File Type:', fileType);

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('petId', selectedPet.id);
      formData.append('category', category);
      formData.append('hospitalName', hospitalName);
      formData.append('fileName', customFileName || fileName);
      formData.append('date', date);
      formData.append('notes', notes || '');
      
      // Append file - Handle both web (blob) and native formats
      if (fileUri.startsWith('blob:')) {
        // Web platform - convert blob to file
        try {
          const response = await fetch(fileUri);
          const blob = await response.blob();
          const file = new File([blob], fileName, { type: fileType });
          formData.append('document', file);
          console.log('📤 Web file appended:', { name: fileName, type: fileType, size: blob.size });
        } catch (error) {
          console.error('❌ Error converting blob to file:', error);
          throw new Error('Failed to process file for upload');
        }
      } else {
        // React Native platform - append as any to bypass type checking
        const fileData: any = {
          uri: fileUri,
          type: fileType,
          name: fileName,
        };
        formData.append('document', fileData as any);
        console.log('📤 Native file appended:', fileData);
      }

      console.log('📤 FormData contents:');
      console.log('  Pet ID:', selectedPet.id);
      console.log('  Category:', category);
      console.log('  Hospital:', hospitalName);
      console.log('  File Name:', customFileName || fileName);
      console.log('  File URI:', fileUri);
      console.log('  File Type:', fileType);
      console.log('  Sending request to backend...');

      const token = await getToken();
      const response = await fetch(`http://localhost:3002/api/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('  Response status:', response.status);

      const data = await response.json();
      console.log('  Response data:', data);

      if (data.success) {
        // Reset the form first
        resetForm();
        // Go back to the pet's docs page after upload
        router.replace(`/(tabs)/pets/${petId}/docs` as any);
        Alert.alert('Success', 'Document uploaded successfully!');
      } else {
        Alert.alert('Error', data.message || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === category);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => step === 1 ? router.back() : setStep(1)} 
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#4559A7" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {step === 1 ? 'Choose Category' : 'Add Files'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* STEP 1: Category Selection */}
        {step === 1 && (
          <View style={styles.form}>
            <Text style={styles.stepTitle}>Select Document Category</Text>
            <Text style={styles.stepDescription}>
              Choose the type of document you want to upload
            </Text>

            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text style={[styles.dropdownText, !category && styles.dropdownPlaceholder]}>
                {selectedCategory ? selectedCategory.title : 'Choose an option...'}
              </Text>
              <ChevronDown size={20} color="#4559A7" />
            </TouchableOpacity>

            {showCategoryDropdown && (
              <View style={styles.dropdownMenu}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.dropdownItem,
                      category === cat.id && styles.dropdownItemSelected
                    ]}
                    onPress={() => handleCategorySelect(cat.id)}
                  >
                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.dropdownItemText}>{cat.title}</Text>
                    {category === cat.id && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.nextButton, !category && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!category}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Details Form */}
        {step === 2 && (
          <View style={styles.form}>
            <View style={styles.selectedCategoryBanner}>
              <View style={[styles.categoryDot, { backgroundColor: selectedCategory?.color }]} />
              <Text style={styles.selectedCategoryText}>{selectedCategory?.title}</Text>
            </View>

            {/* Pet Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Pet</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petsScroll}>
                {pets.map((pet: any) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={[
                      styles.petCard,
                      selectedPet?.id === pet.id && styles.selectedPetCard
                    ]}
                    onPress={() => setSelectedPet(pet)}
                  >
                    <View style={[
                      styles.petAvatar,
                      selectedPet?.id === pet.id && styles.selectedPetAvatar
                    ]}>
                      <Text style={styles.petInitial}>{pet.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={[
                      styles.petName,
                      selectedPet?.id === pet.id && styles.selectedPetName
                    ]}>{pet.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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

            {/* File Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Document File *</Text>
              {fileName ? (
                <View style={styles.filePreview}>
                  <FileText size={24} color="#3BB272" />
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{fileName}</Text>
                    <Text style={styles.fileSize}>Ready to upload</Text>
                  </View>
                  <TouchableOpacity onPress={() => { setFileName(''); setFileUri(''); }}>
                    <Trash2 size={20} color="#E75325" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.filePickerButton} onPress={handlePickDocument}>
                  <Upload size={24} color="#4559A7" />
                  <Text style={styles.filePickerText}>Choose File</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Custom File Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Custom File Name (Optional)</Text>
              <View style={styles.inputContainer}>
                <FileText size={20} color="#4559A7" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter custom name for the file"
                  value={customFileName}
                  onChangeText={setCustomFileName}
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
                  placeholder="YYYY-MM-DD"
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

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.uploadButton, isSubmitting && styles.uploadButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Upload size={20} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>Save & Finish</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4559A7',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#4559A7',
    opacity: 0.7,
    marginBottom: 32,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#ADD7EB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: '#4559A7',
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    opacity: 0.5,
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ADD7EB',
    marginBottom: 32,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#DCEBF5',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 16,
    color: '#4559A7',
    marginLeft: 12,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkmark: {
    fontSize: 18,
    color: '#3BB272',
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#3BB272',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#ADD7EB',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedCategoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCEBF5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  selectedCategoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4559A7',
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 12,
  },
  petsScroll: {
    flexDirection: 'row',
  },
  petCard: {
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#ADD7EB',
    padding: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  selectedPetCard: {
    backgroundColor: '#DCEBF5',
    borderColor: '#4559A7',
  },
  petAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ADD7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedPetAvatar: {
    backgroundColor: '#4559A7',
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
  selectedPetName: {
    color: '#4559A7',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
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
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCEBF5',
    borderWidth: 2,
    borderColor: '#ADD7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    gap: 12,
  },
  filePickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4559A7',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCEBF5',
    borderWidth: 1,
    borderColor: '#3BB272',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#3BB272',
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
