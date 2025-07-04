import { useState } from 'react';
import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";
import { useNegocios } from "@/hooks/useNegocios";
import { User, Briefcase } from "lucide-react";

const stages = ['Nuevo', 'En Proceso', 'Propuesta', 'Ganado', 'Perdido'];

export default function MinimalNegocios() {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const { negocios, loading } = useNegocios();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando negocios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Negocios</h1>
          <p className="text-gray-600 mt-1">Gestiona tus oportunidades de negocio</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant={viewMode === 'table' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('table')}
          >
            Tabla
          </Button>
          <Button 
            variant={viewMode === 'kanban' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
          <Button variant="primary">Nuevo Negocio</Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border p-4">
        <input
          type="text"
          placeholder="Buscar negocios..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Total Negocios</span>
          <span className="text-3xl font-bold mt-2 block">{negocios.length}</span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">En Proceso</span>
          <span className="text-3xl font-bold mt-2 block text-blue-600">
            {negocios.filter(n => n.status === 'en_proceso').length}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Ganados</span>
          <span className="text-3xl font-bold mt-2 block text-green-600">
            {negocios.filter(n => n.status === 'ganado').length}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Valor Total</span>
          <span className="text-3xl font-bold mt-2 block">
            €{negocios.reduce((sum, n) => sum + (n.amount || 0), 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">{negocios.length} negocios</h3>
          </div>
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableHead>Negocio</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableHeader>
              <TableBody>
                {negocios.map((negocio) => (
                  <TableRow key={negocio.id}>
                    <TableCell>
                      <div className="font-medium">{negocio.title}</div>
                    </TableCell>
                    <TableCell>{negocio.company_name || 'N/A'}</TableCell>
                    <TableCell>
                      {negocio.amount ? `€${negocio.amount.toLocaleString()}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge color="blue">{negocio.status || 'nuevo'}</Badge>
                    </TableCell>
                    <TableCell>{negocio.assigned_to || 'Sin asignar'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Ver
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Editar
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto">
            {stages.map((stage) => (
              <div key={stage} className="bg-gray-50 rounded-lg p-4 min-w-[250px] flex-1">
                <h3 className="font-semibold mb-4">{stage}</h3>
                <div className="space-y-3">
                  {negocios.filter(n => (n.status || 'nuevo') === stage.toLowerCase()).map((negocio) => (
                    <div key={negocio.id} className="bg-white rounded p-3 border">
                      <span className="font-medium">{negocio.title}</span>
                      <div className="text-xs text-gray-500 mt-1">{negocio.company_name}</div>
                      <div className="text-xs text-blue-600 font-bold mt-1">
                        {negocio.amount ? `€${negocio.amount.toLocaleString()}` : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Responsable: {negocio.assigned_to || 'Sin asignar'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}