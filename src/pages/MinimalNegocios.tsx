import { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";
import { useNegocios } from "@/hooks/useNegocios";
import { useStages } from "@/hooks/useStages";
import { useBulkOperations } from "@/hooks/useBulkOperations";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useNegocioAutomations } from "@/hooks/useNegocioAutomations";
import { User, Briefcase, Building2, Users, Settings, BarChart3 } from "lucide-react";
// import { NegociosKanban } from "@/components/negocios/NegociosKanban";
const OptimizedNegociosKanban = lazy(() => import('@/components/negocios/OptimizedNegociosKanban').then(m => ({ default: m.OptimizedNegociosKanban })));
import { MetricCard } from "@/components/negocios/MetricCard";
import { MetricsBar } from "@/components/negocios/MetricsBar";
import { FilterBar } from "@/components/negocios/FilterBar";
import { BulkActionsBar } from "@/components/negocios/BulkActionsBar";
import { ActionHistory } from "@/components/negocios/ActionHistory";
import { NegocioTemplates } from "@/components/negocios/NegocioTemplates";
import { AdvancedAnalyticsDashboard } from "@/components/negocios/AdvancedAnalyticsDashboard";
import { CompanyDetailsDialog } from "@/components/companies/CompanyDetailsDialog";
import { ContactDetailsDialog } from "@/components/contacts/ContactDetailsDialog";
import { CreateNegocioDialog } from "@/components/negocios/CreateNegocioDialog";
import { NegocioDetailsDialog } from "@/components/negocios/NegocioDetailsDialog";
import { EditNegocioDialog } from "@/components/negocios/EditNegocioDialog";
import { Company } from "@/types/Company";
import { Contact } from "@/types/Contact";
import { Negocio } from "@/types/Negocio";



