import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  MapPin, 
  Euro, 
  Target, 
  User,
  Mail,
  Phone,
  Edit,
  Plus,
  FileText
} from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MandateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mandates, isLoading } = useBuyingMandates();
  const [mandate, setMandate] = useState<BuyingMandate | null>(null);

  useEffect(() => {
    if (id && mandates.length > 0) {
      const foundMandate = mandates.find(m => m.id === id);
      setMandate(foundMandate || null);
    }
  }, [id, mandates]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!mandate) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">Mandato no encontrado</div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/mandatos')}
          className="mt-4"
        >
          Volver a mandatos
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Activo', className: 'bg-green-100 text-green-800 border-green-200' },
      paused: { label: 'Pausado', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      completed: { label: 'Completado', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800 border-red-200' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge className={`${config.className} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/mandatos')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{mandate.mandate_name}</h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Creado el {format(new Date(mandate.created_at), 'dd MMMM yyyy', { locale: es })}</span>
                <Separator orientation="vertical" className="h-4" />
                {getStatusBadge(mandate.status)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Target
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                    <p className="font-medium">{mandate.client_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contacto</label>
                    <p className="font-medium">{mandate.client_contact}</p>
                  </div>
                  {mandate.client_email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <button className="text-primary hover:text-primary/80 transition-colors">
                          {mandate.client_email}
                        </button>
                      </div>
                    </div>
                  )}
                  {mandate.client_phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <button className="text-primary hover:text-primary/80 transition-colors">
                          {mandate.client_phone}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabs for different sections */}
            <Tabs defaultValue="criteria" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="criteria">Criterios</TabsTrigger>
                <TabsTrigger value="targets">Targets</TabsTrigger>
                <TabsTrigger value="activities">Actividades</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="criteria" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Criterios de Búsqueda
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sectores objetivo</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {mandate.target_sectors?.map((sector, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-muted">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {mandate.target_locations && mandate.target_locations.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Ubicaciones objetivo</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {mandate.target_locations.map((location, idx) => (
                            <Badge key={idx} variant="outline" className="gap-1">
                              <MapPin className="h-3 w-3" />
                              {location}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {mandate.other_criteria && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Otros criterios</label>
                        <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                          {mandate.other_criteria}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="targets">
                <Card>
                  <CardHeader>
                    <CardTitle>Targets Identificados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">No hay targets identificados aún.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activities">
                <Card>
                  <CardHeader>
                    <CardTitle>Actividades Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">No hay actividades registradas.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Documentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">No hay documentos adjuntos.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Financial Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-primary" />
                  Criterios Financieros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Facturación mínima</label>
                  <p className="font-medium">{formatCurrency(mandate.min_revenue)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Facturación máxima</label>
                  <p className="font-medium">{formatCurrency(mandate.max_revenue)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">EBITDA mínimo</label>
                  <p className="font-medium">{formatCurrency(mandate.min_ebitda)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">EBITDA máximo</label>
                  <p className="font-medium">{formatCurrency(mandate.max_ebitda)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Assignment & Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Asignación y Fechas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Asignado a</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {mandate.assigned_user_name || 'Sin asignar'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de inicio</label>
                  <p className="font-medium">
                    {format(new Date(mandate.start_date), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
                {mandate.end_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fecha de fin</label>
                    <p className="font-medium">
                      {format(new Date(mandate.end_date), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}