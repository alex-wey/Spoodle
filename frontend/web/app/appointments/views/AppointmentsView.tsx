'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "../../../components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { getAppointments } from "../../../lib/api";
import { useSessionContext } from "../../../components/SessionContext";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { CreateAppointmentDialog } from "../components/CreateAppointmentDialog";
import { WeekNavigation } from "../components/WeekNavigation";
import { CalendarGrid } from "../components/CalendarGrid";
import { getWeekStart, getWeekDays } from "../utils/dateUtils";
import { transformAppointment, filterAppointmentsForWeek } from "../utils/appointmentTransform";
import type { Appointment } from "../../../lib/types";
import type { AppointmentCardData } from "../components/AppointmentCard";

export default function AppointmentsView() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const { clinicId } = useSessionContext();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const [appointments, setAppointments] = useState<AppointmentCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);
  const weekAppointments = useMemo(
    () => filterAppointmentsForWeek(appointments, currentWeekStart),
    [appointments, currentWeekStart]
  );
  
  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isSignedIn) {
        setError('Please sign in to view appointments');
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          setError('Unable to authenticate. Please try signing in again.');
          setLoading(false);
          return;
        }

        const result = await getAppointments(token, clinicId ? { clinicId } : undefined);
        
        if (result.success && result.data) {
          const transformedAppointments = result.data.map(transformAppointment);
          setAppointments(transformedAppointments);
          setError(null);
        } else {
          setError(result.message || result.error || 'Failed to fetch appointments');
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('An error occurred while fetching appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [isSignedIn, getToken, clinicId]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newWeekStart);
  };

  const goToToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const handleAppointmentClick = (appointmentId: string) => {
    router.push(`/appointments/${appointmentId}`);
  };

  const refetchAppointments = async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      if (!token) return;
      const result = await getAppointments(token, clinicId ? { clinicId } : undefined);
      if (result.success && result.data) {
        const transformedAppointments = result.data.map(transformAppointment);
        setAppointments(transformedAppointments);
      }
    } catch (err) {
      console.error('Error refetching appointments:', err);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">
            View and manage all appointments
          </p>
            </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
        </div>

      {/* Week Navigation and Calendar Grid - Connected */}
      <div className="space-y-0">
        <WeekNavigation
          weekDays={weekDays}
          appointmentCount={weekAppointments.length}
          loading={loading}
          onPreviousWeek={() => navigateWeek('prev')}
          onNextWeek={() => navigateWeek('next')}
          onToday={goToToday}
        />
        <CalendarGrid
          weekDays={weekDays}
          appointments={weekAppointments}
          loading={loading}
          onAppointmentClick={handleAppointmentClick}
        />
          </div>

          {/* Error Message */}
          {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
      )}

      <CreateAppointmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetchAppointments}
      />
    </div>
  );
}
