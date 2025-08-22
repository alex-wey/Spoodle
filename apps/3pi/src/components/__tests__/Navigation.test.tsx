import { render, screen } from '@testing-library/react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import Navigation from '../Navigation'

jest.mock('@/contexts/AuthContext')
jest.mock('next/navigation')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('Navigation', () => {
  const mockUser = { 
    id: '1', 
    name: 'Test User', 
    email: 'test@example.com', 
    role: 'user' 
  }
  const mockLogout = jest.fn()
  const mockPush = jest.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({ 
      user: mockUser, 
      logout: mockLogout, 
      isAuthenticated: true, 
      isLoading: false,
      login: jest.fn()
    })
    mockUsePathname.mockReturnValue('/dashboard')
    mockUseRouter.mockReturnValue({ push: mockPush } as any)
  })

  it('renders navigation elements', () => {
    render(<Navigation />)
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
