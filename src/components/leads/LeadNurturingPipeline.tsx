
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Mail, 
  Phone, 
  Calendar, 
  ArrowRight,
  Star,
  Zap,
  Target,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  MoreHorizontal,
  PlayCircle,
  PauseCircle
} from "lucide-react";
import { Lead, LeadStatus } from "@/types/Lead";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import LeadClosureActionDialog from './LeadClosureActionDialog';

interface NurturingStage {
  id: LeadStatus;
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  automations: string[];
}

interface LeadNurturingPipelineProps {
  leads?: Lead[];
  onUpdateLeadStatus?: (leadId: string, newStatus: LeadStatus) => void;
  onViewLead?: (lead: Lead) => void;
  onScheduleActivity?: (leadId: string, activityType: string) => void;
}

export const LeadNurturingPipeline = ({ 
  leads = [], 
  onUpdateLeadStatus,
  onViewLead,
  onScheduleActivity 
}: LeadNurturingPipelineProps) => {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [closureOpen, setClosureOpen] = useState(false);
  const [closureLead, setClosureLead] = useState<Lead | null>(null);

  // Definición de las etapas del pipeline de nurturing
  const nurturingStages: NurturingStage[] = [
    {
      id: "NEW",
      title: "Captura Inicial",
      description: "Leads recién capturados pendientes de primera evaluación",
      color: "bg-blue-50 border-blue-200",
      icon: <AlertCircle className="h-5 w-5 text-blue-600" />,
      automations: [
        "Email de bienvenida automático",
        "Asignación basada en reglas",
        "Scoring inicial automático"
      ]
    },
    {
      id: "CONTACTED",
      title: "Primer Contacto", 
      description: "Leads con primera interacción iniciada",
      color: "bg-yellow-50 border-yellow-200",
      icon: <Mail className="h-5 w-5 text-yellow-600" />,
      automations: [
        "Seguimiento automático si no responde",
        "Envío de contenido relevante",
        "Recordatorios de seguimiento"
      ]
    },
    {
      id: "NURTURING",
      title: "Nurturing Activo",
      description: "Leads en proceso de educación y calentamiento",
      color: "bg-purple-50 border-purple-200", 
      icon: <Zap className="h-5 w-5 text-purple-600" />,
      automations: [
        "Secuencia de emails educativos",
        "Invitaciones a webinars",
        "Contenido personalizado por industria"
      ]
    },
    {
      id: "QUALIFIED",
      title: "Cualificado",
      description: "Leads listos para oportunidad comercial",
      color: "bg-green-50 border-green-200",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      automations: [
        "Alerta al comercial asignado",
        "Programación de demo/reunión",
        "Preparación de propuesta"
      ]
    },
    {
      id: "CONVERTED",
      title: "Convertido",
      description: "Leads convertidos a contactos/deals",
      color: "bg-emerald-50 border-emerald-200",
      icon: <Target className="h-5 w-5 text-emerald-600" />,
      automations: [
        "Creación automática de contacto",
        "Generación de deal",
        "Transferencia a pipeline comercial"
      ]
    }
  ];

  // Datos mock para demostración
  const mockLeads: Lead[] = [
    {
      id: "lead_1",
      name: "María González",
      email: "maria.gonzalez@techstartup.com", 
      phone: "+34 600 123 456",
      company_name: "Tech Startup SL",
      stage: "pipeline",
      job_title: "CEO",
      source: "website_form",
      status: "NEW",
      priority: "HIGH",
      quality: "EXCELLENT", 
      lead_score: 85,
      assigned_to: { id: "luis_montanya", first_name: "Luis", last_name: "Montanya" },
      follow_up_count: 0,
      email_opens: 0,
      email_clicks: 0,
      website_visits: 3,
      content_downloads: 1,
      tags: ["CEO", "Tech", "High-Value"],
      created_at: "2024-01-22T10:30:00Z",
      updated_at: "2024-01-22T10:30:00Z"
    },
    {
      id: "lead_2",
      name: "Carlos Martín", 
      email: "carlos@distribuidora.com",
      phone: "+34 678 987 654",
      company_name: "Distribuidora Norte",
      job_title: "Director Financiero",
      source: "lead_marker",
      stage: "cualificado",
      status: "CONTACTED",
      priority: "MEDIUM",
      quality: "GOOD",
      lead_score: 72,
      assigned_to: { id: "samuel_lorente", first_name: "Samuel", last_name: "Lorente" },
      first_contact_date: "2024-01-20T14:15:00Z",
      follow_up_count: 2,
      email_opens: 3,
      email_clicks: 1,
      website_visits: 5,
      content_downloads: 2,
      tags: ["CFO", "Acquisition", "Mid-Market"],
      created_at: "2024-01-20T09:15:00Z",
      updated_at: "2024-01-21T16:30:00Z"
    },
    {
      id: "lead_3",
      name: "Ana Rodríguez",
      email: "ana.rodriguez@capittalmarket.com",
      company_name: "InnovateLabs", 
      job_title: "Founder",
      source: "capittal_market",
      stage: "pipeline",
      status: "NURTURING",
      priority: "HIGH",
      quality: "EXCELLENT",
      lead_score: 88,
      assigned_to: { id: "andrea_moreno", first_name: "Andrea", last_name: "Moreno" },
      first_contact_date: "2024-01-18T11:00:00Z",
      last_contact_date: "2024-01-21T15:45:00Z",
      next_follow_up_date: "2024-01-25T10:00:00Z",
      follow_up_count: 4,
      email_opens: 8,
      email_clicks: 4,
      website_visits: 12,
      content_downloads: 5,
      tags: ["Founder", "Startup", "Exit-Ready"],
      created_at: "2024-01-18T08:30:00Z",
      updated_at: "2024-01-21T15:45:00Z"
    },
    {
      id: "lead_4",
      name: "Roberto Silva",
      email: "roberto@manufacturing.com",
      company_name: "Manufacturing Pro",
      job_title: "COO", 
      source: "linkedin",
      stage: "cualificado",
      status: "QUALIFIED",
      priority: "URGENT",
      quality: "GOOD",
      lead_score: 91,
      assigned_to: { id: "pau_rifa", first_name: "Pau", last_name: "Rifa" },
      first_contact_date: "2024-01-15T13:20:00Z",
      last_contact_date: "2024-01-19T10:15:00Z",
      next_follow_up_date: "2024-01-23T14:00:00Z",
      follow_up_count: 5,
      email_opens: 6,
      email_clicks: 3,
      website_visits: 8,
      content_downloads: 3,
      tags: ["COO", "Manufacturing", "Ready-to-Buy"],
      created_at: "2024-01-15T13:20:00Z",
      updated_at: "2024-01-19T10:15:00Z"
    },
    {
      id: "lead_5",
      name: "Laura Fernández",
      email: "laura@converted-company.com",
      company_name: "Converted Company",
      job_title: "CEO",
      source: "referral",
      stage: "ganado",
      status: "CONVERTED",
      priority: "HIGH",
      quality: "EXCELLENT",
      lead_score: 95,
      assigned_to: { id: "luis_montanya", first_name: "Luis", last_name: "Montanya" },
      conversion_date: "2024-01-20T16:00:00Z",
      converted_to_contact_id: "contact_123",
      converted_to_deal_id: "deal_456",
      conversion_value: 150000,
      follow_up_count: 7,
      email_opens: 12,
      email_clicks: 8,
      website_visits: 20,
      content_downloads: 8,
      tags: ["CEO", "Converted", "High-Value"],
      created_at: "2024-01-10T09:00:00Z",
      updated_at: "2024-01-20T16:00:00Z"
    }
  ];

  const allLeads = leads.length > 0 ? leads : mockLeads;

  // Agrupar leads por etapa
  const leadsByStage = nurturingStages.reduce((acc, stage) => {
    acc[stage.id] = allLeads.filter(lead => lead.status === stage.id);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  // Calcular métricas por etapa
  const getStageMetrics = (stageId: LeadStatus) => {
    const stageLeads = leadsByStage[stageId] || [];
    const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.conversion_value || 0), 0);
    const avgScore = stageLeads.length > 0 
      ? Math.round(stageLeads.reduce((sum, lead) => sum + lead.lead_score, 0) / stageLeads.length)
      : 0;
    
    return {
      count: stageLeads.length,
      totalValue,
      avgScore
    };
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return "bg-gray-100 text-gray-800";
    
    switch (priority) {
      case "URGENT": return "bg-red-100 text-red-800";
      case "HIGH": return "bg-orange-100 text-orange-800";
      case "MEDIUM": return "bg-blue-100 text-blue-800";
      case "LOW": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    if (draggedLead && draggedLead.status !== newStatus) {
      onUpdateLeadStatus?.(draggedLead.id, newStatus);
    }
    setDraggedLead(null);
  };

  return (
    <div className="space-y-6">
      {/* Header del Pipeline */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pipeline de Nurturing</h2>
          <p className="text-gray-600">Gestión automatizada del recorrido del lead hasta la conversión</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <PlayCircle className="h-4 w-4 mr-2" />
            Activar Automatización
          </Button>
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver Métricas
          </Button>
        </div>
      </div>

      {/* Métricas Generales del Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total en Pipeline</p>
                <p className="text-2xl font-semibold text-gray-900">{allLeads.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Nurturing</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {leadsByStage.NURTURING?.length || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cualificados</p>
                <p className="text-2xl font-semibold text-green-600">
                  {leadsByStage.QUALIFIED?.length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Convertidos</p>
                <p className="text-2xl font-semibold text-emerald-600">
                  {leadsByStage.CONVERTED?.length || 0}
                </p>
              </div>
              <Target className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {nurturingStages.map((stage) => {
          const metrics = getStageMetrics(stage.id);
          const stageLeads = leadsByStage[stage.id] || [];
          
          return (
            <Card 
              key={stage.id} 
              className={`${stage.color} min-h-[600px]`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {stage.icon}
                    <CardTitle className="text-sm font-medium">{stage.title}</CardTitle>
                  </div>
                  <Badge variant="secondary">{metrics.count}</Badge>
                </div>
                <p className="text-xs text-gray-600">{stage.description}</p>
                
                {/* Métricas de la etapa */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-xs">
                    <span>Score promedio:</span>
                    <span className="font-medium">{metrics.avgScore}</span>
                  </div>
                  {metrics.totalValue > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>Valor total:</span>
                      <span className="font-medium">{formatCurrency(metrics.totalValue)}</span>
                    </div>
                  )}
                </div>

                {/* Automatizaciones activas */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Automatizaciones:</p>
                  {stage.automations.slice(0, 2).map((automation, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <Zap className="h-3 w-3 text-orange-500" />
                      <span className="text-xs text-gray-600">{automation}</span>
                    </div>
                  ))}
                  {stage.automations.length > 2 && (
                    <span className="text-xs text-gray-500">+{stage.automations.length - 2} más</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {stageLeads.map((lead) => (
                  <Card 
                    key={lead.id} 
                    className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-move"
                    draggable
                    onDragStart={() => handleDragStart(lead)}
                  >
                    <CardContent className="p-4">
                      {/* Lead Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{lead.name}</h4>
                          <p className="text-xs text-gray-600">{lead.company_name}</p>
                          <p className="text-xs text-gray-500">{lead.job_title}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setClosureLead(lead); setClosureOpen(true); }}>
                              <Target className="h-4 w-4 mr-2" />
                              Crear desde lead
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onViewLead?.(lead)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onScheduleActivity?.(lead.id, "email")}>
                              <Mail className="h-4 w-4 mr-2" />
                              Enviar Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onScheduleActivity?.(lead.id, "call")}>
                              <Phone className="h-4 w-4 mr-2" />
                              Programar Llamada
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onScheduleActivity?.(lead.id, "meeting")}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Agendar Reunión
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Lead Score y Prioridad */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs font-medium">{lead.lead_score}</span>
                          </div>
                          {lead.priority && (
                            <Badge variant="outline" className={getPriorityColor(lead.priority)}>
                              {lead.priority}
                            </Badge>
                          )}
                        </div>
                        
                        {lead.assigned_to && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                              {lead.assigned_to.first_name?.[0]}{lead.assigned_to.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      {/* Engagement Metrics */}
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-xs">
                          <span>Engagement:</span>
                          <span>{Math.round(((lead.email_opens || 0) + (lead.website_visits || 0)) / 2)}%</span>
                        </div>
                        <Progress 
                          value={Math.round(((lead.email_opens || 0) + (lead.website_visits || 0)) / 2)} 
                          className="h-1"
                        />
                        
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <div className="text-center">
                            <div className="font-medium">{lead.email_opens || 0}</div>
                            <div>Opens</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{lead.website_visits || 0}</div>
                            <div>Visits</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{lead.content_downloads || 0}</div>
                            <div>Downloads</div>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {lead.tags && lead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {lead.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {lead.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{lead.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Fecha y Próxima Acción */}
                      <div className="border-t pt-2 space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Creado:</span>
                          <span>{formatDate(lead.created_at)}</span>
                        </div>
                        {lead.next_follow_up_date && (
                          <div className="flex justify-between text-xs">
                            <span>Próximo:</span>
                            <span className="text-orange-600 font-medium">
                              {formatDate(lead.next_follow_up_date)}
                            </span>
                          </div>
                        )}
                        {lead.conversion_date && (
                          <div className="flex justify-between text-xs">
                            <span>Convertido:</span>
                            <span className="text-green-600 font-medium">
                              {formatDate(lead.conversion_date)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Valor de conversión si existe */}
                      {lead.conversion_value && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-center">
                          <span className="text-sm font-semibold text-green-700">
                            {formatCurrency(lead.conversion_value)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {stageLeads.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin leads en esta etapa</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Diálogo de creación desde lead */}
      {closureLead && (
        <LeadClosureActionDialog
          open={closureOpen}
          onOpenChange={(o) => { setClosureOpen(o); if (!o) setClosureLead(null); }}
          lead={closureLead}
        />
      )}
    </div>
  );
};
