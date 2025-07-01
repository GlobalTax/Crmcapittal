
import React, { Suspense } from 'react'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'

interface LazyPageProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const LazyPage: React.FC<LazyPageProps> = ({ 
  children, 
  fallback = <LoadingSkeleton viewMode="table" count={3} /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}

// Higher-order component for lazy loading pages
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  const LazyComponent = React.lazy(() => 
    Promise.resolve({ default: Component })
  )

  return React.forwardRef<any, P>((props, ref) => (
    <LazyPage>
      <LazyComponent {...props} ref={ref} />
    </LazyPage>
  ))
}
