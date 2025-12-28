import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { TIME_SLOTS } from './constants';
import { TaskItem } from './TaskItem';

interface TaskCalendarProps {
  tasks: any[];
  onTaskPress: (task: any) => void;
}

export function TaskCalendar({ tasks, onTaskPress }: TaskCalendarProps) {
  const getTasksForTime = (hour: number) => {
    const uniqueTasks = new Map<string, any>();
    tasks.forEach((task) => {
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

  return (
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
              {tasksForSlot.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onPress={() => onTaskPress(task)}
                />
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});

