import { Card, CardContent } from "../../../components/ui/card";
import { cn } from "../../../lib/utils";
import { CalendarDayColumn } from "./CalendarDayColumn";
import { AppointmentCardData } from "./AppointmentCard";
import { formatTimeShort, formatDayHeader } from "../utils/dateUtils";
import { HOURS_PER_DAY, PIXELS_PER_HOUR } from "../utils/calendarConstants";

interface CalendarGridProps {
  weekDays: Date[];
  appointments: AppointmentCardData[];
  loading: boolean;
  onAppointmentClick: (appointmentId: string) => void;
}

export function CalendarGrid({
  weekDays,
  appointments,
  loading,
  onAppointmentClick,
}: CalendarGridProps) {
  const getAppointmentsForDay = (day: Date): AppointmentCardData[] => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === day.toDateString();
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading appointments...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-t-none border-0">
      <CardContent className="p-0 border-l border-r border-b border-border rounded-lg rounded-t-none">
        {/* Day Headers */}
        <div 
          className="grid border-b sticky top-0 bg-background z-10"
          style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}
        >
          <div className="p-3 border-r border-border bg-muted/30">
          </div>
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const header = formatDayHeader(day);
            const isLastColumn = index === weekDays.length - 1;
            
            return (
              <div
                key={index}
                className={cn(
                  "py-1.5 px-2 text-center flex flex-col items-center justify-center",
                  !isLastColumn && "border-r border-border",
                  isToday 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground"
                )}
              >
                <div className="text-xs font-medium mb-0">{header.weekday}</div>
                <div className={cn(
                  "text-lg font-bold",
                  isToday ? "text-primary" : "text-foreground"
                )}>
                  {header.day}
                </div>
                <div className="text-xs font-medium">{header.month}</div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div 
          className="grid"
          style={{ 
            height: `${HOURS_PER_DAY * PIXELS_PER_HOUR}px`,
            gridTemplateColumns: '60px repeat(7, 1fr)'
          }}
        >
          {/* Time Column */}
          <div className="border-r border-border bg-muted/30 relative">
            {Array.from({ length: HOURS_PER_DAY }, (_, i) => {
              const hour = 6 + i;
              const isLastRow = i === HOURS_PER_DAY - 1;
              return (
                <div
                  key={hour}
                  className={cn(
                    "absolute text-xs text-muted-foreground pr-2 pt-1 text-right",
                    !isLastRow && "border-b border-border"
                  )}
                  style={{ 
                    top: `${i * PIXELS_PER_HOUR}px`, 
                    height: `${PIXELS_PER_HOUR}px`,
                    width: '100%'
                  }}
                >
                  {formatTimeShort(new Date(2000, 0, 1, hour, 0))}
                </div>
              );
            })}
          </div>

          {/* Day Columns */}
          {weekDays.map((day, dayIndex) => (
            <CalendarDayColumn
              key={dayIndex}
              day={day}
              appointments={getAppointmentsForDay(day)}
              onAppointmentClick={onAppointmentClick}
              isLastColumn={dayIndex === weekDays.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
