
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  Target, 
  Clock, 
  Zap, 
  Filter, 
  Search, 
  Plus,
  Download,
  Settings,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  Globe,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Hourglass
} from "lucide-react";
import { Lead, LeadStatus, LeadSource, LeadPriority, LeadQuality } from "@/types/Lead";

interface LeadManagementDashboardProps {
  leads?: Lead[];
  onCreateLead?: () => void;
  onViewLead?: (lead: Lead) => void;
  onUpdateLead?: (leadId: string, updates: any) => void;
}

export const LeadManagementDashboard = ({ 
  leads = [], 
  onCreateLead,
  onViewLead,
  onUpdateLead 
}: LeadManagementDashboardProps) => {
  const [selectedTab, setSelectedTab] = useState("pipeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | "all">("all");

  // Datos mock para demostración
  const mockLeads: Lead[] = [
    {
      id: "lead_1",
      name: "María González",
      email: "maria.gonzalez@techstartup.com",
      phone: "+34 600 123 456",
      company_name: "Tech Startup SL",
      job_title: "CEO",
      message: "Interesada en servicios de valoración para posible venta",
      source: "website_form",
      form_data: {
        form_type: "consultation_request",
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "ma_services",
        landing_page: "/servicios-ma"
      },
      status: "NEW",
      priority: "HIGH",
      quality: "EXCELLENT",
      lead_score: 85,
      assigned_to_id: "luis_montanya",
      assigned_to: { id: "luis_montanya", first_name: "Luis", last_name: "Montanya" },
      follow_up_count: 0,
      email_opens: 0,
      email_clicks: 0,
      website_visits: 3,
      content_downloads: 1,
      tags: ["CEO", "Tech", "High-Value"],
      created_at: "2024-01-22T10:30:00Z",
      updated_at: "2024-01-22T10:30:00Z",
      last_activity_date: "2024-01-22T10:30:00Z"
    },
    {
      id: "lead_2", 
      name: "Carlos Martín",
      email: "carlos@distribuidora.com",
      phone: "+34 678 987 654",
      company_name: "Distribuidora Norte",
      job_title: "Director Financiero",
      message: "Necesito asesoramiento para adquisición",
      source: "lead_marker",
      form_data: {
        form_type: "demo_request",
        referrer_url: "https://leadmarker.com"
      },
      status: "CONTACTED",
      priority: "MEDIUM",
      quality: "GOOD",
      lead_score: 72,
      assigned_to_id: "samuel_lorente",
      assigned_to: { id: "samuel_lorente", first_name: "Samuel", last_name: "Lorente" },
      first_contact_date: "2024-01-20T14:15:00Z",
      follow_up_count: 2,
      email_opens: 3,
      email_clicks: 1,
      website_visits: 5,
      content_downloads: 2,
      tags: ["CFO", "Acquisition", "Mid-Market"],
      created_at: "2024-01-20T09:15:00Z",
      updated_at: "2024-01-21T16:30:00Z",
      last_activity_date: "2024-01-21T16:30:00Z"
    },
    {
      id: "lead_3",
      name: "Ana Rodríguez",
      email: "ana.rodriguez@capittalmarket.com", 
      phone: "+34 612 345 678",
      company_name: "InnovateLabs",
      job_title: "Founder",
      message: "Startup busca funding, posible exit strategy",
      source: "capittal_market",
      form_data: {
        form_type: "consultation_request",
        external_source: "capittal_market_platform"
      },
      status: "QUALIFIED",
      priority: "URGENT",
      quality: "EXCELLENT",
      lead_score: 93,
      assigned_to_id: "andrea_moreno",
      assigned_to: { id: "andrea_moreno", first_name: "Andrea", last_name: "Moreno" },
      first_contact_date: "2024-01-18T11:00:00Z",
      last_contact_date: "2024-01-21T15:45:00Z",
      next_follow_up_date: "2024-01-25T10:00:00Z",
      follow_up_count: 4,
      email_opens: 8,
      email_clicks: 4,
      website_visits: 12,
      content_downloads: 5,
      tags: ["Founder", "Startup", "Exit-Ready", "High-Value"],
      created_at: "2024-01-18T08:30:00Z",
      updated_at: "2024-01-21T15:45:00Z",
      last_activity_date: "2024-01-21T15:45:00Z"
    }
  ];

  const allLeads = leads.length > 0 ? leads : mockLeads;

  // Filtrado de leads
  const filteredLeads = allLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    const matchesPriority = priorityFilter === "all" || lead.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesSource && matchesPriority;
  });

  // Métricas calculadas
  const stats = {
    total: allLeads.length,
    new: allLeads.filter(l => l.status === "NEW").length,
    contacted: allLeads.filter(l => l.status === "CONTACTED").length,
    qualified: allLeads.filter(l => l.status === "QUALIFIED").length,
    nurturing: allLeads.filter(l => l.status === "NURTURING").length,
    converted: allLeads.filter(l => l.status === "CONVERTED").length,
    avgScore: Math.round(allLeads.reduce((acc, l) => acc + l.lead_score, 0) / allLeads.length) || 0,
    conversionRate: allLeads.length > 0 ? Math.round((allLeads.filter(l => l.status === "CONVERTED").length / allLeads.length) * 100) : 0
  };

  const getStatusIcon = (status: LeadStatus) => {
    switch (status) {
      case "NEW": return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case "CONTACTED": return <Mail className="h-4 w-4 text-yellow-600" />;
      case "QUALIFIED": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "DISQUALIFIED": return <XCircle className="h-4 w-4 text-red-600" />;
      case "NURTURING": return <Hourglass className="h-4 w-4 text-purple-600" />;
      case "CONVERTED": return <Target className="h-4 w-4 text-emerald-600" />;
      case "LOST": return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    const statusConfig = {
      NEW: { label: "Nuevo", color: "bg-blue-100 text-blue-800" },
      CONTACTED: { label: "Contactado", color: "bg-yellow-100 text-yellow-800" },
      QUALIFIED: { label: "Cualificado", color: "bg-green-100 text-green-800" },
      DISQUALIFIED: { label: "Descualificado", color: "bg-red-100 text-red-800" },
      NURTURING: { label: "En Nurturing", color: "bg-purple-100 text-purple-800" },
      CONVERTED: { label: "Convertido", color: "bg-emerald-100 text-emerald-800" },
      LOST: { label: "Perdido", color: "bg-gray-100 text-gray-800" }
    };
    
    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority?: LeadPriority) => {
    if (!priority) return null;
    
    const priorityConfig = {
      LOW: { label: "Baja", color: "bg-gray-100 text-gray-800" },
      MEDIUM: { label: "Media", color: "bg-blue-100 text-blue-800" },
      HIGH: { label: "Alta", color: "bg-orange-100 text-orange-800" },
      URGENT: { label: "Urgente", color: "bg-red-100 text-red-800" }
    };
    
    const config = priorityConfig[priority];
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const getQualityBadge = (quality?: LeadQuality) => {
    if (!quality) return null;
    
    const qualityConfig = {
      POOR: { label: "Bajo", color: "bg-red-100 text-red-800" },
      FAIR: { label: "Regular", color: "bg-yellow-100 text-yellow-800" },
      GOOD: { label: "Bueno", color: "bg-blue-100 text-blue-800" },
      EXCELLENT: { label: "Excelente", color: "bg-green-100 text-green-800" }
    };
    
    const config = qualityConfig[quality];
    return <Badge variant="secondary" className={config.color}>{config.label}</Badge>;
  };

  const getSourceIcon = (source: LeadSource) => {
    switch (source) {
      case "website_form": return <Globe className="h-4 w-4 text-blue-600" />;
      case "lead_marker": return <Target className="h-4 w-4 text-purple-600" />;
      case "capittal_market": return <Star className="h-4 w-4 text-orange-600" />;
      case "linkedin": return <Users className="h-4 w-4 text-blue-700" />;
      default: return <Globe className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-1">Gestión completa del pipeline de leads con nurturing automatizado</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-300">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          <Button variant="outline" className="border-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={onCreateLead}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Lead
          </Button>
        </div>
      </div>

      {/* Métricas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                <p className="text-xs text-green-600">+12% vs mes anterior</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Leads Nuevos</p>
                <p className="text-2xl font-semibold text-blue-600">{stats.new}</p>
                <p className="text-xs text-blue-600">Últimas 24h: {stats.new}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Score Promedio</p>
                <p className="text-2xl font-semibold text-purple-600">{stats.avgScore}</p>
                <p className="text-xs text-purple-600">Calidad: Excelente</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa Conversión</p>
                <p className="text-2xl font-semibold text-green-600">{stats.conversionRate}%</p>
                <p className="text-xs text-green-600">+3.2% vs mes anterior</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de contenido */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="nurturing">Nurturing</TabsTrigger>
          <TabsTrigger value="automation">Automatización</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Tab: Pipeline */}
        <TabsContent value="pipeline" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar leads por nombre, email o empresa..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | "all")}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="NEW">Nuevo</SelectItem>
                      <SelectItem value="CONTACTED">Contactado</SelectItem>
                      <SelectItem value="QUALIFIED">Cualificado</SelectItem>
                      <SelectItem value="NURTURING">Nurturing</SelectItem>
                      <SelectItem value="CONVERTED">Convertido</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as LeadSource | "all")}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="website_form">Web Form</SelectItem>
                      <SelectItem value="lead_marker">Lead Marker</SelectItem>
                      <SelectItem value="capittal_market">Capital Market</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as LeadPriority | "all")}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="MEDIUM">Media</SelectItem>
                      <SelectItem value="LOW">Baja</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Leads */}
          <div className="grid gap-4">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(lead.status)}
                        {getSourceIcon(lead.source)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                          {getPriorityBadge(lead.priority)}
                          {getQualityBadge(lead.quality)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {lead.phone}
                            </span>
                          )}
                          <span>{lead.company_name}</span>
                          <span>{lead.job_title}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span>Score: {lead.lead_score}</span>
                          <span>Creado: {formatDate(lead.created_at)}</span>
                          {lead.last_activity_date && (
                            <span>Última actividad: {formatDate(lead.last_activity_date)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusBadge(lead.status)}
                      
                      <div className="flex items-center space-x-1">
                        <div className="text-xs text-gray-500">
                          <div>Opens: {lead.email_opens || 0}</div>
                          <div>Visits: {lead.website_visits || 0}</div>
                        </div>
                      </div>

                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => onViewLead?.(lead)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {lead.message && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">"{lead.message}"</p>
                    </div>
                  )}

                  {lead.tags && lead.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {lead.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLeads.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron leads
                </h3>
                <p className="text-gray-500">
                  {searchQuery ? "Intenta con otros criterios de búsqueda" : "Los nuevos leads aparecerán aquí"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Nurturing (placeholder) */}
        <TabsContent value="nurturing">
          <Card>
            <CardHeader>
              <CardTitle>Lead Nurturing Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Sistema de nurturing automatizado en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Automation (placeholder) */}
        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Automatización y Reglas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Motor de automatización en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Analytics (placeholder) */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics y Reportes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Dashboard de analytics en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
