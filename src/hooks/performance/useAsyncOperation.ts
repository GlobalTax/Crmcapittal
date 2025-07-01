
import { useState, useCallback } from 'react'

export interface AsyncOperationState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useAsyncOperation<T>() {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await asyncFn()
      setState({ data: result, loading: false, error: null })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}
