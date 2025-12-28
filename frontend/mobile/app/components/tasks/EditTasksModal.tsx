import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, ChevronRight } from 'lucide-react-native';
import { TASK_TYPES, getTaskTypeIcon } from './constants';
import { formatTimeForDisplay } from './utils';

interface EditTasksModalProps {
  visible: boolean;
  loading: boolean;
  tasks: any[];
  onClose: () => void;
  onEditTask: (task: any) => void;
}

export function EditTasksModal({ visible, loading, tasks, onClose, onEditTask }: EditTasksModalProps) {
  const processTasks = () => {
    const nonRecurringTasks = tasks.filter(t => !t.completed && !t.recurring);
    const recurringTasks = tasks.filter(t => !t.completed && t.recurring);
    
    const recurringGroups = new Map<string, any[]>();
    recurringTasks.forEach(task => {
      const key = `${task.taskType}_${task.recurrenceDaysOfWeek}_${task.recurrenceEndDate || 'no-end'}`;
      if (!recurringGroups.has(key)) {
        recurringGroups.set(key, []);
      }
      recurringGroups.get(key)!.push(task);
    });
    
    const combinedRecurringTasks: any[] = [];
    recurringGroups.forEach((group) => {
      if (group.length > 0) {
        const firstTask = group[0];
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
              if (!allTimes.includes(t.scheduledTime)) {
                allTimes.push(t.scheduledTime);
              }
            }
          } else if (!allTimes.includes(firstTask.scheduledTime)) {
            allTimes.push(firstTask.scheduledTime);
          }
        });
        
        combinedRecurringTasks.push({
          ...firstTask,
          recurrenceTimes: allTimes.sort(),
          _combinedFrom: group.map(t => t.id),
        });
      }
    });
    
    return [...nonRecurringTasks, ...combinedRecurringTasks];
  };

  const getRecurringDaysOfWeek = (task: any): string[] => {
    if (!task.recurring || task.recurrencePattern !== 'weekly') {
      return [];
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
      return [];
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return daysOfWeek
      .sort((a, b) => a - b)
      .map(dayNum => dayNames[dayNum])
      .filter(Boolean);
  };

  const getRecurringTimes = (task: any): string[] => {
    if (!task.recurring) {
      return [];
    }

    let times: string[] = [];
    try {
      if (task.recurrenceTimes) {
        const parsedTimes = typeof task.recurrenceTimes === 'string' 
          ? JSON.parse(task.recurrenceTimes) 
          : task.recurrenceTimes;
        times = Array.isArray(parsedTimes) ? parsedTimes : [];
      } else if (task.scheduledTime) {
        times = [task.scheduledTime];
      }
    } catch (error) {
      console.error('Error parsing recurrence times:', error);
      if (task.scheduledTime) {
        times = [task.scheduledTime];
      }
    }

    return times.sort();
  };

  const processedTasks = processTasks();
  const hasTasks = processedTasks.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.editTasksModalContainer} edges={['top']}>
        <View style={styles.editTasksModalHeader}>
          <TouchableOpacity onPress={onClose}>
            <ArrowLeft size={24} color="#4559A7" />
          </TouchableOpacity>
          <Text style={styles.editTasksModalTitle}>All Tasks</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.editTasksModalBody} 
          contentContainerStyle={styles.editTasksModalBodyContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.editTasksLoadingContainer}>
              <ActivityIndicator size="large" color="#4559A7" />
              <Text style={styles.editTasksLoadingText}>Loading tasks...</Text>
            </View>
          ) : !hasTasks ? (
            <View style={styles.editTasksEmptyContainer}>
              <Calendar size={64} color="#9CA3AF" />
              <Text style={styles.editTasksEmptyTitle}>No tasks found</Text>
              <Text style={styles.editTasksEmptyText}>
                Create tasks to see them here
              </Text>
            </View>
          ) : (
            processedTasks.map((task) => {
              const taskDate = new Date(task.scheduledDate);
              const taskTypeLabel = TASK_TYPES.find(t => t.value === task.taskType)?.label || task.taskType;
              const TaskTypeIcon = getTaskTypeIcon(task.taskType);
              const recurringDays = getRecurringDaysOfWeek(task);
              const recurringTimes = getRecurringTimes(task);

              return (
                <View key={task.id} style={styles.editTaskItem}>
                  <TouchableOpacity
                    style={styles.editTaskItemTouchable}
                    onPress={() => onEditTask(task)}
                  >
                    <View style={styles.editTaskItemIconContainer}>
                      <TaskTypeIcon size={24} color="#4559A7" />
                    </View>
                    <View style={styles.editTaskItemContent}>
                      <View style={styles.editTaskItemHeader}>
                        <Text style={styles.editTaskItemTitle} numberOfLines={1}>
                          {task.title}
                        </Text>
                      </View>
                      <View style={styles.badgeContainer}>
                        <View style={styles.taskTypeBadge}>
                          <Text style={styles.taskTypeBadgeText}>
                            {taskTypeLabel}
                          </Text>
                        </View>
                        {task.recurring && (
                          <View style={styles.recurringBadge}>
                            <Text style={styles.recurringBadgeText}>Recurring</Text>
                          </View>
                        )}
                      </View>
                      {task.recurring && recurringDays.length > 0 ? (
                        <View style={styles.recurringDatesContainer}>
                          <Text style={styles.recurringDateItem}>
                            {recurringDays.join(', ')}
                            {recurringTimes.length > 0 && (
                              <Text style={styles.recurringTimeItem}>
                                {' • '}
                                {recurringTimes.map(time => formatTimeForDisplay(time)).join(', ')}
                              </Text>
                            )}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.recurringDatesContainer}>
                          <Text style={styles.recurringDateItem}>
                            {taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {task.scheduledTime && (
                              <Text style={styles.recurringTimeItem}>
                                {' • '}
                                {formatTimeForDisplay(task.scheduledTime)}
                              </Text>
                            )}
                          </Text>
                        </View>
                      )}
                      {task.description && (
                        <Text style={styles.editTaskItemDescription} numberOfLines={2}>
                          {task.description}
                        </Text>
                      )}
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  editTasksModalBodyContent: {
    paddingBottom: 40,
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
    backgroundColor: '#F3F4F6',
  },
  editTaskItemContent: {
    flex: 1,
    marginRight: 12,
  },
  editTaskItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  editTaskItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  taskTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    backgroundColor: '#F3F4F6',
  },
  taskTypeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
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
    gap: 4,
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
  recurringDateItem: {
    fontSize: 14,
    color: '#6B7280',
  },
  recurringTimeItem: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});

