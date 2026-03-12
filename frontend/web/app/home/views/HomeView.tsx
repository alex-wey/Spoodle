'use client';

import { useRouter } from "next/navigation";
import { useSessionContext } from "../../../components/SessionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { AnimatedBackground } from "../../../components/primitives/AnimatedBackground";
import { Calendar, PawPrint, FileText } from "lucide-react";

export default function HomeView() {
  const router = useRouter();
  const { isLoading, user } = useSessionContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const userName = user?.firstName;
  
  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  }).format(new Date());

  return (
    <AnimatedBackground className="flex flex-col h-full">
      <main className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12">
        <div className="w-full max-w-6xl space-y-8">
          {/* Welcome Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Welcome back, {userName}!
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentDate}
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Patient Management Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/patients')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <PawPrint className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Patient Management</CardTitle>
                    <CardDescription>View and manage your patients</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Access your patient profiles, medical records, and care history
                </p>
                <div className="flex justify-center">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/patients');
                    }}
                  >
                    View Patients
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Appointments Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/appointments')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Appointments</CardTitle>
                    <CardDescription>Schedule and track appointments</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Book new appointments and manage upcoming visits
                </p>
                <div className="flex justify-center">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/appointments');
                    }}
                  >
                    View Appointments
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Forms Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/forms')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Forms</CardTitle>
                    <CardDescription>Manage your forms and documents</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Access and complete required forms and documentation
                </p>
                <div className="flex justify-center">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/forms');
                    }}
                  >
                    View Forms
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AnimatedBackground>
  );
}
