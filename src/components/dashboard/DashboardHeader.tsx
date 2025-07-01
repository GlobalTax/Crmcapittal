
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CreateDealDialog } from "@/components/deals/CreateDealDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Download } from "lucide-react";
import { useDeals } from "@/hooks/useDeals";
import { toast } from "sonner";

interface DashboardHeaderProps {
  role: string | null;
}

export const DashboardHeader = ({ role }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { createDeal } = useDeals();

  const handleCreateDeal = async (newDeal: any) => {
    try {
      await createDeal(newDeal);
      toast.success('Deal creado correctamente');
    } catch (error) {
      toast.error('Error al crear el deal');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard M&A</h1>
          <p className="text-gray-600 mt-1">
            Hola {user?.email?.split('@')[0] || 'Usuario'}, aquí tienes tu resumen de actividad
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => setShowCreateDialog(true)}>
            Crear Deal
          </Button>
          <Button variant="outline" size="sm" className="border-gray-300">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm" className="border-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Badge className="bg-gray-100 text-gray-800 border border-gray-300">
            {role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Usuario'}
          </Badge>
        </div>
      </div>

      <CreateDealDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateDeal}
        pipelineId="DEAL"
      />
    </div>
  );
};
