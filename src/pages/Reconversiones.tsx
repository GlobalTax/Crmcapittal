import React from 'react';
import { RefreshCw, Plus, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useReconversiones } from '@/hooks/useReconversiones';

export default function Reconversiones() {
  const { reconversiones, loading, error, createReconversion } = useReconversiones();

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
          </CardContent>
        </Card>
      </div>

      {/* Reconversiones List */}
      <div className="space-y-4">
        {reconversiones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay reconversiones</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comienza creando tu primer proceso de reconversión
              </p>
              <Button onClick={() => createReconversion({
                company_name: 'Nueva Empresa',
                contact_name: 'Nuevo Cliente',
                rejection_reason: 'Evaluación inicial'
              })}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Reconversión
              </Button>
            </CardContent>
          </Card>
        ) : (
          reconversiones.map((reconversion) => (
            <Card key={reconversion.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{reconversion.company_name || 'Sin nombre'}</CardTitle>
                    <CardDescription>
                      Cliente: {reconversion.contact_name}
                      {reconversion.target_sectors && reconversion.target_sectors.length > 0 && 
                        ` • Sectores objetivo: ${reconversion.target_sectors.join(', ')}`
                      }
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      reconversion.status === 'completada' 
                        ? 'bg-green-100 text-green-800' 
                        : reconversion.status === 'en_progreso'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {reconversion.status}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {reconversion.notes && (
                <CardContent>
                  <p className="text-muted-foreground">{reconversion.notes}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}