import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ArrowLeft, Calendar as CalendarIcon, Bug } from 'lucide-react-native';
import { clerkApiClient } from '../../../../lib/api';
import { usePetStore } from '../../../../store/pets';
import type { Pet } from '../../../../types';
import { AppointmentCard, type Appointment } from '../../../../components/pets/AppointmentCard';
import { FAB } from '../../../../components/FAB';

type AppointmentGroup = {
  title: string;
  appointments: Appointment[];
};

export default function PetAppointmentsScreen() {
  const { id: petId } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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

  // Group appointments into Today's, Upcoming, and Past
  const groupAppointments = (appts: Appointment[]): AppointmentGroup[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todays: Appointment[] = [];
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];

    appts.forEach((appt) => {
      const appointmentDate = new Date(appt.startTime);
      appointmentDate.setHours(0, 0, 0, 0);

      if (appointmentDate.getTime() === today.getTime()) {
        todays.push(appt);
      } else if (appointmentDate > today) {
        upcoming.push(appt);
      } else {
        past.push(appt);
      }
    });

    // Sort each group by start time
    const sortByTime = (a: Appointment, b: Appointment) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    };

    todays.sort(sortByTime);
    upcoming.sort(sortByTime);
    past.sort((a, b) => sortByTime(b, a)); // Reverse for past (most recent first)

    const groups: AppointmentGroup[] = [];

    if (todays.length > 0) {
      groups.push({ title: "Today's", appointments: todays });
    }
    if (upcoming.length > 0) {
      groups.push({ title: 'Upcoming', appointments: upcoming });
    }
    if (past.length > 0) {
      groups.push({ title: 'Past', appointments: past });
    }

    return groups;
  };

  // Fetch appointments for the pet
  const fetchAppointments = useCallback(async () => {
    if (!petId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await clerkApiClient.getAppointments({ petId });

      if (response.success && response.data) {
        setAppointments(response.data);
      } else {
        setError('Failed to load appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  // Load appointments when pet is selected
  useEffect(() => {
    if (selectedPet) {
      fetchAppointments();
    }
  }, [selectedPet, fetchAppointments]);

  // Refresh appointments when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (selectedPet) {
        fetchAppointments();
      }
    }, [selectedPet, fetchAppointments])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const appointmentGroups = groupAppointments(appointments);
  const hasAppointments = appointments.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#4559A7" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {selectedPet?.name || 'Pet'}'s Appointments
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading && appointments.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4559A7" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : error && !hasAppointments ? (
        <View style={styles.emptyContainer}>
          <CalendarIcon size={64} color="#ADD7EB" />
          <Text style={styles.emptyTitle}>Unable to Load Appointments</Text>
          <Text style={styles.emptyDescription}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAppointments}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !hasAppointments ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.emptyScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emptyContainer}>
            <CalendarIcon size={64} color="#ADD7EB" />
            <Text style={styles.emptyTitle}>No Appointments Yet</Text>
            <Text style={styles.emptyDescription}>
              This pet doesn't have any appointments scheduled.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4559A7']}
              tintColor="#4559A7"
            />
          }
        >
          <View style={styles.content}>
            {appointmentGroups.map((group, groupIndex) => (
              <View key={group.title} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{group.title}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{group.appointments.length}</Text>
                  </View>
                </View>
                {group.appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

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
  scrollView: {
    flex: 1,
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
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4559A7',
  },
  countBadge: {
    backgroundColor: '#DCEBF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4559A7',
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4559A7',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#4559A7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bugFab: {
    position: 'absolute',
    top: 70,
    right: 20,
    backgroundColor: '#C62828',
  },
});
