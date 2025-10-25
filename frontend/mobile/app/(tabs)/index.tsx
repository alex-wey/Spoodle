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
import { router } from 'expo-router';
import { ChevronRight, Plus, Settings, Heart, FileText, MessageCircle, Bug } from 'lucide-react-native';
import { useAuthStore } from '../store/auth';
import { usePetStore } from '../store/pets';
import PetSelectionModal from '../components/PetSelectionModal';
import ChatbotIntroModal from '../components/ChatbotIntroModal';
import ChatInterfaceModal from '../components/ChatInterfaceModal';
import { FAB } from '../components/FAB';

export default function HomeScreen() {
  const [selectedPet, setSelectedPet] = useState(null);
  const [showPetSelection, setShowPetSelection] = useState(false);
  const [showChatbotIntro, setShowChatbotIntro] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, user } = useAuthStore();
  const { pets, fetchPets } = usePetStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      await fetchPets();
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    setShowPetSelection(false);
    setShowChatbotIntro(true);
  };

  const handleStartChat = () => {
    setShowChatbotIntro(false);
    setShowChatInterface(true);
  };

  const handleCloseChat = () => {
    setShowChatInterface(false);
    setSelectedPet(null);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => {
          // For now, just show a message
          Alert.alert('Logged out', 'You have been logged out');
        }},
      ]
    );
  };

  const quickActions = [
    {
      id: 'documents',
      title: 'Documents',
      icon: FileText,
      color: '#E75325',
      onPress: () => router.push('/(tabs)/docs'),
    },
    {
      id: 'chat',
      title: 'Chat with Spoodle',
      icon: MessageCircle,
      color: '#3BB272',
      onPress: () => setShowPetSelection(true),
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.userName}>{user?.name || 'Pet Owner'}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.headerButton, styles.settingsButton]}
              onPress={() => router.push('/(tabs)/profile/settings')}
            >
              <Settings size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Pet Selection Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Choose Your Pet to Chat</Text>
              <Text style={styles.bannerSubtitle}>
                Select a pet to start chatting with Spoodle AI assistant
              </Text>
            </View>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => setShowPetSelection(true)}
            >
              <MessageCircle size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { backgroundColor: action.color }]}
                onPress={action.onPress}
              >
                <action.icon size={24} color="#FFFFFF" />
                <Text style={styles.quickActionText}>{action.title}</Text>
                <ChevronRight size={16} color="#FFFFFF" style={styles.chevron} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My Pets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Pets</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/pets/add')}>
              <Plus size={20} color="#4559A7" />
            </TouchableOpacity>
          </View>
          
          {pets.length === 0 ? (
            <View style={styles.emptyPetsContainer}>
              <Heart size={48} color="#D1D5DB" />
              <Text style={styles.emptyPetsTitle}>No pets added yet</Text>
              <Text style={styles.emptyPetsSubtitle}>
                Add your first pet to get started with Spoodle
              </Text>
              <TouchableOpacity
                style={styles.addPetButton}
                onPress={() => router.push('/(tabs)/pets/add')}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.addPetButtonText}>Add Pet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.petCard}
                  onPress={() => router.push(`/(tabs)/pets/${pet.id}/profile`)}
                >
                  <View style={styles.petAvatar}>
                    <Text style={styles.petInitial}>
                      {pet.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petBreed}>{pet.breed || 'Mixed Breed'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <PetSelectionModal
        visible={showPetSelection}
        onClose={() => setShowPetSelection(false)}
        onPetSelect={handlePetSelect}
        pets={pets}
      />

      <ChatbotIntroModal
        visible={showChatbotIntro}
        onClose={() => setShowChatbotIntro(false)}
        onStartChat={handleStartChat}
        selectedPet={selectedPet}
      />

      <ChatInterfaceModal
        visible={showChatInterface}
        onClose={handleCloseChat}
        selectedPet={selectedPet}
      />

      {/* Bug Report FAB */}
      <View style={styles.fabContainer}>
        <FAB
          icon={<Bug size={24} color="#FFFFFF" />}
          onPress={() => router.push("/support")}
          style={styles.fabBug}
          size="large"
        />
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4559A7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#4559A7',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4559A7',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4559A7',
  },
  settingsButton: {
    backgroundColor: '#E75325', // Orange background
    borderRadius: 8,
  },
  banner: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#DCEBF5', // Light blue background matching home page
    borderRadius: 16,
    padding: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: {
    flex: 1,
    marginRight: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4559A7',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#4559A7',
    lineHeight: 20,
  },
  chatButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3BB272',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4559A7',
  },
  quickActionsGrid: {
    gap: 12,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  quickActionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  chevron: {
    marginLeft: 8,
  },
  emptyPetsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4559A7',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyPetsSubtitle: {
    fontSize: 14,
    color: '#4559A7',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4559A7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addPetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  petCard: {
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 100,
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4559A7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  petInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 12,
    color: '#4559A7',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fabSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fabBug: {
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: 64,
    height: 64,
  },
});
