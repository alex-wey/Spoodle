import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  Save,
  X,
} from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { SignOutButton } from './components/SignOutButton';
import { DeleteAccountButton } from './components/DeleteAccountButton';
import * as ImagePicker from 'expo-image-picker';
import { clerkApiClient } from '../../lib/api';

export default function ProfileScreen() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: null as string | null,
    address: null as string | null,
    createdAt: null as Date | null,
  });
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedAddress, setEditedAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
  });
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');

  const { user } = useUser();

  const fetchProfileData = React.useCallback(async () => {
    try {
      // Fetch profile data from backend (includes address from users table)
      const profileResponse = await clerkApiClient.getProfile();
      if (profileResponse.success) {
        const data = profileResponse.data;
        setProfile({
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Pet Owner',
          email: data.email || '',
          phone: data.phone || null,
          address: data.address || null,
          createdAt: user?.createdAt ? new Date(user.createdAt) : null,
        });
        setEditedFirstName(data.firstName || '');
        setEditedLastName(data.lastName || '');
        setEditedPhone(data.phone || '');
        
        // Parse address string into components
        if (data.address) {
          const parts = data.address.split(',').map(p => p.trim());
          setEditedAddress({
            street: parts[0] || '',
            city: parts[1] || '',
            state: parts[2] || '',
            zip: parts[3] || '',
          });
        } else {
          setEditedAddress({ street: '', city: '', state: '', zip: '' });
        }
      }

      // Fetch profile image from settings
      try {
        const settingsResponse = await clerkApiClient.getSettings();
        if (settingsResponse.success && settingsResponse.data.profileImageUrl) {
          setAvatarUri(settingsResponse.data.profileImageUrl);
        }
      } catch (settingsError) {
        console.log('Settings not yet created or error fetching:', settingsError);
        // This is fine - settings might not exist yet
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);


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
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true, // Request base64 encoding
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        setIsUploadingImage(true);
        
        try {
          // Convert to base64 data URL
          let imageData: string;
          if (asset.base64) {
            imageData = `data:image/jpeg;base64,${asset.base64}`;
          } else {
            // Fallback to URI (shouldn't happen with base64: true)
            imageData = asset.uri;
          }

          // Update avatar immediately for better UX
          setAvatarUri(imageData);

          // Save to backend
          await clerkApiClient.updateSettings({
            profileImageUrl: imageData
          });

          Alert.alert('Success', 'Profile picture updated successfully!');
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
          // Revert on error
          fetchProfileData();
        } finally {
          setIsUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Concatenate address fields
      const addressParts = [
        editedAddress.street,
        editedAddress.city,
        editedAddress.state,
        editedAddress.zip
      ].filter(part => part.trim());
      
      const concatenatedAddress = addressParts.length > 0 
        ? addressParts.join(', ') 
        : undefined;
      
      // Save profile details via updateProfile endpoint
      const response = await clerkApiClient.updateProfile({
        firstName: editedFirstName || undefined,
        lastName: editedLastName || undefined,
        phone: editedPhone || undefined,
        address: concatenatedAddress
      });

      if (response.success) {
        // Update local state with response data
        setProfile(prev => ({
          ...prev,
          name: `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim() || prev.name,
          phone: response.data.phone || null,
          address: response.data.address || null,
        }));
        setIsEditing(false);
        Alert.alert('Success', 'Address updated successfully!');
      } else {
        throw new Error('Failed to update address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Re-parse the current address
    if (profile.address) {
      const parts = profile.address.split(',').map(p => p.trim());
      setEditedAddress({
        street: parts[0] || '',
        city: parts[1] || '',
        state: parts[2] || '',
        zip: parts[3] || '',
      });
    } else {
      setEditedAddress({ street: '', city: '', state: '', zip: '' });
    }
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          {isEditing ? (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Save size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <TouchableOpacity 
              style={styles.avatarContainer} 
              onPress={pickImage}
              disabled={isUploadingImage}
            >
              <View style={styles.avatar}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <User size={40} color="#FFFFFF" />
                )}
              </View>
              <View style={styles.cameraButton}>
                {isUploadingImage ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Camera size={16} color="#FFFFFF" />
                )}
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

          {/* Name editing */}
          {isEditing && (
            <View style={[styles.contactItem, { alignItems: 'flex-start' }]}>
              <View style={styles.contactIconContainer}>
                <User size={24} color="#3B82F6" />
              </View>
              <View style={styles.contactDetails}>
                <TextInput
                  style={styles.addressInput}
                  value={editedFirstName}
                  onChangeText={setEditedFirstName}
                  placeholder="First name"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  style={[styles.addressInput, { marginTop: 8 }]}
                  value={editedLastName}
                  onChangeText={setEditedLastName}
                  placeholder="Last name"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={[styles.contactLabel, { marginTop: 8 }]}>Full Name</Text>
              </View>
            </View>
          )}

          {isEditing ? (
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Phone size={20} color="#3B82F6" />
              </View>
              <View style={styles.contactDetails}>
                <TextInput
                  style={styles.addressInput}
                  value={editedPhone}
                  onChangeText={setEditedPhone}
                  placeholder="Phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
                <Text style={styles.contactLabel}>Phone Number</Text>
              </View>
            </View>
          ) : profile.phone ? (
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

          <View style={[styles.contactItem, { marginBottom: 0, alignItems: 'flex-start' }]}>
            <View style={[styles.contactIconContainer, { marginTop: 4 }]}>
              <MapPin size={24} color={isEditing ? "#3BB272" : "#3B82F6"} />
            </View>
            <View style={styles.contactDetails}>
              {isEditing ? (
                <View style={styles.addressInputContainer}>
                  <TextInput
                    style={styles.addressInput}
                    value={editedAddress.street}
                    onChangeText={(text) => setEditedAddress(prev => ({ ...prev, street: text }))}
                    placeholder="Street Address"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TextInput
                    style={styles.addressInput}
                    value={editedAddress.city}
                    onChangeText={(text) => setEditedAddress(prev => ({ ...prev, city: text }))}
                    placeholder="City"
                    placeholderTextColor="#9CA3AF"
                  />
                  <View style={styles.addressRow}>
                    <TextInput
                      style={[styles.addressInput, { flex: 1, marginRight: 8 }]}
                      value={editedAddress.state}
                      onChangeText={(text) => setEditedAddress(prev => ({ ...prev, state: text }))}
                      placeholder="State"
                      placeholderTextColor="#9CA3AF"
                    />
                    <TextInput
                      style={[styles.addressInput, { flex: 1 }]}
                      value={editedAddress.zip}
                      onChangeText={(text) => setEditedAddress(prev => ({ ...prev, zip: text }))}
                      placeholder="Zip Code"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              ) : (
                profile.address ? (
                  <View>
                    {(() => {
                      const parts = profile.address.split(',').map(p => p.trim());
                      const street = parts[0] || '';
                      const city = parts[1] || '';
                      const state = parts[2] || '';
                      const zip = parts[3] || '';
                      
                      return (
                        <>
                          <Text style={styles.contactValue}>{street}</Text>
                          <Text style={styles.contactValue}>{city}, {state} {zip}</Text>
                        </>
                      );
                    })()}
                  </View>
                ) : (
                  <Text style={styles.contactValuePlaceholder}>No address added</Text>
                )
              )}
              <Text style={styles.contactLabel}>Home Address</Text>
            </View>
          </View>
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
  },
  scrollContent: {
    paddingBottom: 20,
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
    fontSize: 18,
    fontWeight: '500',
    color: '#4559A7',
    marginBottom: 4,
  },
  contactValuePlaceholder: {
    fontSize: 18,
    color: '#4559A7',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  contactLabel: {
    fontSize: 16,
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
    fontSize: 18,
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
    marginBottom: 14,
    backgroundColor: 'transparent',
    padding: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4559A7',
  },
  saveButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#3BB272',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#C62828',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressInputContainer: {
    width: '100%',
    gap: 8,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addressInput: {
    fontSize: 16,
    color: '#4559A7',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ADD7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 50,
  },
});