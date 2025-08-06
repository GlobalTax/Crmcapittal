import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, UserCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLeads } from '@/hooks/useLeads';
import { useTeams } from '@/hooks/useTeams';
import { Lead } from '@/types/Lead';
import { toast } from 'sonner';

interface TeamAssignmentSectionProps {
  lead: Lead;
}

export const TeamAssignmentSection = ({ lead }: TeamAssignmentSectionProps) => {
  const { updateLead } = useLeads();
  const { teams } = useTeams();

  // Fetch users with their roles using the RPC function
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_users_with_roles');
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const assignedUser = users.find(user => user.user_id === (lead.assigned_to || lead.assigned_to_id));
  
  const handleAssignmentChange = async (value: string) => {
    try {
      if (value === 'unassigned') {
        await updateLead({
          id: lead.id,
          updates: { assigned_to_id: null }
        });
      } else if (value.startsWith('user_')) {
        const userId = value.replace('user_', '');
        await updateLead({
          id: lead.id,
          updates: { assigned_to_id: userId }
        });
      } else if (value.startsWith('team_')) {
        // For now, we'll assign to the team creator
        // In the future, you might want to add a team_id field to leads
        const teamId = value.replace('team_', '');
        const team = teams.find(t => t.id === teamId);
        if (team?.created_by) {
          await updateLead({
            id: lead.id,
            updates: { assigned_to_id: team.created_by }
          });
        }
      }
      toast.success('Lead asignado correctamente');
    } catch (error) {
      console.error('Error assigning lead:', error);
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
          <Select value={(lead.assigned_to || lead.assigned_to_id) ? `user_${lead.assigned_to || lead.assigned_to_id}` : 'unassigned'} onValueChange={handleAssignmentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar usuario o equipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Sin asignar</SelectItem>
              
              {/* Users section */}
              {users.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Usuarios
                  </div>
                   {users.map((user) => (
                     <SelectItem key={`user_${user.user_id}`} value={`user_${user.user_id}`}>
                       👤 {user.first_name} {user.last_name} ({user.role})
                     </SelectItem>
                   ))}
                </>
              )}

              {/* Teams section */}
              {teams.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Equipos
                  </div>
                   {teams.map((team) => (
                     <SelectItem key={`team_${team.id}`} value={`team_${team.id}`}>
                       👥 {team.name} ({team.member_count} miembros)
                     </SelectItem>
                   ))}
                </>
              )}
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