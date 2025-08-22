'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-success text-success-foreground border-success/20'
      case 'error':
        return 'bg-error text-error-foreground border-error/20'
      case 'info':
        return 'bg-primary text-primary-foreground border-primary/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-lg ${getTypeStyles()}`}>
        <span className="text-lg">{getIcon()}</span>
        <span className="font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="ml-2 text-current hover:opacity-70 transition-opacity"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// Toast context for managing multiple toasts
interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void
}

export const useToast = (): ToastContextType => {
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info'
    duration: number
  }>>([])

  const showToast = (message: string, type: 'success' | 'error' | 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type, duration }])
  }

  return {
    showToast
  }
}
