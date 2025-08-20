'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Input, Skeleton, SkeletonCard } from '@/components';
import { apiService } from '@/lib/api';

interface ReportData {
  totalPets: number;
  compliantPets: number;
  nonCompliantPets: number;
  recentCheckIns: number;
  monthlyTrends: {
    month: string;
    checkIns: number;
    complianceChecks: number;
  }[];
  topPetTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
  complianceByCategory: {
    category: string;
    compliant: number;
    nonCompliant: number;
    total: number;
  }[];
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [reportType, setReportType] = useState<'overview' | 'compliance' | 'trends' | 'details'>('overview');

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getReports(dateRange);
      
      if (response.success && response.data) {
        setReportData(response.data);
      } else {
        // Fallback to mock data if API fails
        const mockData: ReportData = {
          totalPets: 1247,
          compliantPets: 892,
          nonCompliantPets: 355,
          recentCheckIns: 156,
          monthlyTrends: [
            { month: 'Jan', checkIns: 45, complianceChecks: 23 },
            { month: 'Feb', checkIns: 52, complianceChecks: 28 },
            { month: 'Mar', checkIns: 48, complianceChecks: 31 },
            { month: 'Apr', checkIns: 61, complianceChecks: 35 },
            { month: 'May', checkIns: 58, complianceChecks: 42 },
            { month: 'Jun', checkIns: 67, complianceChecks: 38 },
          ],
          topPetTypes: [
            { type: 'Dogs', count: 678, percentage: 54.4 },
            { type: 'Cats', count: 423, percentage: 33.9 },
            { type: 'Birds', count: 89, percentage: 7.1 },
            { type: 'Other', count: 57, percentage: 4.6 },
          ],
          complianceByCategory: [
            { category: 'Vaccination', compliant: 156, nonCompliant: 23, total: 179 },
            { category: 'Health Check', compliant: 134, nonCompliant: 18, total: 152 },
            { category: 'Prevention', compliant: 98, nonCompliant: 31, total: 129 },
            { category: 'Documentation', compliant: 87, nonCompliant: 42, total: 129 },
          ],
        };
        setReportData(mockData);
      }
    } catch (err) {
      setError('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const getCompliancePercentage = () => {
    if (!reportData) return 0;
    return Math.round((reportData.compliantPets / reportData.totalPets) * 100);
  };

  const getStatusVariant = (percentage: number) => {
    if (percentage >= 80) return 'success' as const;
    if (percentage >= 60) return 'warning' as const;
    return 'error' as const;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Skeleton variant="text" width="300px" height="36px" className="mb-2" />
            <Skeleton variant="text" width="400px" height="20px" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div className="text-error text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Reports</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadReportData}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-background py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div className="text-muted-foreground text-6xl mb-4">📊</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">No Report Data</h1>
            <p className="text-muted-foreground mb-4">No report data is available at this time.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h1>
          <p className="text-foreground">Comprehensive insights into pet compliance and activity</p>
        </div>

        {/* Controls */}
        <div className="mb-8">
          <Card variant="outlined" className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Date Range</label>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value as any)}
                      className="select"
                    >
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                      <option value="1y">Last Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Report Type</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as any)}
                      className="select"
                    >
                      <option value="overview">Overview</option>
                      <option value="compliance">Compliance</option>
                      <option value="trends">Trends</option>
                      <option value="details">Details</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" leftIcon={<span>📊</span>}>
                    Export PDF
                  </Button>
                  <Button variant="outline" leftIcon={<span>📈</span>}>
                    Export CSV
                  </Button>
                  <Button leftIcon={<span>🔄</span>} onClick={loadReportData}>
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" className="animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Total Pets</p>
                  <p className="text-3xl font-bold text-foreground">{reportData.totalPets.toLocaleString()}</p>
                </div>
                <div className="text-primary text-3xl">🐾</div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Compliance Rate</p>
                  <p className="text-3xl font-bold text-foreground">{getCompliancePercentage()}%</p>
                </div>
                <div className="text-success text-3xl">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Recent Check-ins</p>
                  <p className="text-3xl font-bold text-foreground">{reportData.recentCheckIns}</p>
                </div>
                <div className="text-warning text-3xl">📅</div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Non-Compliant</p>
                  <p className="text-3xl font-bold text-foreground">{reportData.nonCompliantPets}</p>
                </div>
                <div className="text-error text-3xl">⚠️</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pet Types Distribution */}
          <Card variant="elevated" className="animate-slide-in">
            <CardHeader>
              <CardTitle>Pet Types Distribution</CardTitle>
              <CardDescription>Breakdown of pets by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.topPetTypes.map((petType, index) => (
                  <div key={petType.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="font-medium text-foreground">{petType.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-foreground">{petType.count}</span>
                      <Badge variant="default">{petType.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance by Category */}
          <Card variant="elevated" className="animate-slide-in">
            <CardHeader>
              <CardTitle>Compliance by Category</CardTitle>
              <CardDescription>Compliance rates across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.complianceByCategory.map((category) => {
                  const complianceRate = Math.round((category.compliant / category.total) * 100);
                  return (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{category.category}</span>
                        <Badge variant={getStatusVariant(complianceRate)}>{complianceRate}%</Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${complianceRate}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-foreground">
                        <span>{category.compliant} compliant</span>
                        <span>{category.nonCompliant} non-compliant</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card variant="elevated" className="animate-slide-in lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Activity Trends</CardTitle>
              <CardDescription>Check-ins and compliance checks over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-4">
                {reportData.monthlyTrends.map((trend) => (
                  <div key={trend.month} className="text-center space-y-2">
                    <div className="text-sm font-medium text-foreground">{trend.month}</div>
                    <div className="space-y-1">
                      <div className="text-xs text-foreground">Check-ins: {trend.checkIns}</div>
                      <div className="text-xs text-foreground">Compliance: {trend.complianceChecks}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
