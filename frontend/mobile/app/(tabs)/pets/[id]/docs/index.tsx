import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { 
  FolderOpen,
  Plus,
  NotepadText,
  Stethoscope,
  TestTubeDiagonal,
  Syringe,
  ArrowLeft,
  Bug,
  FileText
} from 'lucide-react-native';
import { useDocumentStore } from '../../../../store/documents';
import { usePetStore } from '../../../../store/pets';
import type { Pet } from '../../../../types';
import { FAB } from '../../../../components/FAB';

const DOCUMENT_CATEGORIES = [
  { id: 'veterinary_notes', title: 'Veterinary Notes', color: '#4559A7' },
  { id: 'diagnostic_reports', title: 'Diagnostic Reports', color: '#4559A7' },
  { id: 'lab_results', title: 'Lab Results', color: '#4559A7' },
  { id: 'vaccination_records', title: 'Vaccination Records', color: '#4559A7' },
  { id: 'discharge_reports', title: 'Discharge Reports', color: '#4559A7' },
];

const CATEGORY_ICONS: Record<string, any> = {
  'veterinary_notes': NotepadText,
  'diagnostic_reports': Stethoscope,
  'lab_results': TestTubeDiagonal,
  'vaccination_records': Syringe,
  'discharge_reports': FileText,
};

export default function DocsScreen() {
  const { id: petId } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const { documents, fetchDocuments } = useDocumentStore();
  const { pets, fetchPets } = usePetStore();

  // Load pets and select the current pet - only once on mount
  useEffect(() => {
    const loadPets = async () => {
      await fetchPets();
    };
    loadPets();
  }, [fetchPets]); // Only run once on mount

  // Select pet when pets list or petId changes
  useEffect(() => {
    if (petId && pets.length > 0) {
      const pet = pets.find((p) => p.id === petId);
      if (pet) {
        setSelectedPet(pet);
      }
    }
  }, [petId, pets]); // Only depend on petId and pets array

  // Load documents when pet is selected - only once
  useEffect(() => {
    if (selectedPet) {
      fetchDocuments();
    }
  }, [selectedPet, fetchDocuments]); // Only depend on the pet ID, not the whole object

  // Refresh documents when screen comes into focus (e.g., after uploading)
  useFocusEffect(
    useCallback(() => {
      if (selectedPet) {
        fetchDocuments();
      }
    }, [selectedPet, fetchDocuments])
  );

  // Get document count for a specific category
  const getCategoryCount = (categoryId: string) => {
    if (!selectedPet) return 0;
    return documents.filter(doc => 
      doc.petId === selectedPet.id && doc.category === categoryId
    ).length;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/(tabs)/pets/${petId}/docs/${categoryId}` as any);
  };

  const getCategoryIcon = (categoryId: string) => {
    return CATEGORY_ICONS[categoryId] || FolderOpen;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#4559A7" />
        </TouchableOpacity>
        <Text style={styles.title}>{selectedPet?.name}&apos;s Documents</Text>
        <View style={styles.headerSpacer} />
      </View>

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
        {/* Document Categories Grid */}
        <View style={styles.categoriesGrid}>
          {DOCUMENT_CATEGORIES.map((category) => {
            const IconComponent = getCategoryIcon(category.id);
            const count = getCategoryCount(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryBox, { borderTopColor: category.color }]}
                onPress={() => handleCategoryPress(category.id)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIconContainer, { backgroundColor: category.color }]}> 
                    <IconComponent size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                </View>
                <Text style={styles.categoryCount}>
                  {count} {count === 1 ? 'file' : 'files'}
                </Text>
              </TouchableOpacity>
            );
          })}
          
        </View>

      </ScrollView>

      {/* Upload Document FAB */}
      <TouchableOpacity
        style={styles.uploadFab}
        onPress={() => router.push(`/(tabs)/pets/${petId}/docs/upload` as any)}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Bug Report FAB */}
      <FAB
        icon={<Bug size={20} color="white" />}
        onPress={() => router.push("/support")}
        style={styles.bugFab}
        size="small"
      />
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
    paddingTop: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  categoryBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
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
    marginBottom: 10,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 6,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 14,
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
  uploadFab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4559A7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bugFab: {
    position: 'absolute',
    top: 70,
    right: 20,
    backgroundColor: '#C62828',
  },
});
