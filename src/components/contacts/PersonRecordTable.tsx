import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, ChevronDown, Filter, Settings, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Contact } from '@/types/Contact';
import { EmptyStateSmall } from '@/components/ui/EmptyStateSmall';
import { cleanTestContacts, createSampleContacts } from '@/utils/cleanTestData';
import { useToast } from '@/hooks/use-toast';
import { ContactRoleBadges } from './ContactRoleBadges';
import { ContactStatusBadge } from './ContactStatusBadge';

interface PersonRecordTableProps {
  contacts: Contact[];
  totalCount: number;
  onRowClick?: (contact: Contact) => void;
  onCreateContact?: () => void;
  onSearch?: (term: string) => void;
  onFilter?: () => void;
  isLoading?: boolean;
}

export const PersonRecordTable = ({
  contacts,
  totalCount,
  onRowClick,
  onCreateContact,
  onSearch,
  onFilter,
  isLoading
}: PersonRecordTableProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [savedView, setSavedView] = useState('Recently Contacted People');
  const [isCleaningData, setIsCleaningData] = useState(false);

  const handleRowClick = (contact: Contact) => {
    navigate(`/contacts/${contact.id}`);
    onRowClick?.(contact);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getConnectionStrength = (contact: Contact) => {
    // Calculate connection strength based on interactions
    let strength = 0;
    if (contact.email) strength += 25;
    if (contact.phone) strength += 25;
    if (contact.last_interaction_date) strength += 30;
    if (contact.company) strength += 20;
    
    if (strength >= 80) return { label: 'Strong', color: 'hsl(158, 100%, 38%)' }; // green
    if (strength >= 60) return { label: 'Medium', color: 'hsl(45, 93%, 47%)' }; // yellow  
    if (strength >= 40) return { label: 'Weak', color: 'hsl(25, 95%, 53%)' }; // orange
    return { label: 'Very weak', color: 'hsl(4, 86%, 63%)' }; // red
  };

  const formatLastInteraction = (date?: string) => {
    if (!date) return '—';
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  if (contacts.length === 0 && !isLoading) {
    return (
      <div className="bg-neutral-0 rounded-lg border border-border">
        <div className="p-6">
          <EmptyStateSmall
            icon={<Users className="w-5 h-5 text-primary" />}
            text="No contacts yet"
            action={<Button onClick={onCreateContact}>+ New person</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-0 rounded-lg border border-border">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Saved Views Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 text-sm font-medium">
                {savedView}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setSavedView('Recently Contacted People')}>
                Recently Contacted People
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSavedView('All contacts')}>
                All contacts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSavedView('High priority')}>
                High priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-64 h-8"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onFilter}>
            <Filter className="h-4 w-4 mr-1" />
            Filtros
          </Button>
          <Button variant="ghost" size="sm" onClick={() => console.log('Configurar columnas')}>
            <Settings className="h-4 w-4 mr-1" />
            Ver columnas
          </Button>
          {contacts.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCleanData}
              disabled={isCleaningData}
            >
              {isCleaningData ? 'Limpiando...' : 'Limpiar datos'}
            </Button>
          )}
          <Button onClick={onCreateContact}>
            + New person
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Person</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Company</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Roles</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Estado</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Connection strength</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Last interaction</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => {
              const connectionStrength = getConnectionStrength(contact);
              
              return (
                <tr
                  key={contact.id}
                  className="border-b border-border hover:bg-neutral-50 cursor-pointer"
                  onClick={() => handleRowClick(contact)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-xs">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{contact.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {contact.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <div className="font-medium text-sm">{contact.company || '—'}</div>
                      <div className="text-xs text-muted-foreground">
                        {contact.position || '—'}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <ContactRoleBadges 
                      roles={contact.contact_roles}
                      maxDisplay={2}
                    />
                  </td>
                  <td className="p-3">
                    <ContactStatusBadge 
                      status={contact.contact_status}
                      showIcon={false}
                    />
                  </td>
                  <td className="p-3">
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: connectionStrength.color,
                        color: connectionStrength.color
                      }}
                    >
                      {connectionStrength.label}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      {formatLastInteraction(contact.last_interaction_date)}
                    </div>
                  </td>
                  <td className="p-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick?.(contact);
                      }}
                      className="h-6 px-2"
                    >
                      Ver
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border text-sm text-muted-foreground">
        <div>{totalCount} personas</div>
      </div>
    </div>
  );

  async function handleCleanData() {
    if (!window.confirm('¿Estás seguro de que quieres limpiar los datos de prueba? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsCleaningData(true);
    try {
      const cleanedCount = await cleanTestContacts();
      
      if (cleanedCount > 0) {
        toast({
          title: 'Datos limpiados',
          description: `Se eliminaron ${cleanedCount} contactos de prueba.`,
        });
        
        // Optionally create sample contacts
        if (window.confirm('¿Quieres crear contactos de ejemplo realistas?')) {
          await createSampleContacts();
          toast({
            title: 'Contactos de ejemplo creados',
            description: 'Se han añadido contactos de ejemplo con datos realistas.',
          });
        }
        
        // Refresh the page to show changes
        window.location.reload();
      } else {
        toast({
          title: 'No hay datos para limpiar',
          description: 'No se encontraron contactos de prueba para eliminar.',
        });
      }
    } catch (error) {
      console.error('Error cleaning data:', error);
      toast({
        title: 'Error',
        description: 'Hubo un problema al limpiar los datos.',
        variant: 'destructive',
      });
    } finally {
      setIsCleaningData(false);
    }
  }
};