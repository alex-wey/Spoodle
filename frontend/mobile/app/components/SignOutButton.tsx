import React from 'react';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, Alert } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { usePetStore } from '../store/pets';
import { useDocumentStore } from '../store/documents';

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const router = useRouter();
  const { clearPets } = usePetStore();
  const { clearDocuments } = useDocumentStore();

  const handleSignOut = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => {
          console.log('🚪 Starting logout process...');
          
          // Clear all stores first
          clearPets();
          clearDocuments();
          console.log('✅ All stores cleared');
          
          // Sign out from Clerk
          try {
            await signOut();
            console.log('✅ Clerk signOut completed');
            // Force redirect to landing page
            console.log('🚪 Redirecting to landing page...');
            router.replace("/(auth)/landing");
          } catch (error) {
            console.error('❌ Clerk signOut error:', error);
            // Even if logout fails, force redirect
            router.replace("/(auth)/landing");
          }
        }},
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.logoutButton}
      onPress={handleSignOut}
      activeOpacity={0.5}
    >
      <View style={styles.iconContainer}>
        <LogOut size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.buttonText}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = {
  logoutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B7280',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#374151',
  },
};
