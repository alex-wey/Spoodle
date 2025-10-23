import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin, Bug, CheckCircle, Trash2, Edit3 } from 'lucide-react-native';
import { router } from 'expo-router';
import { FAB } from '../../components/FAB';
import { useAuthStore } from '../../store/auth';
import { apiClient } from '../../lib/api';
export default function AppointmentsScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const { token, user } = useAuthStore();

  useEffect(() => {
    generateWeekDays();
    fetchTasksForDate(selectedDate);
  }, [selectedDate, currentMonth]);

  const generateWeekDays = () => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      weekDays.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
        isToday: date.toDateString() === new Date().toDateString(),
      });
    }
    
    setCurrentWeek(weekDays);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
    
    // Update selected date to first day of new month if current selected date is not in new month
    if (selectedDate.getMonth() !== newMonth.getMonth()) {
      const newSelectedDate = new Date(newMonth);
      newSelectedDate.setDate(1);
      setSelectedDate(newSelectedDate);
    }
  };

  const selectDate = (date) => {
    setSelectedDate(date);
  };

  const fetchTasksForDate = async (date) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const dateString = date.toISOString().split('T')[0];
      const response = await apiClient.getTasks(dateString);
      
      if (response.success) {
        setTasks(response.data || []);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const addNewTask = () => {
    router.push('/(tabs)/appointments/add');
  };

  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const markTaskComplete = async (taskId) => {
    try {
      // TODO: Implement API call to mark task as complete
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completionStatus: true } : task
      ));
      setShowTaskModal(false);
      Alert.alert('Success', 'Task marked as complete!');
    } catch (error) {
      console.error('Error marking task complete:', error);
      Alert.alert('Error', 'Failed to mark task as complete');
    }
  };

  const deleteTask = async (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement API call to delete task
              setTasks(prev => prev.filter(task => task.id !== taskId));
              setShowTaskModal(false);
              Alert.alert('Success', 'Task deleted successfully!');
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          }
        }
      ]
    );
  };

  const addNotesToTask = (taskId) => {
    Alert.prompt(
      'Add Notes',
      'Enter notes for this task:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: async (notes) => {
            try {
              // TODO: Implement API call to update task notes
              setTasks(prev => prev.map(task => 
                task.id === taskId ? { ...task, notes: notes } : task
              ));
              Alert.alert('Success', 'Notes added successfully!');
            } catch (error) {
              console.error('Error adding notes:', error);
              Alert.alert('Error', 'Failed to add notes');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in_progress':
        return '#F59E0B';
      case 'pending':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getTaskTypeColor = (type) => {
    switch (type) {
      case 'walk':
        return '#3BB272';
      case 'feed':
        return '#E75325';
      case 'medicate':
        return '#4559A7';
      case 'groom':
        return '#F59E0B';
      case 'training':
        return '#8B5CF6';
      case 'checkup':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Task Calendar</Text>
          <TouchableOpacity style={styles.addButton} onPress={addNewTask}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity
            onPress={() => navigateMonth('prev')}
            style={styles.navButton}
          >
            <ChevronLeft size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <Text style={styles.monthText}>
            {currentMonth.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </Text>
          
          <TouchableOpacity
            onPress={() => navigateMonth('next')}
            style={styles.navButton}
          >
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            onPress={() => navigateWeek('prev')}
            style={styles.navButton}
          >
            <ChevronLeft size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <View style={styles.weekScrollView}>
            <View style={styles.weekScrollContent}>
              {currentWeek.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => selectDate(day.date)}
                  style={[
                    styles.dayButton,
                    day.isSelected && styles.selectedDayButton,
                    day.isToday && styles.todayButton,
                  ]}
                >
                  <Text style={[
                    styles.dayName,
                    day.isSelected && styles.selectedDayText,
                    day.isToday && styles.todayText,
                  ]}>
                    {day.dayName}
                  </Text>
                  <Text style={[
                    styles.dayNumber,
                    day.isSelected && styles.selectedDayText,
                    day.isToday && styles.todayText,
                  ]}>
                    {day.dayNumber}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            onPress={() => navigateWeek('next')}
            style={styles.navButton}
          >
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Selected Date Info */}
        <View style={styles.dateInfo}>
          <Calendar size={20} color="#4559A7" />
          <Text style={styles.selectedDateText}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Hourly Calendar Blocks */}
        <ScrollView style={styles.tasksContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading tasks...</Text>
            </View>
          ) : (
            <View style={styles.hourlyGrid}>
              {/* Generate hourly time blocks */}
              {Array.from({ length: 24 }, (_, hour) => {
                const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                const tasksForHour = tasks.filter(task => {
                  if (task.scheduledTime) {
                    const taskHour = new Date(task.scheduledTime).getHours();
                    return taskHour === hour;
                  }
                  return false;
                });
                
                // Check if this is the current hour
                const currentHour = new Date().getHours();
                const isCurrentHour = hour === currentHour && selectedDate.toDateString() === new Date().toDateString();
                
                return (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.timeBlock,
                      isCurrentHour && styles.currentTimeBlock,
                      tasksForHour.length > 0 && styles.blockWithTasks
                    ]}
                    onPress={() => tasksForHour.length > 0 ? handleTaskPress(tasksForHour[0]) : addNewTask()}
                    activeOpacity={0.7}
                  >
                    <View style={styles.timeBlockHeader}>
                      <Text style={[
                        styles.timeBlockText,
                        isCurrentHour && styles.currentTimeBlockText
                      ]}>
                        {hour === 0 ? '12 AM' : 
                         hour < 12 ? `${hour} AM` : 
                         hour === 12 ? '12 PM' : 
                         `${hour - 12} PM`}
                      </Text>
                      {tasksForHour.length > 0 && (
                        <View style={styles.taskCountBadge}>
                          <Text style={styles.taskCountText}>{tasksForHour.length}</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.timeBlockContent}>
                      {tasksForHour.length > 0 ? (
                        <View style={styles.tasksInBlock}>
                          {tasksForHour.slice(0, 2).map((task, taskIndex) => (
                            <TouchableOpacity
                              key={task.id || taskIndex} 
                              style={[
                                styles.taskBlock,
                                { backgroundColor: getTaskTypeColor(task.type) }
                              ]}
                              onPress={() => handleTaskPress(task)}
                            >
                              <Text style={styles.taskBlockTitle} numberOfLines={1}>
                                {task.title || 'Untitled Task'}
                              </Text>
                              <Text style={styles.taskBlockPet} numberOfLines={1}>
                                {task.pet?.name || 'Pet'}
                              </Text>
                              {task.completionStatus && (
                                <CheckCircle size={16} color="#FFFFFF" style={styles.completeIcon} />
                              )}
                            </TouchableOpacity>
                          ))}
                          {tasksForHour.length > 2 && (
                            <Text style={styles.moreTasksText}>
                              +{tasksForHour.length - 2} more
                            </Text>
                          )}
                        </View>
                      ) : (
                        <Text style={[
                          styles.emptyBlockText,
                          isCurrentHour && styles.currentEmptyBlockText
                        ]}>
                          {isCurrentHour ? 'Current time' : 'Tap to add task'}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bug Report FAB */}
      <View style={styles.fabContainer}>
        <FAB
          icon={<Bug size={24} color="#FFFFFF" />}
          onPress={() => router.push("/support")}
          style={styles.fabBug}
          size="large"
        />
      </View>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTask.title}</Text>
              <TouchableOpacity onPress={() => setShowTaskModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.taskInfo}>
                <Text style={styles.taskDescription}>{selectedTask.description}</Text>
                <Text style={styles.taskPet}>Pet: {selectedTask.pet?.name || 'Unknown'}</Text>
                <Text style={styles.taskTime}>
                  Time: {formatTime(selectedTask.scheduledTime)}
                </Text>
                <Text style={styles.taskType}>Type: {selectedTask.type}</Text>
                {selectedTask.notes && (
                  <Text style={styles.taskNotes}>Notes: {selectedTask.notes}</Text>
                )}
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={() => markTaskComplete(selectedTask.id)}
                >
                  <CheckCircle size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Mark Complete</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.notesButton]}
                  onPress={() => addNotesToTask(selectedTask.id)}
                >
                  <Edit3 size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Add Notes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteTask(selectedTask.id)}
                >
                  <Trash2 size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4559A7',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4559A7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4559A7',
    flex: 1,
    textAlign: 'center',
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADD7EB',
  },
  weekScrollView: {
    flex: 1,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekScrollContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    minWidth: 40,
    flex: 1,
  },
  selectedDayButton: {
    backgroundColor: '#4559A7',
  },
  todayButton: {
    backgroundColor: '#ADD7EB',
  },
  dayName: {
    fontSize: 12,
    color: '#4559A7',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4559A7',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  todayText: {
    color: '#4559A7',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4559A7',
    marginLeft: 8,
  },
  tasksContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#4559A7',
  },
  hourlyGrid: {
    flex: 1,
    paddingHorizontal: 8,
  },
  timeBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 80,
  },
  currentTimeBlock: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  blockWithTasks: {
    backgroundColor: '#F0F9FF',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  timeBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeBlockText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  currentTimeBlockText: {
    color: '#92400E',
    fontWeight: '700',
  },
  taskCountBadge: {
    backgroundColor: '#4559A7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  taskCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeBlockContent: {
    flex: 1,
    justifyContent: 'center',
  },
  tasksInBlock: {
    gap: 4,
  },
  miniTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 6,
    marginBottom: 2,
  },
  miniTaskTitle: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
  },
  miniStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  moreTasksText: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 2,
  },
  emptyBlockText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  currentEmptyBlockText: {
    color: '#92400E',
    fontWeight: '500',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#4559A7',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
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
  // Task block styles
  taskBlock: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
    position: 'relative',
  },
  taskBlockTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  taskBlockPet: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  completeIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4559A7',
    flex: 1,
  },
  modalBody: {
    flex: 1,
  },
  taskInfo: {
    marginBottom: 20,
  },
  taskDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  taskPet: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  taskType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  taskNotes: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  modalActions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButton: {
    backgroundColor: '#10B981',
  },
  notesButton: {
    backgroundColor: '#4559A7',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});


