import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ArrowLeft, FileText, Calendar, MapPin, Eye, Plus, X, Shield, Activity, Stethoscope, Zap } from 'lucide-react-native';
import { clerkApiClient } from '../../../../lib/api';
import { Document } from '../../../../store/documents';

// Category configuration
const CATEGORY_CONFIG = {
  'past_appointments': {
    title: 'Past Visits',
    icon: Calendar,
  },
  'x_ray_documents': {
    title: 'X-Ray Documents',
    icon: Zap,
  },
  'diagnostic_reports': {
    title: 'Diagnostic Reports',
    icon: Stethoscope,
  },
  'blood_test_reports': {
    title: 'Blood Test Reports',
    icon: Activity,
  },
  'vaccination_history': {
    title: 'Vaccination History',
    icon: Shield,
  },
} as const;

// Standard blue color for all categories
const PRIMARY_COLOR = '#4559A7';
const LIGHT_BLUE = '#ADD7EB';

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const formatFileSize = (bytes: number) => {
  return `${Math.round(bytes / 1024)} KB`;
};

// Document Card Component
interface DocumentCardProps {
  document: Document;
  category: string;
  onView: (document: Document) => void;
}

function DocumentCard({ document, category, onView }: DocumentCardProps) {
  const IconComponent = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]?.icon || FileText;
  
  return (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <View style={styles.documentIcon}>
          <IconComponent size={24} color="#FFFFFF" />
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentName}>{document.fileName}</Text>
          <Text style={styles.documentDate}>
            {formatDate(document.date || document.createdAt)}
          </Text>
          {document.hospitalName && (
            <View style={styles.hospitalInfo}>
              <MapPin size={14} color={PRIMARY_COLOR} />
              <Text style={styles.hospitalName}>{document.hospitalName}</Text>
            </View>
          )}
        </View>
      </View>
      
      {document.notes && (
        <Text style={styles.documentNotes}>{document.notes}</Text>
      )}
      
      <View style={styles.documentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onView(document)}
        >
          <Eye size={20} color={PRIMARY_COLOR} />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Document Viewer Modal Component
interface DocumentViewerModalProps {
  visible: boolean;
  document: Document | null;
  category: string;
  onClose: () => void;
  onOpenExternal: (document: Document) => void;
}

