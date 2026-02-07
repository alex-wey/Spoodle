import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Calendar, Clock, User, CheckCircle, XCircle, RefreshCw } from "lucide-react-native";

export interface Appointment {
  id: string;
  eventTitle?: string | null;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED';
  staff?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  clinic?: {
    name: string;
  };
}

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: (appointmentId: string) => void;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return {
        icon: CheckCircle,
        color: '#3BB272',
        bgColor: '#D1FAE5',
        text: 'Confirmed',
      };
    case 'CANCELLED':
      return {
        icon: XCircle,
        color: '#DC2626',
        bgColor: '#FEE2E2',
        text: 'Cancelled',
      };
    case 'RESCHEDULED':
      return {
        icon: RefreshCw,
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        text: 'Rescheduled',
      };
    default:
      return {
        icon: CheckCircle,
        color: '#6B7280',
        bgColor: '#F3F4F6',
        text: status,
      };
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);
  
  if (appointmentDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (appointmentDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;
  const veterinarianName = appointment.staff?.user
    ? `${appointment.staff.user.firstName} ${appointment.staff.user.lastName}`.trim()
    : 'Unknown Veterinarian';

  const handlePress = () => {
    if (onPress) {
      onPress(appointment.id);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateRow}>
            <Calendar size={16} color="#4559A7" />
            <Text style={styles.dateText}>{formatDate(appointment.startTime)}</Text>
          </View>
          <View style={styles.timeRow}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.timeText}>{formatTime(appointment.startTime)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <StatusIcon size={14} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.text}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {appointment.eventTitle || 'Appointment'}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.labelText}>Veterinarian:</Text>
          <Text style={styles.infoText} numberOfLines={1}>
            {veterinarianName}
          </Text>
        </View>

        {appointment.clinic?.name && (
          <Text style={styles.clinicText} numberOfLines={1}>
            {appointment.clinic.name}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ADD7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4559A7',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  clinicText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
