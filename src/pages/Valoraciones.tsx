import React from 'react';
import { Calculator, Plus, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useValoraciones } from '@/hooks/useValoraciones';

export default function Valoraciones() {
  const { valoraciones, loading, error, createValoracion } = useValoraciones();

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
          <p className="text-destructive mb-4">Error al cargar valoraciones</p>
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
          <h1 className="text-3xl font-bold text-foreground">Valoraciones</h1>
          <p className="text-muted-foreground">
            Gestiona y crea valoraciones de empresas
          </p>
        </div>
        <Button onClick={() => createValoracion({
          company_name: 'Nueva Empresa',
          client_name: 'Nuevo Cliente'
        })}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Valoración
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Valoraciones</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valoraciones.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {valoraciones.filter(v => v.status === 'en_progreso').length}
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
              {valoraciones.filter(v => v.status === 'completada').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Valoraciones List */}
      <div className="space-y-4">
        {valoraciones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay valoraciones</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comienza creando tu primera valoración de empresa
              </p>
              <Button onClick={() => createValoracion({
                company_name: 'Nueva Empresa',
                client_name: 'Nuevo Cliente'
              })}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Valoración
              </Button>
            </CardContent>
          </Card>
        ) : (
          valoraciones.map((valoracion) => (
            <Card key={valoracion.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{valoracion.company_name}</CardTitle>
                    <CardDescription>
                      Cliente: {valoracion.client_name}
                      {valoracion.company_sector && ` • Sector: ${valoracion.company_sector}`}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      valoracion.status === 'completada' 
                        ? 'bg-green-100 text-green-800' 
                        : valoracion.status === 'en_progreso'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {valoracion.status}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {valoracion.company_description && (
                <CardContent>
                  <p className="text-muted-foreground">{valoracion.company_description}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}