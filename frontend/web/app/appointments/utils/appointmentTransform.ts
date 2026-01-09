import type { Appointment } from "../../../lib/types";
import type { AppointmentCardData } from "../components/AppointmentCard";

export function transformAppointment(apt: Appointment): AppointmentCardData {
  // Use startTime and endTime from the appointment
  let startTime = new Date(apt.startTime);
  let endTime = new Date(apt.endTime);

  // Fallback to Cal.com data if startTime/endTime not available
  if (apt.calcomData?.startTime) {
    const calcomStartTime = apt.calcomData.startTime;
    if (typeof calcomStartTime === 'string' || typeof calcomStartTime === 'number') {
      startTime = new Date(calcomStartTime);
    }
  }
  if (apt.calcomData?.endTime) {
    const calcomEndTime = apt.calcomData.endTime;
    if (typeof calcomEndTime === 'string' || typeof calcomEndTime === 'number') {
      endTime = new Date(calcomEndTime);
    }
  }

  // Fallback to Calendly data if available
  if (apt.calendlyData?.resource) {
    const resource = apt.calendlyData.resource as Record<string, unknown>;
    if (resource.start_time) {
      const startTimeValue = resource.start_time;
      if (typeof startTimeValue === 'string' || typeof startTimeValue === 'number') {
        startTime = new Date(startTimeValue);
      }
    }
    if (resource.end_time) {
      const endTimeValue = resource.end_time;
      if (typeof endTimeValue === 'string' || typeof endTimeValue === 'number') {
        endTime = new Date(endTimeValue);
      }
    }
  }

  return {
    id: apt.id,
    petName: apt.pet?.name || 'Unknown Pet',
    petImage: apt.pet?.imageUrl || undefined,
    startTime,
    endTime,
    veterinarian: apt.staff?.user 
      ? `${apt.staff.user.firstName} ${apt.staff.user.lastName}`
      : 'Unknown',
    status: apt.status,
  };
}

export function filterAppointmentsForWeek(
  appointments: AppointmentCardData[],
  weekStart: Date
): AppointmentCardData[] {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  
  return appointments.filter((apt) => {
    const aptDate = new Date(apt.startTime);
    return aptDate >= weekStart && aptDate < weekEnd;
  });
}
