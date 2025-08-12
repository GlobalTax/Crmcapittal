import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Users, UserPlus, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTeams } from '@/hooks/useTeams';
import { CreateTeamDialog } from '@/components/teams/CreateTeamDialog';
import { TeamMembersDialog } from '@/components/teams/TeamMembersDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
}

// Mock data for user management section
const mockMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'admin',
    status: 'active',
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'user',
    status: 'active',
    lastActive: '1 day ago',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'viewer',
    status: 'pending',
    lastActive: 'Never',
  },
];

const MembersTeamsPage = () => {
  const [invitedEmail, setInvitedEmail] = useState('');
  const [invitedRole, setInvitedRole] = useState('user');
  const [isInviting, setIsInviting] = useState(false);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string } | null>(null);
  
  const { teams, deleteTeam, isDeleting } = useTeams();

  const handleInvite = async () => {
    if (!invitedEmail) return;
    
    setIsInviting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(`Invitación enviada a ${invitedEmail}`);
      setInvitedEmail('');
      setIsInviting(false);
    }, 1000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-50 text-red-700 border-red-200';
      case 'user': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'viewer': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'inactive': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">

        <div className="grid gap-6">
          {/* Invite Members Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invitar Miembros
              </CardTitle>
              <CardDescription>
                Invita nuevos miembros a tu espacio de trabajo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="correo@empresa.com"
                  value={invitedEmail}
                  onChange={(e) => setInvitedEmail(e.target.value)}
                  className="flex-1 max-w-xs"
                />
                <Select value={invitedRole} onValueChange={setInvitedRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="viewer">Visor</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInvite} disabled={!invitedEmail || isInviting}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isInviting ? 'Enviando...' : 'Invitar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Members Table */}
          <Card>
            <CardHeader>
              <CardTitle>Miembros del Equipo</CardTitle>
              <CardDescription>
                {mockMembers.length} miembros en tu espacio de trabajo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Miembro</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última actividad</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleColor(member.role)}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {member.lastActive}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar rol</DropdownMenuItem>
                            <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                            <DropdownMenuItem>Reenviar invitación</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Remover miembro
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Teams Section */}
          <Card>
            <CardHeader>
                <Button onClick={() => setCreateTeamOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Equipo
                </Button>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay equipos creados</p>
                    <p className="text-sm">Crea tu primer equipo para organizar a los miembros</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(team.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{team.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {team.description || 'Sin descripción'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>{team.member_count} miembros</span>
                            <span>Creado por {team.creator_name}</span>
                            <span>{format(new Date(team.created_at), 'dd MMM yyyy', { locale: es })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {team.member_count} miembros
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => setSelectedTeam({ id: team.id, name: team.name })}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Gestionar Miembros
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteTeam(team.id)}
                              disabled={isDeleting}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar Equipo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialogs */}
      <CreateTeamDialog 
        open={createTeamOpen} 
        onOpenChange={setCreateTeamOpen} 
      />
      
      {selectedTeam && (
        <TeamMembersDialog
          open={!!selectedTeam}
          onOpenChange={(open) => !open && setSelectedTeam(null)}
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
        />
      )}
    </div>
  );
};

export default MembersTeamsPage;