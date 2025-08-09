'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Spoodle 3PI Portal</h1>
              <span className="ml-4 px-2 py-1 bg-primary-foreground/20 rounded-full text-sm">
                Partner Portal
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/auth/signin" className="hover:text-secondary transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="hover:text-secondary transition-colors">
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Welcome to Your Partner Dashboard
          </h2>
          <p className="text-muted-foreground text-lg">
            Manage pet records, compliance checks, and referral programs with Spoodle&apos;s Third Party Interface.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Today&apos;s Check-ins</h3>
            <p className="text-3xl font-bold text-primary">8</p>
            <p className="text-sm text-muted-foreground">Compliance verifications</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Pet Records</h3>
            <p className="text-3xl font-bold text-secondary">24</p>
            <p className="text-sm text-muted-foreground">Accessed this week</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Referral Earnings</h3>
            <p className="text-3xl font-bold text-primary">$1,245</p>
            <p className="text-sm text-muted-foreground">This month</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Pending Requests</h3>
            <p className="text-3xl font-bold text-secondary">3</p>
            <p className="text-sm text-muted-foreground">From pet owners</p>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/auth/signin" className="block w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-center">
                Sign In to Portal
              </Link>
              <Link href="/auth/signup" className="block w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors text-center">
                Create Partner Account
              </Link>
              <Link href="/verification" className="block w-full border border-border text-foreground px-4 py-2 rounded-md hover:bg-muted transition-colors text-center">
                Learn About Verification
              </Link>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Compliance check completed for Max (Golden Retriever)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                New pet record shared by owner - Luna (Siamese Cat)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Referral code scanned - 5 new signups this week
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                Staff member invited - Sarah Johnson (Admin)
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
