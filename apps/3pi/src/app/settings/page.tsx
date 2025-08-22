'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Input, Skeleton } from '@/components';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'system' | 'integrations'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    organization: user?.organization?.name || '',
    role: user?.role || 'user'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    complianceAlerts: true,
    marketingEmails: false,
    weeklyReports: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true
  });

  const [systemSettings, setSystemSettings] = useState({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });

  const handleSave = async (section: string) => {
    setIsLoading(true);
    setSaveStatus('saving');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const getSaveButtonVariant = () => {
    switch (saveStatus) {
      case 'saving':
        return 'outline';
      case 'saved':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved!';
      case 'error':
        return 'Error!';
      default:
        return 'Save Changes';
    }
  };

  const renderProfile = () => (
    <div className="space-y-6 animate-fade-in">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="Enter your email"
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="Enter your phone number"
                type="tel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Organization</label>
              <Input
                value={profileData.organization}
                onChange={(e) => setProfileData({ ...profileData, organization: e.target.value })}
                placeholder="Enter organization name"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" size="lg">
                {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Contact administrator to change role
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSave('profile')}
              disabled={isLoading}
              variant={getSaveButtonVariant()}
              leftIcon={saveStatus === 'saved' ? <span>✅</span> : saveStatus === 'error' ? <span>❌</span> : undefined}
            >
              {getSaveButtonText()}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>
            Your current account information and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">Active</div>
              <p className="text-sm text-muted-foreground">Account Status</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-success mb-1">Verified</div>
              <p className="text-sm text-muted-foreground">Email Status</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-info mb-1">Today</div>
              <p className="text-sm text-muted-foreground">Last Login</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6 animate-fade-in">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how and when you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium">Communication Channels</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: e.target.checked
                  })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span>Email Notifications</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notificationSettings.smsNotifications}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    smsNotifications: e.target.checked
                  })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span>SMS Notifications</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Notification Types</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notificationSettings.appointmentReminders}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    appointmentReminders: e.target.checked
                  })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span>Appointment Reminders</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notificationSettings.complianceAlerts}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    complianceAlerts: e.target.checked
                  })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span>Compliance Alerts</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notificationSettings.weeklyReports}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    weeklyReports: e.target.checked
                  })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span>Weekly Reports</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notificationSettings.marketingEmails}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    marketingEmails: e.target.checked
                  })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span>Marketing Emails</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSave('notifications')}
              disabled={isLoading}
              variant={getSaveButtonVariant()}
              leftIcon={saveStatus === 'saved' ? <span>✅</span> : saveStatus === 'error' ? <span>❌</span> : undefined}
            >
              {getSaveButtonText()}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6 animate-fade-in">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Manage your account security and authentication preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium">Two-Factor Authentication</h4>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button
                variant={securitySettings.twoFactorAuth ? 'outline' : 'primary'}
                onClick={() => setSecuritySettings({
                  ...securitySettings,
                  twoFactorAuth: !securitySettings.twoFactorAuth
                })}
              >
                {securitySettings.twoFactorAuth ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Session Management</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                <select
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    sessionTimeout: parseInt(e.target.value)
                  })}
                  className="w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password Expiry (days)</label>
                <select
                  value={securitySettings.passwordExpiry}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    passwordExpiry: parseInt(e.target.value)
                  })}
                  className="w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Security Alerts</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={securitySettings.loginNotifications}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    loginNotifications: e.target.checked
                  })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span>Notify on new login attempts</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSave('security')}
              disabled={isLoading}
              variant={getSaveButtonVariant()}
              leftIcon={saveStatus === 'saved' ? <span>✅</span> : saveStatus === 'error' ? <span>❌</span> : undefined}
            >
              {getSaveButtonText()}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Password Management</CardTitle>
          <CardDescription>
            Change your password and manage password requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" leftIcon={<span>🔒</span>}>
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6 animate-fade-in">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Display & Language</CardTitle>
          <CardDescription>
            Customize how the application looks and behaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={systemSettings.theme}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  theme: e.target.value
                })}
                className="w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={systemSettings.language}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  language: e.target.value
                })}
                className="w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <select
                value={systemSettings.timezone}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  timezone: e.target.value
                })}
                className="w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date Format</label>
              <select
                value={systemSettings.dateFormat}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  dateFormat: e.target.value
                })}
                className="w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => handleSave('system')}
              disabled={isLoading}
              variant={getSaveButtonVariant()}
              leftIcon={saveStatus === 'saved' ? <span>✅</span> : saveStatus === 'error' ? <span>❌</span> : undefined}
            >
              {getSaveButtonText()}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>
            Manage your data and privacy preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Data Export</p>
              <p className="text-sm text-muted-foreground">
                Download a copy of your data
              </p>
            </div>
            <Button variant="outline" leftIcon={<span>📥</span>}>
              Export Data
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Account Deletion</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="error" leftIcon={<span>🗑️</span>}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6 animate-fade-in">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Third-Party Integrations</CardTitle>
          <CardDescription>
            Connect external services and applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                G
              </div>
              <div>
                <p className="font-medium">Google Calendar</p>
                <p className="text-sm text-muted-foreground">
                  Sync appointments and reminders
                </p>
              </div>
            </div>
            <Button variant="outline" leftIcon={<span>🔗</span>}>
              Connect
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                S
              </div>
              <div>
                <p className="font-medium">Slack</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications in Slack
                </p>
              </div>
            </div>
            <Button variant="outline" leftIcon={<span>🔗</span>}>
              Connect
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                Z
              </div>
              <div>
                <p className="font-medium">Zapier</p>
                <p className="text-sm text-muted-foreground">
                  Automate workflows with other apps
                </p>
              </div>
            </div>
            <Button variant="outline" leftIcon={<span>🔗</span>}>
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>
            Manage API keys and access tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">API Key</p>
              <p className="text-sm text-muted-foreground">
                Use this key to access the Spoodle API
              </p>
            </div>
            <Button variant="outline" leftIcon={<span>🔑</span>}>
              Generate New Key
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Webhook URL</p>
              <p className="text-sm text-muted-foreground">
                Configure webhooks for real-time updates
              </p>
            </div>
            <Button variant="outline" leftIcon={<span>⚙️</span>}>
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div className="text-error text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You must be logged in to access settings.</p>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and system configuration
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'profile', label: 'Profile', icon: '👤' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' },
                { id: 'security', label: 'Security', icon: '🔒' },
                { id: 'system', label: 'System', icon: '⚙️' },
                { id: 'integrations', label: 'Integrations', icon: '🔗' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'security' && renderSecurity()}
        {activeTab === 'system' && renderSystem()}
        {activeTab === 'integrations' && renderIntegrations()}
      </div>
    </div>
  );
}
