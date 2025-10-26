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
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
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
  Search,
  Shield,
  Activity,
  Zap,
  Microscope,
  Heart,
  Pill,
  ArrowLeft
} from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useDocumentStore } from '../../../../store/documents';
import { usePetStore } from '../../../../store/pets';
import { FAB } from '../../../../components/FAB';
import { Bug } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import type { Pet } from '../../../../types';

export default function DocsScreen() {
  const { id: petId } = useLocalSearchParams<{ id: string }>();
  
  const [documentCategories, setDocumentCategories] = useState([
    { id: 'past_appointments', title: 'Past Appointments', fileCount: 0, color: '#3BB272' },
    { id: 'x_ray_documents', title: 'X-Ray Documents', fileCount: 0, color: '#E75325' },
    { id: 'diagnostic_reports', title: 'Diagnostic Reports', fileCount: 0, color: '#FF5D91' },
    { id: 'blood_test_reports', title: 'Blood Test Reports', fileCount: 0, color: '#4559A7' },
    { id: 'vaccination_history', title: 'Vaccination History', fileCount: 0, color: '#E75325' },
    { id: 'upload-documents', title: 'Upload Past Documents', fileCount: null, color: '#3BB272', isUpload: true },
  ]);

  const categoryIcons: Record<string, any> = {
    'past_appointments': Calendar,
    'x_ray_documents': Zap,
    'diagnostic_reports': Stethoscope,
    'blood_test_reports': Activity,
    'vaccination_history': Shield,
  };
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const { getToken } = useAuth();
  const { documents, fetchDocuments } = useDocumentStore();
  const { pets, fetchPets } = usePetStore();

  useEffect(() => {
    fetchPets(getToken);
  }, []);

  useEffect(() => {
    // Auto-select the pet based on the petId from URL params
    if (petId && pets.length > 0) {
      const pet = pets.find((p) => p.id === petId);
      if (pet) {
        setSelectedPet(pet);
      }
    }
  }, [petId, pets]);

  useEffect(() => {
    if (selectedPet) {
      fetchDocumentCounts();
      fetchDocuments();
    }
  }, [selectedPet]);

  // Refresh document counts when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Docs screen focused, refreshing document counts...');
      fetchDocumentCounts();
    }, [selectedPet, getToken])
  );

  const fetchDocumentCounts = async () => {
    if (!selectedPet) return;
    
    console.log(`📊 Fetching document counts for pet: ${selectedPet.name} (${selectedPet.id})`);
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      
      // Fetch document counts for each category for the selected pet
      const counts = await Promise.all(
        documentCategories.map(async (category) => {
          if (category.isUpload) return category;
          
          try {
            const endpoint = `http://localhost:3002/api/documents/pet/${selectedPet.id}/category/${category.id}`;
            console.log(`📡 Fetching count for ${category.title}: ${endpoint}`);
            
            const response = await fetch(endpoint, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              const count = data.data?.length || 0;
              console.log(`📊 ${category.title} documents for ${selectedPet.name}: ${count}`);
              return { ...category, fileCount: count };
            }
            console.error(`❌ Failed to fetch ${category.title} count:`, response.status);
            return { ...category, fileCount: 0 };
          } catch (error) {
            console.error(`Error fetching ${category.title} for ${selectedPet.name}:`, error);
            return { ...category, fileCount: 0 };
          }
        })
      );
      
      console.log('📊 Updated document categories with counts:', counts);
      setDocumentCategories(counts);
    } catch (error) {
      console.error('Error fetching document counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocumentCounts();
    setRefreshing(false);
  };

  const handleCategoryPress = (category: any) => {
    console.log('Category pressed:', category.id);
    if (category.isUpload) {
      console.log('Navigating to upload page');
      router.push(`/(tabs)/pets/${petId}/docs/upload` as any);
    } else {
      console.log('Navigating to category page:', category.id);
      router.push(`/(tabs)/pets/${petId}/docs/${category.id}?petId=${petId}` as any);
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

  const getCategoryIcon = (categoryId: string) => {
    return categoryIcons[categoryId] || FolderOpen;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4559A7"]}
            tintColor="#4559A7"
          />
        }
      >
        {/* Header */}
          <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#4559A7" />
          </TouchableOpacity>
          <Text style={styles.title}>{selectedPet?.name}'s Docs</Text>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => router.push(`/(tabs)/pets/${petId}/docs/upload` as any)}
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
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIconContainer, { backgroundColor: category.color }]}>
                    <IconComponent size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                </View>
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
          icon={<Bug size={24} color="#FFFFFF" />}
          onPress={() => router.push("/support")}
          style={styles.fabBug}
          size="large"
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
    borderBottomWidth: 1,
    borderBottomColor: '#ADD7EB',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
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
  petSelector: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  petSelectorTitle: {
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
  categoryHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
  fabBug: {
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: 64,
    height: 64,
  },
});
