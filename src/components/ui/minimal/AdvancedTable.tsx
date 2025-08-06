import { useState } from 'react';

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface AdvancedTableProps {
  data: any[];
  columns: Column[];
  onRowClick?: (row: any) => void;
  className?: string;
}

export default function AdvancedTable({ 
  data, 
  columns: initialColumns, 
  onRowClick,
  className = "" 
}: AdvancedTableProps) {
  const [columns, setColumns] = useState(initialColumns);

  // Mostrar/ocultar columnas
  const toggleColumn = (id: string) => {
    setColumns(cols =>
      cols.map(col => col.id === id ? { ...col, visible: !col.visible } : col)
    );
  };

  // Columnas visibles
  const visibleColumns = columns.filter(col => col.visible);

  return (
    <div className={className}>

      <div className="overflow-x-auto border border-gray-100 rounded-lg">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100">
            <tr>
              {visibleColumns.map(col => (
                <th key={col.id} className="py-3 px-4 text-left font-medium text-gray-600">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr 
                key={row.id || index} 
                className={`hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {visibleColumns.map(col => (
                  <td key={col.id} className="py-3 px-4 text-gray-900">
                    {row[col.id] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay datos disponibles
            </h3>
            <p className="text-gray-500">
              No se encontraron registros para mostrar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}