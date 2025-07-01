
import React, { useMemo, useState } from 'react'
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      data.length
    )
    
    return {
      startIndex,
      endIndex,
      items: data.slice(startIndex, endIndex)
    }
  }, [data, scrollTop, itemHeight, containerHeight])

  const totalHeight = data.length * itemHeight
  const offsetY = visibleItems.startIndex * itemHeight

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
            {visibleItems.items.map((item, index) => (
              <div key={keyExtractor(item)} style={{ height: itemHeight }}>
                {renderRow(item, visibleItems.startIndex + index)}
              </div>
            ))}
          </div>
        </TableBody>
      </Table>
    </div>
  )
}
