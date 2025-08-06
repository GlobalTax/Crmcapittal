import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, UserCheck } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useLeads } from '@/hooks/useLeads';
import { Lead } from '@/types/Lead';
import { toast } from 'sonner';

interface TeamAssignmentSectionProps {
  lead: Lead;
}

export const TeamAssignmentSection = ({ lead }: TeamAssignmentSectionProps) => {
  const { users, isLoading } = useUsers();
  const { updateLead } = useLeads();
  
  const assignedUser = users.find(user => user.user_id === lead.assigned_to_id);
  
  const handleAssignmentChange = async (userId: string) => {
    try {
      const updates = userId === 'unassigned' 
        ? { assigned_to_id: null } 
        : { assigned_to_id: userId };
        
      await updateLead({
        id: lead.id,
        updates
      });
      
      if (userId === 'unassigned') {
        toast.success('Lead desasignado');
      } else {
        const user = users.find(u => u.user_id === userId);
        toast.success(`Lead asignado a ${user?.first_name} ${user?.last_name}`);
      }
    } catch (error) {
      toast.error('Error al asignar el lead');
    }
  };
  
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          Asignación del Equipo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Asignado a:
          </label>
          <Select
            value={lead.assigned_to_id || 'unassigned'}
            onValueChange={handleAssignmentChange}
            disabled={isLoading}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Seleccionar miembro del equipo">
                {assignedUser && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(assignedUser.first_name, assignedUser.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {assignedUser.first_name} {assignedUser.last_name}
                    </span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-3 w-3" />
                  </div>
                  <span>Sin asignar</span>
                </div>
              </SelectItem>
              {users.map((user) => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(user.first_name, user.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.role}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {assignedUser && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            <UserCheck className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">
                {assignedUser.first_name} {assignedUser.last_name}
              </div>
              <div className="text-xs text-muted-foreground">
                {assignedUser.email}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};