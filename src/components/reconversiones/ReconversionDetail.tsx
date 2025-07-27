import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, RefreshCw, Settings, Target, Activity, FileText, User, Building, Mail, Phone, Euro, MapPin, Clock, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatInvestmentRange } from '@/utils/reconversionPhases';
import { ReconversionStatusBadge } from './ReconversionStatusBadge';
import type { Reconversion } from '@/types/Reconversion';
import type { Database } from '@/integrations/supabase/types';

type ReconversionRow = Database['public']['Tables']['reconversiones_new']['Row'];

interface ReconversionDetailProps {
  reconversionId: string;
  reconversiones: ReconversionRow[];
  onBackToList: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  onUpdate?: (id: string, updates: Partial<ReconversionRow>) => void;
}

// Helper functions for status display
const getStatusVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
  switch (status) {
    case 'active':
      return 'default';
    case 'matching':
      return 'secondary';
    case 'paused':
      return 'outline';
    case 'closed':
      return 'destructive';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Activa';
    case 'matching':
      return 'Matching';
    case 'paused':
      return 'Pausada';
    case 'closed':
      return 'Cerrada';
    default:
      return status;
  }
};

const getPriorityLabel = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'Baja';
    case 'medium':
      return 'Media';
    case 'high':
      return 'Alta';
    case 'urgent':
      return 'Urgente';
    default:
      return priority;
  }
};

export const ReconversionDetail = ({ 
  reconversionId, 
  reconversiones, 
  onBackToList, 
  onRefresh, 
  isLoading,
  onUpdate 
}: ReconversionDetailProps) => {
  const [reconversion, setReconversion] = useState<ReconversionRow | null>(null);
  const [activeTab, setActiveTab] = useState('preferences');

  useEffect(() => {
    const foundReconversion = reconversiones.find(r => r.id === reconversionId);
    setReconversion(foundReconversion || null);
  }, [reconversionId, reconversiones]);

  if (!reconversion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBackToList} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Reconversión no encontrada</h3>
              <p className="text-muted-foreground">
                La reconversión solicitada no existe o no tienes permisos para verla.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBackToList} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </Button>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={onBackToList}>Reconversiones</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>{reconversion.company_name || 'Reconversión'}</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Building className="h-6 w-6" />
                {reconversion.company_name || 'Sin nombre de empresa'}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  {reconversion.contact_name || 'Sin nombre de contacto'}
                </div>
                {reconversion.contact_email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {reconversion.contact_email}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ReconversionStatusBadge 
                status={reconversion.estado} 
                priority={reconversion.prioridad}
              />
              {onUpdate && (
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preferences" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Preferencias</span>
              </TabsTrigger>
              <TabsTrigger value="matches" className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Matches</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Actividad</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Documentos</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-4">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{reconversion.contact_email || 'Sin email'}</span>
                    </div>
                    {reconversion.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{reconversion.contact_phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Creado {formatDistanceToNow(new Date(reconversion.created_at), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Capacity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="h-5 w-5" />
                    Capacidad de Inversión
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">
                    {formatInvestmentRange(
                      reconversion.investment_capacity_min, 
                      reconversion.investment_capacity_max
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Target Sectors */}
              {reconversion.target_sectors && Array.isArray(reconversion.target_sectors) && reconversion.target_sectors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Sectores Objetivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {reconversion.target_sectors.map((sector, index) => (
                        <Badge key={index} variant="secondary">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Geographic Preferences */}
              {reconversion.geographic_preferences && Array.isArray(reconversion.geographic_preferences) && reconversion.geographic_preferences.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Preferencias Geográficas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {reconversion.geographic_preferences.map((location, index) => (
                        <Badge key={index} variant="outline">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Business Model Preferences */}
              {reconversion.business_model_preferences && Array.isArray(reconversion.business_model_preferences) && reconversion.business_model_preferences.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Modelos de Negocio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {reconversion.business_model_preferences.map((model, index) => (
                        <Badge key={index} variant="outline">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rejection Reason */}
              <Card>
                <CardHeader>
                  <CardTitle>Motivo del Rechazo Original</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{reconversion.rejection_reason || 'Sin motivo especificado'}</p>
                </CardContent>
              </Card>

              {/* Notes */}
              {reconversion.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notas Adicionales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{reconversion.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="matches" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Operaciones Coincidentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Sin matches disponibles</h3>
                    <p className="text-muted-foreground">
                      Aún no se han encontrado operaciones que coincidan con las preferencias
                    </p>
                    <Button className="mt-4">
                      Buscar Matches
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Timeline de Actividad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Reconversión creada</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reconversion.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          No hay más actividad registrada
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Sin documentos</h3>
                    <p className="text-muted-foreground">
                      No hay documentos asociados a esta reconversión
                    </p>
                    <Button className="mt-4">
                      Subir Documento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Información Clave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Estado</p>
                <Badge variant={getStatusVariant(reconversion.estado || 'activa')}>
                  {getStatusLabel(reconversion.estado || 'activa')}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Prioridad</p>
                <Badge variant="outline">
                  {getPriorityLabel(reconversion.prioridad || 'media')}
                </Badge>
              </div>
              {reconversion.assigned_to && (
                <div>
                  <p className="text-sm font-medium">Asignado a</p>
                  <p className="text-sm text-muted-foreground">{reconversion.assigned_to}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Última actualización</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(reconversion.updated_at), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};