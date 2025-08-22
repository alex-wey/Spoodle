'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface NavigationItem {
  name: string
  href: string
  icon: string
  description?: string
  badge?: string
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    description: 'Overview and quick actions'
  },
  {
    name: 'Pets',
    href: '/pets',
    icon: '🐾',
    description: 'Pet management and records',
    children: [
      { name: 'Search Pets', href: '/search', icon: '🔍' },
      { name: 'Register Pet', href: '/pets/register', icon: '📝' },
      { name: 'Pet Records', href: '/pets', icon: '📋' }
    ]
  },
  {
    name: 'Compliance',
    href: '/compliance',
    icon: '🏥',
    description: 'Health and compliance checks',
    children: [
      { name: 'Start Check', href: '/compliance/check', icon: '✅' },
      { name: 'Check History', href: '/compliance/history', icon: '📚' }
    ]
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: '📈',
    description: 'Analytics and reporting',
    badge: 'New'
  },
  {
    name: 'Verification',
    href: '/verification',
    icon: '🔐',
    description: 'Identity and document verification'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: '⚙️',
    description: 'Account and organization settings'
  }
]

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.navigation-menu')) {
        setIsMenuOpen(false)
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ name: 'Home', href: '/' }]
    
    let currentPath = ''
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      const item = navigationItems.find(nav => 
        nav.href === currentPath || 
        nav.children?.some(child => child.href === currentPath)
      )
      
      if (item) {
        breadcrumbs.push({ name: item.name, href: currentPath })
      } else {
        // Handle dynamic routes like [id]
        const parentPath = paths.slice(0, index).join('/')
        const parent = navigationItems.find(nav => 
          nav.href === `/${parentPath}` || 
          nav.children?.some(child => child.href === `/${parentPath}`)
        )
        
        if (parent) {
          breadcrumbs.push({ name: path.charAt(0).toUpperCase() + path.slice(1), href: currentPath })
        }
      }
    })
    
    return breadcrumbs
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Hamburger */}
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl">🐾</span>
                <span className="text-xl font-bold text-gray-900">Spoodle 3PI</span>
              </Link>
            </div>

            {/* Center - Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search pets, owners, or records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                </div>
              </form>
            </div>

            {/* Right side - User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors relative">
                <span className="text-lg">🔔</span>
                <Badge variant="error" size="sm" className="absolute -top-1 -right-1">
                  3
                </Badge>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-gray-400">▼</span>
                </button>
                
                {/* User Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    👤 Profile
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    ⚙️ Settings
                  </Link>
                  <button
                    onClick={signOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb Navigation */}
      {pathname !== '/' && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {getBreadcrumbs().map((breadcrumb, index) => (
                  <li key={breadcrumb.href} className="flex items-center">
                    {index > 0 && (
                      <span className="mx-2 text-gray-400">/</span>
                    )}
                    {index === getBreadcrumbs().length - 1 ? (
                      <span className="text-sm font-medium text-gray-900">
                        {breadcrumb.name}
                      </span>
                    ) : (
                      <Link
                        href={breadcrumb.href}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {breadcrumb.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      )}

      {/* Sidebar Navigation Menu */}
      <div className={`fixed inset-0 z-40 lg:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMenuOpen(false)} />
        
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-xl">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {/* Close button */}
            <div className="flex items-center justify-between px-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-4 space-y-2">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge variant="error" size="sm" className="ml-2">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                  
                  {/* Sub-items */}
                  {item.children && isActive(item.href) && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`group flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                            isActive(child.href)
                              ? 'bg-primary/10 text-primary'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <span className="mr-3">{child.icon}</span>
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Bottom section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-gray-50 lg:pt-5 lg:pb-4">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-2">
            {navigationItems.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="error" size="sm" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
                
                {/* Sub-items */}
                {item.children && isActive(item.href) && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`group flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                          isActive(child.href)
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span className="mr-3">{child.icon}</span>
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="lg:pl-64">
        {/* Content goes here */}
      </div>
    </>
  )
}
