import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { X, Hospital } from 'lucide-react-native';
import { clerkApiClient } from '../../../lib/api';

interface Clinic {
  id: string;
  clerkOrgId: string;
  name: string;
  slug: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  imageUrl?: string;
  _count?: {
    petOwners: number;
  };
}

interface ClinicSwitchModalProps {
  visible: boolean;
  currentClinicId: string;
  currentClinicName: string;
  onClose: () => void;
  onSwitch: (clinic: Clinic) => void;
}

export function ClinicSwitchModal({
  visible,
  currentClinicId,
  currentClinicName,
  onClose,
  onSwitch,
}: ClinicSwitchModalProps) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [spoodleClinic, setSpoodleClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      fetchClinics();
    }
  }, [visible]);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clerkApiClient.getClinics();
      
      if (response.data) {
        // Separate Spoodle from other clinics
        const spoodle = response.data.find(c => c.slug === 'spoodle' && c.id !== currentClinicId);
        const otherClinics = response.data
          .filter(c => c.slug !== 'spoodle' && c.id !== currentClinicId)
          .sort((a, b) => a.name.localeCompare(b.name));
        setSpoodleClinic(spoodle || null);
        setClinics(otherClinics);
      }
    } catch (err: any) {
      console.error('Error fetching clinics:', err);
      setError('Failed to load clinics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClinic = (clinic: Clinic) => {
    onSwitch(clinic);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Switch Clinic</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#4559A7" />
          </TouchableOpacity>
        </View>

        <View style={styles.currentClinicBanner}>
          <Text style={styles.currentClinicLabel}>Current Clinic:</Text>
          <Text style={styles.currentClinicName}>{currentClinicName}</Text>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4559A7" />
            <Text style={styles.loadingText}>Loading clinics...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchClinics}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : clinics.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Hospital size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No other clinics available</Text>
            <Text style={styles.emptySubtext}>
              You are already a member of the only available clinic.
            </Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <ScrollView style={styles.clinicList} showsVerticalScrollIndicator={false}>
              <Text style={styles.subtitle}>Select a new clinic:</Text>
              {clinics.length === 0 ? (
                <View style={styles.emptyStateInline}>
                  <Hospital size={48} color="#9CA3AF" />
                  <Text style={styles.emptyStateText}>No other clinics available</Text>
                </View>
              ) : (
                clinics.map((clinic) => (
                  <TouchableOpacity
                    key={clinic.id}
                    style={styles.clinicCard}
                    onPress={() => handleSelectClinic(clinic)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.clinicContent}>
                      {clinic.imageUrl ? (
                        <Image
                          source={{ uri: clinic.imageUrl }}
                          style={styles.clinicImage}
                        />
                      ) : (
                        <View style={styles.clinicImagePlaceholder}>
                          <Hospital size={24} color="#4559A7" />
                        </View>
                      )}

                      <View style={styles.clinicInfo}>
                        <Text style={styles.clinicName}>{clinic.name}</Text>
                        {clinic.address && (
                          <Text style={styles.clinicAddress} numberOfLines={1}>
                            {clinic.address}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {/* Fixed Spoodle Section at Bottom */}
            {spoodleClinic && (
              <View style={styles.spoodleSection}>
                <View style={styles.spoodleDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.spoodleCard}
                  onPress={() => handleSelectClinic(spoodleClinic)}
                  activeOpacity={0.7}
                >
                  <View style={styles.spoodleContent}>
                    <View style={styles.spoodleIcon}>
                      <Image
                        source={require('../../../../assets/images/icon.png')}
                        style={styles.spoodleLogo}
                      />
                    </View>

                    <View style={styles.spoodleInfo}>
                      <Text style={styles.spoodleTitle}>Can't find your clinic?</Text>
                      <Text style={styles.spoodleSubtitle}>
                        Switch to Spoodle
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4559A7',
  },
  closeButton: {
    padding: 8,
  },
  currentClinicBanner: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4559A7',
  },
  currentClinicLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  currentClinicName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4559A7',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4559A7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4559A7',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  clinicList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  clinicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  clinicContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  clinicImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  clinicImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clinicInfo: {
    flex: 1,
    marginLeft: 16,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  contentContainer: {
    flex: 1,
  },
  emptyStateInline: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  spoodleSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  spoodleDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  spoodleCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  spoodleContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  spoodleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  spoodleLogo: {
    width: 56,
    height: 56,
  },
  spoodleInfo: {
    flex: 1,
    marginLeft: 16,
  },
  spoodleTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 4,
  },
  spoodleSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
});

