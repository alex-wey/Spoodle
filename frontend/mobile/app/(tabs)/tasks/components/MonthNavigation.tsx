import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react-native';
import { formatMonthYear } from './utils';

interface MonthNavigationProps {
  currentMonth: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onOpenEditTasks: () => void;
}

export function MonthNavigation({ currentMonth, onNavigateMonth, onOpenEditTasks }: MonthNavigationProps) {
  return (
    <View style={styles.monthContainer}>
      <TouchableOpacity onPress={() => onNavigateMonth('prev')} style={styles.monthNavButton}>
        <ChevronLeft size={24} color="#4559A7" />
      </TouchableOpacity>
      <View style={styles.monthScroll}>
        <View style={styles.monthLabel}>
          <Text style={styles.monthText}>{formatMonthYear(currentMonth)}</Text>
        </View>
      </View>
      <View style={styles.monthRightButtons}>
        <TouchableOpacity onPress={() => onNavigateMonth('next')} style={styles.monthNavButton}>
          <ChevronRight size={24} color="#4559A7" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onOpenEditTasks}
          style={styles.editButton}
        >
          <Edit size={22} color="#4559A7" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});

