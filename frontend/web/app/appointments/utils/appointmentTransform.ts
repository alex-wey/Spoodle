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

  const clientName = apt.petOwner?.user
    ? `${apt.petOwner.user.firstName} ${apt.petOwner.user.lastName}`.trim()
    : undefined;

  return {
    id: apt.id,
    patientName: apt.pet?.name || 'Unknown Patient',
    patientImage: apt.pet?.imageUrl || undefined,
    startTime,
    endTime,
    veterinarian: apt.staff?.user 
      ? `${apt.staff.user.firstName} ${apt.staff.user.lastName}`
      : 'Unknown',
    status: apt.status,
    eventTitle: apt.eventTitle || undefined,
    clientName,
  };
}

export function filterAppointmentsForWeek(
  appointments: AppointmentCardData[],
  weekStart: Date
): AppointmentCardData[] {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  
  // Reset time to start of day for proper comparison
  const weekStartNormalized = new Date(weekStart);
  weekStartNormalized.setHours(0, 0, 0, 0);
  const weekEndNormalized = new Date(weekEnd);
  weekEndNormalized.setHours(0, 0, 0, 0);
  
  return appointments.filter((apt) => {
    const aptDate = new Date(apt.startTime);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate >= weekStartNormalized && aptDate < weekEndNormalized;
  });
}
