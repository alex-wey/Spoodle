import React from 'react';
import { TouchableOpacity, Text, Alert, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { usePetStore } from '../store/pets';
import { useDocumentStore } from '../store/documents';
import { useChatStore } from '../store/chat';
import { clerkApiClient } from '../lib/api';

export const DeleteAccountButton = () => {
  const { user } = useUser();
  const router = useRouter();
  const { clearPets } = usePetStore();
  const { clearDocuments } = useDocumentStore();
  const { clearAllChatSessions } = useChatStore();

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data including pets, documents, medical records, bug reports, and chat history.',
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
  };

  const executeDeletion = async () => {
    try {
      console.log('🗑️ Starting account deletion process...');
      
      if (!user) {
        throw new Error('No user found. Please log in and try again.');
      }
      
      // Step 1: Delete all user data from our database via backend API
      console.log('📡 Calling backend API to delete user data...');
      await clerkApiClient.deleteAccount();
      console.log('✅ Backend data deletion completed');
      
      // Step 2: Delete the user from Clerk (this will also trigger webhooks)
      console.log('🔐 Deleting user from Clerk...');
      await user.delete();
      console.log('✅ Clerk user deletion completed');
      
      // Step 3: Clear all local stores
      console.log('🧹 Clearing local stores...');
      clearPets();
      clearDocuments();
      clearAllChatSessions();
      console.log('✅ Local stores cleared');
      
      // Show success message and navigate to landing
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
    } catch (error) {
      console.error('❌ Account deletion error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to delete account. Please try again or contact support.';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'Authentication error. Please log in again and try deleting your account.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later or contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(
        'Deletion Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <TouchableOpacity 
      style={styles.deleteButton}
      onPress={handleDeleteAccount}
      activeOpacity={0.5}
    >
      <View style={styles.iconContainer}>
        <Trash2 size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.buttonText}>Delete Account</Text>
    </TouchableOpacity>
  );
};

const styles = {
  deleteButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#DC2626',
    letterSpacing: 0.2,
  },
};
