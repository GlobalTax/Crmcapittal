import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BuyingMandate } from "@/types/BuyingMandate";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Users, 
  Euro, 
  Calendar, 
  TrendingUp,
  Building,
  Phone,
  Mail,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

export const BuyingMandateDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [mandate, setMandate] = useState<BuyingMandate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  // Mock data for activities, tasks, etc.
  const mockActivities = [
    {
      id: '1',
      title: 'Mandato creado',
      description: 'Se ha iniciado el mandato de búsqueda para el cliente',
      created_at: new Date().toISOString(),
      activity_type: 'mandate_created'
    },
    {
      id: '2',
      title: 'Criterios definidos',
      description: 'Se han establecido los criterios de búsqueda y sectores objetivo',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      activity_type: 'criteria_set'
    }
  ];

  const mockTasks = [
    {
      id: '1',
      title: 'Identificar empresas objetivo',
      description: 'Buscar empresas que cumplan con los criterios establecidos',
      completed: false,
      priority: 'high',
      due_date: new Date(Date.now() + 604800000).toISOString()
    },
    {
      id: '2',
      title: 'Preparar teaser inicial',
      description: 'Crear documento de presentación para las empresas objetivo',
      completed: false,
      priority: 'medium',
      due_date: new Date(Date.now() + 1209600000).toISOString()
    }
  ];

  const mockDocuments = [
    {
      id: '1',
      document_name: 'Mandato firmado',
      document_type: 'legal',
      file_url: '#',
      is_confidential: true
    },
    {
      id: '2',
      document_name: 'Criterios de búsqueda',
      document_type: 'general',
      file_url: '#',
      is_confidential: false
    }
  ];

  const mockPeople = [
    {
      id: '1',
      name: mandate?.client_contact || 'Contacto Principal',
      email: mandate?.client_email,
      phone: mandate?.client_phone,
      company: mandate?.client_name,
      role_in_mandate: 'Cliente',
      position: 'Director General'
    }
  ];

  const mockInterestedParties: any[] = [];

  useEffect(() => {
    if (id) {
      fetchMandateData();
    }
  }, [id]);

  const fetchMandateData = async () => {
    try {
      setLoading(true);
      
      // Fetch mandate details
      const { data: mandateData, error: mandateError } = await supabase
        .from('buying_mandates')
        .select('*')
        .eq('id', id)
        .single();

      if (mandateError) throw mandateError;
      setMandate(mandateData as BuyingMandate);

    } catch (error) {
      console.error('Error fetching mandate data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del mandato",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { label: 'Activo', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      'paused': { label: 'Pausado', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      'completed': { label: 'Completado', variant: 'outline' as const, className: 'bg-blue-100 text-blue-800' },
      'cancelled': { label: 'Cancelado', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.active;
    
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'low':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Cargando...</div>;
  }

  if (!mandate) {
    return <div className="flex items-center justify-center h-96">Mandato no encontrado</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/buying-mandates')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{mandate.mandate_name}</h1>
            <p className="text-muted-foreground">
              Mandato de compra - {mandate.client_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(mandate.status)}
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generar Informe
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left side - 3/4 width */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="summary">Resumen</TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="tasks">Tareas</TabsTrigger>
              <TabsTrigger value="people">Personas</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
              <TabsTrigger value="interested">Interesados</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Presupuesto</CardTitle>
                    <Euro className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mandate.min_revenue && mandate.max_revenue 
                        ? `€${(mandate.min_revenue / 1000000).toFixed(1)}M - €${(mandate.max_revenue / 1000000).toFixed(1)}M`
                        : 'Por definir'
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rango de facturación objetivo
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Targets Identificados</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Empresas identificadas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Días Activo</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.floor((new Date().getTime() - new Date(mandate.start_date).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Desde inicio del mandato
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progreso</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">25%</div>
                    <p className="text-xs text-muted-foreground">
                      Identificación en curso
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Sectores objetivo */}
              <Card>
                <CardHeader>
                  <CardTitle>Criterios de Búsqueda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Sectores Objetivo</h4>
                    <div className="flex flex-wrap gap-2">
                      {mandate.target_sectors.map((sector, index) => (
                        <Badge key={index} variant="outline">{sector}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Ubicaciones</h4>
                    <div className="flex flex-wrap gap-2">
                      {mandate.target_locations?.map((location, index) => (
                        <Badge key={index} variant="outline">{location}</Badge>
                      ))}
                    </div>
                  </div>
                  {mandate.other_criteria && (
                    <div>
                      <h4 className="font-medium mb-2">Otros Criterios</h4>
                      <p className="text-sm text-muted-foreground">{mandate.other_criteria}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Cronología de Actividades</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Actividad
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 border-b pb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Documentos</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Subir Documento
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{doc.document_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {doc.document_type}
                          </Badge>
                          {doc.is_confidential && (
                            <Badge variant="secondary" className="text-xs">
                              Confidencial
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Tareas Pendientes</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Tarea
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockTasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          {getPriorityIcon(task.priority)}
                          {task.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 border-2 border-gray-300 rounded"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground">{task.description}</p>
                          )}
                          {task.due_date && (
                            <p className="text-xs text-muted-foreground">
                              Vence: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="people" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Personas Involucradas</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Persona
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockPeople.map((person) => (
                      <div key={person.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{person.name}</p>
                          {person.position && (
                            <p className="text-xs text-muted-foreground">{person.position}</p>
                          )}
                          {person.company && (
                            <p className="text-xs text-muted-foreground">{person.company}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-1">
                            {person.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span className="text-xs">{person.email}</span>
                              </div>
                            )}
                            {person.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span className="text-xs">{person.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">{person.role_in_mandate}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Notas del Mandato</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Nota
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    No hay notas registradas
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interested" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Partes Interesadas</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Interesado
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockInterestedParties.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No hay partes interesadas registradas
                      </p>
                    ) : (
                      mockInterestedParties.map((party) => (
                        <div key={party.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                          <Building className="h-8 w-8 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{party.party_name}</p>
                            {party.contact_person && (
                              <p className="text-xs text-muted-foreground">
                                Contacto: {party.contact_person}
                              </p>
                            )}
                            {party.notes && (
                              <p className="text-xs text-muted-foreground">{party.notes}</p>
                            )}
                          </div>
                          <div className="flex flex-col space-y-1">
                            <Badge variant="outline">{party.interest_level}</Badge>
                            <Badge variant="secondary">{party.status}</Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar - 1/4 width */}
        <div className="space-y-4">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Cliente</h4>
                <p className="text-sm">{mandate.client_name}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Contacto</h4>
                <p className="text-sm">{mandate.client_contact}</p>
              </div>
              {mandate.client_email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{mandate.client_email}</span>
                </div>
              )}
              {mandate.client_phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{mandate.client_phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mandate Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles del Mandato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Tipo</h4>
                <p className="text-sm capitalize">{mandate.mandate_type}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Fecha de Inicio</h4>
                <p className="text-sm">{new Date(mandate.start_date).toLocaleDateString()}</p>
              </div>
              {mandate.end_date && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Fecha de Fin</h4>
                  <p className="text-sm">{new Date(mandate.end_date).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Estado</h4>
                {getStatusBadge(mandate.status)}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Añadir Target
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Generar Teaser
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Contactar Cliente
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Programar Seguimiento
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};