import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SettingSection } from '@/components/settings/SettingSection';
import { MoreHorizontal, Plus, UserPlus } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  lastActive: string;
}

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

export default function MembersTeamsPage() {
  const [members] = useState<TeamMember[]>(mockMembers);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user' | 'viewer'>('user');
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    
    setIsInviting(true);
    // Simulate invite process
    await new Promise(resolve => setTimeout(resolve, 1000));
    setInviteEmail('');
    setIsInviting(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-destructive border-destructive';
      case 'user': return 'text-primary border-primary';
      case 'viewer': return 'text-muted-foreground border-border';
      default: return 'text-muted-foreground border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success border-success';
      case 'pending': return 'text-yellow-600 border-yellow-600';
      case 'inactive': return 'text-muted-foreground border-border';
      default: return 'text-muted-foreground border-border';
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Members & teams</h1>
        <p className="text-muted-foreground mt-1">
          Manage your team members and their access permissions.
        </p>
      </div>

      <SettingSection 
        title="Invite team members"
        description="Add new members to your workspace and assign their roles."
      >
        <div className="flex gap-3">
          <Input
            placeholder="Enter email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 max-w-xs"
          />
          <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleInvite}
            disabled={!inviteEmail || isInviting}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isInviting ? 'Inviting...' : 'Invite'}
          </Button>
        </div>
      </SettingSection>

      <SettingSection 
        title="Team members"
        description={`${members.length} members in your workspace`}
      >
        <div className="space-y-4">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b border-border pb-2">
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-3">Last active</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1"></div>
          </div>

          {/* Table rows */}
          {members.map((member) => (
            <div key={member.id} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-border last:border-0">
              <div className="col-span-4">
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
              </div>
              <div className="col-span-2">
                <Badge variant="outline" className={getRoleColor(member.role)}>
                  {member.role}
                </Badge>
              </div>
              <div className="col-span-3 text-sm text-muted-foreground">
                {member.lastActive}
              </div>
              <div className="col-span-2">
                <Badge variant="outline" className={getStatusColor(member.status)}>
                  {member.status}
                </Badge>
              </div>
              <div className="col-span-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit role</DropdownMenuItem>
                    <DropdownMenuItem>View profile</DropdownMenuItem>
                    <DropdownMenuItem>Resend invite</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Remove member</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </SettingSection>

      <SettingSection 
        title="Teams"
        description="Organize your members into teams for better collaboration."
      >
        <div className="text-center py-8">
          <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-base font-medium mb-2">No teams yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create teams to organize your members and manage permissions more effectively.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create team
          </Button>
        </div>
      </SettingSection>
    </div>
  );
}