
import { useMemo, useState, useCallback } from 'react'

export interface UseOptimizedTableProps<T> {
  data: T[]
  searchFields: (keyof T)[]
  filterFn?: (item: T, filters: Record<string, any>) => boolean
}

export function useOptimizedTable<T>({ 
  data, 
  searchFields, 
  filterFn 
}: UseOptimizedTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })

  const filteredAndSortedData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchTerm) {
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field]
          return value && 
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply filters
    if (filterFn && Object.keys(filters).length > 0) {
      result = result.filter(item => filterFn(item, filters))
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [data, searchTerm, filters, sortConfig, searchFields, filterFn])

  const handleSort = useCallback((key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  return {
    filteredData: filteredAndSortedData,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    sortConfig,
    handleSort
  }
}
