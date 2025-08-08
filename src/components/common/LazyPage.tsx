
import * as React from 'react'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'

interface LazyPageProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const LazyPage = ({ 
  children, 
  fallback = <LoadingSkeleton type="table-row" count={3} /> 
}: LazyPageProps) => {
  return (
    <React.Suspense fallback={fallback}>
      {children}
    </React.Suspense>
  )
}

// Higher-order component for lazy loading pages
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  const LazyComponent = React.lazy(() => 
    Promise.resolve({ default: Component })
  )

  return React.forwardRef<React.ComponentRef<React.ComponentType<P>>, P>((props, ref) => (
    <LazyPage>
      <LazyComponent {...props} ref={ref} />
    </LazyPage>
  ))
}
