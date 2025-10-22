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
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Heart, 
  Calendar,
  Settings,
  LogOut,
  Edit3
} from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';
import { usePetStore } from '../../store/pets';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: null,
    address: null,
    createdAt: new Date('2024-01-15'),
  });
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, logout } = useAuthStore();
  const { pets: petsFromStore } = usePetStore();

  useEffect(() => {
    fetchProfileData();
    if (petsFromStore) {
      setPets(petsFromStore);
    }
  }, [petsFromStore]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Use user data from auth store if available
      if (user) {
        setProfile({
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Pet Owner',
          email: user.email || 'user@example.com',
          phone: null,
          address: null,
          createdAt: new Date(user.createdAt || '2024-01-15'),
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => {
          await logout();
          router.replace("/(auth)/landing");
        }},
      ]
    );
  };

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => Alert.alert('Edit Profile', 'Edit profile functionality coming soon!')}
          >
            <Edit3 size={20} color="#4559A7" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <User size={32} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
            </View>
          </View>
        </View>

        {/* Pet Summary Card */}
        <View style={styles.petSummaryCard}>
          <View style={styles.petSummaryHeader}>
            <View style={styles.petSummaryIconContainer}>
              <Heart size={28} color="#8B5CF6" />
            </View>
            <View style={styles.petSummaryInfo}>
              <Text style={styles.petSummaryTitle}>My Pets</Text>
              <Text style={styles.petSummarySubtitle}>
                {pets.length} {pets.length === 1 ? 'pet' : 'pets'} registered
              </Text>
            </View>
          </View>
          {pets.length > 0 && (
            <View style={styles.petList}>
              {pets.slice(0, 3).map((pet, index) => (
                <View key={pet.id} style={styles.petItem}>
                  <View style={styles.petAvatar}>
                    <Text style={styles.petInitial}>
                      {pet.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.petDetails}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petBreed}>{pet.breed || 'Mixed Breed'}</Text>
                  </View>
                </View>
              ))}
              {pets.length > 3 && (
                <Text style={styles.morePetsText}>
                  +{pets.length - 3} more pets
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contact Information</Text>
          
          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Mail size={20} color="#3B82F6" />
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactValue}>{profile.email}</Text>
              <Text style={styles.contactLabel}>Email Address</Text>
            </View>
          </View>

          {profile.phone ? (
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Phone size={20} color="#3B82F6" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactValue}>{profile.phone}</Text>
                <Text style={styles.contactLabel}>Phone Number</Text>
              </View>
            </View>
          ) : (
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Phone size={20} color="#9CA3AF" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactValuePlaceholder}>No phone number added</Text>
                <Text style={styles.contactLabel}>Phone Number</Text>
              </View>
            </View>
          )}

          {profile.address ? (
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <MapPin size={20} color="#3B82F6" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactValue}>{profile.address}</Text>
                <Text style={styles.contactLabel}>Home Address</Text>
              </View>
            </View>
          ) : (
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <MapPin size={20} color="#9CA3AF" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactValuePlaceholder}>No address added</Text>
                <Text style={styles.contactLabel}>Home Address</Text>
              </View>
            </View>
          )}
        </View>

        {/* Account Information */}
        <View style={styles.accountCard}>
          <Text style={styles.accountTitle}>Account Information</Text>
          
          <View style={styles.accountItem}>
            <Text style={styles.accountLabel}>Member Since</Text>
            <Text style={styles.accountValue}>{formatJoinDate(profile.createdAt)}</Text>
          </View>

          <View style={styles.accountItem}>
            <Text style={styles.accountLabel}>Account Type</Text>
            <View style={styles.accountTypeContainer}>
              <Heart size={16} color="#FFFFFF" />
              <Text style={styles.accountTypeText}>Premium Member</Text>
            </View>
          </View>

          <View style={styles.accountItem}>
            <Text style={styles.accountLabel}>Profile Status</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
        </View>

        {/* Settings Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push("/(tabs)/profile/settings")}
          >
            <View style={styles.actionIconContainer}>
              <Settings size={20} color="#4559A7" />
            </View>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#FEE2E2' }]}>
              <LogOut size={20} color="#DC2626" />
            </View>
            <Text style={[styles.actionText, { color: '#DC2626' }]}>Logout</Text>
          </TouchableOpacity>
        </View>
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4559A7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4559A7',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#4559A7',
  },
  petSummaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  petSummaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ADD7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  petSummaryInfo: {
    flex: 1,
  },
  petSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 2,
  },
  petSummarySubtitle: {
    fontSize: 14,
    color: '#4559A7',
  },
  petList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  petItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ADD7EB',
    padding: 12,
    borderRadius: 12,
    minWidth: '45%',
  },
  petAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4559A7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  petInitial: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 12,
    color: '#4559A7',
  },
  morePetsText: {
    fontSize: 12,
    color: '#4559A7',
    fontStyle: 'italic',
    alignSelf: 'center',
    marginTop: 8,
  },
  contactCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ADD7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4559A7',
    marginBottom: 2,
  },
  contactValuePlaceholder: {
    fontSize: 14,
    color: '#4559A7',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  contactLabel: {
    fontSize: 12,
    color: '#4559A7',
  },
  accountCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountLabel: {
    fontSize: 14,
    color: '#4559A7',
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4559A7',
  },
  accountTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E75325',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accountTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  actionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
});