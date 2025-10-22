import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
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
  FileImage
} from 'lucide-react-native';
import { useAuthStore } from './store/auth';

export default function DocsFilesScreen() {
  const [documentCategories, setDocumentCategories] = useState([
    { id: 'past_appointments', title: 'Past Appointments', fileCount: 0, color: '#10B981' },
    { id: 'x_ray_documents', title: 'X-Ray Documents', fileCount: 0, color: '#F59E0B' },
    { id: 'diagnostic_reports', title: 'Diagnostic Reports', fileCount: 0, color: '#EC4899' },
    { id: 'blood_test_reports', title: 'Blood Test Reports', fileCount: 0, color: '#3B82F6' },
    { id: 'vaccination_history', title: 'Vaccination History', fileCount: 0, color: '#8B5CF6' },
    { id: 'upload-documents', title: 'Upload Documents', fileCount: null, color: '#10B981', isUpload: true },
  ]);
  const [loading, setLoading] = useState(false);

  const { token } = useAuthStore();

  useEffect(() => {
    fetchDocumentCounts();
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
    if (category.isUpload) {
      router.push('/docs-files/form');
    } else {
      router.push(`/docs-files/${category.id}`);
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
          <Text style={styles.title}>Docs & Files</Text>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => router.push('/docs-files/form')}
          >
            <Upload size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Organize and manage all your pet's medical documents and files in one place.
          </Text>
        </View>

        {/* Document Categories */}
        <View style={styles.categoriesContainer}>
          {documentCategories.map((category) => {
            const IconComponent = getCategoryIcon(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <IconComponent size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryCount}>
                      {category.fileCount !== null ? `${category.fileCount} files` : 'Upload new files'}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#6B7280" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/docs-files/form')}
            >
              <Plus size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Add Document</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: '#3BB272' }]}
              onPress={handleChatButton}
            >
              <MessageCircle size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Ask Spoodle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleChatButton}
      >
        <MessageCircle size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4559A7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#4559A7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3BB272',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
