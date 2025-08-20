import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ResetPasswordPage from '../page'

// Mock fetch
global.fetch = jest.fn()

// Mock useSearchParams
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('?token=test-token&email=test@example.com'),
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders reset password form after token validation', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Token is valid' }),
    } as Response)

    render(<ResetPasswordPage />)
    
    // Initially shows loading
    expect(screen.getByText('Validating reset link...')).toBeInTheDocument()
    
    // After validation, shows the form
    await waitFor(() => {
      expect(screen.getByText('Reset your password')).toBeInTheDocument()
    })
    
    expect(screen.getByPlaceholderText('New password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset password' })).toBeInTheDocument()
  })

  it('shows error for invalid token', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid reset token' }),
    } as Response)

    render(<ResetPasswordPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid Reset Link')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Invalid or expired reset link')).toBeInTheDocument()
    expect(screen.getByText('Request a new reset link')).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Token is valid' }),
    } as Response)

    render(<ResetPasswordPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Reset your password')).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByPlaceholderText('New password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password')
    const submitButton = screen.getByRole('button', { name: 'Reset password' })
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
  })

  it('shows error for short password', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Token is valid' }),
    } as Response)

    render(<ResetPasswordPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Reset your password')).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByPlaceholderText('New password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password')
    const submitButton = screen.getByRole('button', { name: 'Reset password' })
    
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument()
    })
  })

  it('handles successful password reset', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Token is valid' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset successfully' }),
      } as Response)

    render(<ResetPasswordPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Reset your password')).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByPlaceholderText('New password')
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password')
    const submitButton = screen.getByRole('button', { name: 'Reset password' })
    
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Password reset successfully! You can now sign in with your new password.')).toBeInTheDocument()
    })
    
    expect(mockFetch).toHaveBeenCalledWith('/api/password-reset/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token: 'test-token', 
        email: 'test@example.com', 
        password: 'newpassword123' 
      }),
    })
  })

  it('has correct navigation links', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Token is valid' }),
    } as Response)

    render(<ResetPasswordPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Reset your password')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Back to sign in')).toBeInTheDocument()
  })
})
