import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";
import { useTransacciones } from "@/hooks/useTransacciones";
import { useStages } from "@/hooks/useStages";
import { Transaccion } from "@/types/Transaccion";
import { User, Briefcase, Building2, Users, TrendingUp } from "lucide-react";

export default function MinimalTransacciones() {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const navigate = useNavigate();
  const { transacciones, loading, error } = useTransacciones();
  const { stages } = useStages('DEAL');
  const [searchQuery, setSearchQuery] = useState('');

  // Search from topbar
  useEffect(() => {
    const handleSearch = (e: CustomEvent<{ query: string }>) => {
      setSearchQuery(e.detail.query);
    };

    window.addEventListener('transaccionesSearch', handleSearch as EventListener);
    return () => window.removeEventListener('transaccionesSearch', handleSearch as EventListener);
  }, []);

  // Apply search filtering
  const filteredTransacciones = transacciones.filter(transaccion => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      transaccion.nombre_transaccion?.toLowerCase().includes(searchLower) ||
      transaccion.company?.name?.toLowerCase().includes(searchLower) ||
      transaccion.contact?.name?.toLowerCase().includes(searchLower) ||
      transaccion.descripcion?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  const handleViewTransaccion = (transaccion: Transaccion) => {
    navigate(`/transacciones/${transaccion.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transacciones M&A</h1>
          <p className="text-gray-600 mt-1">Gestiona tus transacciones de fusiones y adquisiciones</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="primary" onClick={() => navigate('/transacciones/new')}>
            Nueva Transacción
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg font-semibold">{filteredTransacciones.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Activas</p>
              <p className="text-lg font-semibold">{filteredTransacciones.filter(t => t.is_active).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">En Progreso</p>
              <p className="text-lg font-semibold">{filteredTransacciones.filter(t => t.stage?.name === 'In Progress').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Valor Total</p>
              <p className="text-lg font-semibold">
                €{filteredTransacciones.reduce((sum, t) => sum + (t.valor_transaccion || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">{filteredTransacciones.length} transacciones</h3>
        </div>
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableHead>Transacción</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableHeader>
            <TableBody>
              {filteredTransacciones.map((transaccion) => (
                <TableRow key={transaccion.id}>
                  <TableCell>
                    <div className="font-medium">{transaccion.nombre_transaccion}</div>
                  </TableCell>
                  <TableCell>
                    {transaccion.company?.name ? (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {transaccion.company.name}
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {transaccion.contact?.name ? (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {transaccion.contact.name}
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {transaccion.valor_transaccion ? `€${transaccion.valor_transaccion.toLocaleString()}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge color="blue">{transaccion.stage?.name || 'nueva'}</Badge>
                  </TableCell>
                  <TableCell>{transaccion.propietario_transaccion || 'Sin asignar'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => handleViewTransaccion(transaccion)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Ver
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}