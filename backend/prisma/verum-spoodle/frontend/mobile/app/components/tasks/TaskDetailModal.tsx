import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { X, Trash2, CheckCircle } from 'lucide-react-native';
import { formatTimeForDisplay } from './utils';

interface TaskDetailModalProps {
  visible: boolean;
  task: any | null;
  onClose: () => void;
  onComplete: () => void;
  onDelete: () => void;
}

export function TaskDetailModal({ visible, task, onClose, onComplete, onDelete }: TaskDetailModalProps) {
  if (!task) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>{task.title}</Text>
              {task.scheduledTime && (
                <View style={styles.timeBadge}>
                  <Text style={styles.timeBadgeText}>
                    {formatTimeForDisplay(task.scheduledTime)}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {task.description && (
              <View style={styles.modalSection}>
                <Text style={styles.modalText}>{task.description}</Text>
              </View>
            )}

            {task.notes && (
              <View style={styles.modalSection}>
                <Text style={styles.modalText}>{task.notes}</Text>
              </View>
            )}

            {!task.completed && (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={onComplete}
              >
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.completeButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onDelete}
            >
              <Trash2 size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Delete Task</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  timeBadge: {
    backgroundColor: '#DCEBF5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timeBadgeText: {
    fontSize: 12,
    color: '#4559A7',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

