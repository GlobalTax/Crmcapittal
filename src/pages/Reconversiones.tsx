
import React, { useState } from 'react';
import { RefreshCw, Plus, FileText, TrendingUp, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReconversiones } from '@/hooks/useReconversiones';
import { ReconversionCard } from '@/components/reconversiones/ReconversionCard';

export default function Reconversiones() {
  const { reconversiones, loading, error, createReconversion } = useReconversiones();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filtrar reconversiones
  const filteredReconversiones = reconversiones.filter(reconversion => {
    const matchesSearch = reconversion.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reconversion.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reconversion.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Error al cargar reconversiones</p>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reconversiones</h1>
          <p className="text-muted-foreground">
            Gestiona procesos de reconversión empresarial
          </p>
        </div>
        <Button onClick={() => createReconversion({
          company_name: 'Nueva Empresa',
          contact_name: 'Nuevo Cliente',
          rejection_reason: 'Evaluación inicial'
        })}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Reconversión
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reconversiones</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reconversiones.length}</div>
            <p className="text-xs text-muted-foreground">
              procesos registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reconversiones.filter(r => r.status === 'en_progreso').length}
            </div>
            <p className="text-xs text-muted-foreground">
              activos actualmente
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reconversiones.filter(r => r.status === 'completada').length}
            </div>
            <p className="text-xs text-muted-foreground">
              finalizadas con éxito
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_progreso">En Progreso</SelectItem>
                <SelectItem value="pausada">Pausada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cerrada">Cerrada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Reconversiones */}
      <div className="space-y-4">
        {filteredReconversiones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {reconversiones.length === 0 ? 'No hay reconversiones' : 'No se encontraron resultados'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {reconversiones.length === 0 
                  ? 'Comienza creando tu primer proceso de reconversión'
                  : 'Intenta ajustar los filtros de búsqueda'
                }
              </p>
              {reconversiones.length === 0 && (
                <Button onClick={() => createReconversion({
                  company_name: 'Nueva Empresa',
                  contact_name: 'Nuevo Cliente',
                  rejection_reason: 'Evaluación inicial'
                })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Reconversión
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReconversiones.map((reconversion) => (
              <ReconversionCard 
                key={reconversion.id} 
                reconversion={reconversion} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
