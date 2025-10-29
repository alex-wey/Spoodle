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
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Upload, FileText, ChevronDown, Trash2, Calendar, MapPin, Stethoscope, FileEdit } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { usePetStore } from '../../../../store/pets';
import { clerkApiClient } from '../../../../lib/api';

export default function UploadDocumentScreen() {
  // Get category and petId from URL params
  const params = useLocalSearchParams<{ category?: string; id: string }>();
  const preselectedCategory = params.category || '';
  const petId = params.id;
  
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [category, setCategory] = useState(preselectedCategory);
  const [fileName, setFileName] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [fileType, setFileType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [hospitalName, setHospitalName] = useState('');
  const [vetName, setVetName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Reset form when component mounts
  React.useEffect(() => {
    // Only reset if no preselected category (coming from general upload)
    if (!preselectedCategory) {
      setSelectedPet(null);
      setCategory('');
      setFileName('');
      setCustomFileName('');
      setFileUri('');
      setFileType('');
      setHospitalName('');
      setVetName('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [preselectedCategory]);

  const { pets, fetchPets } = usePetStore();

  // Function to reset the form
  const resetForm = () => {
    setSelectedPet(null);
    setCategory('');
    setFileName('');
    setCustomFileName('');
    setFileUri('');
    setFileType('');
    setHospitalName('');
    setVetName('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsSubmitting(false);
  };

  const categories = [
    { id: 'veterinary_notes', title: 'Veterinary Notes', color: '#4559A7' },
    { id: 'diagnostic_reports_and_imaging', title: 'Diagnostic Reports & Imaging', color: '#4559A7' },
    { id: 'lab_results', title: 'Lab Results', color: '#4559A7' },
    { id: 'vaccine_record', title: 'Vaccine Record', color: '#4559A7' },
  ];

  React.useEffect(() => {
    fetchPets();
  }, [fetchPets]);

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
    if (!selectedPet || !category || !fileName || !fileUri) {
      Alert.alert('Missing Information', 'Please select a category and file.');
      return;
    }

    console.log('📤 Starting upload...');
    console.log('  Pet:', selectedPet.id);
    console.log('  Category:', category);
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
      if (notes) {
        formData.append('notes', notes);
      }
      
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
      console.log('  File Name:', customFileName || fileName);
      console.log('  File URI:', fileUri);
      console.log('  File Type:', fileType);
      console.log('  Sending request to backend...');

      const data = await clerkApiClient.uploadDocument(formData);
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
            onPress={() => router.push(`/(tabs)/pets/${petId}/docs` as any)} 
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#4559A7" />
          </TouchableOpacity>
          <Text style={styles.title}>Upload Document</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Single Form */}
        <View style={styles.form}>
          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Document Category *</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <View style={styles.dropdownContent}>
                {selectedCategory && (
                  <View style={[styles.categoryDot, { backgroundColor: selectedCategory.color }]} />
                )}
                <Text style={[styles.dropdownText, !category && styles.dropdownPlaceholder]}>
                  {selectedCategory ? selectedCategory.title : 'Choose a category...'}
                </Text>
              </View>
              <ChevronDown size={22} color="#4559A7" />
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
            <Text style={styles.label}>Date *</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color="#4559A7" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#ADD7EB"
              />
            </View>
          </View>

          {/* Hospital Name - Only for Veterinary Notes */}
          {category === 'veterinary_notes' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hospital/Clinic Name</Text>
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
          )}

          {/* Vet Name - Only for Veterinary Notes */}
          {category === 'veterinary_notes' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Veterinarian Name (Optional)</Text>
              <View style={styles.inputContainer}>
                <Stethoscope size={20} color="#4559A7" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter veterinarian name"
                  value={vetName}
                  onChangeText={setVetName}
                  placeholderTextColor="#ADD7EB"
                />
              </View>
            </View>
          )}

          {/* Notes - For all categories */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <View style={styles.inputContainer}>
              <FileEdit size={20} color="#4559A7" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add any additional notes"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
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
                <Text style={styles.uploadButtonText}>Upload Document</Text>
              </>
            )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ADD7EB',
  },
  backButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4559A7',
  },
  form: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4559A7',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 20,
    color: '#4559A7',
    opacity: 0.7,
    marginBottom: 36,
  },
  inputGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 12,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#ADD7EB',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  dropdownText: {
    fontSize: 20,
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
    marginTop: 10,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#DCEBF5',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 20,
    color: '#4559A7',
    marginLeft: 14,
  },
  categoryDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  checkmark: {
    fontSize: 24,
    color: '#3BB272',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#ADD7EB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputIcon: {
    marginRight: 14,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: '#4559A7',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
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
    paddingVertical: 48,
    gap: 14,
  },
  filePickerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4559A7',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCEBF5',
    borderWidth: 2,
    borderColor: '#3BB272',
    borderRadius: 12,
    padding: 24,
    gap: 14,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 6,
  },
  fileSize: {
    fontSize: 16,
    color: '#3BB272',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3BB272',
    paddingVertical: 24,
    borderRadius: 12,
    marginTop: 24,
    gap: 10,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ADD7EB',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});
