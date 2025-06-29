import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  Target, 
  Activity,
  Mail,
  Phone,
  Calendar,
  Star,
  Settings,
  Zap,
  RefreshCw
} from "lucide-react";
import { useLeadNurturing, useLeadScoring } from "@/hooks/useLeadNurturing";
import { useCapitalMarket } from "@/hooks/useCapitalMarket";
import { LeadStage } from "@/types/LeadNurturing";
import { LeadStatus, Lead } from "@/types/Lead";
import WebhookSettings from "./WebhookSettings";
import { LeadManagementDashboard } from "./LeadManagementDashboard";
import { LeadNurturingPipeline } from "./LeadNurturingPipeline";

const LeadNurturingDashboard = () => {
  const { leadScores, isLoading } = useLeadScoring();
  const { syncStatus, syncFromCapitalMarket, isSyncing } = useCapitalMarket();
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const { nurturingData, activities, updateStage } = useLeadNurturing(selectedLeadId);

  const getStageColor = (stage: LeadStage) => {
    const colors = {
      CAPTURED: "bg-blue-100 text-blue-800",
      QUALIFIED: "bg-green-100 text-green-800", 
      NURTURING: "bg-yellow-100 text-yellow-800",
      SALES_READY: "bg-purple-100 text-purple-800",
      CONVERTED: "bg-emerald-100 text-emerald-800",
      LOST: "bg-red-100 text-red-800"
    };
    return colors[stage] || "bg-gray-100 text-gray-800";
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: "HOT", color: "text-red-600" };
    if (score >= 60) return { level: "WARM", color: "text-orange-600" };
    if (score >= 40) return { level: "LUKEWARM", color: "text-yellow-600" };
    return { level: "COLD", color: "text-blue-600" };
  };

  const handleStageUpdate = (leadId: string, newStage: LeadStage) => {
    updateStage({ leadId, stage: newStage });
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    // Map LeadStatus to LeadStage for compatibility
    const stageMapping: Record<LeadStatus, LeadStage> = {
      'NEW': 'CAPTURED',
      'CONTACTED': 'CAPTURED',
      'QUALIFIED': 'QUALIFIED',
      'NURTURING': 'NURTURING',
      'CONVERTED': 'CONVERTED',
      'DISQUALIFIED': 'LOST',
      'LOST': 'LOST'
    };
    
    const mappedStage = stageMapping[newStatus];
    if (mappedStage) {
      handleStageUpdate(leadId, mappedStage);
    }
  };

  // Helper function to get nurturing data safely
  const getLeadNurturingData = (lead: any) => {
    if (Array.isArray(lead.lead_nurturing) && lead.lead_nurturing.length > 0) {
      return lead.lead_nurturing[0];
    }
    return null;
  };

  // Enhanced mock leads with Capital Market integration data
  const mockLeads: Lead[] = [
    {
      id: "lead_1",
      name: "María González",
      email: "maria.gonzalez@techstartup.com",
      company_name: "Tech Startup SL",
      status: "NEW",
      source: "website_form",
      lead_score: 85,
      created_at: "2024-01-22T10:30:00Z",
      updated_at: "2024-01-22T10:30:00Z",
      priority: "HIGH",
      quality: "EXCELLENT",
      phone: "+34 600 123 456",
      job_title: "CEO",
      message: "Interesada en servicios de valoración para posible venta",
      assigned_to: { id: "luis_montanya", first_name: "Luis", last_name: "Montanya" },
      follow_up_count: 0,
      email_opens: 3,
      email_clicks: 1,
      website_visits: 5,
      content_downloads: 2,
      tags: ["CEO", "Tech", "High-Value", "Auto-Qualified"],
      form_data: {
        form_type: "consultation_request",
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "ma_services",
        landing_page: "/servicios-ma",
        automation_triggered: true
      },
      lead_nurturing: [{
        lead_score: 85,
        engagement_score: 78,
        stage: "QUALIFIED",
        last_activity_date: "2024-01-22T10:30:00Z"
      }]
    },
    {
      id: "lead_2", 
      name: "Roberto Silva",
      email: "roberto@technovatex.com",
      company_name: "TechnovatEx",
      status: "QUALIFIED",
      source: "capittal_market",
      lead_score: 92,
      created_at: "2024-01-20T09:15:00Z",
      updated_at: "2024-01-21T16:30:00Z",
      priority: "URGENT",
      quality: "EXCELLENT",
      phone: "+34 611 222 333",
      job_title: "CEO",
      message: "Buscamos asesoramiento para posible venta tras 8 años de crecimiento",
      assigned_to: { id: "samuel_lorente", first_name: "Samuel", last_name: "Lorente" },
      external_id: "cm_001",
      external_source: "capital_market",
      first_contact_date: "2024-01-20T14:15:00Z",
      follow_up_count: 3,
      email_opens: 5,
      email_clicks: 3,
      website_visits: 8,
      content_downloads: 4,
      tags: ["CEO", "Tech", "Exit-Ready", "Capital Market", "High-Revenue"],
      form_data: {
        external_source: "capital_market",
        import_date: "2024-01-20T09:15:00Z",
        automation_sequence: "startup_exit_sequence"
      },
      lead_nurturing: [{
        lead_score: 92,
        engagement_score: 88,
        stage: "SALES_READY",
        last_activity_date: "2024-01-21T16:30:00Z"
      }]
    },
    {
      id: "lead_3",
      name: "Ana Rodríguez", 
      email: "ana.rodriguez@capittalmarket.com",
      company_name: "InnovateLabs",
      status: "QUALIFIED",
      source: "capittal_market",
      lead_score: 93,
      created_at: "2024-01-18T08:30:00Z",
      updated_at: "2024-01-21T15:45:00Z",
      priority: "URGENT",
      quality: "EXCELLENT",
      phone: "+34 612 345 678",
      job_title: "Founder",
      message: "Startup busca funding, posible exit strategy",
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
      form_data: {
        form_type: "consultation_request",
        external_source: "capittal_market_platform"
      },
      lead_nurturing: [{
        lead_score: 93,
        engagement_score: 88,
        stage: "SALES_READY",
        last_activity_date: "2024-01-21T15:45:00Z"
      }]
    }
  ];

  // Use enhanced mock data
  const leadsData = leadScores.length > 0 ? leadScores : mockLeads;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lead Nurturing Dashboard</h2>
          <p className="text-muted-foreground">
            Gestiona el proceso de nurturing automatizado desde captura hasta conversión
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => syncFromCapitalMarket()}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sync Capital Market'}
          </Button>
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            Automatización
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {leadsData.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hot Leads</p>
                <p className="text-2xl font-semibold text-red-600">
                  {leadsData.filter(lead => {
                    const nurturingData = getLeadNurturingData(lead);
                    return (nurturingData?.lead_score || lead.lead_score) >= 80;
                  }).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sales Ready</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {leadsData.filter(lead => {
                    const nurturingData = getLeadNurturingData(lead);
                    return nurturingData?.stage === 'SALES_READY';
                  }).length}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Capital Market</p>
                <p className="text-2xl font-semibold text-orange-600">
                  {leadsData.filter(lead => lead.source === 'capittal_market').length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Convertidos</p>
                <p className="text-2xl font-semibold text-green-600">
                  {leadsData.filter(lead => {
                    const nurturingData = getLeadNurturingData(lead);
                    return nurturingData?.stage === 'CONVERTED';
                  }).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capital Market Sync Status */}
      {syncStatus.lastSync && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Última sincronización Capital Market</p>
                  <p className="text-sm text-blue-700">
                    {syncStatus.lastSync.toLocaleString()} - {syncStatus.imported} leads importados
                  </p>
                </div>
              </div>
              {syncStatus.errors.length > 0 && (
                <Badge variant="destructive">{syncStatus.errors.length} errores</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="management" className="space-y-4">
        <TabsList>
          <TabsTrigger value="management">Lead Management</TabsTrigger>
          <TabsTrigger value="nurturing-pipeline">Pipeline Nurturing</TabsTrigger>
          <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
          <TabsTrigger value="activities">Actividades</TabsTrigger>
          <TabsTrigger value="automation">Automatización</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-4">
          <LeadManagementDashboard 
            leads={leadsData}
            onViewLead={(lead) => setSelectedLeadId(lead.id)}
            onUpdateLead={handleUpdateLeadStatus}
          />
        </TabsContent>

        <TabsContent value="nurturing-pipeline" className="space-y-4">
          <LeadNurturingPipeline 
            leads={leadsData}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onViewLead={(lead) => setSelectedLeadId(lead.id)}
            onScheduleActivity={(leadId, activityType) => {
              console.log('Schedule activity:', leadId, activityType);
              // Implement activity scheduling logic
            }}
          />
        </TabsContent>

        <TabsContent value="scoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leadsData
                  .sort((a, b) => {
                    const scoreA = getLeadNurturingData(a)?.lead_score || a.lead_score || 0;
                    const scoreB = getLeadNurturingData(b)?.lead_score || b.lead_score || 0;
                    return scoreB - scoreA;
                  })
                  .slice(0, 20)
                  .map((lead) => {
                    const nurturingData = getLeadNurturingData(lead);
                    const score = nurturingData?.lead_score || lead.lead_score || 0;
                    const scoreLevel = getScoreLevel(score);
                    
                    return (
                      <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                          <div className="text-sm text-gray-500">{lead.company_name}</div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStageColor(nurturingData?.stage || 'CAPTURED')}>
                            {nurturingData?.stage || 'CAPTURED'}
                          </Badge>
                          <div className="text-right">
                            <div className={`font-bold ${scoreLevel.color}`}>
                              {score} pts
                            </div>
                            <div className={`text-sm ${scoreLevel.color}`}>
                              {scoreLevel.level}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          {selectedLeadId && (
            <Card>
              <CardHeader>
                <CardTitle>Actividades del Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium">{activity.activity_type}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="outline">+{activity.points_awarded} pts</Badge>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-center text-gray-500">No hay actividades registradas</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Automatización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Reglas Activas</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Bienvenida Lead Nuevo</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Activa</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Cualificación Automática</span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Activa</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Estadísticas de Automatización</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Emails automáticos enviados</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tareas creadas automáticamente</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Leads cualificados automáticamente</span>
                      <span className="font-medium">8</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <WebhookSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadNurturingDashboard;
