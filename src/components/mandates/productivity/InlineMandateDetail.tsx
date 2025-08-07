import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BuyingMandate } from '@/types/BuyingMandate';
import { 
  X, 
  Edit, 
  Target, 
  Activity, 
  FileText, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Clock
} from 'lucide-react';

interface InlineMandateDetailProps {
  mandate: BuyingMandate;
  onClose: () => void;
  onRefresh: () => void;
}

export function InlineMandateDetail({ mandate, onClose, onRefresh }: InlineMandateDetailProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Mock data for demo
  const mockTargets = [
    { 
      id: '1', 
      company_name: 'TechCorp Solutions', 
      status: 'contacted', 
      contact_date: '2024-01-15',
      contact_method: 'email'
    },
    { 
      id: '2', 
      company_name: 'Industrial Partners', 
      status: 'pending', 
      contact_date: null,
      contact_method: null
    },
    { 
      id: '3', 
      company_name: 'ServiceMax Ltd', 
      status: 'interested', 
      contact_date: '2024-01-10',
      contact_method: 'phone'
    }
  ];

  const mockActivities = [
    {
      id: '1',
      type: 'call',
      title: 'Llamada con cliente',
      description: 'Reunión de seguimiento del progreso',
      date: '2024-01-15',
      user: 'Juan Pérez'
    },
    {
      id: '2',
      type: 'email',
      title: 'Envío de actualización',
      description: 'Reporte semanal de targets contactados',
      date: '2024-01-12',
      user: 'María García'
    }
  ];

  return (
    <div className="bg-muted/20 border-t border-border">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold">{mandate.mandate_name}</h3>
            <p className="text-muted-foreground">{mandate.client_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="targets">Targets</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
            <TabsTrigger value="docs">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Client Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Información del Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{mandate.client_phone || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{mandate.client_email || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {mandate.target_locations?.join(', ') || 'Cualquier ubicación'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Criteria */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Criterios de Búsqueda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Sectores</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mandate.target_sectors?.map((sector, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rango de Ingresos</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(mandate.min_revenue)} - {formatCurrency(mandate.max_revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rango EBITDA</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(mandate.min_ebitda)} - {formatCurrency(mandate.max_ebitda)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Inicio</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(mandate.start_date)}
                      </p>
                    </div>
                  </div>
                  {mandate.end_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Vencimiento</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(mandate.end_date)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Estado</p>
                      <Badge variant="default">{mandate.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="targets" className="space-y-4">
            <div className="space-y-2">
              {mockTargets.map((target) => (
                <Card key={target.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{target.company_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {target.contact_date 
                            ? `Contactado ${target.contact_method === 'email' ? 'por email' : 'por teléfono'} el ${formatDate(target.contact_date)}`
                            : 'Pendiente de contactar'
                          }
                        </p>
                      </div>
                      <Badge 
                        variant={target.status === 'interested' ? 'default' : 
                               target.status === 'contacted' ? 'secondary' : 'outline'}
                      >
                        {target.status === 'interested' ? 'Interesado' :
                         target.status === 'contacted' ? 'Contactado' : 'Pendiente'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-3">
              {mockActivities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(activity.date)} • {activity.user}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No hay documentos disponibles</p>
              <Button variant="outline" className="mt-4">
                Subir documento
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}