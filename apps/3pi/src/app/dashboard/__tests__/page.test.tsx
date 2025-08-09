import React from 'react'
import { render, screen } from '@testing-library/react'
import DashboardPage from '../page'

// Mock the auth context
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'STAFF',
  organizationId: 'org1',
  organization: {
    id: 'org1',
    name: 'Test Clinic',
    type: 'VETERINARY_CLINIC',
    status: 'PENDING',
  },
}

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
  }),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('DashboardPage', () => {
  it('renders the dashboard title', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Spoodle 3PI Portal')).toBeInTheDocument()
  })

  it('displays user information', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument()
    // Check for organization name in the header badge
    expect(screen.getByText('Test Clinic', { selector: 'span.ml-4' })).toBeInTheDocument()
  })

  it('shows user role', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('staff')).toBeInTheDocument()
  })

  it('displays organization information', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Organization:')).toBeInTheDocument()
    // Check for organization name in the account status section
    expect(screen.getByText('Test Clinic', { selector: 'span.font-medium' })).toBeInTheDocument()
  })

  it('has navigation links', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Search Pet Records')).toBeInTheDocument()
    expect(screen.getByText('Start Compliance Check')).toBeInTheDocument()
    expect(screen.getByText('Organization Verification')).toBeInTheDocument()
  })

  it('renders quick stats section', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText("Today's Check-ins")).toBeInTheDocument()
    expect(screen.getByText('Pet Records')).toBeInTheDocument()
    expect(screen.getByText('Referral Earnings')).toBeInTheDocument()
    expect(screen.getByText('Pending Requests')).toBeInTheDocument()
  })

  it('renders quick actions section', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('has proper layout structure', () => {
    render(<DashboardPage />)
    
    // Check that the page has a main container
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    
    // Check for header section
    expect(screen.getByText('Spoodle 3PI Portal')).toBeInTheDocument()
    
    // Check for content sections
    expect(screen.getByText('Welcome to Your Partner Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('Account Status')).toBeInTheDocument()
  })
})
