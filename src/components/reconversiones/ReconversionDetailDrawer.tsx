import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Target, 
  Activity, 
  FileText, 
  User, 
  Building, 
  Mail, 
  Phone, 
  Euro,
  MapPin,
  Clock,
  Edit,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatInvestmentRange } from '@/utils/reconversionPhases';
import { ReconversionStatusBadge } from './ReconversionStatusBadge';
import type { Reconversion } from '@/types/Reconversion';

interface ReconversionDetailDrawerProps {
  reconversion: Reconversion | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (reconversion: Reconversion) => void;
}

export function ReconversionDetailDrawer({ 
  reconversion, 
  open, 
  onClose, 
  onEdit 
}: ReconversionDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState('preferences');

  if (!reconversion) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <SheetTitle className="flex items-center gap-2 text-xl">
                <Building className="h-5 w-5" />
                {reconversion.company_name}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4" />
                {reconversion.contact_name}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              <ReconversionStatusBadge 
                status={reconversion.estado} 
                priority={reconversion.prioridad}
              />
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(reconversion)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
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

          <TabsContent value="preferences" className="space-y-4 mt-6">
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
                    <span className="text-sm">{reconversion.contact_email}</span>
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
            {reconversion.target_sectors && reconversion.target_sectors.length > 0 && (
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
            {reconversion.geographic_preferences && reconversion.geographic_preferences.length > 0 && (
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
            {reconversion.business_model_preferences && reconversion.business_model_preferences.length > 0 && (
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
                <p className="text-sm">{reconversion.rejection_reason}</p>
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

          <TabsContent value="matches" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Operaciones Coincidentes
                </CardTitle>
                <CardDescription>
                  Operaciones que podrían interesar a este comprador
                </CardDescription>
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

          <TabsContent value="activity" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Timeline de Actividad
                </CardTitle>
                <CardDescription>
                  Historial de acciones y cambios en esta reconversión
                </CardDescription>
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

          <TabsContent value="documents" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos
                </CardTitle>
                <CardDescription>
                  NDAs, LOIs y otra documentación relacionada
                </CardDescription>
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
      </SheetContent>
    </Sheet>
  );
}