import type { Appointment } from "../../../lib/types";
import type { AppointmentCardData } from "../components/AppointmentCard";

export function transformAppointment(apt: Appointment): AppointmentCardData {
  // Use startTime and endTime from the appointment
  let startTime = new Date(apt.startTime);
  let endTime = new Date(apt.endTime);

  // Fallback to Cal.com data if startTime/endTime not available
  if (apt.calcomData?.startTime) {
    startTime = new Date(apt.calcomData.startTime);
  }
  if (apt.calcomData?.endTime) {
    endTime = new Date(apt.calcomData.endTime);
  }

  // Fallback to Calendly data if available
  if (apt.calendlyData?.resource?.start_time) {
    startTime = new Date(apt.calendlyData.resource.start_time);
  }
  if (apt.calendlyData?.resource?.end_time) {
    endTime = new Date(apt.calendlyData.resource.end_time);
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
