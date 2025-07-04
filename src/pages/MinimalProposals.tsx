import { useState } from 'react';
import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";
import { useProposals } from '@/hooks/useProposals';
import { ProposalWizard } from '@/components/proposals/ProposalWizard';

export default function MinimalProposals() {
  const { proposals, loading, createProposal } = useProposals();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.contact?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.company?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propuestas</h1>
          <p className="text-gray-600 mt-1">Gestiona y crea propuestas de honorarios</p>
        </div>
        <Button 
          variant="primary"
          onClick={() => setIsWizardOpen(true)}
        >
          Nueva Propuesta
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar propuestas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Total Propuestas</span>
          <span className="text-3xl font-bold mt-2 block">{proposals.length}</span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Borradores</span>
          <span className="text-3xl font-bold mt-2 block text-gray-600">
            {proposals.filter(p => p.status === 'draft').length}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Aprobadas</span>
          <span className="text-3xl font-bold mt-2 block text-green-600">
            {proposals.filter(p => p.status === 'approved').length}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Valor Total</span>
          <span className="text-3xl font-bold mt-2 block">
            €{proposals.reduce((sum, p) => sum + (p.total_amount || 0), 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">
            {filteredProposals.length} propuestas
            {searchQuery && ` (filtradas de ${proposals.length})`}
          </h3>
        </div>
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableHead>Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableHeader>
            <TableBody>
              {filteredProposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell>
                    <div className="font-medium">{proposal.title}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{proposal.contact?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{proposal.company?.name || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {proposal.total_amount ? `€${proposal.total_amount.toLocaleString()}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(proposal.status)}
                  </TableCell>
                  <TableCell>
                    {formatDate(proposal.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Ver
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Editar
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredProposals.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron propuestas
              </h3>
              <p className="text-gray-500">
                {searchQuery ? 
                  "Intenta con otros términos de búsqueda" : 
                  "Crea tu primera propuesta para comenzar"
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Wizard Dialog */}
      <ProposalWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleCreateProposal}
      />
    </div>
  );
}