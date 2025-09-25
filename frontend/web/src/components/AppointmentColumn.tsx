import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppointmentCard, Appointment, AppointmentStatus } from "./AppointmentCard";
import { Clock, CheckCircle, User } from "lucide-react";

interface AppointmentColumnProps {
  status: AppointmentStatus;
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
}

const statusConfig = {
  booked: {
    title: "Booked Appointments",
    icon: Clock,
    gradient: "bg-gradient-booked",
    color: "text-primary"
  },
  pending: {
    title: "Pending Discharge", 
    icon: User,
    gradient: "bg-gradient-pending",
    color: "text-warning"
  },
  discharged: {
    title: "Discharged",
    icon: CheckCircle,
    gradient: "bg-gradient-discharged", 
    color: "text-success"
  }
};

export function AppointmentColumn({ 
  status, 
  appointments, 
  onAppointmentClick 
}: AppointmentColumnProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  
  return (
    <div className="flex-1 min-w-80">
      <Card className="h-full shadow-card border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <StatusIcon className={`w-5 h-5 ${config.color}`} />
              {config.title}
            </CardTitle>
            <Badge variant="secondary" className="px-2 py-1">
              {appointments.length}
            </Badge>
          </div>
          <div className={`h-1 w-full rounded-full ${config.gradient}`} />
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
            {appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <StatusIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No {status} appointments today</p>
              </div>
            ) : (
              appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onClick={onAppointmentClick}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}