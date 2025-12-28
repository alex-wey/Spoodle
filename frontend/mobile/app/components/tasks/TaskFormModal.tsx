import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Trash2, Save } from 'lucide-react-native';
import { getTaskTypeLabel } from './constants';
import { TaskTypeDropdown } from './TaskTypeDropdown';
import { formatTimeForDisplay, convertTo24Hour, getDaysInMonthForPicker } from './utils';

export interface TaskFormData {
  taskType: string;
  title: string;
  description?: string;
  daySelectionMode: 'weekly' | 'specific';
  selectedWeekDays: number[];
  selectedDays: Date[];
  taskTimes: string[];
  customTaskType?: string;
}

interface TaskFormModalProps {
  visible: boolean;
  title: string;
  initialTask?: any | null;
  onClose: () => void;
  onBack?: () => void;
  onSave: (taskData: TaskFormData) => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  saveButtonText?: string;
}

export function TaskFormModal({
  visible,
  title,
  initialTask,
  onClose,
  onBack,
  onSave,
  onDelete,
  showDeleteButton = false,
  saveButtonText = 'Save',
}: TaskFormModalProps) {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    scheduledTime: '09:00',
    taskType: 'medicine',
  });
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);
  const [taskTimes, setTaskTimes] = useState<string[]>([]);
  const [tempTime, setTempTime] = useState('09:00');
  const [tempTimePeriod, setTempTimePeriod] = useState<'AM' | 'PM'>('AM');
  const [daySelectionMode, setDaySelectionMode] = useState<'weekly' | 'specific'>('weekly');
  const [datePickerMonth, setDatePickerMonth] = useState(new Date());
  const [customTaskType, setCustomTaskType] = useState('');

  // Initialize form from task data if editing
  useEffect(() => {
    if (initialTask) {
      // Determine task type and custom type
      const taskType = initialTask.taskType || 'medicine';
      let customType = '';
      if (taskType === 'other' && initialTask.title) {
        // Check if title matches a standard task type label
        const standardLabel = getTaskTypeLabel(taskType);
        if (initialTask.title !== standardLabel) {
          customType = initialTask.title;
        }
      }

      setNewTask({
        title: initialTask.title || '',
        description: initialTask.description || initialTask.notes || '',
        scheduledTime: initialTask.scheduledTime || '09:00',
        taskType: taskType,
      });
      setCustomTaskType(customType);

      // Determine day selection mode and populate data
      if (initialTask.recurring && initialTask.recurrencePattern === 'weekly' && initialTask.recurrenceDaysOfWeek) {
        setDaySelectionMode('weekly');
        setSelectedWeekDays(initialTask.recurrenceDaysOfWeek || []);
        setSelectedDays([]);
      } else if (initialTask.scheduledDate) {
        setDaySelectionMode('specific');
        const taskDate = new Date(initialTask.scheduledDate);
        setSelectedDays([taskDate]);
        setSelectedWeekDays([]);
        // Set date picker to show the task's month
        setDatePickerMonth(new Date(taskDate.getFullYear(), taskDate.getMonth(), 1));
      } else {
        setDaySelectionMode('weekly');
        setSelectedWeekDays([]);
        setSelectedDays([]);
      }

      // Set task times
      if (initialTask.recurrenceTimes && initialTask.recurrenceTimes.length > 0) {
        setTaskTimes(initialTask.recurrenceTimes);
      } else if (initialTask.scheduledTime) {
        setTaskTimes([initialTask.scheduledTime]);
      } else {
        setTaskTimes([]);
      }
    } else {
      // Reset form for new task
      resetForm();
    }
  }, [initialTask, visible]);

  const resetForm = () => {
    setNewTask({ title: '', description: '', scheduledTime: '09:00', taskType: 'medicine' });
    setCustomTaskType('');
    setSelectedDays([]);
    setSelectedWeekDays([]);
    setTaskTimes([]);
    setTempTime('09:00');
    setTempTimePeriod('AM');
    setDaySelectionMode('weekly');
    setDatePickerMonth(new Date());
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleWeekDaySelection = (dayOfWeek: number) => {
    if (selectedWeekDays.includes(dayOfWeek)) {
      setSelectedWeekDays(selectedWeekDays.filter(d => d !== dayOfWeek));
    } else {
      setSelectedWeekDays([...selectedWeekDays, dayOfWeek].sort());
    }
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

  const handleAddTime = () => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]|)$/;
    if (!tempTime || !timeRegex.test(tempTime)) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format (12-hour), e.g., 09:00 or 06:30');
      return;
    }

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

    const time24 = convertTo24Hour(tempTime, tempTimePeriod);

    if (!taskTimes.includes(time24)) {
      const sortedTimes = [...taskTimes, time24].sort((a, b) => {
        const [aHours, aMinutes] = a.split(':').map(Number);
        const [bHours, bMinutes] = b.split(':').map(Number);
        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
      });
      setTaskTimes(sortedTimes);
      setTempTime('09:00');
      setTempTimePeriod('AM');
    } else {
      Alert.alert('Duplicate Time', 'This time has already been added');
    }
  };

  const handleRemoveTime = (time: string) => {
    setTaskTimes(taskTimes.filter(t => t !== time));
  };

  const handleSave = () => {
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

    if (newTask.taskType === 'other' && !customTaskType.trim()) {
      Alert.alert('Error', 'Please enter a custom task type');
      return;
    }

    const taskTitle = newTask.taskType === 'other' && customTaskType.trim()
      ? customTaskType.trim()
      : getTaskTypeLabel(newTask.taskType);

    onSave({
      taskType: newTask.taskType,
      title: taskTitle,
      description: newTask.description || undefined,
      daySelectionMode,
      selectedWeekDays,
      selectedDays,
      taskTimes,
      customTaskType: customTaskType.trim() || undefined,
    });

    resetForm();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer} edges={['top']}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onBack || handleClose}>
            <ArrowLeft size={24} color="#4559A7" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollViewContent}
          >
          {/* Task Type Dropdown */}
          <View style={styles.section}>
            <TaskTypeDropdown
              selectedValue={newTask.taskType}
              onSelect={(value) => {
                setNewTask({ ...newTask, taskType: value });
                if (value !== 'other') {
                  setCustomTaskType('');
                }
              }}
            />
            
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
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Dates</Text>
            <View style={styles.dayModeToggle}>
              <TouchableOpacity
                style={[
                  styles.dayModeButton,
                  daySelectionMode === 'weekly' && styles.dayModeButtonActive,
                ]}
                onPress={() => {
                  setDaySelectionMode('weekly');
                  setSelectedDays([]);
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
                  setSelectedWeekDays([]);
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
                        numberOfLines={1}
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
                    <ChevronLeft size={24} color="#4559A7" />
                  </TouchableOpacity>
                  <Text style={styles.datePickerMonthText}>
                    {datePickerMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  <TouchableOpacity onPress={() => navigateDatePickerMonth('next')}>
                    <ChevronRight size={24} color="#4559A7" />
                  </TouchableOpacity>
                </View>

                <View style={styles.calendarHeader}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
                    <Text key={index} style={styles.calendarHeaderText}>
                      {label}
                    </Text>
                  ))}
                </View>

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

          {/* Select Time Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Time</Text>
            <View style={styles.timePickerContainer}>
              <View style={styles.timeInputRow}>
                <View style={styles.timeInputContainer}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="09:00"
                    value={tempTime}
                    onChangeText={(text) => {
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
          </View>

          {/* Times Added Section */}
          {taskTimes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Times Added</Text>
              <View style={styles.timesAddedContainer}>
                {taskTimes.map((time, index) => (
                  <View key={index} style={styles.timeChip}>
                    <Text style={styles.timeChipText}>{formatTimeForDisplay(time)}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveTime(time)}
                      style={styles.timeChipRemove}
                    >
                      <X size={16} color="#4559A7" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Notes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Notes (optional)</Text>
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
          <TouchableOpacity
            style={[
              styles.saveTaskButton,
              !showDeleteButton && styles.saveTaskButtonWithPadding,
            ]}
            onPress={handleSave}
          >
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveTaskButtonText}>{saveButtonText}</Text>
          </TouchableOpacity>

          {/* Delete Button */}
          {showDeleteButton && onDelete && (
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Trash2 size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Delete Task</Text>
            </TouchableOpacity>
          )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
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
    paddingHorizontal: 2,
    marginHorizontal: 2,
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
    textAlign: 'center',
  },
  weekDayButtonTextSelected: {
    color: '#FFFFFF',
  },
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
    paddingTop: 8,
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
    backgroundColor: '#4559A7',
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
  saveTaskButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    flexDirection: 'row',
    gap: 8,
    minHeight: 56,
  },
  saveTaskButtonWithPadding: {
    marginBottom: 40,
  },
  saveTaskButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 40,
    flexDirection: 'row',
    gap: 8,
    minHeight: 56,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

