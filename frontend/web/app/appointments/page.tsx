'use client';

import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AppointmentsPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-2xl w-full space-y-6 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
            <div className="relative bg-primary/10 p-6 rounded-full">
              <Calendar className="h-16 w-16 text-primary" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-lg text-muted-foreground">
            Coming Soon
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We&apos;re building a comprehensive appointment management system to help you schedule, track, and manage all your veterinary appointments in one place.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-4 pb-4 space-y-1">
              <div className="flex justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Schedule Appointments</h3>
              <p className="text-xs text-muted-foreground">
                Easy booking and rescheduling
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-4 pb-4 space-y-1">
              <div className="flex justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Real-time Updates</h3>
              <p className="text-xs text-muted-foreground">
                Stay informed with notifications
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-4 pb-4 space-y-1">
              <div className="flex justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Track History</h3>
              <p className="text-xs text-muted-foreground">
                View past and upcoming visits
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
            <AlertCircle className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">In Development</span>
          </div>
        </div>
      </div>
    </div>
  );
}
