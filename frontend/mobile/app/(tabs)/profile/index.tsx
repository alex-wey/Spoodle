import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Heart,
  Camera,
} from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { usePetStore } from '../../store/pets';
import { useRouter } from 'expo-router';
import { SignOutButton } from '../../components/SignOutButton';
import { DeleteAccountButton } from '../../components/DeleteAccountButton';
import * as ImagePicker from 'expo-image-picker';

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
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

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

  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photos to upload an avatar.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        // Here you would typically upload the image to your backend
        // For now, we'll just store it locally
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              <View style={styles.avatar}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <User size={40} color="#FFFFFF" />
                )}
              </View>
              <View style={styles.cameraButton}>
                <Camera size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>Member since {formatJoinDate(profile.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contact Information</Text>
          
          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Mail size={24} color="#3B82F6" />
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
                <Phone size={24} color="#9CA3AF" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactValuePlaceholder}>No phone number added</Text>
                <Text style={styles.contactLabel}>Phone Number</Text>
              </View>
            </View>
          )}

          {profile.address ? (
            <View style={[styles.contactItem, { marginBottom: 0 }]}>
              <View style={styles.contactIconContainer}>
                <MapPin size={24} color="#3B82F6" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactValue}>{profile.address}</Text>
                <Text style={styles.contactLabel}>Home Address</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.contactItem, { marginBottom: 0 }]}>
              <View style={styles.contactIconContainer}>
                <MapPin size={24} color="#9CA3AF" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactValuePlaceholder}>No address added</Text>
                <Text style={styles.contactLabel}>Home Address</Text>
              </View>
            </View>
          )}
        </View>

        {/* Spoodle Team Contact Information */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Spoodle Information</Text>
          
          <View style={[styles.contactItem, { marginBottom: 0 }]}>
            <View style={styles.contactIconContainer}>
              <Mail size={24} color="#4559A7" />
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
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4559A7',
  },
  profileCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ADD7EB',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4559A7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3BB272',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4559A7',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 16,
    color: '#4559A7',
    opacity: 0.7,
  },
  contactCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ADD7EB',
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ADD7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4559A7',
    marginBottom: 4,
  },
  contactValuePlaceholder: {
    fontSize: 16,
    color: '#4559A7',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  contactLabel: {
    fontSize: 14,
    color: '#4559A7',
    opacity: 0.7,
  },
  accountCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ADD7EB',
  },
  accountTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 20,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountLabel: {
    fontSize: 16,
    color: '#4559A7',
  },
  accountValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4559A7',
  },
  accountTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E75325',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  accountTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#10B981',
  },
  actionsCard: {
    marginHorizontal: 24,
    marginBottom: 40,
    backgroundColor: 'transparent',
    padding: 0,
  },
});