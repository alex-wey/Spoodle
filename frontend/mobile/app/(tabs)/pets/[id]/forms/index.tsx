import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ArrowLeft, ClipboardList, ExternalLink, Bug } from 'lucide-react-native';
import { clerkApiClient } from '../../../../lib/api';
import { usePetStore } from '../../../../store/pets';
import type { Pet } from '../../../../types';
import { FAB } from '../../../../components/FAB';

type FormInvite = {
  id: string;
  formLink: string;
  formName: string;
  clinicId: string;
  petId: string;
  petOwnerId: string;
  createdAt: string;
  updatedAt: string;
  clinic?: {
    id: string;
    name: string;
    slug: string;
  };
  pet?: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    imageUrl?: string;
  };
};

export default function PetFormsScreen() {
  const { id: petId } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [formInvites, setFormInvites] = useState<FormInvite[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { pets, fetchPets } = usePetStore();

  // Load pets and select the current pet
  useEffect(() => {
    const loadPets = async () => {
      await fetchPets();
    };
    loadPets();
  }, [fetchPets]);

  // Select pet when pets list or petId changes
  useEffect(() => {
    if (petId && pets.length > 0) {
      const pet = pets.find((p) => p.id === petId);
      if (pet) {
        setSelectedPet(pet);
      }
    }
  }, [petId, pets]);

  // Fetch form invites for the pet
  const fetchFormInvites = useCallback(async () => {
    if (!petId) return;

    try {
      setError(null);
      const result = await clerkApiClient.getFormInvites(petId);

      if (result.success && result.data) {
        setFormInvites(result.data);
      } else {
        setError(result.message || 'Failed to load form invites');
      }
    } catch (err: any) {
      console.error('Error fetching form invites:', err);
      setError(err.message || 'An error occurred while loading form invites');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [petId]);

  // Fetch on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchFormInvites();
    }, [fetchFormInvites])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFormInvites();
  }, [fetchFormInvites]);

  const handleOpenForm = async (formLink: string) => {
    try {
      const canOpen = await Linking.canOpenURL(formLink);
      if (canOpen) {
        await Linking.openURL(formLink);
      } else {
        Alert.alert('Error', 'Unable to open form link');
      }
    } catch (err) {
      console.error('Error opening form:', err);
      Alert.alert('Error', 'Failed to open form');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#4559A7" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {selectedPet?.name || 'Pet'}'s Forms
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4559A7" />
          <Text style={styles.loadingText}>Loading forms...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#4559A7" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {selectedPet?.name || 'Pet'}'s Forms
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4559A7']}
            tintColor="#4559A7"
          />
        }
      >
        {formInvites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ClipboardList size={48} color="#ADD7EB" />
            <Text style={styles.emptyTitle}>No Forms Available</Text>
            <Text style={styles.emptyText}>
              {selectedPet
                ? `There are no forms to fill out for ${selectedPet.name} at this time.`
                : 'There are no forms to fill out at this time.'}
            </Text>
          </View>
        ) : (
          <View style={styles.formsList}>
            {formInvites.map((invite) => (
              <TouchableOpacity
                key={invite.id}
                style={styles.formCard}
                onPress={() => handleOpenForm(invite.formLink)}
              >
                <View style={styles.formCardHeader}>
                  <View style={styles.formIconContainer}>
                    <ClipboardList size={24} color="#4559A7" />
                  </View>
                  <View style={styles.formCardContent}>
                    <Text style={styles.formTitle}>
                      {invite.formName}
                    </Text>
                    <Text style={styles.formDate}>
                      Received {formatDate(invite.createdAt)}
                    </Text>
                  </View>
                  <ExternalLink size={20} color="#4559A7" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bug Report FAB */}
      <FAB
        icon={<Bug size={20} color="white" />}
        onPress={() => router.push('/support')}
        style={styles.bugFab}
        size="small"
      />
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
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ADD7EB',
  },
  backButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4559A7',
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4559A7',
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4559A7',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  formsList: {
    gap: 12,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ADD7EB',
    padding: 16,
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCardContent: {
    flex: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  formDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bugFab: {
    position: 'absolute',
    top: 70,
    right: 20,
    backgroundColor: '#C62828',
  },
});
