import { Pill, Footprints, Scissors, Calendar, Circle, Salad } from 'lucide-react-native';

export interface TimeSlot {
  hour: number;
  label: string;
}

// Create time slots from 12am to 11pm (24 hours in order)
export const TIME_SLOTS: TimeSlot[] = Array.from({ length: 24 }, (_, i) => {
  const hour = i; // 0-23 (12am to 11pm)
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = hour >= 12 ? 'pm' : 'am';
  return {
    hour,
    label: hour === 0 || hour === 12 ? `12${period}` : `${displayHour}${period}`,
  };
});

export const TASK_TYPES = [
  { value: 'medicine', label: 'Medicine', icon: Pill },
  { value: 'feeding', label: 'Feeding', icon: Salad },
  { value: 'walk', label: 'Walk', icon: Footprints },
  { value: 'grooming', label: 'Grooming', icon: Scissors },
  { value: 'vet_visit', label: 'Vet Visit', icon: Calendar },
  { value: 'other', label: 'Other', icon: Circle },
];

export const getTaskTypeIcon = (taskType: string) => {
  const type = TASK_TYPES.find(t => t.value === taskType);
  return type?.icon || Circle;
};

export const getTaskTypeLabel = (taskType: string, customLabel?: string) => {
  if (taskType === 'other' && customLabel) {
    return customLabel;
  }
  const type = TASK_TYPES.find(t => t.value === taskType);
  return type?.label || 'Task';
};

