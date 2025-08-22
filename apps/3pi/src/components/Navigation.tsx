'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false) // Start collapsed
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Pets', href: '/pets', icon: '🐾' },
    { name: 'Reports', href: '/reports', icon: '📈' },
    { name: 'Compliance', href: '/compliance', icon: '✅' },
    { name: 'Search', href: '/search', icon: '🔍' },
    { name: 'Verification', href: '/verification', icon: '🔐' },
  ]

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    return paths.map((path, index) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1),
      href: '/' + paths.slice(0, index + 1).join('/'),
      isLast: index === paths.length - 1
    }))
  }

  const handleLogout = async () => {
    try {
      await logout()
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const toggleMenu = () => {
    console.log('Hamburger menu clicked! Current state:', isMenuOpen)
    setIsMenuOpen(prev => !prev)
    console.log('New state will be:', !isMenuOpen)
  }

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-backdrop-fade-in"
          onClick={() => {
            console.log('Overlay clicked, closing menu')
            setIsMenuOpen(false)
          }}
        />
      )}

      {/* Floating Hamburger Menu Button - Fixed position on all screens */}
      <button
        onClick={toggleMenu}
        className={`fixed top-8 left-8 w-[50px] h-[50px] bg-white border-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 z-50 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 active:scale-95 cursor-pointer ${
          isMenuOpen 
            ? 'border-primary bg-primary/5 shadow-primary/20' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        aria-label="Toggle navigation menu"
        style={{
          top: '32px', // 50px from top
          left: '32px', // 50px from left
          width: '50px',
          height: '50px'
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onTouchStart={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {isMenuOpen ? (
          // X icon when menu is open
          <svg className="w-6 h-6 text-primary transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Hamburger icon when menu is closed
          <svg className="w-6 h-6 text-gray-700 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Sidebar - Now controlled by hamburger menu on all screen sizes */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-40 transform transition-all duration-300 ease-in-out ${
        isMenuOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full shadow-none'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200" style={{ marginTop: '50px' }}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-lg text-gray-900">Spoodle 3PI</span>
            </div>
            <button
              onClick={() => {
                console.log('Close button clicked')
                setIsMenuOpen(false)
              }}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-2" style={{ marginTop: '100px' }}>
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                }`}
                onClick={() => {
                  console.log('Navigation item clicked:', item.name)
                  // Only auto-close on mobile
                  if (window.innerWidth < 1024) {
                    setIsMenuOpen(false)
                  }
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Now adjusts based on sidebar state */}
      <div className={`transition-all duration-300 ease-in-out ${
        isMenuOpen ? 'lg:pl-64' : 'lg:pl-0'
      }`}>
        {/* Breadcrumb Navigation */}
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <a href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">
                    Home
                  </a>
                </li>
                {getBreadcrumbs().map((breadcrumb, index) => (
                  <li key={breadcrumb.href} className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {breadcrumb.isLast ? (
                      <span className="text-gray-900 font-medium">{breadcrumb.name}</span>
                    ) : (
                      <a href={breadcrumb.href} className="text-gray-500 hover:text-gray-700 transition-colors">
                        {breadcrumb.name}
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
        
        {/* Sidebar State Indicator (subtle) */}
        <div className={`fixed top-20 left-4 transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
        }`}>
          <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md shadow-sm">
            Sidebar Open
          </div>
        </div>
      </div>
    </>
  )
}
