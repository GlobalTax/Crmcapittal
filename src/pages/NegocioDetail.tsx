
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Negocio } from "@/types/Negocio";
import { useNegocios } from "@/hooks/useNegocios";
import { EditNegocioDialog } from "@/components/negocios/EditNegocioDialog";
import { NegocioHeader } from "@/components/negocios/detail/NegocioHeader";
import { NegocioWorkPanel } from "@/components/negocios/detail/NegocioWorkPanel";

const NegocioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { negocios, loading, updateNegocio } = useNegocios();
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [editingNegocio, setEditingNegocio] = useState(false);

  useEffect(() => {
    if (negocios.length > 0 && id) {
      const foundNegocio = negocios.find(n => n.id === id);
      setNegocio(foundNegocio || null);
    }
  }, [negocios, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!negocio) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900">Negocio no encontrado</h2>
          <p className="text-gray-600 mt-2">El negocio que buscas no existe o no tienes permisos para verlo.</p>
          <Link to="/negocios">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Negocios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <NegocioHeader negocio={negocio} onEdit={() => setEditingNegocio(true)} />
      
      {/* Panel de trabajo potente */}
      <NegocioWorkPanel negocio={negocio} />

      {/* Edit Dialog */}
      {editingNegocio && (
        <EditNegocioDialog
          negocio={negocio}
          open={editingNegocio}
          onOpenChange={setEditingNegocio}
          onSuccess={async (updates) => {
            await updateNegocio(negocio.id, updates);
            setEditingNegocio(false);
            // Actualizar el negocio local
            setNegocio({ ...negocio, ...updates });
          }}
        />
      )}
    </div>
  );
};

export default NegocioDetail;
