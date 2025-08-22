'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Input } from '@/components';
import { useRouter } from 'next/navigation';

export default function CompliancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const complianceStats = [
    { label: 'Total Checks Today', value: '12', status: 'success', icon: '✅' },
    { label: 'Pending Reviews', value: '3', status: 'warning', icon: '⏳' },
    { label: 'Compliance Rate', value: '94%', status: 'success', icon: '📊' },
    { label: 'Failed Checks', value: '1', status: 'error', icon: '❌' },
  ];

  const recentChecks = [
    { id: '1', petName: 'Buddy', owner: 'John Smith', status: 'passed', date: '2024-01-15', type: 'Boarding Check' },
    { id: '2', petName: 'Luna', owner: 'Sarah Johnson', status: 'pending', date: '2024-01-15', type: 'Travel Check' },
    { id: '3', petName: 'Max', owner: 'Mike Davis', status: 'failed', date: '2024-01-14', type: 'Boarding Check' },
    { id: '4', petName: 'Bella', owner: 'Emily Wilson', status: 'passed', date: '2024-01-14', type: 'Daycare Check' },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'passed':
        return 'success' as const;
      case 'failed':
        return 'error' as const;
      case 'pending':
        return 'warning' as const;
      default:
        return 'default' as const;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed':
        return 'Passed';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending Review';
      default:
        return 'Unknown';
    }
  };

  const handleQuickCheck = () => {
    router.push('/compliance/check');
  };

  const handleViewCheck = (checkId: string) => {
    router.push(`/compliance/check/${checkId}`);
  };

  return (
    <div className="min-h-screen bg-background py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Compliance Management
          </h1>
          <p className="text-foreground">
            Monitor and manage pet compliance across all services
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Quick Compliance Check</h3>
                  <p className="text-muted-foreground">
                    Start a new compliance check for any pet
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Input
                    placeholder="Search pets by name, ID, or microchip..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                    leftIcon={<span className="text-lg">🔍</span>}
                  />
                  <Button 
                    onClick={handleQuickCheck}
                    leftIcon={<span>🏥</span>}
                    className="whitespace-nowrap"
                  >
                    Start Check
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {complianceStats.map((stat, index) => (
            <Card key={index} variant="elevated">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Compliance Checks */}
        <div className="mb-8">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Recent Compliance Checks</CardTitle>
              <CardDescription>
                Latest compliance checks performed across all pets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentChecks.map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-xl">
                        🐾
                      </div>
                      <div>
                        <h4 className="font-medium">{check.petName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {check.owner} • {check.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(check.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={getStatusVariant(check.status)}
                        dot
                      >
                        {getStatusText(check.status)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCheck(check.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Bulk Compliance Review</CardTitle>
              <CardDescription>
                Review multiple pets for compliance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Generate compliance reports and identify pets that need attention.
              </p>
              <Button variant="outline" leftIcon={<span>📊</span>}>
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Compliance Settings</CardTitle>
              <CardDescription>
                Configure compliance requirements and rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage compliance categories, requirements, and validation rules.
              </p>
              <Button variant="outline" leftIcon={<span>⚙️</span>}>
                Configure Rules
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
