import { cn } from "../../../lib/utils";
import { AppointmentCard, AppointmentCardData } from "./AppointmentCard";
import { START_HOUR, END_HOUR, HOURS_PER_DAY, PIXELS_PER_HOUR, PIXELS_PER_MINUTE } from "../utils/calendarConstants";

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
    
    // Only show appointments within the configured visible window
    if (startHour < START_HOUR || startHour >= END_HOUR) {
      return null;
    }

    const top = ((startHour - START_HOUR) * PIXELS_PER_HOUR) + (startMinute * PIXELS_PER_MINUTE);
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
      {/* Sort appointments by startTime descending (later appointments first) so they appear on top */}
      {[...appointments]
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
        .map((apt, index) => {
          const style = getAppointmentStyle(apt);
          if (!style) return null;

          return (
            <div
              key={apt.id}
              className="absolute left-1 right-1 group"
              style={{
                ...style,
                zIndex: appointments.length - index, // Later appointments get higher z-index
              }}
            >
              <AppointmentCard appointment={apt} onClick={onAppointmentClick} />
            </div>
          );
        })}
    </div>
  );
}
