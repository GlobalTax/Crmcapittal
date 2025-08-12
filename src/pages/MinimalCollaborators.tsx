import { useState } from 'react';
import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";
import { CreateCollaboratorDialog } from '@/components/collaborators/CreateCollaboratorDialog';
import { useCollaborators } from '@/hooks/useCollaborators';
import { Collaborator } from '@/types/Collaborator';

export default function MinimalCollaborators() {
  const {
    collaborators,
    loading,
    createCollaborator,
    updateCollaborator,
    deleteCollaborator,
    generateAgreement
  } = useCollaborators();

  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);

  const handleEditCollaborator = (collaborator: Collaborator) => {
    setEditingCollaborator(collaborator);
    console.log('Editar colaborador:', collaborator);
  };

  const handleDeleteCollaborator = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este colaborador?')) {
      deleteCollaborator(id);
    }
  };

  const handleGenerateAgreement = async (collaborator: Collaborator) => {
    try {
      await generateAgreement(collaborator);
    } catch (error) {
      console.error('Error generating agreement:', error);
    }
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      referente: { label: "Referente", color: "blue" as const },
      partner_comercial: { label: "Partner", color: "green" as const },
      consultor_externo: { label: "Consultor", color: "yellow" as const }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, color: "gray" as const };
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge color={isActive ? "green" : "gray"}>
        {isActive ? "Activo" : "Inactivo"}
      </Badge>
    );
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
          <p className="mt-2 text-gray-600">Cargando colaboradores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-end">
        <CreateCollaboratorDialog 
          onCreateCollaborator={createCollaborator}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Total Colaboradores</span>
          <span className="text-3xl font-bold mt-2 block">{collaborators.length}</span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Activos</span>
          <span className="text-3xl font-bold mt-2 block text-green-600">
            {collaborators.filter(c => c.is_active).length}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Referentes</span>
          <span className="text-3xl font-bold mt-2 block text-blue-600">
            {collaborators.filter(c => c.collaborator_type === 'referente').length}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Partners</span>
          <span className="text-3xl font-bold mt-2 block text-green-600">
            {collaborators.filter(c => c.collaborator_type === 'partner_comercial').length}
          </span>
        </div>
      </div>

      {/* Collaborators Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">{collaborators.length} colaboradores</h3>
        </div>
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Comisión</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Fecha registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableHeader>
            <TableBody>
              {collaborators.map((collaborator) => (
                <TableRow key={collaborator.id}>
                  <TableCell>
                    <div className="font-medium">{collaborator.name}</div>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(collaborator.collaborator_type)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(collaborator.is_active)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {collaborator.commission_percentage ? `${collaborator.commission_percentage}%` : 'N/A'}
                      </div>
                      {collaborator.base_commission && (
                        <div className="text-sm text-gray-500">
                          Base: €{collaborator.base_commission}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {collaborator.email && (
                        <div className="text-sm">{collaborator.email}</div>
                      )}
                      {collaborator.phone && (
                        <div className="text-sm text-gray-500">{collaborator.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(collaborator.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => handleEditCollaborator(collaborator)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleGenerateAgreement(collaborator)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Acuerdo
                      </button>
                      <button 
                        onClick={() => handleDeleteCollaborator(collaborator.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {collaborators.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay colaboradores registrados
              </h3>
              <p className="text-gray-500">
                Agrega tu primer colaborador para comenzar a gestionar tu red de partners
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Acciones Rápidas</h3>
        <div className="flex gap-3 flex-wrap">
          <Button variant="primary">Generar Reporte Comisiones</Button>
          <Button variant="secondary">Exportar Lista</Button>
          <Button variant="secondary">Configurar Plantillas</Button>
        </div>
      </div>
    </div>
  );
}