import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ForgotPasswordPage from '../page'

// Mock fetch
global.fetch = jest.fn()

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders forgot password form', () => {
    render(<ForgotPasswordPage />)
    
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument()
  })

  it('shows validation error for empty email', async () => {
    render(<ForgotPasswordPage />)
    
    const submitButton = screen.getByRole('button', { name: 'Send reset link' })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('')).toBeInTheDocument()
    })
  })

  it('handles successful password reset request', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Reset email sent' }),
    } as Response)

    render(<ForgotPasswordPage />)
    
    const emailInput = screen.getByPlaceholderText('Email address')
    const submitButton = screen.getByRole('button', { name: 'Send reset link' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Password reset email sent! Check your inbox for instructions.')).toBeInTheDocument()
    })
    
    expect(mockFetch).toHaveBeenCalledWith('/api/password-reset/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    })
  })

  it('handles API error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'User not found' }),
    } as Response)

    render(<ForgotPasswordPage />)
    
    const emailInput = screen.getByPlaceholderText('Email address')
    const submitButton = screen.getByRole('button', { name: 'Send reset link' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<ForgotPasswordPage />)
    
    const emailInput = screen.getByPlaceholderText('Email address')
    const submitButton = screen.getByRole('button', { name: 'Send reset link' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    
    expect(screen.getByRole('button', { name: 'Sending...' })).toBeInTheDocument()
  })

  it('has correct navigation links', () => {
    render(<ForgotPasswordPage />)
    
    expect(screen.getByText('Back to sign in')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })
})
