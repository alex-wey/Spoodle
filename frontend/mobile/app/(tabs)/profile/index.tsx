import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Heart, 
  Calendar,
  LogOut,
  Edit3,
  Trash2
} from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';
import { usePetStore } from '../../store/pets';
import { useTaskStore } from '../../store/tasks';
import { useDocumentStore } from '../../store/documents';
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

  const { user, logout, deleteAccount } = useAuthStore();
  const { pets: petsFromStore, clearPets } = usePetStore();
  const { clearTasks } = useTaskStore();
  const { clearDocuments } = useDocumentStore();

  useEffect(() => {
    fetchProfileData();
    if (petsFromStore) {
      setPets(petsFromStore);
    }
  }, [petsFromStore, user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Use user data from auth store if available
      if (user) {
        setProfile({
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Pet Owner',
          email: user.email || 'user@example.com',
          phone: user.phoneNumber || null,
          address: user.address || null,
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
    console.log('🔴 LOGOUT BUTTON CLICKED - handleLogout function called');
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => {
          console.log('🚪 Starting logout process...');
          
          // Clear all stores first
          clearPets();
          clearTasks();
          clearDocuments();
          console.log('✅ All stores cleared');
          
          // Clear auth data
          logout().then(() => {
            console.log('✅ Auth logout completed');
            // Force redirect to landing page
            console.log('🚪 Redirecting to landing page...');
            router.replace("/(auth)/landing");
          }).catch((error) => {
            console.error('❌ Logout error:', error);
            // Even if logout fails, force redirect
            router.replace("/(auth)/landing");
          });
        }},
      ]
    );
  };

  const handleDeleteAccount = async () => {
    console.log('🔴 Delete Account button pressed!');
    
    // For web compatibility, use window.confirm instead of Alert.alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data including pets, documents, and tasks.');
      if (!confirmed) return;
      
      const finalConfirmed = window.confirm('This is your last chance to cancel. Are you absolutely sure you want to delete your account?');
      if (!finalConfirmed) return;
    } else {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data including pets, documents, and tasks.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete Account', 
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Final Confirmation',
                'This is your last chance to cancel. Are you absolutely sure you want to delete your account?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Yes, Delete Forever',
                    style: 'destructive',
                    onPress: () => executeDeletion()
                  }
                ]
              );
            }
          }
        ]
      );
      return;
    }
    
    // Execute the deletion
    await executeDeletion();
  };

  const executeDeletion = async () => {
    try {
      setLoading(true);
      console.log('🗑️ Starting account deletion process...');
      
      // Use the auth store deleteAccount method
      await deleteAccount();
      
      console.log('✅ Account deleted successfully');
      
      // Clear all stores
      clearPets();
      clearTasks();
      clearDocuments();
      
      // Show success message and navigate to landing
      if (Platform.OS === 'web') {
        alert('Your account and all associated data have been permanently deleted.');
        router.replace('/(auth)/landing');
      } else {
        Alert.alert(
          'Account Deleted',
          'Your account and all associated data have been permanently deleted.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/landing')
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Account deletion error:', error);
      if (Platform.OS === 'web') {
        alert(`Deletion Failed: ${error instanceof Error ? error.message : 'Failed to delete account. Please try again or contact support.'}`);
      } else {
        Alert.alert(
          'Deletion Failed',
          error instanceof Error ? error.message : 'Failed to delete account. Please try again or contact support.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
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

        {/* Spoodle Team Contact Information */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Spoodle Team Contact Information</Text>
          
          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Mail size={20} color="#4559A7" />
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactValue}>spoodlebugs@gmail.com</Text>
              <Text style={styles.contactLabel}>Email Address</Text>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity 
            style={[styles.actionItem, { backgroundColor: '#F8F9FA', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' }]} 
            onPress={handleLogout}
            activeOpacity={0.5}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#6B7280' }]}>
              <LogOut size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionText, { color: '#374151', fontWeight: '500' }]}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionItem, { backgroundColor: '#FEF7F7', borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#FED7D7' }]} 
            onPress={() => {
              console.log('🔴 Delete Account TouchableOpacity pressed!');
              handleDeleteAccount();
            }}
            activeOpacity={0.5}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#F56565' }]}>
              <Trash2 size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionText, { color: '#C53030', fontWeight: '500' }]}>Delete Account</Text>
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