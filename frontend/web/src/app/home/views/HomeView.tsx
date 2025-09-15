'use client';

import { useSessionContext } from "@/components/SessionContext";
import UserButton from "@/components/clerk/UserButton";

export default function HomeView() {
  const { user, organization, hasOrganization, isLoading } = useSessionContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Spoodle</h1>
              {hasOrganization && (
                <div className="ml-4 pl-4 border-l border-gray-300">
                  <span className="text-sm text-gray-500">Clinic Portal</span>
                  <p className="text-lg font-semibold text-gray-900">{organization?.name}</p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Appointments</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Patients</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Records</a>
              </nav>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.firstName || user?.fullName || 'Doctor'}! 👋
                </h2>
                <p className="text-gray-600 mb-4">
                  {hasOrganization 
                    ? `Ready to manage ${organization?.name} today?`
                    : "Ready to manage your veterinary practice today?"
                  }
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Signed in as {user?.email}
                  </div>
                  {hasOrganization && (
                    <div className="flex items-center text-gray-500">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Organization: {organization?.name}
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Today&apos;s Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Status */}
        {!hasOrganization && (
          <div className="mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    No Organization Selected
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Join or create an organization to access clinic management features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Today&apos;s Appointments</h3>
            <p className="text-3xl font-bold text-blue-600">12</p>
            <p className="text-sm text-gray-500">3 pending confirmations</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">New Records</h3>
            <p className="text-3xl font-bold text-green-600">8</p>
            <p className="text-sm text-gray-500">Shared this week</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Patients</h3>
            <p className="text-3xl font-bold text-blue-600">156</p>
            <p className="text-sm text-gray-500">This month</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Tasks</h3>
            <p className="text-3xl font-bold text-orange-600">5</p>
            <p className="text-sm text-gray-500">Require attention</p>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                View shared pet medical records before appointments
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Manage appointment requests and scheduling
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Update patient information and treatment notes
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Export and print pet health reports
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                View Today&apos;s Schedule
              </button>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                Search Patient Records
              </button>
              <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                Generate Reports
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}