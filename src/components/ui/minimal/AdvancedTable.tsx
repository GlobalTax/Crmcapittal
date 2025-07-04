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
      {/* Configuración de columnas */}
      <div className="mb-4 flex flex-wrap gap-3">
        <span className="text-sm font-medium text-gray-700">Mostrar columnas:</span>
        {columns.map(col => (
          <label key={col.id} className="text-sm flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={col.visible}
              onChange={() => toggleColumn(col.id)}
              className="rounded border-gray-300"
            />
            <span className="text-gray-600">{col.label}</span>
          </label>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-1">
          <thead>
            <tr className="text-left text-gray-500">
              {visibleColumns.map(col => (
                <th key={col.id} className="py-2 px-4 font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr 
                key={row.id || index} 
                className={`bg-white hover:bg-gray-50 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {visibleColumns.map(col => (
                  <td key={col.id} className="py-3 px-4">
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