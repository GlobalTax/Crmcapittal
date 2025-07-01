
import React, { useRef, useEffect, useState } from 'react';
import { useVirtualization } from '@/hooks/useVirtualization';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = ''
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const { visibleItems, totalHeight, offsetY } = useVirtualization(
    items.length,
    itemHeight,
    containerHeight,
    scrollTop
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((index) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(items[index], index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Componente especializado para operaciones
export function VirtualizedOperationsList({ 
  operations, 
  renderOperation 
}: {
  operations: any[];
  renderOperation: (operation: any, index: number) => React.ReactNode;
}) {
  const ITEM_HEIGHT = 120; // Altura estimada de cada tarjeta de operación
  const CONTAINER_HEIGHT = 600; // Altura del contenedor

  return (
    <VirtualizedList
      items={operations}
      itemHeight={ITEM_HEIGHT}
      containerHeight={CONTAINER_HEIGHT}
      renderItem={renderOperation}
      className="rounded-lg border"
    />
  );
}

// Componente especializado para tablas
export function VirtualizedTable<T>({
  data,
  columns,
  rowHeight = 50,
  containerHeight = 400
}: {
  data: T[];
  columns: Array<{
    key: string;
    header: string;
    render: (item: T) => React.ReactNode;
  }>;
  rowHeight?: number;
  containerHeight?: number;
}) {
  const renderRow = (item: T, index: number) => (
    <div className="flex border-b border-gray-200 hover:bg-gray-50">
      {columns.map((column) => (
        <div key={column.key} className="flex-1 p-3">
          {column.render(item)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="border rounded-lg">
      {/* Header */}
      <div className="flex bg-gray-100 border-b border-gray-200">
        {columns.map((column) => (
          <div key={column.key} className="flex-1 p-3 font-medium">
            {column.header}
          </div>
        ))}
      </div>
      
      {/* Virtualized Body */}
      <VirtualizedList
        items={data}
        itemHeight={rowHeight}
        containerHeight={containerHeight}
        renderItem={renderRow}
      />
    </div>
  );
}
