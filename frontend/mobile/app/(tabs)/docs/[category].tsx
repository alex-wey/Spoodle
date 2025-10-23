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
  Image,
  Linking,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ArrowLeft, FileText, Calendar, MapPin, Download, Eye, Plus, X, ExternalLink, Shield, Activity, Stethoscope, Zap, Microscope, Heart, Pill } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';
import { useDocumentStore } from '../../store/documents';

export default function CategoryDocumentsScreen() {
  const { category, petId } = useLocalSearchParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  const { token } = useAuthStore();
  const { fetchDocumentsByCategory } = useDocumentStore();

  const categoryTitles = {
    'past_appointments': 'Past Appointments',
    'x_ray_documents': 'X-Ray Documents',
    'diagnostic_reports': 'Diagnostic Reports',
    'blood_test_reports': 'Blood Test Reports',
    'vaccination_history': 'Vaccination History',
  };

  const categoryColors = {
    'past_appointments': '#3BB272',
    'x_ray_documents': '#E75325',
    'diagnostic_reports': '#4559A7',
    'blood_test_reports': '#ADD7EB',
    'vaccination_history': '#4559A7',
  };

  const categoryIcons = {
    'past_appointments': Calendar,
    'x_ray_documents': Zap,
    'diagnostic_reports': Stethoscope,
    'blood_test_reports': Activity,
    'vaccination_history': Shield,
  };

  useEffect(() => {
    fetchDocuments();
  }, [category]);

  // Refresh documents when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Screen focused, refreshing documents...');
      fetchDocuments();
    }, [category, petId, token])
  );

  const fetchDocuments = async () => {
    if (!token || !category) return;
    
    setLoading(true);
    try {
      console.log(`🔍 Fetching documents for category: ${category}, pet: ${petId}`);
      
      // Use pet-specific endpoint if petId is provided, otherwise use general category endpoint
      const endpoint = petId 
        ? `http://localhost:3002/api/documents/pet/${petId}/category/${category}`
        : `http://localhost:3002/api/documents/category/${category}`;
        
      console.log(`📡 Using endpoint: ${endpoint}`);
        
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`📡 Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📄 Category documents response:', data);
        console.log('📄 Documents array:', data.data);
        console.log('📄 Documents count:', data.data?.length || 0);
        setDocuments(data.data || []);
      } else {
        console.error('❌ Failed to fetch documents:', response.status);
        const errorData = await response.text();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };

  const handleViewDocument = async (document) => {
    try {
      console.log('🔍 Viewing document:', document);
      
      // Check if it's an image file
      if (document.mimeType?.startsWith('image/')) {
        setSelectedDocument(document);
        setViewerVisible(true);
        return;
      }
      
      // For PDFs and other documents, try to open with external app
      if (document.mimeType === 'application/pdf' || document.mimeType?.includes('pdf')) {
        Alert.alert(
          'Open PDF',
          'PDF files need to be opened with an external PDF viewer. Would you like to download and open this document?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Download & Open', 
              onPress: async () => {
                try {
                  const response = await fetch(`http://localhost:3002/api/documents/download/${document.id}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });
                  
                  if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    await Linking.openURL(url);
                  } else {
                    Alert.alert('Error', 'Failed to download document');
                  }
                } catch (error) {
                  console.error('Error opening PDF:', error);
                  Alert.alert('Error', 'Failed to open document');
                }
              }
            }
          ]
        );
        return;
      }
      
      // For other file types, show details modal
      setSelectedDocument(document);
      setViewerVisible(true);
      
    } catch (error) {
      console.error('Error viewing document:', error);
      Alert.alert('Error', 'Failed to view document');
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      Alert.alert(
        'Download Document',
        `Would you like to download "${document.fileName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Download', 
            onPress: async () => {
              try {
                // Show loading state
                Alert.alert('Download Started', `Preparing download for ${document.fileName}...`);
                
                // Call backend download endpoint
                const response = await fetch(`http://localhost:3002/api/documents/download/${document.id}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });
                
                if (response.ok) {
                  const data = await response.json();
                  console.log('📥 Download response:', data);
                  
                  Alert.alert(
                    'Download Ready',
                    `Document: ${data.data.fileName}\nSize: ${Math.round(data.data.fileSize / 1024)} KB\nType: ${data.data.mimeType}\n\nNote: In a full implementation, this would download the file to your device. For now, you can view the document details in the viewer.`,
                    [
                      { text: 'OK', style: 'default' }
                    ]
                  );
                } else {
                  const errorData = await response.json();
                  Alert.alert('Download Failed', errorData.message || 'Failed to download document');
                }
              } catch (error) {
                console.error('Download error:', error);
                Alert.alert('Download Error', 'Failed to download document. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Download handler error:', error);
      Alert.alert('Error', 'Failed to initiate download. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
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
          <Text style={styles.title}>{categoryTitles[category] || 'Documents'}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Documents List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading documents...</Text>
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={64} color="#ADD7EB" />
            <Text style={styles.emptyTitle}>No Documents Found</Text>
            <Text style={styles.emptyDescription}>
              No documents found in this category yet.
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push({
                pathname: '/(tabs)/docs/upload',
                params: { category: category }
              })}
            >
              <Text style={styles.addButtonText}>Add First Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.documentsContainer}>
            {console.log('📋 Rendering documents:', documents)}
            {documents.map((document, index) => (
              <View key={index} style={styles.documentCard}>
                <View style={styles.documentHeader}>
                  <View style={[styles.documentIcon, { backgroundColor: categoryColors[category] }]}>
                    {(() => {
                      const IconComponent = categoryIcons[category] || FileText;
                      return <IconComponent size={24} color="#FFFFFF" />;
                    })()}
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName}>{document.fileName}</Text>
                    <Text style={styles.documentDate}>
                      {formatDate(document.date || document.createdAt)}
                    </Text>
                    {document.hospitalName && (
                      <View style={styles.hospitalInfo}>
                        <MapPin size={14} color="#4559A7" />
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
                    onPress={() => handleViewDocument(document)}
                  >
                    <Eye size={20} color="#4559A7" />
                    <Text style={styles.actionText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({
          pathname: '/(tabs)/docs/upload',
          params: { category: category }
        })}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Document Viewer Modal */}
      <Modal
        visible={viewerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setViewerVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setViewerVisible(false)}
            >
              <X size={24} color="#4559A7" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Document Details</Text>
            <View style={styles.placeholder} />
          </View>
          
          {selectedDocument && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.documentViewer}>
                {/* File Content Display */}
             {selectedDocument && selectedDocument.mimeType?.startsWith('image/') ? (
               <View style={styles.imagePreviewContainer}>
                 <View style={[styles.imagePreviewIcon, { backgroundColor: categoryColors[selectedDocument.category] }]}>
                   {(() => {
                     const IconComponent = categoryIcons[selectedDocument.category] || FileText;
                     return <IconComponent size={24} color="#FFFFFF" />;
                   })()}
                 </View>
                 <Text style={styles.imagePreviewText}>Image Preview</Text>
                 <Text style={styles.imagePreviewSubtext}>Tap "Open Externally" to view</Text>
               </View>
             ) : (
                  /* Document Icon for non-images */
                  <View style={[styles.viewerIcon, { backgroundColor: categoryColors[selectedDocument.category] }]}>
                    {(() => {
                      const IconComponent = categoryIcons[selectedDocument.category] || FileText;
                      return <IconComponent size={48} color="#FFFFFF" />;
                    })()}
                  </View>
                )}
                
                {/* Document Info */}
                <View style={styles.documentDetails}>
                  <Text style={styles.documentTitle}>{selectedDocument.fileName}</Text>
                  <Text style={styles.documentCategory}>{categoryTitles[selectedDocument.category]}</Text>
                  
                  {/* Document Metadata */}
                  <View style={styles.metadataContainer}>
                    <View style={styles.metadataRow}>
                      <Calendar size={16} color="#4559A7" />
                      <Text style={styles.metadataLabel}>Date:</Text>
                      <Text style={styles.metadataValue}>
                        {formatDate(selectedDocument.date || selectedDocument.createdAt)}
                      </Text>
                    </View>
                    
                    {selectedDocument.hospitalName && (
                      <View style={styles.metadataRow}>
                        <MapPin size={16} color="#4559A7" />
                        <Text style={styles.metadataLabel}>Hospital:</Text>
                        <Text style={styles.metadataValue}>{selectedDocument.hospitalName}</Text>
                      </View>
                    )}
                    
                    <View style={styles.metadataRow}>
                      <FileText size={16} color="#4559A7" />
                      <Text style={styles.metadataLabel}>Pet:</Text>
                      <Text style={styles.metadataValue}>
                        {selectedDocument.pet?.name || 'Unknown'}
                      </Text>
                    </View>
                    
                    <View style={styles.metadataRow}>
                      <Download size={16} color="#4559A7" />
                      <Text style={styles.metadataLabel}>Size:</Text>
                      <Text style={styles.metadataValue}>
                        {selectedDocument.fileSize ? `${Math.round(selectedDocument.fileSize / 1024)} KB` : 'Unknown'}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Notes Section */}
                  {selectedDocument.notes && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>Notes:</Text>
                      <Text style={styles.notesText}>{selectedDocument.notes}</Text>
                    </View>
                  )}
                  
                  {/* Technical Details */}
                  <View style={styles.technicalDetails}>
                    <Text style={styles.technicalLabel}>Technical Details:</Text>
                    <Text style={styles.technicalText}>
                      File Path: {selectedDocument.filePath}
                    </Text>
                    <Text style={styles.technicalText}>
                      MIME Type: {selectedDocument.mimeType || 'Unknown'}
                    </Text>
                    <Text style={styles.technicalText}>
                      Created: {formatDate(selectedDocument.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
          
          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={async () => {
                try {
                  // Close the modal first
                  setViewerVisible(false);
                  
                  if (Platform.OS === 'web') {
                    // For web, download and open in new tab
                    const response = await fetch(`http://localhost:3002/api/documents/download/${selectedDocument.id}`, {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                    });
                    
                    if (response.ok) {
                      const blob = await response.blob();
                      const url = URL.createObjectURL(blob);
                      window.open(url, '_blank');
                    } else {
                      Alert.alert('Error', 'Failed to open document');
                    }
                  } else {
                    // For mobile, try to open the file URL directly
                    const fileUrl = selectedDocument.fileUrl || `http://localhost:3002/api/documents/download/${selectedDocument.id}`;
                    
                    // Check if we can open this URL
                    const canOpen = await Linking.canOpenURL(fileUrl);
                    
                    if (canOpen) {
                      await Linking.openURL(fileUrl);
                    } else {
                      // If direct URL doesn't work, try downloading first
                      Alert.alert(
                        'Open Document',
                        'Would you like to download and open this document?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Download & Open', 
                            onPress: async () => {
                              try {
                                const response = await fetch(`http://localhost:3002/api/documents/download/${selectedDocument.id}`, {
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                  },
                                });
                                
                                if (response.ok) {
                                  const blob = await response.blob();
                                  const url = URL.createObjectURL(blob);
                                  await Linking.openURL(url);
                                } else {
                                  Alert.alert('Error', 'Failed to download document');
                                }
                              } catch (error) {
                                console.error('Error downloading document:', error);
                                Alert.alert('Error', 'Failed to download document');
                              }
                            }
                          }
                        ]
                      );
                    }
                  }
                } catch (error) {
                  console.error('Error opening document:', error);
                  Alert.alert('Error', 'Failed to open document');
                }
              }}
            >
              <Eye size={24} color="#FFFFFF" />
              <Text style={styles.viewButtonText}>View Record</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#4559A7',
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
    color: '#4559A7',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#4559A7',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#4559A7',
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
    borderColor: '#ADD7EB',
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
    color: '#4559A7',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 14,
    color: '#4559A7',
    marginBottom: 4,
  },
  hospitalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospitalName: {
    fontSize: 12,
    color: '#4559A7',
    marginLeft: 4,
  },
  documentNotes: {
    fontSize: 14,
    color: '#4559A7',
    fontStyle: 'italic',
    marginBottom: 12,
    paddingLeft: 60,
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ADD7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#ADD7EB',
    minWidth: 120,
  },
  actionText: {
    fontSize: 16,
    color: '#4559A7',
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
    backgroundColor: '#3BB272',
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
    borderBottomColor: '#ADD7EB',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4559A7',
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
    color: '#4559A7',
    textAlign: 'center',
    marginBottom: 8,
  },
  documentCategory: {
    fontSize: 16,
    color: '#4559A7',
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
    color: '#4559A7',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
  },
  metadataValue: {
    fontSize: 14,
    color: '#4559A7',
    flex: 1,
  },
  notesContainer: {
    width: '100%',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E75325',
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#4559A7',
    lineHeight: 20,
  },
  technicalDetails: {
    width: '100%',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ADD7EB',
  },
  technicalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 12,
  },
  technicalText: {
    fontSize: 12,
    color: '#4559A7',
    opacity: 0.8,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ADD7EB',
    alignItems: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4559A7',
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
    backgroundColor: '#4559A7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  imagePreviewEmoji: {
    fontSize: 24,
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
