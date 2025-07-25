import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, RefreshCw, Calendar, User, MapPin, DollarSign, Target, FileText, Building2 } from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { MandateNavigation } from './MandateNavigation';
import { MandateDetailsSidebar } from './MandateDetailsSidebar';
import { MandateOverviewTab } from './tabs/MandateOverviewTab';
import { MandateTargetsTab } from './tabs/MandateTargetsTab';
import { MandateTasksTab } from './tabs/MandateTasksTab';
import { MandateDocumentsTab } from './tabs/MandateDocumentsTab';
import { MandateActivityTab } from './tabs/MandateActivityTab';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MandateDetailProps {
  mandateId: string;
  mandates: BuyingMandate[];
  onBackToList: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'paused':
      return 'secondary';
    case 'completed':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'paused':
      return 'Pausado';
    case 'completed':
      return 'Completado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'compra':
      return 'Compra';
    case 'venta':
      return 'Venta';
    default:
      return type;
  }
};

export const MandateDetail = ({ mandateId, mandates, onBackToList, onRefresh, isLoading }: MandateDetailProps) => {
  const [mandate, setMandate] = useState<BuyingMandate | null>(null);

  useEffect(() => {
    const foundMandate = mandates.find(m => m.id === mandateId);
    setMandate(foundMandate || null);
  }, [mandateId, mandates]);

  if (!mandate) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={onBackToList} className="cursor-pointer">
                Mandatos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Mandato no encontrado</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Mandato no encontrado</h3>
              <p className="text-sm mb-4">
                El mandato solicitado no existe o ha sido eliminado.
              </p>
              <Button onClick={onBackToList}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb and Navigation */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={onBackToList} className="cursor-pointer">
                Mandatos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{mandate.client_name || 'Sin nombre'}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button 
            variant="outline" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Mandate Navigation */}
      <MandateNavigation 
        currentMandateId={mandateId}
        mandates={mandates}
      />

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{mandate.client_name || 'Sin nombre'}</CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={getStatusVariant(mandate.status)}>
                  {getStatusLabel(mandate.status)}
                </Badge>
                <Badge variant="outline">
                  {getTypeLabel(mandate.mandate_type)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                Creado el {format(new Date(mandate.created_at), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              <span>Cliente: {mandate.client_name || 'No especificado'}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 mr-2" />
              <span>Tipo: {getTypeLabel(mandate.mandate_type)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="targets">Objetivos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <p className="mt-1">
                    <Badge variant={getStatusVariant(mandate.status)}>
                      {getStatusLabel(mandate.status)}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Mandato</label>
                  <p className="mt-1">
                    <Badge variant="outline">
                      {getTypeLabel(mandate.mandate_type)}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                  <p className="mt-1">{mandate.client_name || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
                  <p className="mt-1">
                    {format(new Date(mandate.created_at), 'dd MMM yyyy', { locale: es })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Empresas Objetivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Funcionalidad de objetivos en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Funcionalidad de documentos en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Historial de actividad en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};