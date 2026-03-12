'use client';

import { useRouter } from "next/navigation";
import { useSessionContext } from "../../../components/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { AnimatedBackground } from "../../../components/primitives/AnimatedBackground";
import { Calendar, PawPrint, FileText, MessageSquare, BriefcaseBusiness, Settings, CalendarDays } from "lucide-react";

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
      <main className="flex-1 flex flex-col p-6 md:p-8 lg:p-12">
        <div className="w-full max-w-6xl mx-auto">
          {/* Welcome Header */}
          <div className="space-y-3 mb-6 mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
              <CalendarDays className="h-5 w-5" />
              <span className="text-sm font-medium">{currentDate}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome back, {userName}!
            </h1>
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-6xl mx-auto">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Patient Management Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/patients')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <PawPrint className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Patient Management</CardTitle>
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
                  <CardTitle>Appointments</CardTitle>
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
                  <CardTitle>Forms</CardTitle>
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

            {/* Messages Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/messages')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Messages</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Send and receive messages with clients and staff
                </p>
                <div className="flex justify-center">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/messages');
                    }}
                  >
                    View Messages
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Business Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/business')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BriefcaseBusiness className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Business</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  View analytics, reports, and business operations
                </p>
                <div className="flex justify-center">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/business');
                    }}
                  >
                    View Business
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/settings')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Customize your account and application settings
                </p>
                <div className="flex justify-center">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/settings');
                    }}
                  >
                    View Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </main>
    </AnimatedBackground>
  );
}
