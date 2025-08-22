'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface FloatingAction {
  name: string
  icon: string
  href: string
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

const floatingActions: FloatingAction[] = [
  {
    name: 'Search',
    icon: '🔍',
    href: '/search',
    color: 'primary'
  },
  {
    name: 'Check',
    icon: '🏥',
    href: '/compliance/check',
    color: 'success'
  },
  {
    name: 'Register',
    icon: '📝',
    href: '/pets/register',
    color: 'secondary'
  },
  {
    name: 'Reports',
    icon: '📊',
    href: '/reports',
    color: 'warning'
  }
]

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleAction = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  const getColorClasses = (color: FloatingAction['color']) => {
    const colorMap = {
      primary: 'bg-primary hover:bg-primary/90',
      secondary: 'bg-secondary hover:bg-secondary/90',
      success: 'bg-green-600 hover:bg-green-700',
      warning: 'bg-yellow-600 hover:bg-yellow-700',
      error: 'bg-red-600 hover:bg-red-700'
    }
    return colorMap[color]
  }

  return (
    <>
      {/* Floating Action Button - Mobile Only */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        {/* Action Buttons */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 space-y-3">
            {floatingActions.map((action, index) => (
              <div
                key={action.name}
                className="flex items-center space-x-3 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded shadow-sm whitespace-nowrap">
                  {action.name}
                </span>
                <Button
                  onClick={() => handleAction(action.href)}
                  className={`w-12 h-12 rounded-full shadow-lg ${getColorClasses(action.color)} text-white hover:scale-110 transition-all duration-200`}
                  title={action.name}
                >
                  <span className="text-lg">{action.icon}</span>
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Main FAB Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white transition-all duration-200 ${
            isOpen ? 'rotate-45' : 'rotate-0'
          }`}
          aria-label={isOpen ? 'Close menu' : 'Open quick actions'}
        >
          <span className="text-2xl">{isOpen ? '✕' : '+'}</span>
        </Button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
