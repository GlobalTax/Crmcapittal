import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleLeadsTable } from "./SimpleLeadsTable";
import { LeadKanbanBoard } from "./LeadKanbanBoard";
import { LeadDetailDrawer } from "./LeadDetailDrawer";
import { UnifiedCard } from "@/components/ui/unified-card";
import { PageTitle, Text } from "@/components/ui/typography";
import { useLeadContacts } from "@/hooks/useLeadContacts";
import { Lead } from "@/types/Lead";
import { Users, TrendingUp, UserCheck, AlertCircle } from "lucide-react";

export const SimpleLeadManagement = () => {
  const [activeTab, setActiveTab] = useState("manage");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { leads, isLoading } = useLeadContacts();

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const handleDrawerClose = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) {
      setSelectedLead(null);
    }
  };

  // Calculate stats
  const stats = {
    total: leads.length,
    new: leads.filter(lead => lead.lead_status === 'NEW').length,
    contacted: leads.filter(lead => lead.lead_status === 'CONTACTED').length,
    qualified: leads.filter(lead => lead.lead_status === 'QUALIFIED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <PageTitle>Gestión de Leads</PageTitle>
        <Text variant="large" color="muted">
          Gestiona y realiza seguimiento de tus leads comerciales
        </Text>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manage">Lista</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <SimpleLeadsTable />
        </TabsContent>

        <TabsContent value="kanban" className="space-y-6">
          <LeadKanbanBoard onLeadClick={handleLeadClick} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <UnifiedCard
              variant="stats"
              title="Total Leads"
              metric={stats.total}
              description="Todos los leads registrados"
              icon={Users}
            />

            <UnifiedCard
              variant="stats"
              title="Nuevos"
              metric={stats.new}
              description="Leads sin contactar"
              icon={AlertCircle}
            />

            <UnifiedCard
              variant="stats"
              title="Contactados"
              metric={stats.contacted}
              description="Leads en proceso"
              icon={TrendingUp}
            />

            <UnifiedCard
              variant="stats"
              title="Calificados"
              metric={stats.qualified}
              description="Leads calificados"
              icon={UserCheck}
            />
          </div>

          <UnifiedCard variant="chart" title="Métricas de rendimiento">
            <div className="text-center py-8">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <Text color="muted">Próximamente: gráficos y métricas detalladas</Text>
            </div>
          </UnifiedCard>
        </TabsContent>

      </Tabs>

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        open={drawerOpen}
        onOpenChange={handleDrawerClose}
      />
    </div>
  );
};