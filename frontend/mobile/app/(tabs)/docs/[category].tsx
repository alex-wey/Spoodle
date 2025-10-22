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
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, FileText, Calendar, MapPin, Download, Eye } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';
import { useDocumentStore } from '../../store/documents';

export default function CategoryDocumentsScreen() {
  const { category } = useLocalSearchParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchDocuments();
  }, [category]);

  const fetchDocuments = async () => {
    if (!token || !category) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3002/api/documents/category/${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (document) => {
    Alert.alert('View Document', `Opening ${document.fileName}...`);
  };

  const handleDownloadDocument = (document) => {
    Alert.alert('Download Document', `Downloading ${document.fileName}...`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
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
              onPress={() => router.push('/(tabs)/docs/upload')}
            >
              <Text style={styles.addButtonText}>Add First Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.documentsContainer}>
            {documents.map((document, index) => (
              <View key={index} style={styles.documentCard}>
                <View style={styles.documentHeader}>
                  <View style={[styles.documentIcon, { backgroundColor: categoryColors[category] }]}>
                    <FileText size={24} color="#FFFFFF" />
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
                    <Eye size={16} color="#4559A7" />
                    <Text style={styles.actionText}>View</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDownloadDocument(document)}
                  >
                    <Download size={16} color="#4559A7" />
                    <Text style={styles.actionText}>Download</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ADD7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ADD7EB',
  },
  actionText: {
    fontSize: 14,
    color: '#4559A7',
    marginLeft: 6,
    fontWeight: '500',
  },
});
