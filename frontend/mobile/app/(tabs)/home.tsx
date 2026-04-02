import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import {
  Calendar,
  MessageCircle,
  FileText,
  ClipboardList,
  ChevronRight,
  AlertCircle,
  Dog,
  PawPrint,
  Clock,
  MoreVertical,
  X,
} from 'lucide-react-native';
import { usePetStore } from '../store/pets';
import { clerkApiClient } from '../lib/api';
import { getSafeImageSource } from '../lib/imageUtils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 16) / 2; // 2 columns with padding

interface Task {
  id: string;
  title: string;
  taskType: string;
  scheduledTime: string;
  scheduledDate: string;
  petId: string;
  completed: boolean;
}

interface Appointment {
  id: string;
  petId: string;
  appointmentDate: Date;
  appointmentTime?: string;
  reason?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { pets, fetchPets } = usePetStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clinic, setClinic] = useState<any>(null);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [urgentItems, setUrgentItems] = useState<any[]>([]);
  const [showAllUrgent, setShowAllUrgent] = useState(false);
  const [quickMenuPetId, setQuickMenuPetId] = useState<string | null>(null);
  const [showDocumentsPetSelector, setShowDocumentsPetSelector] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch pets
      await fetchPets();
      
      // Fetch profile for clinic info
      const profileResponse = await clerkApiClient.getProfile();
      if (profileResponse.success && profileResponse.data.clinic) {
        setClinic(profileResponse.data.clinic);
      }
      
      // Fetch today's tasks for all pets
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      
      const allTasks: Task[] = [];
      const allAppointments: Appointment[] = [];
      
      for (const pet of pets) {
        try {
          // Get tasks
          const tasksResponse = await clerkApiClient.getTasks(pet.id, today, endOfDay);
          if (tasksResponse.data) {
            allTasks.push(...tasksResponse.data.filter((t: Task) => !t.completed));
          }
          
          // Get appointments (upcoming)
          const appointmentsResponse = await clerkApiClient.getAppointments(pet.id);
          if (appointmentsResponse.data) {
            const upcoming = appointmentsResponse.data.filter((apt: any) => {
              const aptDate = new Date(apt.appointmentDate);
              return aptDate >= today;
            });
            allAppointments.push(...upcoming);
          }
        } catch (error) {
          console.error(`Error fetching data for pet ${pet.id}:`, error);
        }
      }
      
      setTodayTasks(allTasks.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)));
      setUpcomingAppointments(allAppointments.sort((a, b) => 
        new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
      ));
      
      // Calculate urgent items
      const urgent = [];
      const overdueTasks = allTasks.filter(t => {
        const taskTime = new Date(`${t.scheduledDate}T${t.scheduledTime}`);
        return taskTime < new Date();
      });
      
      const todayAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.toDateString() === today.toDateString();
      });
      
      const thisWeekAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return aptDate > today && aptDate <= weekFromNow;
      });
      
      if (overdueTasks.length > 0) {
        urgent.push({
          type: 'overdue',
          count: overdueTasks.length,
          message: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
        });
      }
      
      if (todayAppointments.length > 0) {
        urgent.push({
          type: 'appointment_today',
          count: todayAppointments.length,
          message: `${todayAppointments.length} appointment${todayAppointments.length > 1 ? 's' : ''} today`,
        });
      }
      
      if (thisWeekAppointments.length > 0) {
        urgent.push({
          type: 'appointment_week',
          count: thisWeekAppointments.length,
          message: `${thisWeekAppointments.length} appointment${thisWeekAppointments.length > 1 ? 's' : ''} this week`,
        });
      }
      
      setUrgentItems(urgent);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  }, [pets, fetchPets]);

  // Fetch data on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserName = () => {
    if (user?.firstName) return user.firstName;
    if (user?.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress.split('@')[0];
    }
    return 'there';
  };

  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet?.name || 'Pet';
  };

  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateObj = new Date(date);
    
    if (dateObj.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (dateObj.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getTasksForPet = (petId: string) => {
    return todayTasks.filter(t => t.petId === petId).length;
  };

  const getNextAppointmentForPet = (petId: string) => {
    const petAppointments = upcomingAppointments.filter(apt => apt.petId === petId);
    if (petAppointments.length === 0) return null;
    return petAppointments[0];
  };

  const getStatusColor = (petId: string) => {
    const tasksCount = getTasksForPet(petId);
    const overdueTasks = todayTasks.filter(t => {
      if (t.petId !== petId) return false;
      const taskTime = new Date(`${t.scheduledDate}T${t.scheduledTime}`);
      return taskTime < new Date();
    });
    
    if (overdueTasks.length > 0) return '#E75325'; // Orange (overdue)
    if (tasksCount > 0) return '#ADD7EB'; // Light Blue (tasks today)
    return '#3BB272'; // Green (all clear)
  };

  if (loading && pets.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4559A7" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4559A7"]}
            tintColor="#4559A7"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {getUserName()}! 👋</Text>
            {clinic && clinic.slug !== 'spoodle' && (
              <View style={styles.clinicBadge}>
                <Text style={styles.clinicBadgeText}>🏥 {clinic.name}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Attention Needed Section */}
        {urgentItems.length > 0 && (
          <TouchableOpacity 
            style={styles.urgentCard}
            onPress={() => setShowAllUrgent(!showAllUrgent)}
            activeOpacity={0.7}
          >
            <View style={styles.urgentHeader}>
              <View style={styles.urgentTitleRow}>
                <AlertCircle size={24} color="#E75325" />
                <Text style={styles.urgentTitle}>
                  ATTENTION NEEDED ({urgentItems.length})
                </Text>
              </View>
              <ChevronRight 
                size={20} 
                color="#E75325" 
                style={{ transform: [{ rotate: showAllUrgent ? '90deg' : '0deg' }] }}
              />
            </View>
            {(showAllUrgent || urgentItems.length <= 3) && (
              <View style={styles.urgentList}>
                {urgentItems.map((item, index) => (
                  <View key={index} style={styles.urgentItem}>
                    <View style={styles.urgentDot} />
                    <Text style={styles.urgentItemText}>{item.message}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* All My Pets Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All My Pets</Text>
          {pets.length === 0 ? (
            <View style={styles.emptyPetsCard}>
              <Dog size={48} color="#9CA3AF" />
              <Text style={styles.emptyPetsText}>No pets yet</Text>
              <TouchableOpacity
                style={styles.addPetButton}
                onPress={() => router.push('/(tabs)/pets/add')}
              >
                <Text style={styles.addPetButtonText}>Add Your First Pet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.petsGrid}>
              {pets.map((pet) => {
                const tasksCount = getTasksForPet(pet.id);
                const nextAppointment = getNextAppointmentForPet(pet.id);
                const statusColor = getStatusColor(pet.id);
                
                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={styles.petCard}
                    onPress={() => router.push(`/(tabs)/pets/${pet.id}/profile` as any)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.petCardHeader}>
                      <Image
                        source={getSafeImageSource(pet.imageUrl, pet.name, pet.biologicalSex)}
                        style={styles.petImage}
                        onError={(error) => {
                          console.log('Home pet card image load error:', error);
                        }}
                      />
                      <View style={styles.petCardHeaderRight}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <TouchableOpacity
                          style={styles.menuButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            setQuickMenuPetId(pet.id);
                          }}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <MoreVertical size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
                    <Text style={styles.petBreed} numberOfLines={1}>
                      {pet.breed || pet.species}
                    </Text>
                    <View style={styles.petInfo}>
                      {tasksCount > 0 && (
                        <View style={styles.petBadge}>
                          <Text style={styles.petBadgeText}>{tasksCount} task{tasksCount > 1 ? 's' : ''}</Text>
                        </View>
                      )}
                      {nextAppointment && (
                        <Text style={styles.petNextApt} numberOfLines={1}>
                          Next: {formatDate(nextAppointment.appointmentDate)}
                        </Text>
                      )}
                      {!nextAppointment && tasksCount === 0 && (
                        <View style={styles.petAllGoodContainer}>
                          <Text style={styles.petAllGood}>All good! </Text>
                          <Text style={styles.petCheckmark}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Today's Schedule */}
        {todayTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Schedule</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.scheduleCard}>
              {todayTasks.slice(0, 5).map((task, index) => {
                const isOverdue = new Date(`${task.scheduledDate}T${task.scheduledTime}`) < new Date();
                return (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.scheduleItem,
                      index < todayTasks.length - 1 && styles.scheduleItemBorder
                    ]}
                    onPress={() => router.push('/(tabs)/tasks')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.scheduleTime}>
                      <Clock size={16} color={isOverdue ? '#E75325' : '#6B7280'} />
                      <Text style={[
                        styles.scheduleTimeText,
                        isOverdue && styles.scheduleTimeOverdue
                      ]}>
                        {formatTime(task.scheduledTime)}
                      </Text>
                    </View>
                    <View style={styles.scheduleInfo}>
                      <Text style={styles.scheduleTask}>{getPetName(task.petId)}: {task.title}</Text>
                      <Text style={styles.scheduleType}>{task.taskType}</Text>
                    </View>
                    <View style={[styles.checkbox, isOverdue && styles.checkboxOverdue]} />
                  </TouchableOpacity>
                );
              })}
              {todayTasks.length > 5 && (
                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={() => router.push('/(tabs)/tasks')}
                >
                  <Text style={styles.viewMoreText}>
                    +{todayTasks.length - 5} more tasks
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/tasks')}
            >
              <Calendar size={24} color="#4559A7" />
              <Text style={styles.actionText}>Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/chat')}
            >
              <MessageCircle size={24} color="#4559A7" />
              <Text style={styles.actionText}>Ask Vet AI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (pets.length > 0) {
                  setShowDocumentsPetSelector(true);
                }
              }}
            >
              <FileText size={24} color="#4559A7" />
              <Text style={styles.actionText}>Documents</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (pets.length > 0) {
                  router.push(`/(tabs)/pets/${pets[0].id}/forms` as any);
                }
              }}
            >
              <ClipboardList size={24} color="#4559A7" />
              <Text style={styles.actionText}>Forms</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Empty State for No Tasks */}
        {pets.length > 0 && todayTasks.length === 0 && urgentItems.length === 0 && (
          <View style={styles.allClearCard}>
            <Text style={styles.allClearEmoji}>🎉</Text>
            <Text style={styles.allClearTitle}>All caught up!</Text>
            <Text style={styles.allClearText}>
              No tasks or appointments for today. Enjoy your day!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Action Menu Modal */}
      <Modal
        visible={quickMenuPetId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setQuickMenuPetId(null)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setQuickMenuPetId(null)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {quickMenuPetId ? getPetName(quickMenuPetId) : 'Quick Actions'}
              </Text>
              <TouchableOpacity
                onPress={() => setQuickMenuPetId(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color="#4559A7" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalAction}
              onPress={() => {
                if (quickMenuPetId) {
                  setQuickMenuPetId(null);
                  router.push(`/(tabs)/pets/${quickMenuPetId}/docs` as any);
                }
              }}
            >
              <View style={styles.modalActionIcon}>
                <FileText size={24} color="#4559A7" />
              </View>
              <Text style={styles.modalActionText}>Documents</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalAction}
              onPress={() => {
                if (quickMenuPetId) {
                  setQuickMenuPetId(null);
                  router.push(`/(tabs)/pets/${quickMenuPetId}/appointments` as any);
                }
              }}
            >
              <View style={styles.modalActionIcon}>
                <Calendar size={24} color="#4559A7" />
              </View>
              <Text style={styles.modalActionText}>Appointments</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalAction}
              onPress={() => {
                if (quickMenuPetId) {
                  setQuickMenuPetId(null);
                  router.push(`/(tabs)/pets/${quickMenuPetId}/forms` as any);
                }
              }}
            >
              <View style={styles.modalActionIcon}>
                <ClipboardList size={24} color="#4559A7" />
              </View>
              <Text style={styles.modalActionText}>Forms</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Documents Pet Selector Modal */}
      <Modal
        visible={showDocumentsPetSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDocumentsPetSelector(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowDocumentsPetSelector(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Pet</Text>
              <TouchableOpacity
                onPress={() => setShowDocumentsPetSelector(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color="#4559A7" />
              </TouchableOpacity>
            </View>

            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petSelectorItem}
                onPress={() => {
                  setShowDocumentsPetSelector(false);
                  router.push(`/(tabs)/pets/${pet.id}/docs` as any);
                }}
              >
                <Image
                  source={getSafeImageSource(pet.imageUrl, pet.name, pet.biologicalSex)}
                  style={styles.petSelectorImage}
                  onError={(error) => {
                    console.log('Pet selector image load error:', error);
                  }}
                />
                <View style={styles.petSelectorInfo}>
                  <Text style={styles.petSelectorName}>{pet.name}</Text>
                  <Text style={styles.petSelectorBreed}>{pet.breed || pet.species}</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4559A7',
    marginBottom: 8,
    lineHeight: 34,
  },
  clinicBadge: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  clinicBadgeText: {
    fontSize: 12,
    color: '#4559A7',
    fontWeight: '600',
  },
  urgentCard: {
    backgroundColor: '#FFF5F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#E75325',
  },
  urgentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  urgentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E75325',
  },
  urgentList: {
    marginTop: 12,
  },
  urgentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  urgentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E75325',
    marginRight: 12,
  },
  urgentItemText: {
    fontSize: 14,
    color: '#E75325',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4559A7',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4559A7',
    fontWeight: '600',
  },
  emptyPetsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyPetsText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 16,
  },
  addPetButton: {
    backgroundColor: '#4559A7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addPetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  petsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  petCard: {
    width: CARD_WIDTH,
    backgroundColor: '#4559A7',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  petCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  petCardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  petBreed: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    fontWeight: '500',
  },
  petInfo: {
    gap: 6,
  },
  petBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  petBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  petNextApt: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  petAllGoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petAllGood: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  petCheckmark: {
    fontSize: 13,
    color: '#3BB272',
    fontWeight: '700',
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  scheduleItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 80,
  },
  scheduleTimeText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  scheduleTimeOverdue: {
    color: '#E75325',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTask: {
    fontSize: 15,
    color: '#4559A7',
    fontWeight: '500',
    marginBottom: 2,
  },
  scheduleType: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  checkboxOverdue: {
    borderColor: '#E75325',
    backgroundColor: '#FFF5F0',
  },
  viewMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#4559A7',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: (width - 40 - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    color: '#4559A7',
    fontWeight: '600',
  },
  allClearCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3BB272',
  },
  allClearEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  allClearTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3BB272',
    marginBottom: 8,
  },
  allClearText: {
    fontSize: 15,
    color: '#3BB272',
    textAlign: 'center',
    lineHeight: 22,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4559A7',
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  modalActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalActionText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  petSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  petSelectorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: 'rgba(69, 89, 167, 0.1)',
    borderWidth: 2,
    borderColor: '#4559A7',
  },
  petSelectorInfo: {
    flex: 1,
  },
  petSelectorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4559A7',
    marginBottom: 4,
  },
  petSelectorBreed: {
    fontSize: 14,
    color: '#6B7280',
  },
});