function DocumentViewerModal({ visible, document, category, onClose, onOpenExternal }: DocumentViewerModalProps) {
  if (!document) return null;
  
  const IconComponent = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]?.icon || FileText;
  const categoryTitle = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]?.title || 'Documents';
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Document Details</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.documentViewer}>
            {document.mimeType?.startsWith('image/') ? (
              <View style={styles.imagePreviewContainer}>
                <View style={styles.imagePreviewIcon}>
                  <IconComponent size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.imagePreviewText}>Image Preview</Text>
                <Text style={styles.imagePreviewSubtext}>Tap "View Document" to open</Text>
              </View>
            ) : (
              <View style={styles.viewerIcon}>
                <IconComponent size={48} color="#FFFFFF" />
              </View>
            )}
            
            <View style={styles.documentDetails}>
              <Text style={styles.documentTitle}>{document.fileName}</Text>
              <Text style={styles.documentCategory}>{categoryTitle}</Text>
              
              <View style={styles.metadataContainer}>
                <View style={styles.metadataRow}>
                  <Calendar size={16} color={PRIMARY_COLOR} />
                  <Text style={styles.metadataLabel}>Date:</Text>
                  <Text style={styles.metadataValue}>
                    {formatDate(document.date || document.createdAt)}
                  </Text>
                </View>
                
                {document.hospitalName && (
                  <View style={styles.metadataRow}>
                    <MapPin size={16} color={PRIMARY_COLOR} />
                    <Text style={styles.metadataLabel}>Hospital:</Text>
                    <Text style={styles.metadataValue}>{document.hospitalName}</Text>
                  </View>
                )}
                
                <View style={styles.metadataRow}>
                  <FileText size={16} color={PRIMARY_COLOR} />
                  <Text style={styles.metadataLabel}>Pet:</Text>
                  <Text style={styles.metadataValue}>
                    {document.pet?.name || 'Unknown'}
                  </Text>
                </View>
                
                <View style={styles.metadataRow}>
                  <FileText size={16} color={PRIMARY_COLOR} />
                  <Text style={styles.metadataLabel}>Size:</Text>
                  <Text style={styles.metadataValue}>
                    {document.fileSize ? formatFileSize(document.fileSize) : 'Unknown'}
                  </Text>
                </View>
              </View>
              
              {document.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{document.notes}</Text>
                </View>
              )}
              
              <View style={styles.technicalDetails}>
                <Text style={styles.technicalLabel}>Technical Details:</Text>
                <Text style={styles.technicalText}>
                  File Path: {document.filePath}
                </Text>
                <Text style={styles.technicalText}>
                  MIME Type: {document.mimeType || 'Unknown'}
                </Text>
                <Text style={styles.technicalText}>
                  Created: {formatDate(document.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => onOpenExternal(document)}
          >
            <Eye size={24} color="#FFFFFF" />
            <Text style={styles.viewButtonText}>View Document</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// Main Component
export default function CategoryDocumentsScreen() {
  const { category, petId } = useLocalSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  const categoryTitle = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]?.title || 'Documents';

  useEffect(() => {
    fetchDocuments();
  }, [category]);

  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Screen focused, refreshing documents...');
      fetchDocuments();
    }, [category, petId])
  );

  const fetchDocuments = async () => {
    if (!category) return;
    
    setLoading(true);
    try {
      console.log(`🔍 Fetching documents for category: ${category}, pet: ${petId}`);
      
      const response = petId 
        ? await clerkApiClient.getDocumentsByPetAndCategory(petId as string, category as string)
        : await clerkApiClient.getDocumentsByCategory(category as string);
      
      if (response.success) {
        console.log('📄 Documents count:', response.data?.length || 0);
        setDocuments(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setViewerVisible(true);
  };

  const handleOpenExternal = async (document: Document) => {
    try {
      setViewerVisible(false);
      
      if (Platform.OS === 'web') {
        const response = await clerkApiClient.downloadDocument(document.id);
        if (response.success) {
          Alert.alert('Download Ready', `Document: ${response.data.fileName}\nSize: ${formatFileSize(response.data.fileSize)}`);
        }
      } else {
        const fileUrl = `http://localhost:3002/api/documents/download/${document.id}`;
        const canOpen = await Linking.canOpenURL(fileUrl);
        
        if (canOpen) {
          await Linking.openURL(fileUrl);
        } else {
          Alert.alert(
            'Open Document',
            'Would you like to download and open this document?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open', onPress: () => Linking.openURL(fileUrl) }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert('Error', 'Failed to open document');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
            tintColor={PRIMARY_COLOR}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.push(`/(tabs)/pets/${petId}/docs` as any)} 
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          <Text style={styles.title}>{categoryTitle}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Documents List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading documents...</Text>
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={64} color={LIGHT_BLUE} />
            <Text style={styles.emptyTitle}>No Documents Found</Text>
            <Text style={styles.emptyDescription}>
              No documents found in this category yet.
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push({
                pathname: `/(tabs)/pets/${petId}/docs/upload` as any,
                params: { category: category }
              })}
            >
              <Text style={styles.addButtonText}>Add First Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.documentsContainer}>
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                category={category as string}
                onView={handleViewDocument}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({
          pathname: `/(tabs)/pets/${petId}/docs/upload` as any,
          params: { category: category }
        })}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        visible={viewerVisible}
        document={selectedDocument}
        category={category as string}
        onClose={() => setViewerVisible(false)}
        onOpenExternal={handleOpenExternal}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_BLUE,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: PRIMARY_COLOR,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  documentsContainer: {
    padding: 20,
  },
  documentCard: {
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
    borderColor: LIGHT_BLUE,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    marginBottom: 4,
  },
  hospitalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospitalName: {
    fontSize: 12,
    color: PRIMARY_COLOR,
    marginLeft: 4,
  },
  documentNotes: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontStyle: 'italic',
    marginBottom: 12,
    paddingLeft: 60,
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: LIGHT_BLUE,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: LIGHT_BLUE,
    minWidth: 120,
  },
  actionText: {
    fontSize: 16,
    color: PRIMARY_COLOR,
    marginLeft: 8,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_BLUE,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  documentViewer: {
    alignItems: 'center',
  },
  viewerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  documentDetails: {
    width: '100%',
    alignItems: 'center',
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    textAlign: 'center',
    marginBottom: 8,
  },
  documentCategory: {
    fontSize: 16,
    color: PRIMARY_COLOR,
    opacity: 0.7,
    marginBottom: 24,
  },
  metadataContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
  },
  metadataValue: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    flex: 1,
  },
  notesContainer: {
    width: '100%',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_COLOR,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    lineHeight: 20,
  },
  technicalDetails: {
    width: '100%',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: LIGHT_BLUE,
  },
  technicalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: 12,
  },
  technicalText: {
    fontSize: 12,
    color: PRIMARY_COLOR,
    opacity: 0.8,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: LIGHT_BLUE,
    alignItems: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    gap: 12,
    minWidth: 200,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  imagePreviewIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  imagePreviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  imagePreviewSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
