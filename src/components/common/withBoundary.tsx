import React from 'react'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

// Simple HOC to wrap any component with an ErrorBoundary and context
export function withBoundary<T extends object>(
  Component: React.ComponentType<T>,
  context: string,
) {
  return function WithBoundary(props: T) {
    return (
      <ErrorBoundary context={context}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
