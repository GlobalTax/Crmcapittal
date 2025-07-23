
import React, { useState } from 'react';
import { RefreshCw, Plus, FileText, TrendingUp, Shield, Grid, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReconversions } from '@/hooks/useReconversions';
import { useReconversionSecurity } from '@/hooks/useReconversionSecurity';
import { useReconversionFilters } from '@/hooks/useReconversionFilters';
import { ReconversionList } from '@/components/reconversiones/ReconversionList';
import { ReconversionCreateDialog } from '@/components/reconversiones/ReconversionCreateDialog';
import { ReconversionFilters } from '@/components/reconversiones/ReconversionFilters';
import { Toggle } from '@/components/ui/toggle';
import type { Database } from '@/integrations/supabase/types';

export default function Reconversiones() {
  const { reconversiones, loading, error, createReconversion, updateReconversion, deleteReconversion } = useReconversions();
  const { isAdmin } = useReconversionSecurity();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    filteredReconversiones
  } = useReconversionFilters(reconversiones as any);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando reconversiones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error al cargar reconversiones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateReconversion = async () => {
    try {
      await createReconversion({
        company_name: 'Nueva Empresa',
        contact_name: 'Nuevo Cliente',
        rejection_reason: 'Evaluación inicial'
      });
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const stats = {
    total: reconversiones.length,
    activas: reconversiones.filter(r => r.status === 'active').length,
    enMatching: reconversiones.filter(r => r.status === 'matching').length,
    completadas: reconversiones.filter(r => r.status === 'closed').length,
    urgentes: reconversiones.filter(r => (r as any).priority === 'high').length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="h-8 w-8" />
            Reconversiones
            {isAdmin && <Shield className="h-5 w-5 text-muted-foreground" />}
          </h1>
          <p className="text-muted-foreground">
            Gestiona procesos de reconversión empresarial con seguridad avanzada
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded-lg p-1">
            <Toggle
              pressed={viewMode === 'grid'}
              onPressedChange={() => setViewMode('grid')}
              variant="outline"
              size="sm"
            >
              <Grid className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={viewMode === 'list'}
              onPressedChange={() => setViewMode('list')}
              variant="outline"
              size="sm"
            >
              <List className="h-4 w-4" />
            </Toggle>
          </div>

          {/* Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? 'border-primary' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>

           <ReconversionCreateDialog onCreateReconversion={createReconversion} />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="animate-slide-in-right">
          <CardHeader>
            <CardTitle className="text-lg">Filtros de búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <ReconversionFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="reconversiones" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reconversiones">
            Reconversiones 
            <span className="ml-2 bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
              {filteredReconversiones.length}
            </span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="auditoria">Auditoría Global</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="reconversiones" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Reconversiones totales</p>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activas</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.activas}</div>
                <p className="text-xs text-muted-foreground">En proceso activo</p>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Matching</CardTitle>
                <RefreshCw className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.enMatching}</div>
                <p className="text-xs text-muted-foreground">Buscando coincidencias</p>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                <FileText className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{stats.completadas}</div>
                <p className="text-xs text-muted-foreground">Procesos finalizados</p>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
                <TrendingUp className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.urgentes}</div>
                <p className="text-xs text-muted-foreground">Requieren atención</p>
              </CardContent>
            </Card>
          </div>

          {/* Reconversiones List/Grid */}
          <div className="space-y-4">
            {filteredReconversiones.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {hasActiveFilters ? 'No se encontraron reconversiones' : 'No hay reconversiones'}
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {hasActiveFilters 
                      ? 'Ajusta los filtros para ver más resultados'
                      : 'Comienza creando tu primer proceso de reconversión'
                    }
                  </p>
                   {!hasActiveFilters && (
                     <ReconversionCreateDialog onCreateReconversion={createReconversion} />
                   )}
                </CardContent>
              </Card>
            ) : (
              <ReconversionList
                reconversiones={filteredReconversiones as any}
                onView={(reconversion) => console.log('Ver detalles:', reconversion.id)}
                onEdit={(reconversion) => console.log('Editar:', reconversion.id)}
                onDelete={(reconversion) => console.log('Eliminar:', reconversion.id)}
                viewMode={viewMode}
              />
            )}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="auditoria">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Panel de Auditoría Global
                </CardTitle>
                <CardDescription>
                  Vista completa de todos los logs de auditoría del sistema de reconversiones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Selecciona una reconversión específica para ver su historial de auditoría.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
