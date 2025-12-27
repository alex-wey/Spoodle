import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { TASK_TYPES } from './constants';

interface TaskTypeDropdownProps {
  selectedValue: string;
  onSelect: (value: string) => void;
  label?: string;
}

export function TaskTypeDropdown({ selectedValue, onSelect, label = 'Task Type' }: TaskTypeDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelect = (value: string) => {
    onSelect(value);
    setShowDropdown(false);
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text style={styles.dropdownButtonText}>
          {TASK_TYPES.find(t => t.value === selectedValue)?.label || 'Select task type'}
        </Text>
        <ChevronDown size={20} color="#6B7280" />
      </TouchableOpacity>
      
      {showDropdown && (
        <View style={styles.dropdownList}>
          {TASK_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.dropdownItem,
                selectedValue === type.value && styles.dropdownItemSelected,
              ]}
              onPress={() => handleSelect(type.value)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                {selectedValue === type.value && (
                  <Check size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                )}
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedValue === type.value && styles.dropdownItemTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
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
});

