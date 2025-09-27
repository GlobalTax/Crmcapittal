import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useBulkLeadActions, useLeadSegments } from "@/hooks/useLeadAnalytics";
import { Users, UserCheck, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LeadBulkActionsProps {
  selectedLeads: string[];
  onSelectionClear: () => void;
}

export const LeadBulkActions = ({ selectedLeads, onSelectionClear }: LeadBulkActionsProps) => {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [segmentDialogOpen, setSegmentDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISQUALIFIED'>('NEW');
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedSegment, setSelectedSegment] = useState<string>("");

  const { bulkUpdateStatus, bulkAssign, bulkAddToSegment, isLoading } = useBulkLeadActions();
  const { data: segments } = useLeadSegments();

  // Get users for assignment
  const { data: users } = useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleStatusUpdate = () => {
    if (!selectedStatus) return;
    
    bulkUpdateStatus({ leadIds: selectedLeads, status: selectedStatus });
    setStatusDialogOpen(false);
    setSelectedStatus('NEW');
    onSelectionClear();
  };

  const handleAssignment = () => {
    if (!selectedUser) return;
    
    bulkAssign({ leadIds: selectedLeads, userId: selectedUser });
    setAssignDialogOpen(false);
    setSelectedUser("");
    onSelectionClear();
  };

  const handleSegmentAssignment = () => {
    if (!selectedSegment) return;
    
    bulkAddToSegment({ leadIds: selectedLeads, segmentId: selectedSegment });
    setSegmentDialogOpen(false);
    setSelectedSegment("");
    onSelectionClear();
  };

  if (selectedLeads.length === 0) return null;

  return (
    <div className="app-center-in-main bottom-6">
      <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4">
        <Badge variant="secondary" className="px-3 py-1">
          {selectedLeads.length} leads seleccionados
        </Badge>

        <div className="flex gap-2">
          {/* Status Update Dialog */}
          <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Cambiar Estado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cambiar Estado de {selectedLeads.length} Leads</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Nuevo Estado</Label>
                  <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISQUALIFIED')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">Nuevo</SelectItem>
                      <SelectItem value="CONTACTED">Contactado</SelectItem>
                      <SelectItem value="QUALIFIED">Cualificado</SelectItem>
                      <SelectItem value="DISQUALIFIED">Descalificado</SelectItem>
                      
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleStatusUpdate} 
                    disabled={!selectedStatus || isLoading}
                  >
                    Actualizar Estado
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Assignment Dialog */}
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <UserCheck className="h-4 w-4" />
                Asignar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Asignar {selectedLeads.length} Leads</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user">Usuario</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAssignment} 
                    disabled={!selectedUser || isLoading}
                  >
                    Asignar Leads
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Segment Assignment Dialog */}
          <Dialog open={segmentDialogOpen} onOpenChange={setSegmentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Tag className="h-4 w-4" />
                Añadir a Segmento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir {selectedLeads.length} Leads a Segmento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="segment">Segmento</Label>
                  <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments?.map((segment) => (
                        <SelectItem key={segment.id} value={segment.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: segment.color }}
                            />
                            {segment.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setSegmentDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSegmentAssignment} 
                    disabled={!selectedSegment || isLoading}
                  >
                    Añadir a Segmento
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={onSelectionClear}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};