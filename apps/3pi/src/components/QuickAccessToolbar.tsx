'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface QuickAction {
  name: string
  icon: string
  href: string
  description: string
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  badge?: string
}

const quickActions: QuickAction[] = [
  {
    name: 'Search Pets',
    icon: '🔍',
    href: '/search',
    description: 'Find pet records quickly',
    color: 'primary'
  },
  {
    name: 'Compliance Check',
    icon: '🏥',
    href: '/compliance/check',
    description: 'Start a new health check',
    color: 'success',
    badge: 'Hot'
  },
  {
    name: 'Register Pet',
    icon: '📝',
    href: '/pets/register',
    description: 'Add new pet to system',
    color: 'secondary'
  },
  {
    name: 'View Reports',
    icon: '📊',
    href: '/reports',
    description: 'Analytics and insights',
    color: 'warning'
  },
  {
    name: 'Verification',
    icon: '🔐',
    href: '/verification',
    description: 'Verify documents',
    color: 'error'
  }
]

export default function QuickAccessToolbar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()

  const handleAction = (href: string) => {
    router.push(href)
  }

  const getColorClasses = (color: QuickAction['color']) => {
    const colorMap = {
      primary: 'bg-primary hover:bg-primary/90 text-white',
      secondary: 'bg-secondary hover:bg-secondary/90 text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      error: 'bg-red-600 hover:bg-red-700 text-white'
    }
    return colorMap[color]
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 mr-4">Quick Actions:</span>
            {quickActions.map((action) => (
              <Button
                key={action.name}
                onClick={() => handleAction(action.href)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 hover:scale-105 ${getColorClasses(action.color)}`}
                title={action.description}
              >
                <span className="mr-2">{action.icon}</span>
                <span className="hidden sm:inline">{action.name}</span>
                {action.badge && (
                  <Badge variant="error" size="sm" className="ml-2">
                    {action.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title={isExpanded ? 'Collapse toolbar' : 'Expand toolbar'}
          >
            <span className="text-lg">{isExpanded ? '▼' : '▲'}</span>
          </button>
        </div>

        {/* Expanded Section */}
        {isExpanded && (
          <div className="border-t border-gray-200 pt-4 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <div
                  key={action.name}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleAction(action.href)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{action.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{action.name}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
