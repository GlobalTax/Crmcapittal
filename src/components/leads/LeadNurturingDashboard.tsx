
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
  Settings
} from "lucide-react";
import { useLeadNurturing, useLeadScoring } from "@/hooks/useLeadNurturing";
import { LeadStage } from "@/types/LeadNurturing";
import { LeadStatus } from "@/types/Lead";
import WebhookSettings from "./WebhookSettings";
import { LeadManagementDashboard } from "./LeadManagementDashboard";
import { LeadNurturingPipeline } from "./LeadNurturingPipeline";

const LeadNurturingDashboard = () => {
  const { leadScores, isLoading } = useLeadScoring();
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
            Gestiona el proceso de nurturing desde captura hasta conversión
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {leadScores.length}
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
                  {leadScores.filter(lead => {
                    const nurturingData = getLeadNurturingData(lead);
                    return nurturingData?.lead_score >= 80;
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
                  {leadScores.filter(lead => {
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
                <p className="text-sm text-gray-600">Convertidos</p>
                <p className="text-2xl font-semibold text-green-600">
                  {leadScores.filter(lead => {
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

      <Tabs defaultValue="management" className="space-y-4">
        <TabsList>
          <TabsTrigger value="management">Lead Management</TabsTrigger>
          <TabsTrigger value="nurturing-pipeline">Pipeline Nurturing</TabsTrigger>
          <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
          <TabsTrigger value="activities">Actividades</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-4">
          <LeadManagementDashboard 
            leads={leadScores}
            onViewLead={(lead) => setSelectedLeadId(lead.id)}
            onUpdateLead={handleUpdateLeadStatus}
          />
        </TabsContent>

        <TabsContent value="nurturing-pipeline" className="space-y-4">
          <LeadNurturingPipeline 
            leads={leadScores}
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
                {leadScores
                  .sort((a, b) => {
                    const scoreA = getLeadNurturingData(a)?.lead_score || 0;
                    const scoreB = getLeadNurturingData(b)?.lead_score || 0;
                    return scoreB - scoreA;
                  })
                  .slice(0, 20)
                  .map((lead) => {
                    const nurturingData = getLeadNurturingData(lead);
                    const score = nurturingData?.lead_score || 0;
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

        <TabsContent value="webhooks" className="space-y-4">
          <WebhookSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadNurturingDashboard;
