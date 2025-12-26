import React, { useRef, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { getDaysInMonth, formatDayName, formatDayNumber, isSameDay } from './utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DateSelectorProps {
  currentMonth: Date;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ currentMonth, selectedDate, onDateChange }: DateSelectorProps) {
  const dateScrollRef = useRef<ScrollView>(null);

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
      const itemWidth = 58;
      const scrollPosition = todayIndex * itemWidth - (SCREEN_WIDTH / 2) + (itemWidth / 2);
      
      dateScrollRef.current.scrollTo({
        x: Math.max(0, scrollPosition),
        animated: true,
      });
    }
  }, [currentMonth]);

  React.useEffect(() => {
    // Scroll to today on initial render
    setTimeout(() => {
      scrollToToday();
    }, 300);
  }, [scrollToToday]);

  return (
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
              onPress={() => onDateChange(date)}
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
  );
}

const styles = StyleSheet.create({
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
});

