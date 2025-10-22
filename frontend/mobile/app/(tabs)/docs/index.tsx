import React, { useState, useEffect } from 'react';
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
import { 
  FileText, 
  Plus, 
  MessageCircle, 
  FolderOpen,
  Upload,
  ChevronRight,
  Calendar,
  Stethoscope,
  TestTube,
  Syringe,
  FileImage,
  Search
} from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';
import { useDocumentStore } from '../../store/documents';
import { FAB } from '../../components/FAB';
import { Bug } from 'lucide-react-native';

export default function DocsScreen() {
  const [documentCategories, setDocumentCategories] = useState([
    { id: 'past_appointments', title: 'Past Appointments', fileCount: 0, color: '#3BB272' },
    { id: 'x_ray_documents', title: 'X-Ray Documents', fileCount: 0, color: '#E75325' },
    { id: 'diagnostic_reports', title: 'Diagnostic Reports', fileCount: 0, color: '#FF5D91' },
    { id: 'blood_test_reports', title: 'Blood Test Reports', fileCount: 0, color: '#4559A7' },
    { id: 'vaccination_history', title: 'Vaccination History', fileCount: 0, color: '#E75325' },
    { id: 'upload-documents', title: 'Upload Past Medical Records', fileCount: null, color: '#3BB272', isUpload: true },
  ]);
  const [loading, setLoading] = useState(false);

  const { token } = useAuthStore();
  const { documents, fetchDocuments } = useDocumentStore();

  useEffect(() => {
    fetchDocumentCounts();
    fetchDocuments();
  }, []);

  const fetchDocumentCounts = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      // Fetch document counts for each category
      const counts = await Promise.all(
        documentCategories.map(async (category) => {
          if (category.isUpload) return category;
          
          try {
            const response = await fetch(`http://localhost:3002/api/documents/category/${category.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              return { ...category, fileCount: data.documents?.length || 0 };
            }
            return { ...category, fileCount: 0 };
          } catch (error) {
            console.error(`Error fetching ${category.title}:`, error);
            return { ...category, fileCount: 0 };
          }
        })
      );
      
      setDocumentCategories(counts);
    } catch (error) {
      console.error('Error fetching document counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category) => {
    console.log('Category pressed:', category.id);
    if (category.isUpload) {
      console.log('Navigating to upload page');
      Alert.alert('Upload', 'Opening upload page...', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => router.push('/(tabs)/docs/upload') }
      ]);
    } else {
      console.log('Navigating to category page:', category.id);
      router.push(`/(tabs)/docs/${category.id}`);
    }
  };

  const handleChatButton = () => {
    Alert.alert(
      'Chat with Spoodle',
      'This will open the chatbot to help you with your documents.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Chat', onPress: () => console.log('Chat started') },
      ]
    );
  };

  const getCategoryIcon = (categoryId) => {
    switch (categoryId) {
      case 'past_appointments':
        return Calendar;
      case 'x_ray_documents':
        return FileImage;
      case 'diagnostic_reports':
        return Stethoscope;
      case 'blood_test_reports':
        return TestTube;
      case 'vaccination_history':
        return Syringe;
      default:
        return FolderOpen;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.title}>Docs & Files</Text>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => router.push('/(tabs)/docs/upload')}
          >
            <Upload size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#ADD7EB" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search files..."
              placeholderTextColor="#ADD7EB"
            />
          </View>
        </View>

        {/* Document Categories Grid */}
        <View style={styles.categoriesGrid}>
          {documentCategories.map((category) => {
            const IconComponent = getCategoryIcon(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryBox, { borderTopColor: category.color }]}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryCount}>
                  {category.fileCount !== null ? `${category.fileCount} files` : ''}
                </Text>
                {category.isUpload && (
                  <View style={styles.uploadIcon}>
                    <Plus size={32} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* Bug Report FAB */}
      <View style={styles.fabContainer}>
        <FAB
          icon={<Bug size={20} color="#4559A7" />}
          onPress={() => router.push("/support")}
          style={styles.fabSecondary}
          size="small"
        />
      </View>
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
    paddingTop: 20,
    paddingBottom: 16,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4559A7',
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4559A7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ADD7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4559A7',
    marginLeft: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  categoryBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ADD7EB',
    borderTopWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: '#4559A7',
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3BB272',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fabSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ADD7EB',
  },
});
