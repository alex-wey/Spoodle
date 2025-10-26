import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Save, User, Mail, Phone, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { clerkApiClient } from '../../lib/api';
import { useAuth } from '@clerk/clerk-expo';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        Alert.alert('Validation Error', 'First name and last name are required.');
        return;
      }

      const response = await clerkApiClient.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
      }, getToken);

      if (response.success) {
        // Update the user in the auth store
        const updatedUser = {
          ...user,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          phoneNumber: response.data.phone,
          address: response.data.address,
        };
        // Profile updated successfully - Clerk will handle user state
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Save size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Form */}
        <View style={styles.formContainer}>
          
          {/* First Name */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <User size={16} color="#6B7280" />
              <Text style={styles.inputLabel}>First Name</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={formData.firstName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
              placeholder="Enter your first name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <User size={16} color="#6B7280" />
              <Text style={styles.inputLabel}>Last Name</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={formData.lastName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
              placeholder="Enter your last name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Email (Read-only) */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Mail size={16} color="#6B7280" />
              <Text style={styles.inputLabel}>Email</Text>
            </View>
            <TextInput
              style={[styles.textInput, styles.textInputDisabled]}
              value={formData.email}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.inputHelperText}>Email cannot be changed</Text>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Phone size={16} color="#6B7280" />
              <Text style={styles.inputLabel}>Phone Number</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="Enter your phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.inputLabel}>Address</Text>
            </View>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              placeholder="Enter your address"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButtonLarge, saving && styles.saveButtonLargeDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4559A7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textInputDisabled: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputHelperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButtonLarge: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4559A7',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonLargeDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
