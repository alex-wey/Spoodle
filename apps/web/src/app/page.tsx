export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Spoodle Clinic Portal</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="hover:text-secondary transition-colors">Dashboard</a>
              <a href="#" className="hover:text-secondary transition-colors">Appointments</a>
              <a href="#" className="hover:text-secondary transition-colors">Patients</a>
              <a href="#" className="hover:text-secondary transition-colors">Records</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Welcome to Your Clinic Dashboard
          </h2>
          <p className="text-muted-foreground text-lg">
            Manage your veterinary practice with Spoodle&apos;s comprehensive pet healthcare platform.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Today&apos;s Appointments</h3>
            <p className="text-3xl font-bold text-primary">12</p>
            <p className="text-sm text-muted-foreground">3 pending confirmations</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">New Records</h3>
            <p className="text-3xl font-bold text-secondary">8</p>
            <p className="text-sm text-muted-foreground">Shared this week</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Active Patients</h3>
            <p className="text-3xl font-bold text-primary">156</p>
            <p className="text-sm text-muted-foreground">This month</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Pending Tasks</h3>
            <p className="text-3xl font-bold text-secondary">5</p>
            <p className="text-sm text-muted-foreground">Require attention</p>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">Key Features</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                View shared pet medical records before appointments
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Manage appointment requests and scheduling
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Update patient information and treatment notes
          </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Export and print pet health reports
          </li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                View Today&apos;s Schedule
              </button>
              <button className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors">
                Search Patient Records
              </button>
              <button className="w-full border border-border text-foreground px-4 py-2 rounded-md hover:bg-muted transition-colors">
                Generate Reports
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
