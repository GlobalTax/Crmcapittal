
import React, { useMemo, useState } from 'react'
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useVirtualization } from '@/hooks/useVirtualization'

interface VirtualTableProps<T> {
  data: T[]
  itemHeight: number
  containerHeight: number
  renderRow: (item: T, index: number) => React.ReactNode
  headers: React.ReactNode
  keyExtractor: (item: T) => string
}

export function VirtualTable<T>({ 
  data, 
  itemHeight, 
  containerHeight, 
  renderRow, 
  headers,
  keyExtractor 
}: VirtualTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)

  const { visibleItems, totalHeight, offsetY, startIndex } = useVirtualization(
    data.length,
    itemHeight,
    containerHeight,
    scrollTop
  )

  const visibleData = useMemo(() => {
    return visibleItems.map(index => data[index])
  }, [data, visibleItems])

  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <Table>
        <TableHeader>
          {headers}
        </TableHeader>
        <TableBody style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ 
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            width: '100%'
          }}>
            {visibleData.map((item, localIndex) => (
              <div key={keyExtractor(item)} style={{ height: itemHeight }}>
                {renderRow(item, startIndex + localIndex)}
              </div>
            ))}
          </div>
        </TableBody>
      </Table>
    </div>
  )
}
