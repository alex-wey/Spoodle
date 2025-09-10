'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name?: string
  role: string
  organizationId?: string
  organization?: any
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Development bypass - set to true to skip authentication
  const DEV_BYPASS_AUTH = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'

  useEffect(() => {
    if (DEV_BYPASS_AUTH) {
      // Mock user for development
      const mockUser: User = {
        id: 'dev-user-123',
        email: 'dev@spoodle.com',
        name: 'Development User',
        role: 'ADMIN',
        organizationId: 'dev-org-123',
        organization: {
          id: 'dev-org-123',
          name: 'Development Organization',
          type: 'VETERINARY_CLINIC',
          status: 'VERIFIED'
        }
      }
      setUser(mockUser)
      setIsLoading(false)
      return
    }

    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    if (session?.user) {
      // Ensure the user object has all required properties
      const userData: User = {
        id: session.user.id || '',
        email: session.user.email || '',
        name: session.user.name,
        role: session.user.role || 'user',
        organizationId: session.user.organizationId,
        organization: session.user.organization
      }
      setUser(userData)
    } else {
      setUser(null)
    }

    setIsLoading(false)
  }, [session, status, DEV_BYPASS_AUTH])

  const login = async (email: string, password: string) => {
    if (DEV_BYPASS_AUTH) {
      // In development bypass mode, just redirect to dashboard
      router.push('/dashboard')
      return
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    if (DEV_BYPASS_AUTH) {
      // In development bypass mode, just redirect to home
      router.push('/')
      return
    }

    await signOut({ redirect: false })
    router.push('/auth/signin')
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
