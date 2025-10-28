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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#4559A7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#4559A7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4559A7',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
    shadowColor: '#4559A7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#4559A7',
    letterSpacing: 0.2,
  },
};
