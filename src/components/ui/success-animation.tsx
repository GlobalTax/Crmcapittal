import React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SuccessAnimationProps {
  show?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onComplete?: () => void
}

export function SuccessAnimation({ 
  show = false, 
  size = 'md',
  className,
  onComplete 
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = React.useState(show)

  React.useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!isVisible) return null

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn(
      "inline-flex items-center justify-center rounded-full bg-green-100 text-green-600",
      "animate-scale-in",
      sizeClasses[size],
      className
    )}>
      <Check className={cn(
        "animate-checkmark",
        iconSizes[size]
      )} />
    </div>
  )
}

interface SuccessToastProps {
  message: string
  show?: boolean
  onClose?: () => void
}

export function SuccessToast({ message, show = false, onClose }: SuccessToastProps) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose?.()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg min-w-[300px]">
        <div className="flex items-center space-x-3">
          <SuccessAnimation show={true} size="sm" />
          <span className="text-green-800 font-medium">{message}</span>
        </div>
      </div>
    </div>
  )
}

export function SuccessButton({ 
  children, 
  success = false,
  onClick,
  ...props 
}: {
  children: React.ReactNode
  success?: boolean
  onClick?: () => void
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [showSuccess, setShowSuccess] = React.useState(false)

  React.useEffect(() => {
    if (success) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
        "bg-blue-600 text-white hover:bg-blue-700",
        "transition-all duration-200 hover:scale-105 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        showSuccess && "bg-green-600 hover:bg-green-700"
      )}
      onClick={onClick}
      {...props}
    >
      {showSuccess ? (
        <>
          <SuccessAnimation show={true} size="sm" />
          <span>¡Éxito!</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}