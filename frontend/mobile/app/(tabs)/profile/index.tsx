import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Heart, 
  Edit3,
} from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { usePetStore } from '../../store/pets';
import { useRouter } from 'expo-router';
import { SignOutButton } from '../../components/SignOutButton';
import { DeleteAccountButton } from '../../components/DeleteAccountButton';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: null as string | null,
    address: null as string | null,
    createdAt: null as Date | null,
  });
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const { pets: petsFromStore } = usePetStore();

  useEffect(() => {
    fetchProfileData();
    if (petsFromStore) {
      setPets(petsFromStore as any);
    }
  }, [petsFromStore, user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Use user data from Clerk if available
      if (user) {
        setProfile({
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Pet Owner',
          email: user.emailAddresses?.[0]?.emailAddress || '',
          phone: user.phoneNumbers?.[0]?.phoneNumber || null,
          address: null, // Clerk doesn't store address by default
          createdAt: user.createdAt ? new Date(user.createdAt) : null,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };


  const formatJoinDate = (date: Date | null) => {
    if (!date) return 'Unknown';
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
            onPress={() => router.push("/(tabs)/profile/edit")}
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
              <Text style={styles.accountTypeText}>Pet Owner</Text>
            </View>
          </View>

          <View style={styles.accountItem}>
            <Text style={styles.accountLabel}>Profile Status</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{user ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
        </View>

        {/* Spoodle Team Contact Information */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Spoodle Team Contact Information</Text>
          
          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Mail size={20} color="#4559A7" />
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactValue}>support@spoodle.com</Text>
              <Text style={styles.contactLabel}>Email Address</Text>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.actionsCard}>
          <SignOutButton />
          <DeleteAccountButton />
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
});