export default function MinimalNegocios() {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedNegocio, setSelectedNegocio] = useState<Negocio | null>(null);
  const [editingNegocio, setEditingNegocio] = useState<Negocio | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filteredNegocios, setFilteredNegocios] = useState<Negocio[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showActionHistory, setShowActionHistory] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const { negocios, loading, error, createNegocio, updateNegocio, updateNegocioStage } = useNegocios();
  const { stages } = useStages('DEAL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection handlers
  const handleSelectItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(displayNegocios.map(n => n.id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Search from topbar
  useEffect(() => {
    const handleSearch = (e: CustomEvent<{ query: string }>) => {
      setSearchQuery(e.detail.query);
    };

    window.addEventListener('negociosSearch', handleSearch as EventListener);
    return () => window.removeEventListener('negociosSearch', handleSearch as EventListener);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey)) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          // Undo functionality would be implemented here
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          // Redo functionality would be implemented here
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apply search and filtering
  const searchFilteredNegocios = negocios.filter(negocio => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      negocio.nombre_negocio?.toLowerCase().includes(searchLower) ||
      negocio.company?.name?.toLowerCase().includes(searchLower) ||
      negocio.contact?.name?.toLowerCase().includes(searchLower) ||
      negocio.descripcion?.toLowerCase().includes(searchLower)
    );
  });

  // Use filtered negocios for display, fallback to search filtered if not filtered yet
  const displayNegocios = filteredNegocios.length > 0 || negocios.length === 0 ? filteredNegocios : searchFilteredNegocios;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando negocios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  const handleCompanyClick = (negocio: any) => {
    if (negocio.company?.name) {
      // Create a minimal company object for the dialog
      const company: Company = {
        id: negocio.company.id || 'temp-id',
        name: negocio.company.name,
        company_size: '11-50' as any,
        company_type: 'cliente' as any,
        company_status: 'activa' as any,
        lifecycle_stage: 'customer' as any,
        is_target_account: false,
        is_key_account: false,
        is_franquicia: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        industry: negocio.company.industry,
        website: negocio.company.website
      };
      setSelectedCompany(company);
    }
  };

  const handleContactClick = (negocio: any) => {
    if (negocio.contact?.name) {
      const contact: Contact = {
        id: negocio.contact.id,
        name: negocio.contact.name,
        email: negocio.contact.email,
        phone: negocio.contact.phone,
        position: negocio.contact.position,
        contact_type: 'other' as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSelectedContact(contact);
    }
  };

  const handleCreateNegocio = async (negocioData: Omit<Negocio, 'id' | 'created_at' | 'updated_at'>) => {
    await createNegocio(negocioData);
    setIsCreateDialogOpen(false);
  };

  const handleEditNegocio = async (id: string, updates: Partial<Negocio>) => {
    await updateNegocio(id, updates);
    setEditingNegocio(null);
  };

  const handleViewNegocio = (negocio: Negocio) => {
    setSelectedNegocio(negocio);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Negocios</h1>
        <div className="flex items-center gap-3">
          <Button 
            variant="primary" 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Nuevo Negocio
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex justify-center mb-4">
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setViewMode('table')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                viewMode === 'table'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Tabla
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                viewMode === 'kanban'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Kanban
            </button>
          </nav>
        </div>
      </div>

      {/* Metrics Bar - Only show in Kanban mode */}
      {viewMode === 'kanban' && (
        <div className="py-6">
          <MetricsBar negocios={displayNegocios} stages={stages} />
        </div>
      )}

      {/* Advanced Filter Bar */}
      <FilterBar negocios={negocios} onFilteredChange={setFilteredNegocios} />

      {/* Select All Button - Only show in Kanban mode when deals exist */}
      {viewMode === 'kanban' && displayNegocios.length > 0 && (
        <div className="flex justify-start py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-2"
          >
            <div className="h-4 w-4 border border-muted-foreground rounded flex items-center justify-center">
              <div className="h-2 w-2 bg-muted-foreground rounded-sm opacity-50" />
            </div>
            Select all
          </Button>
        </div>
      )}

      {/* Basic Stats - Only show in Table mode */}
      {viewMode === 'table' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-6">
          <MetricCard
            label="Total Negocios"
            value={displayNegocios.length}
          />
          <MetricCard
            label="Activos"
            value={displayNegocios.filter(n => n.is_active).length}
            color="text-blue-600"
          />
          <MetricCard
            label="Alta Prioridad"
            value={displayNegocios.filter(n => n.prioridad === 'alta' || n.prioridad === 'urgente').length}
            color="text-orange-600"
          />
          <MetricCard
            label="Valor Total"
            value={`€${displayNegocios.reduce((sum, n) => sum + (n.valor_negocio || 0), 0).toLocaleString()}`}
          />
        </div>
      )}

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">{displayNegocios.length} negocios</h3>
          </div>
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableHead>Negocio</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableHeader>
              <TableBody>
                {displayNegocios.map((negocio) => (
                  <TableRow key={negocio.id}>
                    <TableCell>
                      <div className="font-medium">{negocio.nombre_negocio}</div>
                    </TableCell>
                    <TableCell>
                      {negocio.company?.name ? (
                        <button
                          onClick={() => handleCompanyClick(negocio)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                        >
                          <Building2 className="h-3 w-3" />
                          {negocio.company.name}
                        </button>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {negocio.contact?.name ? (
                        <button
                          onClick={() => handleContactClick(negocio)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-800 hover:underline text-sm font-medium"
                        >
                          <Users className="h-3 w-3" />
                          {negocio.contact.name}
                        </button>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {negocio.valor_negocio ? `€${negocio.valor_negocio.toLocaleString()}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge color="blue">{negocio.stage?.name || 'nuevo'}</Badge>
                    </TableCell>
                    <TableCell>{negocio.propietario_negocio || 'Sin asignar'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleViewNegocio(negocio)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Ver
                        </button>
                        <button 
                          onClick={() => setEditingNegocio(negocio)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Editar
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Vista Kanban</h3>
          </div>
          <div className="p-4">
            <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <OptimizedNegociosKanban
                negocios={displayNegocios}
                onUpdateStage={updateNegocioStage}
                onEdit={setEditingNegocio}
                onView={setSelectedNegocio}
                onAddNegocio={() => setIsCreateDialogOpen(true)}
                isLoading={loading}
                onRefresh={() => window.location.reload()}
                selectedIds={selectedIds}
                onSelectItem={handleSelectItem}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Company Details Modal */}
      {selectedCompany && (
        <CompanyDetailsDialog
          company={selectedCompany}
          open={!!selectedCompany}
          onOpenChange={(open) => !open && setSelectedCompany(null)}
          onEditCompany={(company) => {
            setSelectedCompany(null);
            // TODO: Implement edit company functionality
          }}
        />
      )}

      {/* Contact Details Modal */}
      {selectedContact && (
        <ContactDetailsDialog
          contact={selectedContact}
          open={!!selectedContact}
          onOpenChange={(open) => !open && setSelectedContact(null)}
          onEditContact={(contact) => {
            setSelectedContact(null);
            // TODO: Implement edit contact functionality
          }}
        />
      )}

      {/* Create Negocio Dialog */}
      <CreateNegocioDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateNegocio}
      />

      {/* Negocio Details Dialog */}
      {selectedNegocio && (
        <NegocioDetailsDialog
          negocio={selectedNegocio}
          open={!!selectedNegocio}
          onOpenChange={(open) => !open && setSelectedNegocio(null)}
          onEdit={setEditingNegocio}
        />
      )}

      {/* Edit Negocio Dialog */}
      {editingNegocio && (
        <EditNegocioDialog
          negocio={editingNegocio}
          open={!!editingNegocio}
          onOpenChange={(open) => !open && setEditingNegocio(null)}
          onSuccess={(updates) => handleEditNegocio(editingNegocio.id, updates)}
        />
      )}

      {/* Action History Modal */}
      {showActionHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Historial de Acciones</h2>
              <Button variant="secondary" onClick={() => setShowActionHistory(false)}>
                Cerrar
              </Button>
            </div>
            <ActionHistory />
          </div>
        </div>
      )}

      {/* Advanced Analytics Modal */}
      {showAdvancedAnalytics && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Analytics Avanzados</h2>
              <Button variant="secondary" onClick={() => setShowAdvancedAnalytics(false)}>
                Cerrar
              </Button>
            </div>
            <AdvancedAnalyticsDashboard negocios={displayNegocios} stages={stages} />
          </div>
        </div>
      )}
    </div>
  );
}