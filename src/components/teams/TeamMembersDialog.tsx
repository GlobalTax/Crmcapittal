import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trash2, Plus, Users } from 'lucide-react';
import { useTeamMembers } from '@/hooks/useTeams';
import { useUsers } from '@/hooks/useUsers';

interface TeamMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  teamName: string;
}

export const TeamMembersDialog = ({ open, onOpenChange, teamId, teamName }: TeamMembersDialogProps) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { members, addMember, removeMember, isAdding, isRemoving } = useTeamMembers(teamId);
  const { users } = useUsers();

  // Filter users that are not already in the team
  const availableUsers = users.filter(user => 
    !members.some(member => member.user_id === user.user_id)
  );

  const handleAddMember = () => {
    if (!selectedUserId) return;
    
    addMember({
      teamId,
      userId: selectedUserId,
      role: 'member'
    });
    
    setSelectedUserId('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Miembros de {teamName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add new member section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Agregar Nuevo Miembro</h3>
            <div className="flex gap-2">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddMember}
                disabled={!selectedUserId || isAdding}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                {isAdding ? 'Agregando...' : 'Agregar'}
              </Button>
            </div>
            {availableUsers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Todos los usuarios disponibles ya son miembros de este equipo.
              </p>
            )}
          </div>

          {/* Current members list */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">
              Miembros Actuales ({members.length})
            </h3>
            
            {members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Este equipo no tiene miembros aún</p>
                <p className="text-sm">Agrega usuarios para comenzar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(member.user_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user_name}</p>
                        <p className="text-sm text-muted-foreground">{member.user_email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {member.role === 'member' ? 'Miembro' : member.role}
                      </Badge>
                      <Button
                        onClick={() => removeMember(member.id)}
                        disabled={isRemoving}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};