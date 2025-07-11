import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useLead } from '@/hooks/useLeads';
import { LeadStatus } from '@/types/Lead';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  Building, 
  Calendar,
  User,
  Star,
  TrendingUp,
  MessageCircle,
  FileText,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { lead, isLoading } = useLead(id || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando lead...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Lead no encontrado</h2>
          <Button onClick={() => navigate('/gestion-leads')}>
            Volver a leads
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: LeadStatus) => {
    const variants = {
      'NEW': 'bg-blue-100 text-blue-800 border-blue-200',
      'CONTACTED': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'QUALIFIED': 'bg-green-100 text-green-800 border-green-200',
      'DISQUALIFIED': 'bg-red-100 text-red-800 border-red-200',
      'NURTURING': 'bg-purple-100 text-purple-800 border-purple-200',
      'CONVERTED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'LOST': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/gestion-leads')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a leads
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-2xl font-bold">{lead.name}</h1>
                <p className="text-muted-foreground">{lead.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(lead.status)}
              <Button size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="activity">Actividad</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Información del contacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                        <p className="font-medium">{lead.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-primary">{lead.email}</p>
                      </div>
                      {lead.phone && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                          <p className="text-primary">{lead.phone}</p>
                        </div>
                      )}
                      {lead.company_name && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                          <p className="font-medium">{lead.company_name}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Información del lead
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Estado</label>
                        <div className="mt-1">
                          {getStatusBadge(lead.status)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Fuente</label>
                        <p className="font-medium capitalize">{lead.source.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Puntuación</label>
                        <p className="font-medium">{lead.lead_score}/100</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Propietario</label>
                        <p className="font-medium">
                          {lead.assigned_to 
                            ? `${lead.assigned_to.first_name} ${lead.assigned_to.last_name}`
                            : 'Sin asignar'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {lead.message && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Mensaje inicial
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{lead.message}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Actividad reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Lead creado</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(lead.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2" />
                        <p>No hay más actividad registrada</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Notas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <p>No hay notas registradas</p>
                      <Button variant="outline" className="mt-4">
                        Añadir nota
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar email
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Programar reunión
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de creación</label>
                  <p className="text-sm">
                    {format(new Date(lead.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Última actualización</label>
                  <p className="text-sm">
                    {format(new Date(lead.updated_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}