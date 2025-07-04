import React, { useState } from 'react';
import { CreateCollaboratorDialog } from '@/components/collaborators/CreateCollaboratorDialog';
import { CollaboratorsTable } from '@/components/collaborators/CollaboratorsTable';
import { useCollaborators } from '@/hooks/useCollaborators';
import { Collaborator } from '@/types/Collaborator';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Users, UserCheck, UserPlus, TrendingUp } from 'lucide-react';

const Collaborators = () => {
  const {
    collaborators,
    loading,
    createCollaborator,
    updateCollaborator,
    deleteCollaborator
  } = useCollaborators();

  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);

  const handleEditCollaborator = (collaborator: Collaborator) => {
    setEditingCollaborator(collaborator);
    // TODO: Implementar modal de edición
    console.log('Editar colaborador:', collaborator);
  };

  const handleDeleteCollaborator = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este colaborador?')) {
      deleteCollaborator(id);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  const stats = [
    {
      title: "Total Colaboradores",
      value: collaborators.length,
      description: "Colaboradores registrados",
      icon: Users,
    },
    {
      title: "Activos",
      value: collaborators.filter(c => c.is_active).length,
      description: "Colaboradores activos",
      icon: UserCheck,
    },
    {
      title: "Referentes",
      value: collaborators.filter(c => c.collaborator_type === 'referente').length,
      description: "Colaboradores referentes",
      icon: UserPlus,
    },
    {
      title: "Partners",
      value: collaborators.filter(c => c.collaborator_type === 'partner_comercial').length,
      description: "Partners comerciales",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Colaboradores</h2>
          <p className="text-muted-foreground">
            Gestiona tu red de colaboradores y sus comisiones.
          </p>
        </div>
        <CreateCollaboratorDialog 
          onCreateCollaborator={createCollaborator}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <CollaboratorsTable
        collaborators={collaborators}
        onEditCollaborator={handleEditCollaborator}
        onDeleteCollaborator={handleDeleteCollaborator}
      />
    </div>
  );
};

export default Collaborators;