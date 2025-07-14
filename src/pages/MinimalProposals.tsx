import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { UnifiedCard } from "@/components/ui/unified-card";
import AdvancedTable from "@/components/ui/minimal/AdvancedTable";
import { useProposals } from '@/hooks/useProposals';
import { ProposalWizard } from '@/components/proposals/ProposalWizard';
import { FileText, Users, CheckCircle, Euro, Plus } from "lucide-react";

export default function MinimalProposals() {
  const { proposals, loading, createProposal } = useProposals();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Definir columnas para la tabla de propuestas
  const proposalColumns = [
    { id: 'title', label: 'Título', visible: true },
    { id: 'client', label: 'Cliente', visible: true },
    { id: 'company', label: 'Empresa', visible: true },
    { id: 'value', label: 'Valor', visible: true },
    { id: 'status', label: 'Estado', visible: true },
    { id: 'date', label: 'Fecha', visible: true },
    { id: 'actions', label: 'Acciones', visible: true }
  ];

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.contact?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.company?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Preparar datos para la tabla avanzada
  const tableData = filteredProposals.map(proposal => ({
    id: proposal.id,
    title: <div className="font-medium">{proposal.title}</div>,
    client: proposal.contact?.name || 'N/A',
    company: <div className="text-sm text-gray-500">{proposal.company?.name || 'N/A'}</div>,
    value: proposal.total_amount ? `€${proposal.total_amount.toLocaleString()}` : 'N/A',
    status: getStatusBadge(proposal.status),
    date: formatDate(proposal.created_at),
    actions: (
      <div className="flex gap-2 justify-end">
        <button className="text-blue-600 hover:text-blue-800 text-sm">Ver</button>
        <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
      </div>
    )
  }));

  const handleCreateProposal = async (data: any) => {
    await createProposal(data);
    setIsWizardOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Borrador", color: "gray" as const },
      sent: { label: "Enviada", color: "blue" as const },
      approved: { label: "Aprobada", color: "green" as const },
      rejected: { label: "Rechazada", color: "red" as const },
      expired: { label: "Expirada", color: "yellow" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando propuestas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Page Header */}
      <PageHeader
        title="Propuestas"
        description="Gestiona y crea propuestas de honorarios profesionales"
        badge={{ text: `${proposals.length} propuestas`, variant: 'secondary' }}
        actions={
          <Button onClick={() => setIsWizardOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Propuesta
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Propuestas"
          value={proposals.length.toLocaleString()}
          description="Propuestas creadas"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatsCard
          title="Borradores"
          value={proposals.filter(p => p.status === 'draft').length.toLocaleString()}
          description="En desarrollo"
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Aprobadas"
          value={proposals.filter(p => p.status === 'approved').length.toLocaleString()}
          description="Aceptadas"
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatsCard
          title="Valor Total"
          value={`€${proposals.reduce((sum, p) => sum + (p.total_amount || 0), 0).toLocaleString()}`}
          description="Valor total"
          icon={<Euro className="h-5 w-5" />}
        />
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar propuestas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="sent">Enviada</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
              <option value="expired">Expirada</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Proposals Table */}
      <UnifiedCard 
        title={`${filteredProposals.length} propuestas${searchQuery ? ` (filtradas de ${proposals.length})` : ''}`}
        className="p-0"
      >
        <div className="p-6">
          <AdvancedTable
            data={tableData}
            columns={proposalColumns}
            className=""
          />
        </div>
      </UnifiedCard>

      {/* Wizard Dialog */}
      <ProposalWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleCreateProposal}
      />
    </div>
  );
}