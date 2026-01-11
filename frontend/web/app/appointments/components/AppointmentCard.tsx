import { Card, CardContent } from "../../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { cn } from "../../../lib/utils";
import { statusTypes } from "./WeekNavigation";
import { formatTimeCompact } from "../utils/dateUtils";

export interface AppointmentCardData {
  id: string;
  petName: string;
  petImage?: string;
  startTime: Date;
  endTime: Date;
  veterinarian: string;
  status: "CONFIRMED" | "CANCELLED" | "RESCHEDULED";
  eventTitle?: string | null;
  ownerName?: string;
}

interface AppointmentCardProps {
  appointment: AppointmentCardData;
  onClick: (appointmentId: string) => void;
}

// Convert bg-* colors to border-* colors
const statusBorderColors: Record<string, string> = Object.fromEntries(
  statusTypes.map((type) => [
    type.status,
    type.color.replace("bg-", "border-")
  ])
);

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const borderColor = statusBorderColors[appointment.status] || "border-border";
  
  return (
    <Card
      className={cn(
        "h-full border-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer",
        "bg-card",
        borderColor
      )}
      onClick={() => onClick(appointment.id)}
    >
      <CardContent className="p-2 h-full flex flex-col min-h-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Avatar className="h-5 w-5 flex-shrink-0">
            <AvatarImage src={appointment.petImage} alt={appointment.petName} />
            <AvatarFallback className="text-[9px] font-medium bg-muted">
              {appointment.petName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatTimeCompact(appointment.startTime)}
          </span>
          {appointment.eventTitle && (
            <p className="font-semibold text-xs text-foreground truncate leading-tight min-w-0">
              {appointment.eventTitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
