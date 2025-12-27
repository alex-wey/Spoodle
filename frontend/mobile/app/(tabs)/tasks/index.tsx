import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, PawPrint, Plus } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePetStore } from '../../store/pets';
import { useUser } from '@clerk/clerk-expo';
import { clerkApiClient } from '../../lib/api';
import PetSelectionModal from '../pets/components/PetSelectionModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PetSelector } from './components/PetSelector';
import { MonthNavigation } from './components/MonthNavigation';
import { DateSelector } from './components/DateSelector';
import { TaskCalendar } from './components/TaskCalendar';
import { TaskDetailModal } from './components/TaskDetailModal';
import { EditTasksModal } from './components/EditTasksModal';
import { TaskFormModal } from './components/TaskFormModal';

export default function TaskCalendarScreen() {
  const { pets, selectedPetId, selectPet, fetchPets } = usePetStore();
  const { user } = useUser();
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
  const [skippedOccurrences, setSkippedOccurrences] = useState<Record<string, string[]>>({});
  const [hasSelectedPet, setHasSelectedPet] = useState(false);

  const hasManuallySelectedDate = useRef(false);
  const isInitialLoad = useRef(true);

  // Fetch pets on mount
  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  // Check if pet should be selected on mount
  useEffect(() => {
    if (pets.length > 0 && !hasSelectedPet) {
      if (selectedPetId && pets.find(p => p.id === selectedPetId)) {
        setSelectedPet(selectedPetId);
        setHasSelectedPet(true);
        setInitialLoading(false);
      } else {
        setPetSelectionVisible(true);
        setInitialLoading(false);
      }
    } else if (pets.length === 0) {
      setInitialLoading(false);
    }
  }, [pets, selectedPetId, hasSelectedPet]);

  // Reset to today's date only on initial load when calendar tab is focused
  useFocusEffect(
    useCallback(() => {
      if (isInitialLoad.current) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setSelectedDate(today);
        setCurrentMonth(today);
        hasManuallySelectedDate.current = false;
        isInitialLoad.current = false;
      }
    }, [])
  );

  // Fetch tasks for selected date and pet - clear tasks when date/pet changes
  useEffect(() => {
    if (selectedPet) {
      setTasks([]);
      fetchTasks();
    }
  }, [selectedPet, selectedDate]);

  const fetchTasks = async () => {
    if (!selectedPet) return;
    setLoading(true);
    try {
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

  const handleSaveTask = async (taskData: {
    taskType: string;
    title: string;
    description?: string;
    daySelectionMode: 'weekly' | 'specific';
    selectedWeekDays: number[];
    selectedDays: Date[];
    taskTimes: string[];
    customTaskType?: string;
  }) => {
    if (!taskToEdit || !selectedPet) {
      Alert.alert('Error', 'Please select a pet');
      return;
    }

    try {
      // Delete the old task(s) first - handle recurring tasks
      if (taskToEdit._combinedFrom && taskToEdit._combinedFrom.length > 1) {
        // Delete all related recurring tasks
        const deletePromises = taskToEdit._combinedFrom.map((id: string) => 
          clerkApiClient.deleteTask(id)
        );
        await Promise.all(deletePromises);
      } else if (taskToEdit.isRecurringInstance && taskToEdit.parentTaskId) {
        // Delete the parent recurring task
        await clerkApiClient.deleteTask(taskToEdit.parentTaskId);
      } else {
        // Delete single task
        await clerkApiClient.deleteTask(taskToEdit.id);
      }

      // Create new task(s) using the same logic as handleAddTask
      const promises = [];
      
      if (taskData.daySelectionMode === 'weekly') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + (12 * 7));
        
        let firstDate: Date | null = null;
        for (const dayOfWeek of taskData.selectedWeekDays) {
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
        
        promises.push(
          clerkApiClient.createTask({
            petId: selectedPet,
            taskType: taskData.taskType,
            title: taskData.title,
            description: taskData.description || undefined,
            scheduledDate: firstDate,
            scheduledTime: taskData.taskTimes[0] || '09:00',
            notes: taskData.description || undefined,
            recurring: true,
            recurrencePattern: 'weekly',
            recurrenceDaysOfWeek: taskData.selectedWeekDays,
            recurrenceEndDate: endDate,
            recurrenceTimes: taskData.taskTimes,
          }).catch((err) => {
            console.error(`Error creating recurring task:`, err);
            throw err;
          })
        );
      } else {
        for (const day of taskData.selectedDays) {
          const date = new Date(day);
          date.setHours(0, 0, 0, 0);
          
          for (const time of taskData.taskTimes) {
            promises.push(
              clerkApiClient.createTask({
                petId: selectedPet,
                taskType: taskData.taskType,
                title: taskData.title,
                description: taskData.description || undefined,
                scheduledDate: date,
                scheduledTime: time,
                notes: taskData.description || undefined,
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
            ? `Updated ${successful} task(s). ${failed} task(s) failed.`
            : `Successfully updated ${successful} task(s)!`
        );
        setEditTaskModalVisible(false);
        setTaskToEdit(null);
        fetchTasks();
        fetchAllTasks();
      } else {
        Alert.alert('Error', `Failed to update all ${promises.length} task(s). Please check the console for details.`);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (task: any, fromCalendar: boolean = false) => {
    let parentTaskId: string | null = null;
    let occurrenceDate: string | null = null;
    let occurrenceTime: string | null = null;
    
    if (task.isRecurringInstance) {
      if (task.parentTaskId) {
        parentTaskId = task.parentTaskId;
      } else if (task.id.includes('_')) {
        const parts = task.id.split('_');
        parentTaskId = parts[0];
        occurrenceDate = parts[1];
        occurrenceTime = parts[2];
      }
    }
    
    console.log(`[handleDeleteTask] Task: ${task.id}, isRecurringInstance: ${task.isRecurringInstance}, parentTaskId: ${parentTaskId}`);
    
    if (task.isRecurringInstance && parentTaskId) {
      if (Platform.OS === 'web') {
        const choice = window.prompt(
          `Delete Recurring Task: "${task.title}"\n\n` +
          `Choose an option:\n` +
          `1 - Delete only this occurrence (${occurrenceDate} at ${occurrenceTime})\n` +
          `2 - Delete all occurrences (entire recurring pattern)\n` +
          `Cancel - Don't delete anything\n\n` +
          `Enter 1, 2, or Cancel:`
        );
        
        if (!choice || choice.toLowerCase() === 'cancel') {
          return;
        }
        
        if (choice === '1') {
          await handleDeleteOccurrenceOnly(task, parentTaskId, occurrenceDate, occurrenceTime, fromCalendar);
        } else if (choice === '2') {
          await handleDeleteAllOccurrences(parentTaskId, task.title, fromCalendar);
        }
      } else {
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
  
  const handleDeleteOccurrenceOnly = async (
    task: any,
    parentTaskId: string,
    occurrenceDate: string | null,
    occurrenceTime: string | null,
    fromCalendar: boolean
  ) => {
    try {
      const skippedKey = `skipped_occurrences_${parentTaskId}`;
      const skippedData = await AsyncStorage.getItem(skippedKey);
      const skippedList: string[] = skippedData ? JSON.parse(skippedData) : [];
      
      const occurrenceKey = occurrenceDate && occurrenceTime 
        ? `${occurrenceDate}_${occurrenceTime}`
        : task.id.split('_').slice(1).join('_');
      
      if (!skippedList.includes(occurrenceKey)) {
        skippedList.push(occurrenceKey);
        await AsyncStorage.setItem(skippedKey, JSON.stringify(skippedList));
        
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
    setTasks([]);
    setSelectedDate(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
    if (newMonth.getMonth() !== selectedDate.getMonth()) {
      const firstDay = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1);
      handleDateChange(firstDay);
    }
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
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (12 * 7));
    }

    const checkDate = forDate || selectedDate;
    const checkDateStr = checkDate.toISOString().split('T')[0];

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
        
        times = Array.isArray(parsedTimes) 
          ? parsedTimes.filter(t => {
              if (!t || typeof t !== 'string') return false;
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

    if (times.length === 0) {
      if (task.scheduledTime && typeof task.scheduledTime === 'string' && task.scheduledTime.includes(':')) {
        times = [task.scheduledTime];
    } else {
        console.warn(`[expandRecurringTask] No valid times found for task ${task.id}, skipping expansion`);
        return [];
      }
    }

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      if (daysOfWeek.includes(dayOfWeek)) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        if (!forDate || dateStr === checkDateStr) {
          for (const time of times) {
            const occurrenceKey = `${dateStr}_${time}`;
            
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

  const handleAddTask = async (taskData: {
    taskType: string;
    title: string;
    description?: string;
    daySelectionMode: 'weekly' | 'specific';
    selectedWeekDays: number[];
    selectedDays: Date[];
    taskTimes: string[];
    customTaskType?: string;
  }) => {
    if (!selectedPet) {
      Alert.alert('Error', 'Please select a pet');
      return;
    }

    try {
      const promises = [];
      
      if (taskData.daySelectionMode === 'weekly') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + (12 * 7));
        
        let firstDate: Date | null = null;
        for (const dayOfWeek of taskData.selectedWeekDays) {
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
        
        promises.push(
          clerkApiClient.createTask({
            petId: selectedPet,
            taskType: taskData.taskType,
            title: taskData.title,
            description: taskData.description || undefined,
            scheduledDate: firstDate,
            scheduledTime: taskData.taskTimes[0] || '09:00',
            notes: taskData.description || undefined,
            recurring: true,
            recurrencePattern: 'weekly',
            recurrenceDaysOfWeek: taskData.selectedWeekDays,
            recurrenceEndDate: endDate,
            recurrenceTimes: taskData.taskTimes,
          }).catch((err) => {
            console.error(`Error creating recurring task:`, err);
            throw err;
          })
        );
      } else {
        for (const day of taskData.selectedDays) {
          const date = new Date(day);
          date.setHours(0, 0, 0, 0);
          
          for (const time of taskData.taskTimes) {
            promises.push(
              clerkApiClient.createTask({
                petId: selectedPet,
                taskType: taskData.taskType,
                title: taskData.title,
                description: taskData.description || undefined,
                scheduledDate: date,
                scheduledTime: time,
                notes: taskData.description || undefined,
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
    setAddTaskModalVisible(true);
  };

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
          <Calendar size={64} color="#9CA3AF" />
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
          <PawPrint size={64} color="#9CA3AF" />
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
      <PetSelector
        pets={pets}
        selectedPet={selectedPet}
        onSelectPet={handlePetSelect}
      />

      <MonthNavigation
        currentMonth={currentMonth}
        onNavigateMonth={navigateMonth}
        onOpenEditTasks={handleOpenEditTasks}
      />

      <DateSelector
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      {loading && tasks.length === 0 && (
        <View style={styles.dayLoadingContainer}>
          <ActivityIndicator size="small" color="#4559A7" />
          <Text style={styles.dayLoadingText}>Loading tasks for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}...</Text>
        </View>
      )}

      <TaskCalendar
        tasks={expandedTasks}
        onTaskPress={handleTaskPress}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleOpenAddTask}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <TaskDetailModal
        visible={taskModalVisible}
        task={selectedTask}
        onClose={() => setTaskModalVisible(false)}
        onComplete={() => handleCompleteTask(selectedTask!)}
        onDelete={() => {
          if (selectedTask) {
            handleDeleteTask(selectedTask, true);
          }
        }}
      />

      <TaskFormModal
        visible={addTaskModalVisible}
        title="What kind of task?"
        onClose={() => setAddTaskModalVisible(false)}
        onSave={handleAddTask}
        saveButtonText="Save"
      />

      <PetSelectionModal
        visible={petSelectionVisible}
        onClose={() => {
          if (selectedPet) {
            setPetSelectionVisible(false);
          }
        }}
        onSelectPet={handlePetSelect}
        pets={pets}
      />

      <EditTasksModal
        visible={editTasksModalVisible}
        loading={loadingAllTasks}
        tasks={allTasks}
        onClose={() => setEditTasksModalVisible(false)}
        onEditTask={handleEditTask}
      />

      <TaskFormModal
        visible={editTaskModalVisible}
        title="Edit Task"
        initialTask={taskToEdit}
        onClose={() => {
          setEditTaskModalVisible(false);
          setTaskToEdit(null);
        }}
        onBack={() => {
          setEditTaskModalVisible(false);
          setTaskToEdit(null);
          setEditTasksModalVisible(true);
        }}
        onSave={handleSaveTask}
        onDelete={() => {
          if (taskToEdit) {
            handleDeleteTask(taskToEdit, false);
          }
        }}
        showDeleteButton={true}
        saveButtonText="Save Changes"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
});
