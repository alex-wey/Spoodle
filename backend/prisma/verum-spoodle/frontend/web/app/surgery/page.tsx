'use client';

import { Activity, Calendar, Clock, Users, AlertCircle, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SurgeryPage() {
  // Mock surgery data
  const upcomingSurgeries = [
    {
      id: '1',
      petName: 'Max',
      ownerName: 'John Smith',
      procedure: 'Spay',
      scheduledDate: '2024-01-15',
      scheduledTime: '10:00 AM',
      veterinarian: 'Dr. Sarah Johnson',
      status: 'scheduled',
    },
    {
      id: '2',
      petName: 'Luna',
      ownerName: 'Sarah Johnson',
      procedure: 'Dental Extraction',
      scheduledDate: '2024-01-16',
      scheduledTime: '2:00 PM',
      veterinarian: 'Dr. Michael Chen',
      status: 'scheduled',
    },
    {
      id: '3',
      petName: 'Buddy',
      ownerName: 'Michael Chen',
      procedure: 'Neuter',
      scheduledDate: '2024-01-17',
      scheduledTime: '9:00 AM',
      veterinarian: 'Dr. Sarah Johnson',
      status: 'confirmed',
    },
  ];

  const recentSurgeries = [
    {
      id: '4',
      petName: 'Bella',
      ownerName: 'Emily Davis',
      procedure: 'Tumor Removal',
      completedDate: '2024-01-10',
      veterinarian: 'Dr. Michael Chen',
      status: 'completed',
    },
    {
      id: '5',
      petName: 'Charlie',
      ownerName: 'David Wilson',
      procedure: 'Fracture Repair',
      completedDate: '2024-01-08',
      veterinarian: 'Dr. Sarah Johnson',
      status: 'completed',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Surgery Management</h2>
          <p className="text-muted-foreground">
            Manage surgical procedures and schedules
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSurgeries.length}</div>
            <p className="text-xs text-muted-foreground">Surgeries scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Total procedures</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veterinarians</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Available surgeons</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Surgery rooms</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Surgeries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Surgeries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingSurgeries.map((surgery) => (
              <div
                key={surgery.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{surgery.procedure}</span>
                    {getStatusBadge(surgery.status)}
                  </div>
                  <div className="text-sm text-muted-foreground ml-7">
                    <span className="font-medium">{surgery.petName}</span> • Owner: {surgery.ownerName}
                  </div>
                  <div className="text-xs text-muted-foreground ml-7">
                    {surgery.scheduledDate} at {surgery.scheduledTime} • {surgery.veterinarian}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Surgeries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Surgeries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSurgeries.map((surgery) => (
              <div
                key={surgery.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{surgery.procedure}</span>
                    {getStatusBadge(surgery.status)}
                  </div>
                  <div className="text-sm text-muted-foreground ml-7">
                    <span className="font-medium">{surgery.petName}</span> • Owner: {surgery.ownerName}
                  </div>
                  <div className="text-xs text-muted-foreground ml-7">
                    Completed on {surgery.completedDate} • {surgery.veterinarian}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-center justify-center">
            <AlertCircle className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Full surgery management features coming soon. This is a mock page for demonstration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



