import { useState } from 'react';
import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";
import { useNegocios } from "@/hooks/useNegocios";
import { User, Briefcase, Building2, Users } from "lucide-react";
import { NegociosKanban } from "@/components/negocios/NegociosKanban";
import { CompanyDetailsDialog } from "@/components/companies/CompanyDetailsDialog";
import { ContactDetailsDialog } from "@/components/contacts/ContactDetailsDialog";
import { CreateNegocioDialog } from "@/components/negocios/CreateNegocioDialog";
import { NegocioDetailsDialog } from "@/components/negocios/NegocioDetailsDialog";
import { EditNegocioDialog } from "@/components/negocios/EditNegocioDialog";
import { Company } from "@/types/Company";
import { Contact } from "@/types/Contact";
import { Negocio } from "@/types/Negocio";



export default function MinimalNegocios() {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedNegocio, setSelectedNegocio] = useState<Negocio | null>(null);
  const [editingNegocio, setEditingNegocio] = useState<Negocio | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { negocios, loading, error, createNegocio, updateNegocio, updateNegocioStage } = useNegocios();

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-sm font-bold text-gray-900">Negocios</h1>
          <p className="text-gray-600 mt-1">Gestiona tus oportunidades de negocio</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant={viewMode === 'table' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('table')}
          >
            Tabla
          </Button>
          <Button 
            variant={viewMode === 'kanban' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
          <Button variant="primary" onClick={() => setIsCreateDialogOpen(true)}>Nuevo Negocio</Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border p-4">
        <input
          type="text"
          placeholder="Buscar negocios..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Total Negocios</span>
          <span className="text-sm font-bold mt-2 block">{negocios.length}</span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Activos</span>
          <span className="text-sm font-bold mt-2 block text-blue-600">
            {negocios.filter(n => n.is_active).length}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Alta Prioridad</span>
          <span className="text-sm font-bold mt-2 block text-orange-600">
            {negocios.filter(n => n.prioridad === 'alta' || n.prioridad === 'urgente').length}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Valor Total</span>
          <span className="text-sm font-bold mt-2 block">
            €{negocios.reduce((sum, n) => sum + (n.valor_negocio || 0), 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">{negocios.length} negocios</h3>
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
                {negocios.map((negocio) => (
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
            <NegociosKanban
              negocios={negocios}
              onUpdateStage={updateNegocioStage}
              onEdit={setEditingNegocio}
              onView={setSelectedNegocio}
            />
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
    </div>
  );
}