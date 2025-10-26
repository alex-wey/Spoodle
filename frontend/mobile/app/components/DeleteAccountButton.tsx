import React from 'react';
import { TouchableOpacity, Text, Alert, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { usePetStore } from '../store/pets';
import { useDocumentStore } from '../store/documents';

export const DeleteAccountButton = () => {
  const { user } = useUser();
  const router = useRouter();
  const { clearPets } = usePetStore();
  const { clearDocuments } = useDocumentStore();

  const handleDeleteAccount = async () => {
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
  };

  const executeDeletion = async () => {
    try {
      console.log('🗑️ Starting account deletion process...');
      
      if (!user) {
        throw new Error('No user found. Please log in and try again.');
      }
      
      // Use Clerk's native delete method
      await user.delete();
      
      console.log('✅ Account deleted successfully');
      
      // Clear all stores
      clearPets();
      clearDocuments();
      
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
      Alert.alert(
        'Deletion Failed',
        error instanceof Error ? error.message : 'Failed to delete account. Please try again or contact support.',
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
    backgroundColor: '#FEF7F7',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FED7D7',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F56565',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#C53030',
  },
};
