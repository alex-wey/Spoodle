import { render, screen } from '@testing-library/react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import Navigation from '../Navigation'

// Mock the hooks
jest.mock('@/contexts/AuthContext')
jest.mock('next/navigation')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('Navigation', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com'
  }

  const mockSignOut = jest.fn()
  const mockPush = jest.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      signOut: mockSignOut,
      isAuthenticated: true,
      isLoading: false
    })
    mockUsePathname.mockReturnValue('/dashboard')
    mockUseRouter.mockReturnValue({
      push: mockPush
    } as any)
  })

  it('renders navigation elements', () => {
    render(<Navigation />)
    
    // Check for main navigation elements
    expect(screen.getByText('Spoodle 3PI')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search pets, owners, or records...')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('shows hamburger menu button', () => {
    render(<Navigation />)
    
    const hamburgerButton = screen.getByLabelText('Toggle menu')
    expect(hamburgerButton).toBeInTheDocument()
  })

  it('displays user information', () => {
    render(<Navigation />)
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })
})
