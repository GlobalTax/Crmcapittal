
import React from 'react';
import { RefreshCw, Plus, FileText, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReconversiones } from '@/hooks/useReconversiones';
import { useReconversionSecurity } from '@/hooks/useReconversionSecurity';
import { SecureReconversionCard } from '@/components/reconversiones/SecureReconversionCard';
import { ReconversionAuditPanel } from '@/components/reconversiones/ReconversionAuditPanel';

export default function Reconversiones() {
  const { reconversiones, loading, error, createReconversion } = useReconversiones();
  const { isAdmin } = useReconversionSecurity();

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

  const handleCreateReconversion = async () => {
    try {
      await createReconversion({
        company_name: 'Nueva Empresa',
        contact_name: 'Nuevo Cliente',
        original_rejection_reason: 'Evaluación inicial'
      });
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        <Button onClick={handleCreateReconversion}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Reconversión
        </Button>
      </div>

      <Tabs defaultValue="reconversiones" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reconversiones">Reconversiones</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="auditoria">Auditoría Global</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="reconversiones" className="space-y-6">
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
                  <Button onClick={handleCreateReconversion}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Reconversión
                  </Button>
                </CardContent>
              </Card>
            ) : (
              reconversiones.map((reconversion) => (
                <SecureReconversionCard
                  key={reconversion.id}
                  reconversion={reconversion}
                  onViewDetails={() => console.log('Ver detalles:', reconversion.id)}
                  onEdit={() => console.log('Editar:', reconversion.id)}
                  onDelete={() => console.log('Eliminar:', reconversion.id)}
                />
              ))
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
