
import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  renderTime: number
  componentName: string
  timestamp: number
}

export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)

  useEffect(() => {
    renderStartTime.current = performance.now()
    renderCount.current += 1
  })

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current
    
    if (renderTime > 16) { // More than 16ms (60fps threshold)
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
    }

    const metrics: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now()
    }

    // In production, you might want to send this to analytics
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance metrics:', metrics)
    }
  })

  return {
    renderCount: renderCount.current
  }
}
