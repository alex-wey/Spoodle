import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, FileText, Syringe, Stethoscope, Scissors, Activity, TestTube, X, Plus, Download } from "lucide-react-native";
import { useEffect, useState } from "react";
import { apiClient } from "../../../lib/api";

interface MedicalRecord {
  recordId: string;
  petId: string;
  ownerId: string;
  fileType: 'medical_history' | 'vaccination' | 'medication' | 'surgical' | 'diagnostic' | 'blood_work' | 'x_ray';
  fileName: string;
  fileUrl?: string;
  uploadDate: string;
  description?: string;
  clinicId?: string;
  vetId?: string;
}

const getFileTypeIcon = (fileType: MedicalRecord['fileType']) => {
  switch (fileType) {
    case 'vaccination':
      return <Syringe size={20} color="#10B981" />;
    case 'medical_history':
      return <FileText size={20} color="#4F46E5" />;
    case 'medication':
      return <Activity size={20} color="#F59E0B" />;
    case 'surgical':
      return <Scissors size={20} color="#EF4444" />;
    case 'diagnostic':
      return <Stethoscope size={20} color="#8B5CF6" />;
    case 'blood_work':
      return <TestTube size={20} color="#EC4899" />;
    case 'x_ray':
      return <X size={20} color="#06B6D4" />;
    default:
      return <FileText size={20} color="#6B7280" />;
  }
};

const getFileTypeColor = (fileType: MedicalRecord['fileType']) => {
  switch (fileType) {
    case 'vaccination':
      return '#10B981';
    case 'medical_history':
      return '#4F46E5';
    case 'medication':
      return '#F59E0B';
    case 'surgical':
      return '#EF4444';
    case 'diagnostic':
      return '#8B5CF6';
    case 'blood_work':
      return '#EC4899';
    case 'x_ray':
      return '#06B6D4';
    default:
      return '#6B7280';
  }
};

const getFileTypeLabel = (fileType: MedicalRecord['fileType']) => {
  return fileType.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export default function PetRecordsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPetRecords();
  }, [id]);

  const loadPetRecords = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPetRecords(id);
      if (response.success) {
        setRecords(response.data as MedicalRecord[]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load pet records");
      console.error("Error loading pet records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRecord = async (record: MedicalRecord) => {
    if (record.fileUrl) {
      try {
        const canOpen = await Linking.canOpenURL(record.fileUrl);
        if (canOpen) {
          await Linking.openURL(record.fileUrl);
        } else {
          Alert.alert("Error", "Cannot open this file");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to open file");
        console.error("Error opening file:", error);
      }
    } else {
      Alert.alert("Info", "File URL not available");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Pet Records</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Pet Records</Text>
        <TouchableOpacity onPress={() => {/* TODO: Navigate to upload screen */}}>
          <Plus size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Records</Text>
            <Text style={styles.emptyText}>
              Medical records for this pet will appear here
            </Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {/* TODO: Navigate to upload screen */}}
            >
              <Plus size={20} color="white" />
              <Text style={styles.addButtonText}>Add Record</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.recordsList}>
            {records.map((record) => {
              const color = getFileTypeColor(record.fileType);
              return (
                <TouchableOpacity
                  key={record.recordId}
                  style={styles.recordCard}
                  onPress={() => handleOpenRecord(record)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                    {getFileTypeIcon(record.fileType)}
                  </View>
                  
                  <View style={styles.recordContent}>
                    <View style={styles.recordHeader}>
                      <Text style={styles.recordTitle} numberOfLines={1}>
                        {record.fileName}
                      </Text>
                      <View style={[styles.typeBadge, { backgroundColor: `${color}15` }]}>
                        <Text style={[styles.typeText, { color }]}>
                          {getFileTypeLabel(record.fileType)}
                        </Text>
                      </View>
                    </View>
                    
                    {record.description && (
                      <Text style={styles.recordDescription} numberOfLines={2}>
                        {record.description}
                      </Text>
                    )}
                    
                    <View style={styles.recordFooter}>
                      <Text style={styles.dateText}>
                        {new Date(record.uploadDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Text>
                      {record.fileUrl && (
                        <View style={styles.downloadIndicator}>
                          <Download size={14} color="#6B7280" />
                          <Text style={styles.downloadText}>View</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  recordsList: {
    padding: 16,
  },
  recordCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recordContent: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  recordTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  recordDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  recordFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  downloadIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  downloadText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
});
