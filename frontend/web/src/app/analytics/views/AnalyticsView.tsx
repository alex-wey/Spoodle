'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Download, TrendingUp, TrendingDown, Users, Calendar, DollarSign, Clock } from "lucide-react";

const revenueData = [
  { month: "Jan", revenue: 45000, appointments: 120 },
  { month: "Feb", revenue: 52000, appointments: 135 },
  { month: "Mar", revenue: 48000, appointments: 128 },
  { month: "Apr", revenue: 58000, appointments: 150 },
  { month: "May", revenue: 62000, appointments: 165 },
  { month: "Jun", revenue: 59000, appointments: 158 },
];

const petOwnerData = [
  { name: "Sarah Johnson", revenue: 2400, appointments: 8, type: "Premium" },
  { name: "Michael Chen", revenue: 1800, appointments: 6, type: "Regular" },
  { name: "Emma Wilson", revenue: 3200, appointments: 12, type: "Premium" },
  { name: "David Brown", revenue: 950, appointments: 3, type: "New" },
  { name: "Lisa Garcia", revenue: 1600, appointments: 5, type: "Regular" },
];

const utilizationData = [
  { week: "Week 1", dvm: 85, staff: 78 },
  { week: "Week 2", dvm: 92, staff: 85 },
  { week: "Week 3", dvm: 88, staff: 82 },
  { week: "Week 4", dvm: 95, staff: 88 },
];

const missedAppointments = [
  { name: "John Smith", missed: 3, lastAppointment: "2024-01-15", petName: "Buddy" },
  { name: "Anna Taylor", missed: 2, lastAppointment: "2024-02-03", petName: "Whiskers" },
  { name: "Robert Davis", missed: 4, lastAppointment: "2024-01-22", petName: "Max" },
];

const customerTypeData = [
  { name: "New Customers", value: 35, color: "#8884d8" },
  { name: "Recurring", value: 65, color: "#82ca9d" },
];

const servicesData = [
  { service: "Wellness Exams", count: 145, revenue: 21750 },
  { service: "Vaccinations", count: 98, revenue: 9800 },
  { service: "Surgery", count: 23, revenue: 18400 },
  { service: "Dental Care", count: 67, revenue: 13400 },
  { service: "Emergency Care", count: 34, revenue: 17000 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  appointments: {
    label: "Appointments",
    color: "hsl(var(--secondary))",
  },
  dvm: {
    label: "DVM Utilization",
    color: "hsl(var(--primary))",
  },
  staff: {
    label: "Staff Utilization",
    color: "hsl(var(--secondary))",
  },
};

export default function AnalyticsView() {
  const [dateRange, setDateRange] = useState("last-6-months");
  
  const exportReport = (type: string) => {
    // Mock export functionality
    const filename = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
    console.log(`Exporting ${filename}`);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive clinic performance analysis and metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => exportReport('comprehensive')}>
            <Download className="mr-2 h-4 w-4" />
            Export All Reports
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue/Appointment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$374</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DVM Utilization</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">90%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">83%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +3% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missed Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              -15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue & Appointments</TabsTrigger>
          <TabsTrigger value="customers">Pet Owners</TabsTrigger>
          <TabsTrigger value="utilization">Staff Utilization</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue and appointment volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Distribution</CardTitle>
                <CardDescription>New vs recurring customers</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent as number * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {customerTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Pet Owners by Revenue</CardTitle>
                <CardDescription>Ranked by total revenue and appointment frequency</CardDescription>
              </div>
              <Button onClick={() => exportReport('pet-owners')}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {petOwnerData.map((owner, index) => (
                  <div key={owner.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{owner.name}</p>
                        <p className="text-sm text-muted-foreground">{owner.appointments} appointments</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={owner.type === 'Premium' ? 'default' : owner.type === 'Regular' ? 'secondary' : 'outline'}>
                        {owner.type}
                      </Badge>
                      <div className="text-right">
                        <p className="font-medium">${owner.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Missed Appointments</CardTitle>
                <CardDescription>Pet owners who have missed multiple appointments</CardDescription>
              </div>
              <Button onClick={() => exportReport('missed-appointments')}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {missedAppointments.map((owner) => (
                  <div key={owner.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{owner.name}</p>
                      <p className="text-sm text-muted-foreground">Pet: {owner.petName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-destructive">{owner.missed} missed</p>
                      <p className="text-sm text-muted-foreground">Last: {owner.lastAppointment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Utilization Trends</CardTitle>
              <CardDescription>DVM and staff utilization over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={utilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="dvm" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="DVM Utilization"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="staff" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      name="Staff Utilization"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Service Performance</CardTitle>
                <CardDescription>Revenue and volume by service type</CardDescription>
              </div>
              <Button onClick={() => exportReport('services')}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servicesData.map((service) => (
                  <div key={service.service} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{service.service}</p>
                      <p className="text-sm text-muted-foreground">{service.count} appointments</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${service.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        ${Math.round(service.revenue / service.count)}/avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
