
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Users, Target, ClipboardList } from 'lucide-react';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { useMandatoById } from '@/hooks/useMandatoById';
import { MandatoTargetPanel } from './MandatoTargetPanel';

export const BuyingMandateDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { 
    targets, 
    documents, 
    fetchTargets, 
    fetchDocuments 
  } = useBuyingMandates();

  const { mandate, loading, error } = useMandatoById(id!);

  useEffect(() => {
    if (id && mandate) {
      fetchTargets(id);
      fetchDocuments(id);
    }
  }, [id, mandate, fetchTargets, fetchDocuments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !mandate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Error al cargar el mandato</p>
          <Button variant="outline" className="mt-2" onClick={() => navigate('/mandatos')}>
            Volver a Mandatos
          </Button>
        </div>
      </div>
    );
  }

  const mandateTargets = targets.filter(target => target.mandate_id === id);
  const mandateDocuments = documents.filter(doc => doc.mandate_id === id);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Activo', variant: 'default' as const },
      paused: { label: 'Pausado', variant: 'secondary' as const },
      completed: { label: 'Completado', variant: 'outline' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleEditTarget = (target: any) => {
    console.log('Edit target:', target);
  };

  const handleViewDocuments = (target: any) => {
    console.log('View documents for target:', target);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/mandatos')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mandatos
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{mandate.mandate_name}</h1>
            <p className="text-muted-foreground">
              Cliente: {mandate.client_name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(mandate.status)}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <FileText className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="targets">
            <Target className="h-4 w-4 mr-2" />
            Targets ({mandateTargets.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            <ClipboardList className="h-4 w-4 mr-2" />
            Documentos ({mandateDocuments.length})
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Users className="h-4 w-4 mr-2" />
            Actividad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                  <p className="text-sm">{mandate.client_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contacto</label>
                  <p className="text-sm">{mandate.client_contact}</p>
                </div>
                {mandate.client_email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{mandate.client_email}</p>
                  </div>
                )}
                {mandate.client_phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                    <p className="text-sm">{mandate.client_phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Criterios de Búsqueda */}
            <Card>
              <CardHeader>
                <CardTitle>Criterios de Búsqueda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sectores Objetivo</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mandate.target_sectors.map((sector, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
                {mandate.target_locations && mandate.target_locations.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ubicaciones</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mandate.target_locations.map((location, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {mandate.min_revenue && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Facturación Mínima</label>
                    <p className="text-sm">{mandate.min_revenue.toLocaleString()} €</p>
                  </div>
                )}
                {mandate.max_revenue && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Facturación Máxima</label>
                    <p className="text-sm">{mandate.max_revenue.toLocaleString()} €</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Targets</p>
                  <p className="text-3xl font-bold">{mandateTargets.length}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Targets Contactados</p>
                  <p className="text-3xl font-bold">
                    {mandateTargets.filter(t => t.contacted).length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Documentos</p>
                  <p className="text-3xl font-bold">{mandateDocuments.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="targets">
          <MandatoTargetPanel 
            targets={mandateTargets}
            documents={mandateDocuments}
            onEditTarget={handleEditTarget}
            onViewDocuments={handleViewDocuments}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                Funcionalidad de documentos en desarrollo
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                Panel de actividad en desarrollo
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
