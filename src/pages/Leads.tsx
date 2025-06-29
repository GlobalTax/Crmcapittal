
import { useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
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
import { LeadsTable } from "@/components/leads/LeadsTable";
import { CreateLeadDialog } from "@/components/leads/CreateLeadDialog";
import { LeadStatus } from "@/types/Lead";
import { Bell, Users, TrendingUp, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const Leads = () => {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');

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
    isCreating
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
  ];

  const handleAssignLead = (leadId: string, userId: string) => {
    updateLead({ id: leadId, updates: { assigned_to_id: userId } });
  };

  const handleDeleteLead = (leadId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este lead?')) {
      deleteLead(leadId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bandeja de Leads</h2>
          <p className="text-sm text-slate-600">
            Gestiona y convierte tus leads en oportunidades de negocio.
          </p>
        </div>
        <CreateLeadDialog onCreateLead={createLead} isCreating={isCreating} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Email Stats Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-900">Estadísticas de Email</h3>
        <EmailStatsCard />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="status-filter" className="text-sm font-medium text-slate-600">Estado</Label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | 'all')}>
            <SelectTrigger className="border-slate-200">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="NEW">Nuevo</SelectItem>
              <SelectItem value="CONTACTED">Contactado</SelectItem>
              <SelectItem value="QUALIFIED">Calificado</SelectItem>
              <SelectItem value="DISQUALIFIED">Descalificado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <LeadsTable
            leads={leads}
            onViewLead={(leadId) => console.log('Ver lead:', leadId)}
            onDeleteLead={handleDeleteLead}
            onAssignLead={handleAssignLead}
            isLoading={isLoading}
          />
        </div>
      </Card>
    </div>
  );
};

export default Leads;
