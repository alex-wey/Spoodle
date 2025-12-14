import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { usePetStore } from '../../store/pets';
import { getSafeImageSource } from '../../lib/imageUtils';
import { useAuth } from '@clerk/clerk-expo';
import { clerkApiClient } from '../../lib/api';
import PetSelectionModal from '../pets/components/PetSelectionModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TimeSlot {
  hour: number;
  label: string;
}

// Create time slots starting from 6am, wrapping around to show 6am again at the bottom
const TIME_SLOTS: TimeSlot[] = [
  // Hours 6am-11pm (6-23)
  ...Array.from({ length: 18 }, (_, i) => {
    const hour = i + 6; // Start from 6am
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? 'pm' : 'am';
    return {
      hour,
      label: hour === 0 || hour === 12 ? `12${period}` : `${displayHour}${period}`,
    };
  }),
  // Hours 12am-5am (0-5) - wrap around to show at bottom
  ...Array.from({ length: 6 }, (_, i) => {
    const hour = i; // 0-5
    const displayHour = hour === 0 ? 12 : hour;
    const period = 'am';
    return {
      hour,
      label: hour === 0 ? `12${period}` : `${displayHour}${period}`,
    };
  }),
];

export default function TaskCalendarScreen() {
  const { pets, selectedPetId, selectPet, fetchPets } = usePetStore();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [petSelectionVisible, setPetSelectionVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [editTasksModalVisible, setEditTasksModalVisible] = useState(false);
  const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [loadingAllTasks, setLoadingAllTasks] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    scheduledTime: '09:00',
    taskType: 'medicine',
  });
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]); // 0=Sun, 1=Mon, etc.
  const [taskTimes, setTaskTimes] = useState<string[]>([]);
  const [showTaskTypeDropdown, setShowTaskTypeDropdown] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState('09:00');
  const [tempTimePeriod, setTempTimePeriod] = useState<'AM' | 'PM'>('AM');
  const [daySelectionMode, setDaySelectionMode] = useState<'weekly' | 'specific'>('weekly'); // 'weekly' or 'specific'
  const [datePickerMonth, setDatePickerMonth] = useState(new Date()); // For date picker view
  const [skippedOccurrences, setSkippedOccurrences] = useState<Record<string, string[]>>({}); // Map of parentTaskId -> array of "date_time" strings
  const [customTaskType, setCustomTaskType] = useState(''); // Custom task type text when "other" is selected

  const TASK_TYPES = [
    { value: 'medicine', label: 'Medicine', icon: 'medical-outline', color: '#FF5D91' },
    { value: 'feeding', label: 'Feeding', icon: 'restaurant-outline', color: '#F47721' },
    { value: 'walk', label: 'Walk', icon: 'walk-outline', color: '#4559A7' },
    { value: 'grooming', label: 'Grooming', icon: 'brush-outline', color: '#ADD7EB' },
    { value: 'vet_visit', label: 'Vet Visit', icon: 'calendar-outline', color: '#3BB272' },
    { value: 'other', label: 'Other', icon: 'ellipse-outline', color: '#CDC9CE' },
  ];

  const getTaskTypeIcon = (taskType: string) => {
    const type = TASK_TYPES.find(t => t.value === taskType);
    return type?.icon || 'calendar-outline';
  };

  const getTaskTypeColor = (taskType: string) => {
    const type = TASK_TYPES.find(t => t.value === taskType);
    return type?.color || '#CDC9CE';
  };
  
  const getTaskTypeLabel = (taskType: string, customLabel?: string) => {
    if (taskType === 'other' && customLabel) {
      return customLabel;
    }
    const type = TASK_TYPES.find(t => t.value === taskType);
    return type?.label || 'Task';
  };
  const [hasSelectedPet, setHasSelectedPet] = useState(false);

  const dateScrollRef = useRef<ScrollView>(null);
  const hasManuallySelectedDate = useRef(false); // Track if user has manually selected a date
  const isInitialLoad = useRef(true); // Track if this is the first load

  // Fetch pets on mount
  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  // Check if pet should be selected on mount
  useEffect(() => {
    if (pets.length > 0 && !hasSelectedPet) {
      // Check if there's a stored selection
      if (selectedPetId && pets.find(p => p.id === selectedPetId)) {
        setSelectedPet(selectedPetId);
        setHasSelectedPet(true);
        setInitialLoading(false);
      } else {
        // Show pet selection modal on first load
        setPetSelectionVisible(true);
        setInitialLoading(false);
      }
    } else if (pets.length === 0) {
      setInitialLoading(false);
    }
  }, [pets, selectedPetId, hasSelectedPet]);

  // Function to scroll to today's date in the date selector
  const scrollToToday = useCallback(() => {
    if (!dateScrollRef.current) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = getDaysInMonth(currentMonth);
    const todayIndex = days.findIndex((date) => {
      if (!date) return false;
      const dateStr = date.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      return dateStr === todayStr;
    });
    
    if (todayIndex !== -1) {
      // Calculate item width: minWidth (50) + paddingHorizontal (12*2=24) + gap (8) ≈ 58-60px
      // Using a slightly larger value to account for text width variations
      const itemWidth = 58; // minWidth (50) + gap (8), padding is included in minWidth
      const scrollPosition = todayIndex * itemWidth - (SCREEN_WIDTH / 2) + (itemWidth / 2);
      
      dateScrollRef.current.scrollTo({
        x: Math.max(0, scrollPosition),
        animated: true,
      });
    }
  }, [currentMonth]);

  // Reset to today's date only on initial load when calendar tab is focused
  useFocusEffect(
    useCallback(() => {
      // Only reset to today on initial load, not every time the tab is focused
      if (isInitialLoad.current) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setSelectedDate(today);
        setCurrentMonth(today);
        hasManuallySelectedDate.current = false;
        isInitialLoad.current = false;
        
        // Scroll to today's date after a delay to ensure the view is rendered
        setTimeout(() => {
          scrollToToday();
        }, 300);
      }
    }, [scrollToToday])
  );

  // Fetch tasks for selected date and pet - clear tasks when date/pet changes
  useEffect(() => {
    if (selectedPet) {
      // Clear old tasks immediately when date or pet changes
      setTasks([]);
      // Then fetch new tasks for the selected day
      fetchTasks();
    }
  }, [selectedPet, selectedDate]);

  const fetchTasks = async () => {
    if (!selectedPet) return;
    setLoading(true);
    try {
      // Create date range for the selected day only
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      
      console.log(`[TaskCalendar] Fetching tasks for pet ${selectedPet} on ${selectedDate.toISOString().split('T')[0]}`);
      
      const response = await clerkApiClient.getTasks(
        selectedPet,
        startDate,
        endDate
      );
      
      console.log(`[TaskCalendar] Loaded ${response.data?.length || 0} tasks for selected day`);
      
      // Remove duplicate tasks (same ID) that might be returned from backend
      const uniqueTasks = new Map<string, any>();
      (response.data || []).forEach((task: any) => {
        if (!uniqueTasks.has(task.id)) {
          uniqueTasks.set(task.id, task);
        } else {
          console.warn(`[TaskCalendar] Duplicate task found: ${task.id} - ${task.title}`);
        }
      });
      
      const deduplicatedTasks = Array.from(uniqueTasks.values());
      console.log(`[TaskCalendar] After deduplication: ${deduplicatedTasks.length} unique tasks`);
      setTasks(deduplicatedTasks);
      
      // Load skipped occurrences for all recurring tasks
      await loadSkippedOccurrences(deduplicatedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };
  
  const loadSkippedOccurrences = async (tasks: any[]) => {
    try {
      const skippedMap: Record<string, string[]> = {};
      const recurringTasks = tasks.filter(t => t.recurring);
      
      for (const task of recurringTasks) {
        const skippedKey = `skipped_occurrences_${task.id}`;
        const skippedData = await AsyncStorage.getItem(skippedKey);
        if (skippedData) {
          skippedMap[task.id] = JSON.parse(skippedData);
        }
      }
      
      setSkippedOccurrences(skippedMap);
    } catch (error) {
      console.error('Error loading skipped occurrences:', error);
    }
  };

  const fetchAllTasks = async () => {
    if (!selectedPet) return;
    setLoadingAllTasks(true);
    try {
      const response = await clerkApiClient.getTasks(selectedPet);
      setAllTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      setAllTasks([]);
    } finally {
      setLoadingAllTasks(false);
    }
  };

  const handleOpenEditTasks = async () => {
    if (!selectedPet) {
      Alert.alert('Error', 'Please select a pet first');
      return;
    }
    await fetchAllTasks();
    setEditTasksModalVisible(true);
  };

  const handleEditTask = (task: any) => {
    setTaskToEdit(task);
    setEditTasksModalVisible(false);
    setEditTaskModalVisible(true);
  };

  const handleSaveTask = async () => {
    if (!taskToEdit) return;

    try {
      await clerkApiClient.updateTask(taskToEdit.id, {
        title: taskToEdit.title,
        description: taskToEdit.description,
        scheduledDate: taskToEdit.scheduledDate,
        scheduledTime: taskToEdit.scheduledTime,
        taskType: taskToEdit.taskType,
        notes: taskToEdit.notes || undefined,
      });
      Alert.alert('Success', 'Task updated successfully!');
      setEditTaskModalVisible(false);
      setTaskToEdit(null);
      // Refresh tasks
      fetchTasks();
      fetchAllTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDeleteTask = async (task: any, fromCalendar: boolean = false) => {
    // For recurring task instances, extract parent task ID from composite ID
    // Composite ID format: {parentId}_{date}_{time}
    let parentTaskId: string | null = null;
    let occurrenceDate: string | null = null;
    let occurrenceTime: string | null = null;
    
    if (task.isRecurringInstance) {
      if (task.parentTaskId) {
        parentTaskId = task.parentTaskId;
      } else if (task.id.includes('_')) {
        // Extract parent ID and occurrence details from composite ID: "parentId_date_time"
        const parts = task.id.split('_');
        parentTaskId = parts[0]; // First part is the parent task ID
        occurrenceDate = parts[1]; // Second part is the date
        occurrenceTime = parts[2]; // Third part is the time
      }
    }
    
    console.log(`[handleDeleteTask] Task: ${task.id}, isRecurringInstance: ${task.isRecurringInstance}, parentTaskId: ${parentTaskId}`);
    
    // If it's a recurring task instance, show options: delete this occurrence, delete all, or cancel
    if (task.isRecurringInstance && parentTaskId) {
      if (Platform.OS === 'web') {
        // For web, use a custom prompt (window.confirm only supports yes/no)
        const choice = window.prompt(
          `Delete Recurring Task: "${task.title}"\n\n` +
          `Choose an option:\n` +
          `1 - Delete only this occurrence (${occurrenceDate} at ${occurrenceTime})\n` +
          `2 - Delete all occurrences (entire recurring pattern)\n` +
          `Cancel - Don't delete anything\n\n` +
          `Enter 1, 2, or Cancel:`
        );
        
        if (!choice || choice.toLowerCase() === 'cancel') {
          return; // User cancelled
        }
        
        if (choice === '1') {
          // Delete only this occurrence - mark as completed to hide it
          await handleDeleteOccurrenceOnly(task, parentTaskId, occurrenceDate, occurrenceTime, fromCalendar);
        } else if (choice === '2') {
          // Delete all occurrences - delete the parent task
          await handleDeleteAllOccurrences(parentTaskId, task.title, fromCalendar);
        }
      } else {
        // For native, use Alert with 3 buttons
        Alert.alert(
          `Delete Recurring Task: "${task.title}"`,
          `This is a recurring task. What would you like to delete?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'This occurrence only',
              onPress: async () => {
                await handleDeleteOccurrenceOnly(task, parentTaskId!, occurrenceDate, occurrenceTime, fromCalendar);
              },
            },
            {
              text: 'All occurrences',
              style: 'destructive',
              onPress: async () => {
                await handleDeleteAllOccurrences(parentTaskId!, task.title, fromCalendar);
              },
            },
          ]
        );
      }
      return;
    }
    
    // For non-recurring tasks, show simple confirmation
    const confirmMessage = `Are you sure you want to delete "${task.title}"?${task._combinedFrom && task._combinedFrom.length > 1 ? ` This will delete all ${task._combinedFrom.length} related recurring tasks.` : ''}`;
    
    if (Platform.OS === 'web') {
      const shouldDelete = window.confirm(`Delete Task\n\n${confirmMessage}`);
      if (!shouldDelete) {
        return;
      }
    } else {
      return new Promise<void>((resolve) => {
        Alert.alert(
          'Delete Task',
          confirmMessage,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                await performDelete();
                resolve();
              },
            },
          ]
        );
      });
    }
    
    await performDelete();
    
    async function performDelete() {
      try {
        // If this is a combined recurring task, delete all related tasks
        if (task._combinedFrom && task._combinedFrom.length > 1) {
          const deletePromises = task._combinedFrom.map((id: string) => 
            clerkApiClient.deleteTask(id)
          );
          await Promise.all(deletePromises);
          if (Platform.OS === 'web') {
            alert(`Success: Deleted ${task._combinedFrom.length} recurring tasks successfully!`);
          } else {
            Alert.alert('Success', `Deleted ${task._combinedFrom.length} recurring tasks successfully!`);
          }
        } else {
          console.log(`[handleDeleteTask] Deleting task: ${task.id}`);
          await clerkApiClient.deleteTask(task.id);
          if (Platform.OS === 'web') {
            alert('Success: Task deleted successfully!');
          } else {
            Alert.alert('Success', 'Task deleted successfully!');
          }
        }
        
        if (fromCalendar) {
          fetchTasks();
        } else {
          fetchAllTasks();
        }
        
        // Close modals if needed
        if (taskModalVisible && (selectedTask?.id === task.id || task._combinedFrom?.includes(selectedTask?.id))) {
          setTaskModalVisible(false);
          setSelectedTask(null);
        }
        if (editTaskModalVisible && (taskToEdit?.id === task.id || task._combinedFrom?.includes(taskToEdit?.id))) {
          setEditTaskModalVisible(false);
          setTaskToEdit(null);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        if (Platform.OS === 'web') {
          alert('Error: Failed to delete task');
        } else {
          Alert.alert('Error', 'Failed to delete task');
        }
      }
    }
  };
  
  // Handle deleting only a single occurrence of a recurring task
  const handleDeleteOccurrenceOnly = async (
    task: any,
    parentTaskId: string,
    occurrenceDate: string | null,
    occurrenceTime: string | null,
    fromCalendar: boolean
  ) => {
    try {
      // Store skipped occurrence in AsyncStorage
      // Format: "skipped_occurrences_{parentTaskId}" -> array of "{date}_{time}"
      const skippedKey = `skipped_occurrences_${parentTaskId}`;
      const skippedData = await AsyncStorage.getItem(skippedKey);
      const skippedList: string[] = skippedData ? JSON.parse(skippedData) : [];
      
      // Add this occurrence to the skipped list
      const occurrenceKey = occurrenceDate && occurrenceTime 
        ? `${occurrenceDate}_${occurrenceTime}`
        : task.id.split('_').slice(1).join('_'); // Fallback: extract date_time from composite ID
      
      if (!skippedList.includes(occurrenceKey)) {
        skippedList.push(occurrenceKey);
        await AsyncStorage.setItem(skippedKey, JSON.stringify(skippedList));
        
        // Update state immediately
        setSkippedOccurrences(prev => ({
          ...prev,
          [parentTaskId]: skippedList,
        }));
      }
      
      if (Platform.OS === 'web') {
        alert(`Success: This occurrence has been skipped and will be hidden from the calendar.`);
      } else {
        Alert.alert('Success', 'This occurrence has been skipped and will be hidden from the calendar.');
      }
      
      if (fromCalendar) {
        fetchTasks();
      } else {
        fetchAllTasks();
      }
      
      if (taskModalVisible && selectedTask?.id === task.id) {
        setTaskModalVisible(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error deleting occurrence:', error);
      if (Platform.OS === 'web') {
        alert('Error: Failed to skip occurrence');
      } else {
        Alert.alert('Error', 'Failed to skip occurrence');
      }
    }
  };
  
  // Handle deleting all occurrences of a recurring task
  const handleDeleteAllOccurrences = async (
    parentTaskId: string,
    taskTitle: string,
    fromCalendar: boolean
  ) => {
    try {
      console.log(`[handleDeleteAllOccurrences] Deleting parent task: ${parentTaskId}`);
      await clerkApiClient.deleteTask(parentTaskId);
      
      if (Platform.OS === 'web') {
        alert(`Success: All occurrences of "${taskTitle}" have been deleted!`);
      } else {
        Alert.alert('Success', `All occurrences of "${taskTitle}" have been deleted!`);
      }
      
      if (fromCalendar) {
        fetchTasks();
      } else {
        fetchAllTasks();
      }
      
      if (taskModalVisible) {
        setTaskModalVisible(false);
        setSelectedTask(null);
      }
      if (editTaskModalVisible) {
        setEditTaskModalVisible(false);
        setTaskToEdit(null);
      }
    } catch (error) {
      console.error('Error deleting all occurrences:', error);
      if (Platform.OS === 'web') {
        alert('Error: Failed to delete all occurrences');
      } else {
        Alert.alert('Error', 'Failed to delete all occurrences');
      }
    }
  };

  const handlePetSelect = (pet: any) => {
    setSelectedPet(pet.id);
    selectPet(pet.id);
    setHasSelectedPet(true);
    setPetSelectionVisible(false);
  };

  const handleDateChange = (newDate: Date) => {
    // Clear tasks immediately when date changes
    setTasks([]);
    setSelectedDate(newDate);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDayNumber = (date: Date) => {
    return date.getDate().toString();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];
    // Add days from previous month to fill the week
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift(prevDate);
    }
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    // Add days from next month to complete the week
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        days.push(new Date(year, month + 1, i));
      }
    }

    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    startOfWeek.setDate(diff);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
    // Update selected date if it's out of range
    if (newMonth.getMonth() !== selectedDate.getMonth()) {
      const firstDay = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1);
      handleDateChange(firstDay);
    }
    // Mark that user has manually navigated
    hasManuallySelectedDate.current = true;
  };

  const handleTaskPress = (task: any) => {
    setSelectedTask(task);
    setTaskModalVisible(true);
  };

  const handleCompleteTask = async (task: any) => {
    try {
      const userName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.emailAddresses?.[0]?.emailAddress || 'User';
      
      // For recurring task instances, use the parent task ID instead of the composite ID
      const taskIdToComplete = task.isRecurringInstance && task.parentTaskId 
        ? task.parentTaskId 
        : task.id;
      
      console.log(`[handleCompleteTask] Completing task: ${taskIdToComplete} (isRecurringInstance: ${task.isRecurringInstance}, originalId: ${task.id})`);
      
      await clerkApiClient.completeTask(taskIdToComplete, {
        completedAt: new Date(),
        completedBy: user?.id,
        completedByName: userName,
      });
      Alert.alert('Success', 'Task marked as complete!');
      setTaskModalVisible(false);
      fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const getDaysForWeek = (startDate: Date): Date[] => {
    const days: Date[] = [];
    // Get Monday of the current week
    const monday = new Date(startDate);
    const dayOfWeek = monday.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, otherwise go to Monday
    monday.setDate(monday.getDate() + diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const toggleDaySelection = (day: Date) => {
    const dayStr = day.toISOString().split('T')[0];
    const isSelected = selectedDays.some(d => d.toISOString().split('T')[0] === dayStr);
    
    if (isSelected) {
      setSelectedDays(selectedDays.filter(d => d.toISOString().split('T')[0] !== dayStr));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const toggleWeekDaySelection = (dayOfWeek: number) => {
    // dayOfWeek: 0=Sunday, 1=Monday, etc.
    if (selectedWeekDays.includes(dayOfWeek)) {
      setSelectedWeekDays(selectedWeekDays.filter(d => d !== dayOfWeek));
    } else {
      setSelectedWeekDays([...selectedWeekDays, dayOfWeek].sort());
    }
  };

  const getDaysInMonthForPicker = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, monthIndex, day));
    }
    
    return days;
  };

  const toggleSpecificDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isSelected = selectedDays.some(d => d.toISOString().split('T')[0] === dateStr);
    
    if (isSelected) {
      setSelectedDays(selectedDays.filter(d => d.toISOString().split('T')[0] !== dateStr));
    } else {
      setSelectedDays([...selectedDays, date]);
    }
  };

  const navigateDatePickerMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(datePickerMonth);
    newMonth.setMonth(datePickerMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setDatePickerMonth(newMonth);
  };

  const convertTo24Hour = (time12: string, period: 'AM' | 'PM'): string => {
    const [hoursStr, minutesStr] = time12.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr || '00';

    if (period === 'AM') {
      if (hours === 12) {
        hours = 0;
      }
    } else {
      // PM
      if (hours !== 12) {
        hours += 12;
      }
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const handleAddTime = () => {
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]|)$/;
    if (!tempTime || !timeRegex.test(tempTime)) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format (12-hour), e.g., 09:00 or 06:30');
      return;
    }

    // Ensure minutes are provided
    const timeParts = tempTime.split(':');
    if (timeParts.length !== 2 || !timeParts[1] || timeParts[1].length !== 2) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format, e.g., 09:00');
      return;
    }

    const hours = parseInt(timeParts[0], 10);
    if (hours < 1 || hours > 12) {
      Alert.alert('Invalid Time', 'Hours must be between 1 and 12');
      return;
    }

    // Convert to 24-hour format for storage
    const time24 = convertTo24Hour(tempTime, tempTimePeriod);

    if (!taskTimes.includes(time24)) {
      // Sort times chronologically
      const sortedTimes = [...taskTimes, time24].sort((a, b) => {
        const [aHours, aMinutes] = a.split(':').map(Number);
        const [bHours, bMinutes] = b.split(':').map(Number);
        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
      });
      setTaskTimes(sortedTimes);
      setTempTime('09:00');
      setTempTimePeriod('AM');
      setShowTimePicker(false);
    } else {
      Alert.alert('Duplicate Time', 'This time has already been added');
    }
  };

  const handleRemoveTime = (time: string) => {
    setTaskTimes(taskTimes.filter(t => t !== time));
  };

  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const handleAddTask = async () => {
    if (!selectedPet) {
      Alert.alert('Error', 'Please select a pet');
      return;
    }

    if (daySelectionMode === 'weekly' && selectedWeekDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day of the week');
      return;
    }

    if (daySelectionMode === 'specific' && selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one date');
      return;
    }

    if (taskTimes.length === 0) {
      Alert.alert('Error', 'Please add at least one time');
      return;
    }

    // Use custom task type if "other" is selected, otherwise use the predefined label
    const taskTitle = newTask.taskType === 'other' && customTaskType.trim()
      ? customTaskType.trim()
      : TASK_TYPES.find(t => t.value === newTask.taskType)?.label || 'Task';
    
    // Validate custom task type if "other" is selected
    if (newTask.taskType === 'other' && !customTaskType.trim()) {
      Alert.alert('Error', 'Please enter a custom task type');
      return;
    }

    try {
      const promises = [];
      
      if (daySelectionMode === 'weekly') {
        // For weekly recurring, create a single recurring task
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate end date (12 weeks from today)
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + (12 * 7));
        
        // Calculate the first occurrence date (first selected day of week)
        let firstDate: Date | null = null;
        for (const dayOfWeek of selectedWeekDays) {
          const date = new Date(today);
          const currentDayOfWeek = date.getDay();
          let daysToAdd = dayOfWeek - currentDayOfWeek;
          
          if (daysToAdd < 0) {
            daysToAdd += 7;
          }
          
          date.setDate(date.getDate() + daysToAdd);
          date.setHours(0, 0, 0, 0);
          
          if (!firstDate || date < firstDate) {
            firstDate = date;
          }
        }
        
        if (!firstDate) {
          Alert.alert('Error', 'Could not calculate first occurrence date');
          return;
        }
        
        // Create a single recurring task with all times
        // Use the first time as the scheduledTime (required field)
        // Store all times in recurrenceTimes array
        promises.push(
          clerkApiClient.createTask({
            petId: selectedPet,
            taskType: newTask.taskType,
            title: taskTitle,
            description: newTask.description || undefined,
            scheduledDate: firstDate,
            scheduledTime: taskTimes[0] || '09:00', // Use first time as primary
            notes: newTask.description || undefined,
            recurring: true,
            recurrencePattern: 'weekly',
            recurrenceDaysOfWeek: selectedWeekDays,
            recurrenceEndDate: endDate,
            recurrenceTimes: taskTimes, // Store all times
          }).catch((err) => {
            console.error(`Error creating recurring task:`, err);
            throw err;
          })
        );
      } else {
        // For specific dates, create tasks for selected dates
        for (const day of selectedDays) {
          // Ensure time is set to midnight to avoid timezone issues
          const date = new Date(day);
          date.setHours(0, 0, 0, 0);
          
          for (const time of taskTimes) {
            promises.push(
              clerkApiClient.createTask({
                petId: selectedPet,
                taskType: newTask.taskType,
                title: taskTitle,
                description: newTask.description || undefined,
                scheduledDate: date,
                scheduledTime: time,
                notes: newTask.description || undefined,
              }).catch((err) => {
                console.error(`Error creating task for ${date.toISOString()} at ${time}:`, err);
                throw err;
              })
            );
          }
        }
      }

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (failed > 0) {
        console.error(`Failed to create ${failed} task(s) out of ${promises.length}`);
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Task ${index + 1} failed:`, result.reason);
          }
        });
      }

      if (successful > 0) {
        Alert.alert(
          failed > 0 ? 'Partial Success' : 'Success',
          failed > 0
            ? `Created ${successful} task(s). ${failed} task(s) failed.`
            : `Successfully created ${successful} task(s)!`
        );
        setAddTaskModalVisible(false);
      setNewTask({ title: '', description: '', scheduledTime: '09:00', taskType: 'medicine' });
      setCustomTaskType(''); // Clear custom task type
      setSelectedDays([]);
      setSelectedWeekDays([]);
      setTaskTimes([]);
      setTempTime('09:00');
      setTempTimePeriod('AM');
      setDaySelectionMode('weekly');
      fetchTasks();
      } else {
        Alert.alert('Error', `Failed to create all ${promises.length} task(s). Please check the console for details.`);
      }
    } catch (error) {
      console.error('Error creating tasks:', error);
      Alert.alert('Error', 'Failed to create tasks. Please try again.');
    }
  };

  const handleOpenAddTask = () => {
    // Reset state when opening
    setSelectedDays([]);
    setSelectedWeekDays([]);
    setTaskTimes([]);
    setTempTime('09:00');
    setTempTimePeriod('AM');
    setDaySelectionMode('weekly');
    setDatePickerMonth(new Date());
    setCustomTaskType(''); // Clear custom task type
    setNewTask({
      title: '',
      description: '',
      scheduledTime: '09:00',
      taskType: 'medicine',
    });
    setAddTaskModalVisible(true);
  };

  const expandRecurringTask = (task: any, forDate?: Date): any[] => {
    if (!task.recurring || task.recurrencePattern !== 'weekly') {
      return [task];
    }

    const occurrences: any[] = [];
    const startDate = new Date(task.scheduledDate);
    startDate.setHours(0, 0, 0, 0);
    
    let endDate: Date;
    if (task.recurrenceEndDate) {
      endDate = new Date(task.recurrenceEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to 12 weeks if no end date
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (12 * 7));
    }

    const checkDate = forDate || selectedDate;
    const checkDateStr = checkDate.toISOString().split('T')[0];

    // Parse recurrence data
    let daysOfWeek: number[] = [];
    let times: string[] = [];

    try {
      if (task.recurrenceDaysOfWeek) {
        daysOfWeek = typeof task.recurrenceDaysOfWeek === 'string' 
          ? JSON.parse(task.recurrenceDaysOfWeek) 
          : task.recurrenceDaysOfWeek;
      }
      if (task.recurrenceTimes) {
        const parsedTimes = typeof task.recurrenceTimes === 'string' 
          ? JSON.parse(task.recurrenceTimes) 
          : task.recurrenceTimes;
        
        // Ensure times are in correct format (HH:MM) and filter out invalid entries
        times = Array.isArray(parsedTimes) 
          ? parsedTimes.filter(t => {
              if (!t || typeof t !== 'string') return false;
              // Must be in HH:MM format (e.g., "14:00", "09:30")
              const timeMatch = t.match(/^(\d{1,2}):(\d{2})$/);
              if (!timeMatch) return false;
              const hours = parseInt(timeMatch[1], 10);
              const minutes = parseInt(timeMatch[2], 10);
              return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
            })
          : [];
      }
    } catch (error) {
      console.error('Error parsing recurrence data:', error, task);
      return [];
    }

    // If no recurrence times specified, use the task's scheduledTime
    if (times.length === 0) {
      if (task.scheduledTime && typeof task.scheduledTime === 'string' && task.scheduledTime.includes(':')) {
        times = [task.scheduledTime];
      } else {
        console.warn(`[expandRecurringTask] No valid times found for task ${task.id}, skipping expansion`);
        return [];
      }
    }
    

    // Expand occurrences within the date range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      if (daysOfWeek.includes(dayOfWeek)) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Only include occurrences for the check date if specified
        if (!forDate || dateStr === checkDateStr) {
          for (const time of times) {
            const occurrenceKey = `${dateStr}_${time}`;
            
            // Skip this occurrence if it's in the skipped list
            const skipped = skippedOccurrences[task.id] || [];
            if (skipped.includes(occurrenceKey)) {
              continue;
            }
            
            occurrences.push({
              ...task,
              id: `${task.id}_${dateStr}_${time}`,
              scheduledDate: dateStr,
              scheduledTime: time,
              isRecurringInstance: true,
              parentTaskId: task.id,
            });
          }
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return occurrences;
  };

  // Expand all tasks once using useMemo (only recalculates when tasks or selectedDate changes)
  const expandedTasks = useMemo(() => {
    const result: any[] = [];
    const seenTaskIds = new Set<string>();
    
    tasks.forEach((task) => {
      if (seenTaskIds.has(task.id)) {
        return;
      }
      seenTaskIds.add(task.id);
      
      if (task.recurring) {
        const occurrences = expandRecurringTask(task, selectedDate);
        result.push(...occurrences);
      } else {
        result.push(task);
      }
    });
    
    return result;
  }, [tasks, selectedDate, skippedOccurrences]);

  const getTasksForTime = (hour: number) => {
    // Filter expanded tasks by hour
    const uniqueTasks = new Map<string, any>();
    expandedTasks.forEach((task) => {
      if (!task.scheduledTime) return;
      const [taskHour] = task.scheduledTime.split(':').map(Number);
      if (taskHour === hour) {
        const key = task.isRecurringInstance ? task.id : `${task.id}_${task.scheduledTime}`;
        if (!uniqueTasks.has(key)) {
          uniqueTasks.set(key, task);
        }
      }
    });

    return Array.from(uniqueTasks.values());
  };

  const selectedPetData = pets.find((p) => p.id === selectedPet);

  // Show loading screen on initial load
  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4559A7" />
          <Text style={styles.loadingText}>Loading task calendar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no pets
  if (pets.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Pets Found</Text>
          <Text style={styles.emptyText}>
            Add a pet to start using the task calendar
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show calendar only if pet is selected
  if (!selectedPet) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="paw-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Select a Pet</Text>
          <Text style={styles.emptyText}>
            Choose a pet to view their task calendar
          </Text>
          <TouchableOpacity
            style={styles.selectPetButton}
            onPress={() => setPetSelectionVisible(true)}
          >
            <Text style={styles.selectPetButtonText}>Select Pet</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Pet Selector */}
      {pets.length > 0 && (
        <View style={styles.petSelector}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petSelectorContent}
          >
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.petChip,
                  selectedPet === pet.id && styles.petChipSelected,
                ]}
              onPress={() => {
                handlePetSelect(pet);
              }}
              >
                <Image
                  source={getSafeImageSource(pet.imageUrl, pet.name, pet.biologicalSex)}
                  style={[
                    styles.petAvatar,
                    selectedPet === pet.id && styles.petAvatarSelected,
                  ]}
                />
                <Text
                  style={[styles.petName, selectedPet === pet.id && styles.petNameSelected]}
                  numberOfLines={1}
                >
                  {pet.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Month Navigation */}
      <View style={styles.monthContainer}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.monthNavButton}>
          <Ionicons name="chevron-back" size={24} color="#4559A7" />
        </TouchableOpacity>
        <View style={styles.monthScroll}>
          <View style={styles.monthLabel}>
            <Text style={styles.monthText}>{formatMonthYear(currentMonth)}</Text>
          </View>
        </View>
        <View style={styles.monthRightButtons}>
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.monthNavButton}>
            <Ionicons name="chevron-forward" size={24} color="#4559A7" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleOpenEditTasks}
            style={styles.editButton}
          >
            <Ionicons name="create-outline" size={22} color="#4559A7" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Selector */}
      <View style={styles.dateContainer}>
        <ScrollView
          ref={dateScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScrollContent}
        >
          {getDaysInMonth(currentMonth).map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

            return (
              <TouchableOpacity
                key={index}
                style={[styles.dateItem, isSelected && styles.dateItemSelected]}
                onPress={() => handleDateChange(date)}
              >
                <Text
                  style={[
                    styles.dateDayName,
                    isSelected && styles.dateDayNameSelected,
                    !isCurrentMonth && styles.dateDayNameInactive,
                  ]}
                >
                  {formatDayName(date)}
                </Text>
                <Text
                  style={[
                    styles.dateNumber,
                    isSelected && styles.dateNumberSelected,
                    !isCurrentMonth && styles.dateNumberInactive,
                  ]}
                >
                  {formatDayNumber(date)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Loading Indicator for Day Change */}
      {loading && tasks.length === 0 && (
        <View style={styles.dayLoadingContainer}>
          <ActivityIndicator size="small" color="#4559A7" />
          <Text style={styles.dayLoadingText}>Loading tasks for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}...</Text>
        </View>
      )}

      {/* Task Calendar View */}
      <ScrollView style={styles.calendarView} showsVerticalScrollIndicator={false}>
        {TIME_SLOTS.map((slot) => {
          const tasksForSlot = getTasksForTime(slot.hour);

          return (
            <View key={slot.hour} style={styles.timeSlot}>
              <View style={styles.timeLabelContainer}>
                <Text style={styles.timeLabel}>{slot.label}</Text>
                <View style={styles.timeLine} />
              </View>
              <View style={styles.taskContainer}>
                {tasksForSlot.map((task) => {
                  const taskTypeColor = getTaskTypeColor(task.taskType);
                  const taskTypeIcon = getTaskTypeIcon(task.taskType);
                  
                  return (
                    <View key={task.id} style={styles.taskItemWrapper}>
                      <TouchableOpacity
                        style={[
                          styles.taskItem,
                          task.completed && styles.taskItemCompleted,
                        ]}
                        onPress={() => handleTaskPress(task)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.taskIconContainer, { backgroundColor: `${taskTypeColor}15` }]}>
                          <Ionicons name={taskTypeIcon as any} size={18} color={taskTypeColor} />
                        </View>
                        <View style={styles.taskContent}>
                          <View style={styles.taskHeader}>
                            <Text
                              style={[
                                styles.taskTitle,
                                task.completed && styles.taskTitleCompleted,
                              ]}
                              numberOfLines={1}
                            >
                              {task.title}
                            </Text>
                            {task.completed && (
                              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                            )}
                          </View>
                          {task.description && (
                            <Text
                              style={[
                                styles.taskDescription,
                                task.completed && styles.taskDescriptionCompleted,
                              ]}
                              numberOfLines={2}
                            >
                              {task.description}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                      <View 
                        style={styles.taskDeleteButtonContainer}
                        pointerEvents="box-none"
                      >
                        <TouchableOpacity
                          style={styles.taskDeleteButton}
                          onPress={() => {
                            console.log('[Delete Button] Pressed for task:', task.id, 'isRecurringInstance:', task.isRecurringInstance);
                            handleDeleteTask(task, true);
                          }}
                          activeOpacity={0.6}
                          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        >
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleOpenAddTask}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Task Detail Modal */}
      <Modal
        visible={taskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTask && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedTask.title}</Text>
                  <TouchableOpacity onPress={() => setTaskModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {selectedTask.description && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabel}>Description</Text>
                      <Text style={styles.modalText}>{selectedTask.description}</Text>
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Time</Text>
                    <Text style={styles.modalText}>
                      {selectedTask.scheduledTime || 'Not set'}
                    </Text>
                  </View>

                  {selectedTask.completed && (
                    <>
                      <View style={styles.modalSection}>
                        <Text style={styles.modalLabel}>Completed At</Text>
                        <Text style={styles.modalText}>
                          {selectedTask.completedAt
                            ? new Date(selectedTask.completedAt).toLocaleString()
                            : 'N/A'}
                        </Text>
                      </View>

                      {selectedTask.completedByName && (
                        <View style={styles.modalSection}>
                          <Text style={styles.modalLabel}>Completed By</Text>
                          <Text style={styles.modalText}>{selectedTask.completedByName}</Text>
                        </View>
                      )}

                      {selectedTask.notes && (
                        <View style={styles.modalSection}>
                          <Text style={styles.modalLabel}>Notes</Text>
                          <Text style={styles.modalText}>{selectedTask.notes}</Text>
                        </View>
                      )}
                    </>
                  )}

                  {!selectedTask.completed && (
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={() => handleCompleteTask(selectedTask)}
                    >
                      <Text style={styles.completeButtonText}>Mark as Complete</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        visible={addTaskModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddTaskModalVisible(false)}
      >
        <SafeAreaView style={styles.addTaskModalContainer} edges={['top']}>
          <View style={styles.addTaskModalHeader}>
            <TouchableOpacity onPress={() => setAddTaskModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#4559A7" />
            </TouchableOpacity>
            <Text style={styles.addTaskModalTitle}>What kind of task?</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.addTaskModalBody} showsVerticalScrollIndicator={false}>
            {/* Task Type Dropdown */}
            <View style={styles.addTaskSection}>
              <Text style={styles.addTaskSectionLabel}>Task Type</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowTaskTypeDropdown(!showTaskTypeDropdown)}
              >
                <Text style={styles.dropdownButtonText}>
                  {TASK_TYPES.find(t => t.value === newTask.taskType)?.label || 'Select task type'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </TouchableOpacity>
              
              {showTaskTypeDropdown && (
                <View style={styles.dropdownList}>
                  {TASK_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.dropdownItem,
                        newTask.taskType === type.value && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setNewTask({ ...newTask, taskType: type.value });
                        setShowTaskTypeDropdown(false);
                        if (type.value !== 'other') {
                          setCustomTaskType(''); // Clear custom text when switching away from "other"
                        }
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        {newTask.taskType === type.value && (
                          <Ionicons name="checkmark" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        )}
                        <Text
                          style={[
                            styles.dropdownItemText,
                            newTask.taskType === type.value && styles.dropdownItemTextSelected,
                          ]}
                        >
                          {type.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {/* Show custom task type input when "other" is selected */}
              {newTask.taskType === 'other' && (
                <View style={styles.customTaskTypeContainer}>
                  <Text style={styles.customTaskTypeLabel}>Enter custom task type:</Text>
                  <TextInput
                    style={styles.customTaskTypeInput}
                    placeholder="e.g., Training, Playtime, etc."
                    value={customTaskType}
                    onChangeText={setCustomTaskType}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}
            </View>

            {/* Day Selection Mode Toggle */}
            <View style={styles.addTaskSection}>
              <Text style={styles.addTaskSectionLabel}>Select days</Text>
              <View style={styles.dayModeToggle}>
                <TouchableOpacity
                  style={[
                    styles.dayModeButton,
                    daySelectionMode === 'weekly' && styles.dayModeButtonActive,
                  ]}
                  onPress={() => {
                    setDaySelectionMode('weekly');
                    setSelectedDays([]); // Clear specific dates when switching to weekly
                  }}
                >
                  <Text
                    style={[
                      styles.dayModeButtonText,
                      daySelectionMode === 'weekly' && styles.dayModeButtonTextActive,
                    ]}
                  >
                    Recurring Weekly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.dayModeButton,
                    daySelectionMode === 'specific' && styles.dayModeButtonActive,
                  ]}
                  onPress={() => {
                    setDaySelectionMode('specific');
                    setSelectedWeekDays([]); // Clear weekly days when switching to specific
                  }}
                >
                  <Text
                    style={[
                      styles.dayModeButtonText,
                      daySelectionMode === 'specific' && styles.dayModeButtonTextActive,
                    ]}
                  >
                    Specific Dates
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Weekly Day Selection */}
              {daySelectionMode === 'weekly' && (
                <View style={styles.weekDayContainer}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, index) => {
                    const isSelected = selectedWeekDays.includes(index);
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.weekDayButton,
                          isSelected && styles.weekDayButtonSelected,
                        ]}
                        onPress={() => toggleWeekDaySelection(index)}
                      >
                        <Text
                          style={[
                            styles.weekDayButtonText,
                            isSelected && styles.weekDayButtonTextSelected,
                          ]}
                        >
                          {dayName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Specific Date Selection */}
              {daySelectionMode === 'specific' && (
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={() => navigateDatePickerMonth('prev')}>
                      <Ionicons name="chevron-back" size={24} color="#4559A7" />
                    </TouchableOpacity>
                    <Text style={styles.datePickerMonthText}>
                      {datePickerMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => navigateDatePickerMonth('next')}>
                      <Ionicons name="chevron-forward" size={24} color="#4559A7" />
                    </TouchableOpacity>
                  </View>

                  {/* Day labels */}
                  <View style={styles.calendarHeader}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
                      <Text key={index} style={styles.calendarHeaderText}>
                        {label}
                      </Text>
                    ))}
                  </View>

                  {/* Calendar grid */}
                  <View style={styles.calendarGrid}>
                    {getDaysInMonthForPicker(datePickerMonth).map((date, index) => {
                      if (!date) {
                        return <View key={index} style={styles.calendarDayEmpty} />;
                      }

                      const dateStr = date.toISOString().split('T')[0];
                      const isSelected = selectedDays.some(d => d.toISOString().split('T')[0] === dateStr);
                      const isToday = dateStr === new Date().toISOString().split('T')[0];
                      const isPast = date < new Date() && !isToday;

                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.calendarDay,
                            isSelected && styles.calendarDaySelected,
                            isToday && !isSelected && styles.calendarDayToday,
                            isPast && styles.calendarDayPast,
                          ]}
                          onPress={() => !isPast && toggleSpecificDate(date)}
                          disabled={isPast}
                        >
                          <Text
                            style={[
                              styles.calendarDayText,
                              isSelected && styles.calendarDayTextSelected,
                              isPast && styles.calendarDayTextPast,
                            ]}
                          >
                            {date.getDate()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* Edit Time Section */}
            <View style={styles.addTaskSection}>
              <Text style={styles.addTaskSectionLabel}>Edit Time</Text>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => setShowTimePicker(!showTimePicker)}
              >
                <Text style={styles.timePickerButtonText}>Tap to Add Time</Text>
              </TouchableOpacity>
              
              {showTimePicker && (
                <View style={styles.timePickerContainer}>
                  <View style={styles.timeInputRow}>
                    <View style={styles.timeInputContainer}>
                      <TextInput
                        style={styles.timeInput}
                        placeholder="09:00"
                        value={tempTime}
                        onChangeText={(text) => {
                          // Format as HH:MM
                          let formatted = text.replace(/[^0-9]/g, '');
                          if (formatted.length > 2) {
                            formatted = formatted.slice(0, 2) + ':' + formatted.slice(2, 4);
                          }
                          setTempTime(formatted);
                        }}
                        keyboardType="numeric"
                        placeholderTextColor="#9CA3AF"
                        maxLength={5}
                      />
                    </View>
                    <View style={styles.timePeriodContainer}>
                      <TouchableOpacity
                        style={[styles.timePeriodButton, tempTimePeriod === 'AM' && styles.timePeriodButtonSelected]}
                        onPress={() => setTempTimePeriod('AM')}
                      >
                        <Text style={[styles.timePeriodText, tempTimePeriod === 'AM' && styles.timePeriodTextSelected]}>
                          AM
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.timePeriodButton, tempTimePeriod === 'PM' && styles.timePeriodButtonSelected]}
                        onPress={() => setTempTimePeriod('PM')}
                      >
                        <Text style={[styles.timePeriodText, tempTimePeriod === 'PM' && styles.timePeriodTextSelected]}>
                          PM
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.addTimeButton} onPress={handleAddTime}>
                    <Text style={styles.addTimeButtonText}>Add Time</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Times Added Section */}
            {taskTimes.length > 0 && (
              <View style={styles.addTaskSection}>
                <Text style={styles.addTaskSectionLabel}>Times Added</Text>
                <View style={styles.timesAddedContainer}>
                  {taskTimes.map((time, index) => (
                    <View key={index} style={styles.timeChip}>
                      <Text style={styles.timeChipText}>{formatTimeForDisplay(time)}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveTime(time)}
                        style={styles.timeChipRemove}
                      >
                        <Ionicons name="close" size={16} color="#4559A7" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Notes Section */}
            <View style={styles.addTaskSection}>
              <Text style={styles.addTaskSectionLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add any notes for this task..."
                value={newTask.description}
                onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                multiline
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveTaskButton} onPress={handleAddTask}>
              <Text style={styles.saveTaskButtonText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Pet Selection Modal */}
      <PetSelectionModal
        visible={petSelectionVisible}
        onClose={() => {
          // Don't allow closing if no pet is selected
          if (selectedPet) {
            setPetSelectionVisible(false);
          }
        }}
        onSelectPet={handlePetSelect}
        pets={pets}
      />

      {/* Edit Tasks List Modal */}
      <Modal
        visible={editTasksModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditTasksModalVisible(false)}
      >
        <SafeAreaView style={styles.editTasksModalContainer} edges={['top']}>
          <View style={styles.editTasksModalHeader}>
            <TouchableOpacity onPress={() => setEditTasksModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#4559A7" />
            </TouchableOpacity>
            <Text style={styles.editTasksModalTitle}>All Tasks</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.editTasksModalBody} showsVerticalScrollIndicator={false}>
            {loadingAllTasks ? (
              <View style={styles.editTasksLoadingContainer}>
                <ActivityIndicator size="large" color="#4559A7" />
                <Text style={styles.editTasksLoadingText}>Loading tasks...</Text>
              </View>
            ) : (() => {
              const nonRecurringTasks = allTasks.filter(t => !t.completed && !t.recurring);
              const recurringTasks = allTasks.filter(t => !t.completed && t.recurring);
              const recurringGroups = new Map<string, any[]>();
              recurringTasks.forEach(task => {
                const key = `${task.taskType}_${task.recurrenceDaysOfWeek}_${task.recurrenceEndDate || 'no-end'}`;
                if (!recurringGroups.has(key)) {
                  recurringGroups.set(key, []);
                }
                recurringGroups.get(key)!.push(task);
              });
              const combinedRecurringCount = recurringGroups.size;
              return nonRecurringTasks.length + combinedRecurringCount;
            })() === 0 ? (
              <View style={styles.editTasksEmptyContainer}>
                <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
                <Text style={styles.editTasksEmptyTitle}>No tasks found</Text>
                <Text style={styles.editTasksEmptyText}>
                  Create tasks to see them here
                </Text>
              </View>
            ) : (
              (() => {
                // Group recurring tasks by pattern (same type, days, end date) to show as one entry
                const nonRecurringTasks = allTasks.filter(t => !t.completed && !t.recurring);
                const recurringTasks = allTasks.filter(t => !t.completed && t.recurring);
                
                // Group recurring tasks by taskType + recurrenceDaysOfWeek + recurrenceEndDate
                const recurringGroups = new Map<string, any[]>();
                recurringTasks.forEach(task => {
                  const key = `${task.taskType}_${task.recurrenceDaysOfWeek}_${task.recurrenceEndDate || 'no-end'}`;
                  if (!recurringGroups.has(key)) {
                    recurringGroups.set(key, []);
                  }
                  recurringGroups.get(key)!.push(task);
                });
                
                // Create combined recurring tasks (merge times from grouped tasks)
                const combinedRecurringTasks: any[] = [];
                recurringGroups.forEach((group) => {
                  if (group.length > 0) {
                    const firstTask = group[0];
                    // Combine all times from tasks in this group
                    const allTimes: string[] = [];
                    group.forEach(t => {
                      if (t.recurrenceTimes) {
                        try {
                          const times = typeof t.recurrenceTimes === 'string' 
                            ? JSON.parse(t.recurrenceTimes) 
                            : t.recurrenceTimes;
                          times.forEach((time: string) => {
                            if (!allTimes.includes(time)) {
                              allTimes.push(time);
                            }
                          });
                        } catch (error) {
                          // Fallback to scheduledTime
                          if (!allTimes.includes(t.scheduledTime)) {
                            allTimes.push(t.scheduledTime);
                          }
                        }
                      } else if (!allTimes.includes(firstTask.scheduledTime)) {
                        allTimes.push(firstTask.scheduledTime);
                      }
                    });
                    
                    // Create a combined task representation
                    combinedRecurringTasks.push({
                      ...firstTask,
                      recurrenceTimes: allTimes.sort(),
                      _combinedFrom: group.map(t => t.id), // Track original IDs for deletion
                    });
                  }
                });
                
                // Combine non-recurring and grouped recurring tasks
                return [...nonRecurringTasks, ...combinedRecurringTasks];
              })().map((task) => {
                const taskDate = new Date(task.scheduledDate);
                const taskTypeLabel = TASK_TYPES.find(t => t.value === task.taskType)?.label || task.taskType;
                const taskTypeColor = getTaskTypeColor(task.taskType);
                const taskTypeIcon = getTaskTypeIcon(task.taskType);
                
                // Get all dates for recurring tasks
                let allOccurrences: string[] = [];
                if (task.recurring && task.recurrencePattern === 'weekly') {
                  const startDate = new Date(task.scheduledDate);
                  startDate.setHours(0, 0, 0, 0);
                  
                  let endDate: Date;
                  if (task.recurrenceEndDate) {
                    endDate = new Date(task.recurrenceEndDate);
                    endDate.setHours(23, 59, 59, 999);
                  } else {
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + (12 * 7));
                  }

                  let daysOfWeek: number[] = [];
                  try {
                    if (task.recurrenceDaysOfWeek) {
                      daysOfWeek = typeof task.recurrenceDaysOfWeek === 'string' 
                        ? JSON.parse(task.recurrenceDaysOfWeek) 
                        : task.recurrenceDaysOfWeek;
                    }
                  } catch (error) {
                    console.error('Error parsing recurrence days:', error);
                  }

                  const currentDate = new Date(startDate);
                  while (currentDate <= endDate && allOccurrences.length < 10) {
                    const dayOfWeek = currentDate.getDay();
                    if (daysOfWeek.includes(dayOfWeek)) {
                      allOccurrences.push(currentDate.toISOString().split('T')[0]);
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                  }
                  
                  // Get total count for display
                  const totalCount = allOccurrences.length;
                  if (currentDate <= endDate) {
                    // Count remaining
                    let remaining = 0;
                    while (currentDate <= endDate) {
                      const dayOfWeek = currentDate.getDay();
                      if (daysOfWeek.includes(dayOfWeek)) {
                        remaining++;
                      }
                      currentDate.setDate(currentDate.getDate() + 1);
                    }
                    allOccurrences.push(`...and ${remaining} more` as any);
                  }
                }
                
                return (
                  <View key={task.id} style={styles.editTaskItem}>
                    <TouchableOpacity
                      style={styles.editTaskItemTouchable}
                      onPress={() => handleEditTask(task)}
                    >
                      <View style={[styles.editTaskItemIconContainer, { backgroundColor: `${taskTypeColor}15` }]}>
                        <Ionicons name={taskTypeIcon as any} size={24} color={taskTypeColor} />
                      </View>
                      <View style={styles.editTaskItemContent}>
                        <View style={styles.editTaskItemHeader}>
                          <Text style={styles.editTaskItemTitle} numberOfLines={1}>
                            {task.title}
                          </Text>
                          {task.recurring && (
                            <View style={styles.recurringBadge}>
                              <Ionicons name="repeat-outline" size={14} color="#4559A7" />
                              <Text style={styles.recurringBadgeText}>Recurring</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.editTaskItemType, { color: taskTypeColor }]}>{taskTypeLabel}</Text>
                        {task.recurring && allOccurrences.length > 0 ? (
                          <View style={styles.recurringDatesContainer}>
                            {allOccurrences.map((dateStr, idx) => {
                              if (typeof dateStr === 'string' && dateStr.startsWith('...and')) {
                                return (
                                  <Text key={idx} style={[styles.recurringDateItem, { fontWeight: '500' }]}>
                                    {dateStr}
                                  </Text>
                                );
                              }
                              const date = new Date(dateStr);
                              return (
                                <Text key={idx} style={styles.recurringDateItem}>
                                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  {idx < allOccurrences.length - 1 && !allOccurrences[idx + 1]?.startsWith('...') && ', '}
                                </Text>
                              );
                            })}
                          </View>
                        ) : (
                          <View style={styles.editTaskItemDetails}>
                            <Text style={styles.editTaskItemDate}>
                              {taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                            <Text style={styles.editTaskItemTime}>
                              {task.recurring && task.recurrenceTimes 
                                ? (typeof task.recurrenceTimes === 'string' 
                                  ? JSON.parse(task.recurrenceTimes).join(', ')
                                  : task.recurrenceTimes.join(', '))
                                : task.scheduledTime}
                            </Text>
                          </View>
                        )}
                        {task.description && (
                          <Text style={styles.editTaskItemDescription} numberOfLines={2}>
                            {task.description}
                          </Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteTaskButton}
                      onPress={() => handleDeleteTask(task, false)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        visible={editTaskModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setEditTaskModalVisible(false);
          setTaskToEdit(null);
        }}
      >
        <SafeAreaView style={styles.editTaskModalContainer} edges={['top']}>
          <View style={styles.editTaskModalHeader}>
            <TouchableOpacity
              onPress={() => {
                setEditTaskModalVisible(false);
                setTaskToEdit(null);
                setEditTasksModalVisible(true);
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#4559A7" />
            </TouchableOpacity>
            <Text style={styles.editTaskModalTitle}>Edit Task</Text>
            <View style={{ width: 24 }} />
          </View>

          {taskToEdit && (
            <ScrollView style={styles.editTaskModalBody} showsVerticalScrollIndicator={false}>
              {/* Task Type */}
              <View style={styles.editTaskSection}>
                <Text style={styles.editTaskSectionLabel}>Task Type</Text>
                <View style={styles.taskTypeContainer}>
                  {TASK_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.taskTypeButton,
                        taskToEdit.taskType === type.value && styles.taskTypeButtonSelected,
                      ]}
                      onPress={() => setTaskToEdit({ ...taskToEdit, taskType: type.value })}
                    >
                      <Text
                        style={[
                          styles.taskTypeButtonText,
                          taskToEdit.taskType === type.value && styles.taskTypeButtonTextSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Title */}
              <View style={styles.editTaskSection}>
                <Text style={styles.editTaskSectionLabel}>Title</Text>
                <TextInput
                  style={styles.editTaskInput}
                  value={taskToEdit.title}
                  onChangeText={(text) => setTaskToEdit({ ...taskToEdit, title: text })}
                  placeholder="Enter task title"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Description */}
              <View style={styles.editTaskSection}>
                <Text style={styles.editTaskSectionLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.editTaskInput, styles.editTaskTextArea]}
                  value={taskToEdit.description || ''}
                  onChangeText={(text) => setTaskToEdit({ ...taskToEdit, description: text })}
                  placeholder="Enter task description"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Date */}
              <View style={styles.editTaskSection}>
                <Text style={styles.editTaskSectionLabel}>Date</Text>
                <TextInput
                  style={styles.editTaskInput}
                  value={new Date(taskToEdit.scheduledDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit' 
                  })}
                  editable={false}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Time */}
              <View style={styles.editTaskSection}>
                <Text style={styles.editTaskSectionLabel}>Time</Text>
                <TextInput
                  style={styles.editTaskInput}
                  value={taskToEdit.scheduledTime}
                  onChangeText={(text) => setTaskToEdit({ ...taskToEdit, scheduledTime: text })}
                  placeholder="09:00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>

              {/* Notes */}
              <View style={styles.editTaskSection}>
                <Text style={styles.editTaskSectionLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.editTaskInput, styles.editTaskTextArea]}
                  value={taskToEdit.notes || ''}
                  onChangeText={(text) => setTaskToEdit({ ...taskToEdit, notes: text })}
                  placeholder="Add any additional notes"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveTaskButton} onPress={handleSaveTask}>
                <Text style={styles.saveTaskButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  petSelector: {
    backgroundColor: '#4559A7',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  petSelectorContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  petChip: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  petChipSelected: {},
  petAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E3A8A',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petAvatarSelected: {
    borderColor: '#FFFFFF',
  },
  petName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    maxWidth: 60,
  },
  petNameSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  monthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  monthNavButton: {
    padding: 8,
  },
  monthRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginLeft: 4,
  },
  monthScroll: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  dateContainer: {
    backgroundColor: '#E8F4FD',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 50,
  },
  dateItemSelected: {
    backgroundColor: '#4559A7',
  },
  dateDayName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  dateDayNameSelected: {
    color: '#FFFFFF',
  },
  dateDayNameInactive: {
    color: '#D1D5DB',
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dateNumberSelected: {
    color: '#FFFFFF',
  },
  dateNumberInactive: {
    color: '#D1D5DB',
  },
  calendarView: {
    flex: 1,
  },
  timeSlot: {
    flexDirection: 'row',
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timeLabelContainer: {
    width: 70,
    paddingTop: 8,
    paddingRight: 12,
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  timeLine: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginTop: 4,
    marginRight: 8,
  },
  taskContainer: {
    flex: 1,
    paddingTop: 8,
    paddingRight: 16,
  },
  taskItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  taskItem: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#4559A7',
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskItemCompleted: {
    backgroundColor: '#ECFDF5',
    borderLeftColor: '#10B981',
    opacity: 0.8,
  },
  taskIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  taskDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  taskDescriptionCompleted: {
    color: '#9CA3AF',
  },
  taskDeleteButtonContainer: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskDeleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4559A7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  completeButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#4559A7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  selectPetButton: {
    backgroundColor: '#4559A7',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  selectPetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dayLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dayLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  // Add Task Modal Styles
  addTaskModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  addTaskModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  addTaskModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  addTaskModalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addTaskSection: {
    marginTop: 24,
  },
  addTaskSectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  // Dropdown Styles
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    minHeight: 56,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#10B981',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Custom Task Type Styles
  customTaskTypeContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  customTaskTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  customTaskTypeInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  // Day Selection Mode Toggle Styles
  dayModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  dayModeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayModeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dayModeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  dayModeButtonTextActive: {
    color: '#4559A7',
    fontWeight: '600',
  },
  // Weekly Day Selection Styles
  weekDayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  weekDayButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    minHeight: 56,
  },
  weekDayButtonSelected: {
    backgroundColor: '#4559A7',
    borderColor: '#4559A7',
  },
  weekDayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  weekDayButtonTextSelected: {
    color: '#FFFFFF',
  },
  // Date Picker Styles
  datePickerContainer: {
    marginTop: 8,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  datePickerMonthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  calendarHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 4,
  },
  calendarDayEmpty: {
    width: '14.28%',
    aspectRatio: 1,
    marginVertical: 4,
  },
  calendarDaySelected: {
    backgroundColor: '#4559A7',
  },
  calendarDayToday: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#4559A7',
  },
  calendarDayPast: {
    opacity: 0.4,
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarDayTextPast: {
    color: '#9CA3AF',
  },
  // Time Picker Styles
  timePickerButton: {
    backgroundColor: '#DCEBF5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  timePickerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4559A7',
  },
  timePickerContainer: {
    marginTop: 12,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeInputContainer: {
    flex: 1,
    marginRight: 12,
  },
  timeInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  timePeriodContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  timePeriodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  timePeriodButtonSelected: {
    backgroundColor: '#4559A7',
  },
  timePeriodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  timePeriodTextSelected: {
    color: '#FFFFFF',
  },
  addTimeButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTimeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Times Added Styles
  timesAddedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCEBF5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4559A7',
  },
  timeChipRemove: {
    padding: 4,
  },
  // Notes Input Styles
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  // Save Button Styles
  saveTaskButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 40,
    minHeight: 56,
  },
  saveTaskButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Edit Tasks List Modal Styles
  editTasksModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  editTasksModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  editTasksModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  editTasksModalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  editTasksLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  editTasksLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  editTasksEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  editTasksEmptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  editTasksEmptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  editTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginTop: 12,
  },
  editTaskItemTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editTaskItemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  editTaskItemContent: {
    flex: 1,
    marginRight: 12,
  },
  deleteTaskButton: {
    padding: 8,
    marginLeft: 8,
  },
  editTaskItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  editTaskItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  editTaskItemType: {
    fontSize: 14,
    color: '#4559A7',
    fontWeight: '500',
    marginBottom: 8,
  },
  editTaskItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  editTaskItemDate: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 12,
  },
  editTaskItemTime: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  editTaskItemDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  recurringBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4559A7',
    marginLeft: 4,
  },
  recurringDatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  recurringDatesLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  recurringDateItem: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Edit Task Modal Styles
  editTaskModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  editTaskModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  editTaskModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  editTaskModalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  editTaskSection: {
    marginTop: 24,
  },
  editTaskSectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  editTaskInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  editTaskTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  taskTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taskTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    marginBottom: 8,
  },
  taskTypeButtonSelected: {
    backgroundColor: '#4559A7',
    borderColor: '#4559A7',
  },
  taskTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  taskTypeButtonTextSelected: {
    color: '#FFFFFF',
  },
});

