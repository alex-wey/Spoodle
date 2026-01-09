import { cn } from "../../../lib/utils";
import { AppointmentCard, AppointmentCardData } from "./AppointmentCard";
import { HOURS_PER_DAY, PIXELS_PER_HOUR, PIXELS_PER_MINUTE } from "../utils/calendarConstants";

interface CalendarDayColumnProps {
  day: Date;
  appointments: AppointmentCardData[];
  onAppointmentClick: (appointmentId: string) => void;
  isLastColumn?: boolean;
}

export function CalendarDayColumn({
  day,
  appointments,
  onAppointmentClick,
  isLastColumn = false,
}: CalendarDayColumnProps) {
  const isToday = day.toDateString() === new Date().toDateString();

  const getAppointmentStyle = (apt: AppointmentCardData) => {
    const startHour = apt.startTime.getHours();
    const startMinute = apt.startTime.getMinutes();
    
    // Only show appointments between 6 AM and 6 PM
    if (startHour < 6 || startHour >= 18) {
      return null;
    }

    const top = ((startHour - 6) * PIXELS_PER_HOUR) + (startMinute * PIXELS_PER_MINUTE);
    const duration = (apt.endTime.getTime() - apt.startTime.getTime()) / (1000 * 60);
    const height = Math.max(duration * PIXELS_PER_MINUTE, 40);

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  return (
    <div
      className={cn(
        "relative",
        !isLastColumn && "border-r border-border",
        isToday && "bg-primary/5"
      )}
    >
      {/* Hour Lines - aligned with grid */}
      {Array.from({ length: HOURS_PER_DAY }, (_, i) => {
        const isLastRow = i === HOURS_PER_DAY - 1;
        return (
          <div
            key={i}
            className={cn(
              "absolute",
              !isLastRow && "border-b border-border"
            )}
            style={{
              top: `${i * PIXELS_PER_HOUR}px`,
              left: 0,
              right: 0,
              height: `${PIXELS_PER_HOUR}px`,
            }}
          />
        );
      })}

      {/* Appointment Cards */}
      {appointments.map((apt) => {
        const style = getAppointmentStyle(apt);
        if (!style) return null;

        return (
          <div
            key={apt.id}
            className="absolute left-1 right-1 group"
            style={style}
          >
            <AppointmentCard appointment={apt} onClick={onAppointmentClick} />
          </div>
        );
      })}
    </div>
  );
}
