
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const Leads = () => {
  const navigate = useNavigate();
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

  const handleViewLead = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const handleAssignLead = (leadId: string, userId: string) => {
    updateLead({ id: leadId, updates: { assigned_to_id: userId } });
  };

  const handleDeleteLead = (leadId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este lead?')) {
      deleteLead(leadId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bandeja de Leads</h1>
              <p className="text-gray-600">Gestiona y convierte tus leads en oportunidades</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <CreateLeadDialog onCreateLead={createLead} isCreating={isCreating} />
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status-filter">Estado</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | 'all')}>
                <SelectTrigger>
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Nuevos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {leads.filter(l => l.status === 'NEW').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Contactados</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {leads.filter(l => l.status === 'CONTACTED').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Calificados</p>
                <p className="text-2xl font-bold text-green-600">
                  {leads.filter(l => l.status === 'QUALIFIED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <LeadsTable
              leads={leads}
              onViewLead={handleViewLead}
              onDeleteLead={handleDeleteLead}
              onAssignLead={handleAssignLead}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leads;
