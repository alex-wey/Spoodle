import React from 'react';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { usePetStore } from '../../../store/pets';
import { useDocumentStore } from '../../../store/documents';
import { useChatStore } from '../../../store/chat';

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const router = useRouter();
  const { clearPets } = usePetStore();
  const { clearDocuments } = useDocumentStore();
  const { clearAllChatSessions } = useChatStore();

  const handleSignOut = async () => {
    const proceed = Platform.OS === 'web'
      ? window.confirm('Are you sure you want to sign out?')
      : null;

    if (Platform.OS === 'web') {
      if (!proceed) return;
      // web flow (no multi-button Alert support)
      try {
        clearPets();
        clearDocuments();
        clearAllChatSessions();
        await signOut();
      } catch (e) {
        console.error('❌ Clerk signOut error:', e);
      } finally {
        router.replace('/(auth)/landing');
      }
      return;
    }

    // native flow with Alert buttons
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: async () => {
          try {
            clearPets();
            clearDocuments();
            clearAllChatSessions();
            await signOut();
          } catch (e) {
            console.error('❌ Clerk signOut error:', e);
          } finally {
            router.replace('/(auth)/landing');
          }
        }},
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.signOutButton}
      onPress={handleSignOut}
      activeOpacity={0.5}
    >
      <View style={styles.iconContainer}>
        <LogOut size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.buttonText}>Sign Out</Text>
    </TouchableOpacity>
  );
};

const styles = {
  signOutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#4559A7',
    paddingVertical: 12,
    paddingHorizontal: 24,
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
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#4559A7',
    letterSpacing: 0.2,
  },
};
