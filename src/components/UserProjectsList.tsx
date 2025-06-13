
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { List, Eye } from "lucide-react";

interface UserProjectsListProps {
  userId: string;
  userName: string;
  isManager: boolean;
}

const UserProjectsList = ({ userId, userName, isManager }: UserProjectsListProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['user-projects', userId],
    queryFn: async () => {
      console.log('Fetching projects for user:', userId);
      
      if (isManager) {
        // Si es manager, buscar por manager_id en operations
        const { data: managerData } = await supabase
          .from('operation_managers')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (managerData) {
          const { data, error } = await supabase
            .from('operations')
            .select('id, company_name, project_name, sector, operation_type, amount, currency, status, date, created_at')
            .eq('manager_id', managerData.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching manager projects:', error);
            throw error;
          }
          return data || [];
        }
      } else {
        // Si es usuario normal, buscar por created_by
        const { data, error } = await supabase
          .from('operations')
          .select('id, company_name, project_name, sector, operation_type, amount, currency, status, date, created_at')
          .eq('created_by', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user projects:', error);
          throw error;
        }
        return data || [];
      }
      
      return [];
    },
    enabled: isOpen, // Solo cargar cuando se abra el diálogo
  });

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <List className="h-4 w-4 mr-1" />
          Proyectos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Proyectos de {userName} {isManager ? '(Gestor)' : '(Usuario)'}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Cargando proyectos...</p>
            </div>
          ) : projects && projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.company_name}</TableCell>
                    <TableCell>{project.project_name || 'Sin nombre'}</TableCell>
                    <TableCell>{project.sector}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {project.operation_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatAmount(project.amount, project.currency)}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(project.date).toLocaleDateString('es-ES')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                {isManager ? 'Este gestor no tiene proyectos asignados' : 'Este usuario no ha creado proyectos'}
              </p>
            </div>
          )}
        </div>
        {projects && projects.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              Total: {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
              {isManager ? ' gestionado' : ' creado'}{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProjectsList;
