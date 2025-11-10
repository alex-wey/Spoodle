import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { clerkApiClient } from '../lib/api';

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

export default function SelectClinicScreen() {
  const router = useRouter();
  const [clinics, setClinics] = React.useState<Clinic[]>([]);
  const [spoodleClinic, setSpoodleClinic] = React.useState<Clinic | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selecting, setSelecting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showToast, setShowToast] = React.useState(false);
  const toastOpacity = React.useRef(new Animated.Value(0)).current;

  // Fetch available clinics
  React.useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await clerkApiClient.getClinics();

      if (response.data) {
        // Separate Spoodle from other clinics
        const spoodle = response.data.find(c => c.slug === 'spoodle');
        const otherClinics = response.data
          .filter(c => c.slug !== 'spoodle')
          .sort((a, b) => a.name.localeCompare(b.name));
        setSpoodleClinic(spoodle || null);
        setClinics(otherClinics);
      }
    } catch (err: any) {
      console.error('Error fetching clinics:', err);
      showErrorToast('Failed to load clinics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showErrorToast = (message: string) => {
    setError(message);
    setShowToast(true);

    // Fade in
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowToast(false);
        setError('');
      });
    }, 3000);
  };

  const handleSelectClinic = async (clinic: Clinic) => {
    try {
      setSelecting(true);

      // Call API to assign clinic to user
      const response = await clerkApiClient.selectClinic(clinic.id);

      if (response.success) {
        // Successfully selected clinic, navigate to main app
        router.replace('/(tabs)/pets');
      } else {
        showErrorToast(response.message || 'Failed to select clinic');
      }
    } catch (err: any) {
      console.error('Error selecting clinic:', err);
      showErrorToast('Failed to select clinic. Please try again.');
    } finally {
      setSelecting(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#4559A7', '#5B6FB8', '#3A4A8F']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading clinics...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const renderClinicCard = (clinic: Clinic) => (
    <TouchableOpacity
      key={clinic.id}
      style={styles.clinicCard}
      onPress={() => handleSelectClinic(clinic)}
      disabled={selecting}
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
            <Ionicons name="business" size={32} color="#4559A7" />
          </View>
        )}
        
        <Text style={styles.clinicName}>{clinic.name}</Text>
        
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color="#9CA3AF" 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#4559A7', '#5B6FB8', '#3A4A8F']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Clinic</Text>
          <Text style={styles.subtitle}>
            Select your veterinary clinic from our list of trusted partners:
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {clinics.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={64} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.emptyText}>No clinics available</Text>
            </View>
          ) : (
            clinics.map((clinic) => renderClinicCard(clinic))
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
              disabled={selecting}
              activeOpacity={0.7}
            >
              <View style={styles.spoodleContent}>
                <View style={styles.spoodleIcon}>
                  <Image 
                    source={require('../../assets/images/icon.png')} 
                    style={styles.spoodleLogo}
                  />
                </View>
                
                <View style={styles.spoodleInfo}>
                  <Text style={styles.spoodleTitle}>Can't find your clinic?</Text>
                  <Text style={styles.spoodleSubtitle}>
                    Join Spoodle and get started!
                  </Text>
                </View>
                
                <Ionicons 
                  name="chevron-forward" 
                  size={24} 
                  color="#9CA3AF" 
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Overlay */}
        {selecting && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4559A7" />
              <Text style={styles.loadingBoxText}>Joining clinic...</Text>
            </View>
          </View>
        )}

        {/* Toast Notification */}
        {showToast && (
          <Animated.View
            style={[
              styles.toastContainer,
              { opacity: toastOpacity }
            ]}
          >
            <View style={styles.toast}>
              <Ionicons name="alert-circle" size={20} color="#FCA5A5" />
              <Text style={styles.toastText}>{error}</Text>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  clinicCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  clinicContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  clinicImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  clinicImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clinicInfo: {
    flex: 1,
    marginLeft: 16,
  },
  clinicName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 16,
  },
  clinicDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  clinicDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  memberCountText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingBoxText: {
    color: '#1F2937',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    zIndex: 1000,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  spoodleSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  spoodleDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  spoodleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  spoodleSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
  },
});

