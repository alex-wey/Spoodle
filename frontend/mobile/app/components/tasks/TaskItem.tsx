import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { getTaskTypeIcon } from './constants';

interface TaskItemProps {
  task: any;
  onPress: () => void;
}

export function TaskItem({ task, onPress }: TaskItemProps) {
  const TaskTypeIcon = getTaskTypeIcon(task.taskType);

  return (
    <TouchableOpacity
      style={[
        styles.taskItem,
        task.completed && styles.taskItemCompleted,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.taskIconContainer}>
        <TaskTypeIcon size={18} color="#4559A7" />
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
            <CheckCircle size={20} color="#10B981" />
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
  );
}

const styles = StyleSheet.create({
  taskItem: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#4559A7',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    backgroundColor: '#F3F4F6',
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
});

