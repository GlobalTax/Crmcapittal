
import { Component, ErrorInfo, ReactNode, useState, useCallback, useEffect } from 'react'
import { ErrorFallback } from './ErrorFallback'
import { toast as notify } from 'sonner'
import { secureLogger } from '@/utils/secureLogger'

interface Props {
  children: ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void; context?: string }>
  context?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  private hasNotified = false

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Secure logging (sanitized) + security event
    secureLogger.error('UI error boundary captured an error', {
      context: this.props.context || 'general',
      route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      componentStack: errorInfo.componentStack,
    }, error)

    secureLogger.security('ui_error', 'medium', {
      context: this.props.context || 'general',
      route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    })

    // User-friendly toast (only once)
    if (!this.hasNotified) {
      this.hasNotified = true
      notify.error('Ha ocurrido un error inesperado. Hemos registrado el incidente.')
    }
  }

  resetError = () => {
    this.hasNotified = false
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorFallback

      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError}
          context={this.props.context}
        />
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null)

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  const captureError = useCallback((error: Error) => {
    setError(error)
  }, [])

  useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}
