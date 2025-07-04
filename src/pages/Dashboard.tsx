import { useState } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { EmailStatsCard } from "@/components/dashboard/EmailStatsCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLeads } from "@/hooks/useLeads";
import { useUsers } from "@/hooks/useUsers";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { CreateLeadDialog } from "@/components/leads/CreateLeadDialog";
import { LeadDetailDialog } from "@/components/leads/LeadDetailDialog";
import { LeadStatus } from "@/types/Lead";
import { Bell, Users, TrendingUp, UserCheck, Heart, CheckCircle, XCircle } from "lucide-react";

const Dashboard = () => {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { users } = useUsers();

  const filters = {
    ...(statusFilter !== 'all' && { status: statusFilter as LeadStatus }),
    ...(assignedFilter !== 'all' && { assigned_to_id: assignedFilter })
  };

  const {
    leads,
    isLoading,
    createLead,
    updateLead,
    deleteLead,
    convertLead,
    isCreating,
    isConverting
  } = useLeads(filters);

  const stats = [
    {
      title: "Total Leads",
      value: leads.length,
      description: "Leads en el sistema",
      icon: Bell,
    },
    {
      title: "Nuevos",
      value: leads.filter(l => l.status === 'NEW').length,
      description: "Pendientes de contacto",
      icon: Users,
    },
    {
      title: "Contactados",
      value: leads.filter(l => l.status === 'CONTACTED').length,
      description: "En proceso",
      icon: TrendingUp,
    },
    {
      title: "Calificados",
      value: leads.filter(l => l.status === 'QUALIFIED').length,
      description: "Listos para conversión",
      icon: UserCheck,
    },
    {
      title: "Nutriendo",
      value: leads.filter(l => l.status === 'NURTURING').length,
      description: "En seguimiento automatizado",
      icon: Heart,
    },
    {
      title: "Convertidos",
      value: leads.filter(l => l.status === 'CONVERTED').length,
      description: "Transformados en clientes",
      icon: CheckCircle,
    },
    {
      title: "Perdidos",
      value: leads.filter(l => l.status === 'LOST').length,
      description: "Oportunidades perdidas",
      icon: XCircle,
    },
  ];

  const handleAssignLead = (leadId: string, userId: string) => {
    updateLead({ id: leadId, updates: { assigned_to_id: userId } });
  };

  const handleDeleteLead = (leadId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este lead?')) {
      deleteLead(leadId);
    }
  };

  const handleConvertLead = (leadId: string, options: { createCompany: boolean; createDeal: boolean }) => {
    convertLead({ leadId, options });
  };

  const handleViewLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      setDetailDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Control Leads</h2>
          <p className="text-muted-foreground">
            Gestiona y convierte tus leads en oportunidades de negocio.
          </p>
        </div>
        <CreateLeadDialog onCreateLead={createLead} isCreating={isCreating} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.slice(0, 4).map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.slice(4).map((stat, index) => (
          <StatsCard key={index + 4} {...stat} />
        ))}
      </div>

      {/* Email Stats Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Estadísticas de Email</h3>
        <EmailStatsCard />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="status-filter">Estado</Label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="NEW">Nuevo</SelectItem>
              <SelectItem value="CONTACTED">Contactado</SelectItem>
              <SelectItem value="QUALIFIED">Calificado</SelectItem>
              <SelectItem value="NURTURING">Nutriendo</SelectItem>
              <SelectItem value="CONVERTED">Convertido</SelectItem>
              <SelectItem value="LOST">Perdido</SelectItem>
              <SelectItem value="DISQUALIFIED">Descalificado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="assigned-filter">Asignado a</Label>
          <Select value={assignedFilter} onValueChange={setAssignedFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los usuarios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los usuarios</SelectItem>
              <SelectItem value="unassigned">Sin asignar</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  {user.first_name} {user.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <LeadsTable
            leads={leads}
            onViewLead={handleViewLead}
            onDeleteLead={handleDeleteLead}
            onAssignLead={handleAssignLead}
            onConvertLead={handleConvertLead}
            isLoading={isLoading}
            isConverting={isConverting}
          />
        </div>
      </div>

      <LeadDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        lead={selectedLead}
      />
    </div>
  );
};

export default Dashboard;