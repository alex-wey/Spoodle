import { Card, CardContent } from "../../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../lib/utils";
import { formatTime } from "../utils/dateUtils";

export interface AppointmentCardData {
  id: string;
  petName: string;
  petImage?: string;
  startTime: Date;
  endTime: Date;
  veterinarian: string;
  status: "booked" | "pending" | "discharged";
}

interface AppointmentCardProps {
  appointment: AppointmentCardData;
  onClick: (appointmentId: string) => void;
}

const statusColors: Record<string, string> = {
  booked: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  discharged: "bg-success/10 text-success border-success/20"
};

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  return (
    <Card
      className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-[1.02] cursor-pointer"
      onClick={() => onClick(appointment.id)}
    >
      <CardContent className="p-2 h-full flex flex-col">
        <div className="flex items-start gap-2">
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarImage src={appointment.petImage} alt={appointment.petName} />
            <AvatarFallback className="text-xs">
              {appointment.petName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <p className="font-semibold text-xs text-foreground truncate">
                {appointment.petName}
              </p>
              <Badge
                variant="outline"
                className={cn("text-[10px] px-1 py-0 h-4", statusColors[appointment.status])}
              >
                {appointment.status}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {formatTime(appointment.startTime)}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {appointment.veterinarian}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
