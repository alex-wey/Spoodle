import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { SignOutButton } from './components/SignOutButton';
import { DeleteAccountButton } from './components/DeleteAccountButton';
import { ProfileCard } from './components/ProfileCard';
import { ContactInformation } from './components/ContactInformation';
import { ClinicInformation } from './components/ClinicInformation';
import { SpoodleInformation } from './components/SpoodleInformation';
import * as ImagePicker from 'expo-image-picker';
import { clerkApiClient } from '../../lib/api';

interface Clinic {
  id: string;
  clerkOrgId: string;
  name: string;
  slug: string;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  imageUrl?: string | null;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: null as string | null,
    address: null as string | null,
    createdAt: null as Date | null,
  });
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [clinicImageError, setClinicImageError] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
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

      // Fetch clinic information
      try {
        const clinicResponse = await clerkApiClient.getMyClinic();
        if (clinicResponse.success && clinicResponse.data) {
          setClinic(clinicResponse.data);
          setClinicImageError(false); // Reset error state when clinic changes
        }
      } catch (clinicError) {
        console.log('No clinic assigned or error fetching:', clinicError);
        // User might not have selected a clinic yet
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
      month: 'short' 
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
        phone: editedPhone || undefined,
        address: concatenatedAddress
      });

      if (response.success) {
        // Update local state with response data
        setProfile(prev => ({
          ...prev,
          phone: response.data.phone || null,
          address: response.data.address || null,
        }));
        setIsEditing(false);
        Alert.alert('Success', 'Contact information updated successfully!');
      } else {
        throw new Error('Failed to update contact information');
      }
    } catch (error) {
      console.error('Error saving contact information:', error);
      Alert.alert('Error', 'Failed to save contact information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveName = async () => {
    try {
      setIsSavingName(true);
      
      // Save name via updateProfile endpoint
      const response = await clerkApiClient.updateProfile({
        firstName: editedFirstName || undefined,
        lastName: editedLastName || undefined,
      });

      if (response.success) {
        // Update local state with response data
        setProfile(prev => ({
          ...prev,
          name: `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim() || prev.name,
        }));
        setIsEditingName(false);
        Alert.alert('Success', 'Name updated successfully!');
      } else {
        throw new Error('Failed to update name');
      }
    } catch (error) {
      console.error('Error saving name:', error);
      Alert.alert('Error', 'Failed to save name. Please try again.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelName = () => {
    // Reset to current profile name - use the already loaded editedFirstName/editedLastName
    // These are set when profile data is fetched, so just reset editing state
    setIsEditingName(false);
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

  const handleAddressChange = (field: 'street' | 'city' | 'state' | 'zip', text: string) => {
    setEditedAddress(prev => ({ ...prev, [field]: text }));
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
        </View>

        {/* Profile Card */}
        <ProfileCard
          name={profile.name}
          memberSince={formatJoinDate(profile.createdAt)}
          avatarUri={avatarUri}
          isUploadingImage={isUploadingImage}
          isEditingName={isEditingName}
          isSavingName={isSavingName}
          editedFirstName={editedFirstName}
          editedLastName={editedLastName}
          onPickImage={pickImage}
          onEditName={() => setIsEditingName(true)}
          onSaveName={handleSaveName}
          onCancelName={handleCancelName}
          onFirstNameChange={setEditedFirstName}
          onLastNameChange={setEditedLastName}
        />

        {/* Contact Information */}
        <ContactInformation
          email={profile.email}
          phone={profile.phone}
          address={profile.address}
          isEditing={isEditing}
          isSaving={isSaving}
          editedPhone={editedPhone}
          editedAddress={editedAddress}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          onPhoneChange={setEditedPhone}
          onAddressChange={handleAddressChange}
        />

        {/* Clinic Information */}
        {clinic && clinic.slug !== 'spoodle' && (
          <ClinicInformation
            clinic={clinic}
            clinicImageError={clinicImageError}
            onImageError={() => setClinicImageError(true)}
          />
        )}

        {/* Spoodle Information */}
        <SpoodleInformation />

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
  actionsCard: {
    marginHorizontal: 24,
    marginBottom: 14,
    backgroundColor: 'transparent',
    padding: 0,
  },
});
