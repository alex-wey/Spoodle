import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignUpPage from '../page'

// Mock the auth context
const mockSignUp = jest.fn()
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
  }),
}))

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('SignUpPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the sign-up form', () => {
    render(<SignUpPage />)
    
    expect(screen.getByText('Create Your Partner Account')).toBeInTheDocument()
    expect(screen.getByText('Join Spoodle\'s network of trusted pet care partners')).toBeInTheDocument()
  })

  it('has all required input fields', () => {
    render(<SignUpPage />)
    
    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/organization type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument() // First password field
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('has a sign-up button', () => {
    render(<SignUpPage />)
    
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('has a link to sign in', () => {
    render(<SignUpPage />)
    
    expect(screen.getByText('Already have an account? Sign in')).toBeInTheDocument()
  })

  it('submits form with correct data', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue(undefined)
    
    render(<SignUpPage />)
    
    const orgNameInput = screen.getByLabelText(/organization name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i) // First password field
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const orgTypeSelect = screen.getByLabelText(/organization type/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    await user.type(orgNameInput, 'Test Clinic')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.selectOptions(orgTypeSelect, 'VETERINARY_CLINIC')
    await user.click(submitButton)
    
    expect(mockSignUp).toHaveBeenCalledWith({
      organizationName: 'Test Clinic',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      organizationType: 'VETERINARY_CLINIC',
    })
  })

  it('shows error message when passwords do not match', async () => {
    const user = userEvent.setup()
    
    render(<SignUpPage />)
    
    const passwordInput = screen.getByLabelText(/^password/i) // First password field
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'differentpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('shows error message when signup fails', async () => {
    const user = userEvent.setup()
    mockSignUp.mockRejectedValue(new Error('Email already exists'))
    
    render(<SignUpPage />)
    
    const orgNameInput = screen.getByLabelText(/organization name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i) // First password field
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const orgTypeSelect = screen.getByLabelText(/organization type/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    await user.type(orgNameInput, 'Test Clinic')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.selectOptions(orgTypeSelect, 'VETERINARY_CLINIC')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  it('disables submit button while loading', async () => {
    const user = userEvent.setup()
    mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<SignUpPage />)
    
    const orgNameInput = screen.getByLabelText(/organization name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i) // First password field
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const orgTypeSelect = screen.getByLabelText(/organization type/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    await user.type(orgNameInput, 'Test Clinic')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.selectOptions(orgTypeSelect, 'VETERINARY_CLINIC')
    await user.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Creating Account...')).toBeInTheDocument()
  })

  it('requires all fields to be filled', () => {
    render(<SignUpPage />)
    
    const orgNameInput = screen.getByLabelText(/organization name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i) // First password field
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const orgTypeSelect = screen.getByLabelText(/organization type/i)
    
    expect(orgNameInput).toBeRequired()
    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
    expect(confirmPasswordInput).toBeRequired()
    expect(orgTypeSelect).toBeRequired()
  })

  it('has proper form validation attributes', () => {
    render(<SignUpPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i) // First password field
    
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('minLength', '8')
  })

  it('has organization type options', () => {
    render(<SignUpPage />)
    
    const orgTypeSelect = screen.getByLabelText(/organization type/i)
    expect(orgTypeSelect).toBeInTheDocument()
    
    // Check for common organization types
    expect(screen.getByText('Veterinary Clinic')).toBeInTheDocument()
    expect(screen.getByText('Pet Store')).toBeInTheDocument()
    expect(screen.getByText('Animal Shelter')).toBeInTheDocument()
  })
})
