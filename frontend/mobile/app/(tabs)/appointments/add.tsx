import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { ArrowLeft, Plus, Clock, Calendar, FileText } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { usePetStore } from '../../store/pets';
import { useAuthStore } from '../../store/auth';
import { apiClient } from '../../lib/api';
import DateTimePicker from '@react-native-community/datetimepicker';

const TASK_TYPES = [
  { value: 'walk', label: 'Walk/Exercise', icon: '🚶' },
  { value: 'feed', label: 'Meal', icon: '🍽️' },
  { value: 'medicate', label: 'Medicine', icon: '💊' },
  { value: 'groom', label: 'Grooming', icon: '✂️' },
  { value: 'training', label: 'Training', icon: '🎯' },
  { value: 'checkup', label: 'Checkup', icon: '🏥' },
  { value: 'other', label: 'Other', icon: '📝' },
];

const DATE_OPTIONS = [
  { value: 'single', label: 'Specific date' },
  { value: 'recurring', label: 'Repeat on a weekly basis' },
];

export default function AddTaskScreen() {
  const { pets, fetchPets } = usePetStore();
  const { token } = useAuthStore();
  const params = useLocalSearchParams();
  
  const [formData, setFormData] = useState({
    petId: '',
    taskType: '',
    title: '',
    description: '',
    dateOption: 'single',
    selectedDate: new Date(),
    selectedTimes: [] as string[],
    recurringPattern: 'weekly',
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTaskTypeModal, setShowTaskTypeModal] = useState(false);
  const [showDateOptionModal, setShowDateOptionModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    fetchPets();
    // If editing, populate form with existing data
    if (params.editId) {
      // TODO: Fetch existing task data and populate form
    }
  }, []);

  const handleSubmit = async () => {
    if (!formData.petId.trim()) {
      Alert.alert('Error', 'Please select a pet');
      return;
    }
    
    if (!formData.taskType.trim()) {
      Alert.alert('Error', 'Please select a task type');
      return;
    }
    
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    
    if (formData.selectedTimes.length === 0) {
      Alert.alert('Error', 'Please add at least one time');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Please log in to create a task');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create tasks for each selected time
      const tasks = formData.selectedTimes.map(time => ({
        petId: formData.petId,
        type: formData.taskType,
        title: formData.title,
        description: formData.description,
        scheduledTime: new Date(`${formData.selectedDate.toISOString().split('T')[0]}T${time}`).toISOString(),
        recurring: formData.dateOption === 'recurring',
        recurrencePattern: formData.dateOption === 'recurring' ? formData.recurringPattern : undefined,
        notes: formData.notes,
      }));

      // Submit each task
      for (const task of tasks) {
        await apiClient.createTask(task);
      }

      Alert.alert(
        'Success!',
        `Task${tasks.length > 1 ? 's' : ''} created successfully!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Create task error:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTime = () => {
    setTempTime(new Date());
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      const timeString = selectedTime.toTimeString().slice(0, 5); // HH:MM format
      if (!formData.selectedTimes.includes(timeString)) {
        setFormData(prev => ({
          ...prev,
          selectedTimes: [...prev.selectedTimes, timeString]
        }));
      }
    }
  };

  const confirmTime = () => {
    const timeString = tempTime.toTimeString().slice(0, 5); // HH:MM format
    if (!formData.selectedTimes.includes(timeString)) {
      setFormData(prev => ({
        ...prev,
        selectedTimes: [...prev.selectedTimes, timeString]
      }));
    }
    setShowTimePicker(false);
  };

  const removeTime = (timeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTimes: prev.selectedTimes.filter(time => time !== timeToRemove)
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        selectedDate: selectedDate
      }));
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTaskTypeLabel = (value: string) => {
    const taskType = TASK_TYPES.find(type => type.value === value);
    return taskType ? `${taskType.icon} ${taskType.label}` : 'Select kind of task...';
  };

  const getDateOptionLabel = (value: string) => {
    const option = DATE_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : 'Choose a date option...';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#4559A7" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Task</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Pet Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Pet *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petScrollView}>
            <View style={styles.petContainer}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petButton,
                    formData.petId === pet.id && styles.petButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, petId: pet.id })}
                >
                  <Text style={[
                    styles.petButtonText,
                    formData.petId === pet.id && styles.petButtonTextSelected
                  ]}>
                    {pet.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Task Type Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>What kind of task? *</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowTaskTypeModal(true)}
          >
            <Text style={[
              styles.dropdownButtonText,
              !formData.taskType && styles.placeholderText
            ]}>
              {getTaskTypeLabel(formData.taskType)}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Date Option Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Choose a date option *</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDateOptionModal(true)}
          >
            <Text style={[
              styles.dropdownButtonText,
              !formData.dateOption && styles.placeholderText
            ]}>
              {getDateOptionLabel(formData.dateOption)}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Specific Date Selection */}
        {formData.dateOption === 'single' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Date *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color="#FFFFFF" />
              <Text style={styles.dateButtonText}>
                {formData.selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Time Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Edit Time *</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={addTime}
          >
            <Clock size={20} color="#FFFFFF" />
            <Text style={styles.timeButtonText}>Tap to Add Time</Text>
          </TouchableOpacity>
          <Text style={styles.timeHint}>Add Time</Text>
        </View>

        {/* Times Added */}
        {formData.selectedTimes.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Times Added</Text>
            <View style={styles.timesContainer}>
              {formData.selectedTimes.map((time, index) => (
                <View key={index} style={styles.timeItem}>
                  <Text style={styles.timeText}>{formatTime(time)}</Text>
                  <TouchableOpacity
                    style={styles.removeTimeButton}
                    onPress={() => removeTime(time)}
                  >
                    <Text style={styles.removeTimeText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any additional notes..."
            placeholderTextColor="#9CA3AF"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Creating Task...' : 'Add Task'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Task Type Modal */}
      {showTaskTypeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What kind of task?</Text>
            <ScrollView style={styles.modalScrollView}>
              {TASK_TYPES.map((taskType) => (
                <TouchableOpacity
                  key={taskType.value}
                  style={[
                    styles.modalOption,
                    formData.taskType === taskType.value && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, taskType: taskType.value });
                    setShowTaskTypeModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    formData.taskType === taskType.value && styles.modalOptionTextSelected
                  ]}>
                    {taskType.icon} {taskType.label}
                  </Text>
                  {formData.taskType === taskType.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTaskTypeModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Date Option Modal */}
      {showDateOptionModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose a date option</Text>
            <ScrollView style={styles.modalScrollView}>
              {DATE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    formData.dateOption === option.value && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, dateOption: option.value });
                    setShowDateOptionModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    formData.dateOption === option.value && styles.modalOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {formData.dateOption === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDateOptionModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.webDatePicker}>
                <input
                  type="date"
                  value={formData.selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setFormData(prev => ({ ...prev, selectedDate: newDate }));
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  style={styles.webDateInput}
                />
              </View>
            ) : (
              <DateTimePicker
                value={formData.selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                style={styles.datePicker}
                minimumDate={new Date()}
              />
            )}
            {(Platform.OS === 'ios' || Platform.OS === 'web') && (
              <View style={styles.datePickerButtons}>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.datePickerButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.datePickerButton, styles.datePickerButtonPrimary]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={[styles.datePickerButtonText, styles.datePickerButtonTextPrimary]}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.webTimePicker}>
                <input
                  type="time"
                  value={tempTime.toTimeString().slice(0, 5)}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const newTime = new Date();
                    newTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    setTempTime(newTime);
                  }}
                  style={styles.webTimeInput}
                />
              </View>
            ) : (
              <DateTimePicker
                value={tempTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                style={styles.timePicker}
              />
            )}
            {(Platform.OS === 'ios' || Platform.OS === 'web') && (
              <View style={styles.timePickerButtons}>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.timePickerButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.timePickerButton, styles.timePickerButtonPrimary]}
                  onPress={confirmTime}
                >
                  <Text style={[styles.timePickerButtonText, styles.timePickerButtonTextPrimary]}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4559A7',
  },
  placeholder: {
    width: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  petScrollView: {
    marginBottom: 8,
  },
  petContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  petButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  petButtonSelected: {
    backgroundColor: '#4559A7',
    borderColor: '#4559A7',
  },
  petButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  petButtonTextSelected: {
    color: '#FFFFFF',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#4559A7',
    gap: 8,
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  timesContainer: {
    gap: 8,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E40AF',
  },
  removeTimeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeTimeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  notesInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#374151',
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#4559A7',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  modalOptionSelected: {
    backgroundColor: '#4559A7',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  modalOptionTextSelected: {
    color: '#FFFFFF',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  timePicker: {
    marginVertical: 20,
  },
  timePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  timePickerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  timePickerButtonPrimary: {
    backgroundColor: '#4559A7',
  },
  timePickerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  timePickerButtonTextPrimary: {
    color: '#FFFFFF',
  },
  // Date picker styles
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#4559A7',
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  datePicker: {
    marginVertical: 20,
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  datePickerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  datePickerButtonPrimary: {
    backgroundColor: '#4559A7',
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  datePickerButtonTextPrimary: {
    color: '#FFFFFF',
  },
  // Web-specific styles
  webDatePicker: {
    marginVertical: 20,
    alignItems: 'center',
  },
  webDateInput: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    minWidth: 200,
  },
  webTimePicker: {
    marginVertical: 20,
    alignItems: 'center',
  },
  webTimeInput: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    minWidth: 200,
  },
});
