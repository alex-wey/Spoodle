import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppointmentStatus = "booked" | "pending" | "discharged";

export interface Appointment {
  id: string;
  petName: string;
  petImage?: string;
  petBreed: string;
  ownerName: string;
  appointmentType: string;
  time: string;
  isNewClient: boolean;
  hasNewMessage: boolean;
  veterinarian: string;
  status: AppointmentStatus;
  notes?: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: (appointment: Appointment) => void;
}

const statusConfig = {
  booked: {
    gradient: "bg-gradient-booked",
    badge: "bg-primary/10 text-primary border-primary/20",
    icon: Clock
  },
  pending: {
    gradient: "bg-gradient-pending", 
    badge: "bg-warning/10 text-warning border-warning/20",
    icon: Clock
  },
  discharged: {
    gradient: "bg-gradient-discharged",
    badge: "bg-success/10 text-success border-success/20", 
    icon: User
  }
};

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const config = statusConfig[appointment.status];
  const StatusIcon = config.icon;

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-hover hover:scale-[1.02] border-0 shadow-card"
      onClick={() => onClick?.(appointment)}
    >
      <CardContent className="p-4">
        {/* Header with status and time */}
        <div className="flex items-start justify-between mb-3">
          <Badge variant="outline" className={config.badge}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {appointment.time}
          </Badge>
          <div className="flex items-center gap-1">
            {appointment.isNewClient && (
              <Badge variant="secondary" className="text-xs">New</Badge>
            )}
            {appointment.hasNewMessage && (
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            )}
          </div>
        </div>

        {/* Pet information */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={appointment.petImage} alt={appointment.petName} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground font-medium">
              {appointment.petName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground truncate">{appointment.petName}</h3>
            <p className="text-sm text-muted-foreground truncate">{appointment.petBreed}</p>
          </div>
        </div>

        {/* Owner information */}
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span className="truncate">{appointment.ownerName}</span>
        </div>

        {/* Appointment details */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-card-foreground">{appointment.appointmentType}</p>
          <p className="text-xs text-muted-foreground">Dr. {appointment.veterinarian}</p>
          {appointment.notes && (
            <p className="text-xs text-muted-foreground italic truncate">{appointment.notes}</p>
          )}
        </div>

        {/* Status indicator bar */}
        <div className={cn("h-1 w-full rounded-full mt-4", config.gradient)} />
      </CardContent>
    </Card>
  );
}