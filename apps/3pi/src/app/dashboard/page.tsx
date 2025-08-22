'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components';

export default function DashboardPage() {
  const [recentActivity] = useState([
    {
      id: 1,
      type: 'compliance_check',
      petName: 'Buddy',
      ownerName: 'John Smith',
      status: 'passed',
      timestamp: '2024-01-15T10:30:00Z',
      performedBy: 'Dr. Johnson'
    },
    {
      id: 2,
      type: 'pet_registration',
      petName: 'Luna',
      ownerName: 'Sarah Wilson',
      status: 'completed',
      timestamp: '2024-01-15T09:15:00Z',
      performedBy: 'Admin'
    },
    {
      id: 3,
      type: 'medical_record',
      petName: 'Max',
      ownerName: 'Mike Davis',
      status: 'uploaded',
      timestamp: '2024-01-15T08:45:00Z',
      performedBy: 'Dr. Brown'
    }
  ]);

  const [quickStats] = useState({
    totalPets: 1247,
    activeCompliance: 892,
    pendingChecks: 23,
    recentRegistrations: 15
  });

  const [organizationInfo] = useState({
    name: 'Test Clinic',
    address: '123 Main St, Anytown, USA',
    phone: '(555) 123-4567',
    email: 'info@testclinic.com',
    license: 'VET-2024-001'
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'compliance_check':
        return '🏥';
      case 'pet_registration':
        return '🐾';
      case 'medical_record':
        return '📄';
      default:
        return '📋';
    }
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'compliance_check':
        return `Compliance check for ${activity.petName} (${activity.ownerName}) - ${activity.status}`;
      case 'pet_registration':
        return `New pet registration for ${activity.petName} (${activity.ownerName})`;
      case 'medical_record':
        return `Medical record uploaded for ${activity.petName} (${activity.ownerName})`;
      default:
        return 'Activity recorded';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'passed':
      case 'completed':
        return 'success' as const;
      case 'failed':
        return 'error' as const;
      case 'pending':
        return 'warning' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your pet management system.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card variant="elevated" className="animate-scale-in">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{quickStats.totalPets}</div>
                  <p className="text-foreground font-medium">Total Pets</p>
                </CardContent>
              </Card>
              
              <Card variant="elevated" className="animate-scale-in">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-success mb-2">{quickStats.activeCompliance}</div>
                  <p className="text-foreground font-medium">Compliant Pets</p>
                </CardContent>
              </Card>
              
              <Card variant="elevated" className="animate-scale-in">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-warning mb-2">{quickStats.pendingChecks}</div>
                  <p className="text-foreground font-medium">Pending Checks</p>
                </CardContent>
              </Card>
              
              <Card variant="elevated" className="animate-scale-in">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">{quickStats.recentRegistrations}</div>
                  <p className="text-foreground font-medium">New This Week</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts for daily operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => window.location.href = '/search'}
                    className="h-16 text-lg"
                    leftIcon={<span className="text-xl">🔍</span>}
                  >
                    Search Pets
                  </Button>
                  
                  <Button 
                    variant="secondary"
                    onClick={() => window.location.href = '/compliance/check'}
                    className="h-16 text-lg"
                    leftIcon={<span className="text-xl">🏥</span>}
                  >
                    Start Compliance Check
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/pets/register'}
                    className="h-16 text-lg"
                    leftIcon={<span className="text-xl">🐾</span>}
                  >
                    Register New Pet
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/reports'}
                    className="h-16 text-lg"
                    leftIcon={<span className="text-xl">📊</span>}
                  >
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions and updates in your system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted transition-colors">
                      <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1">
                        <p className="font-medium">{getActivityText(activity)}</p>
                        <p className="text-sm text-foreground">
                          {new Date(activity.timestamp).toLocaleString()} • {activity.performedBy}
                        </p>
                      </div>
                      <Badge
                        variant={getStatusVariant(activity.status)}
                        dot
                        size="sm"
                      >
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization Info */}
            <Card variant="elevated" className="animate-slide-in">
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>
                  Your clinic information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">{organizationInfo.name}</h3>
                  <p className="text-foreground">{organizationInfo.address}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><strong>Phone:</strong> {organizationInfo.phone}</p>
                  <p><strong>Email:</strong> {organizationInfo.email}</p>
                  <p><strong>License:</strong> {organizationInfo.license}</p>
                </div>
                
                <Button variant="outline" className="w-full">
                  Edit Organization
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Current system health and performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Status</span>
                  <Badge variant="success" dot>
                    Online
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="success" dot>
                    Connected
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage</span>
                  <Badge variant="warning" dot>
                    75% Used
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Backup</span>
                  <span className="text-sm text-foreground">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>
                  Frequently accessed pages and resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  leftIcon={<span>📋</span>}
                  onClick={() => window.location.href = '/requests'}
                >
                  Owner Requests
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  leftIcon={<span>📊</span>}
                  onClick={() => window.location.href = '/analytics'}
                >
                  Analytics
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  leftIcon={<span>⚙️</span>}
                  onClick={() => window.location.href = '/settings'}
                >
                  Settings
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  leftIcon={<span>📚</span>}
                  onClick={() => window.location.href = '/help'}
                >
                  Help & Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
