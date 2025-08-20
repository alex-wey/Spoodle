import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignInPage from '../page'

// Import the SignInForm component directly for testing
import { SignInForm } from '../page'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock the auth context
const mockLogin = jest.fn()
const mockAuthContext = {
  user: null,
  isLoading: false,
  login: mockLogin,
  logout: jest.fn(),
  isAuthenticated: false,
}

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}))

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}))

// Helper function to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the sign-in form', () => {
    renderWithProviders(<SignInForm />)
    
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByText('Access your Spoodle 3PI Partner Portal')).toBeInTheDocument()
  })

  it('has email and password input fields', () => {
    renderWithProviders(<SignInForm />)
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('has a sign-in button', () => {
    renderWithProviders(<SignInForm />)
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('has a link to sign up', () => {
    renderWithProviders(<SignInForm />)
    
    expect(screen.getByText("Don't have an account? Sign up")).toBeInTheDocument()
  })

  it('submits form with correct data', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(undefined)
    
    renderWithProviders(<SignInForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('shows error message when login fails', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValue(new Error('Invalid credentials'))
    
    renderWithProviders(<SignInForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
  })

  it('disables submit button while loading', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    renderWithProviders(<SignInForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Signing in...')).toBeInTheDocument()
  })

  it('requires email and password fields', () => {
    renderWithProviders(<SignInForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  it('has proper form validation attributes', () => {
    renderWithProviders(<SignInForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('autoComplete', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
  })
})
