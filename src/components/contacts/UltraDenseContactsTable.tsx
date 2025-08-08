import * as React from 'react';
import { Contact } from '@/types/Contact';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Edit3 } from 'lucide-react';
import { EmptyStateSmall } from '@/components/ui/EmptyStateSmall';
import { Users } from 'lucide-react';

interface UltraDenseContactsTableProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onCreateContact: () => void;
  isLoading?: boolean;
}

export const UltraDenseContactsTable = ({
  contacts,
  onContactClick,
  onCreateContact,
  isLoading
}: UltraDenseContactsTableProps) => {
  const [hoveredRow, setHoveredRow] = React.useState<string | null>(null);

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const formatActivity = (contact: Contact) => {
    const date = contact.last_contact_date || contact.updated_at;
    if (!date) return { text: 'Sin actividad', type: '' };
    
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    let text = '';
    if (days === 0) text = 'Hoy';
    else if (days === 1) text = 'Ayer';
    else if (days < 7) text = `Hace ${days} días`;
    else if (days < 30) text = `Hace ${Math.floor(days / 7)} sem`;
    else text = `Hace ${Math.floor(days / 30)} mes`;
    
    const type = contact.email ? 'Email' : contact.phone ? 'Call' : 'Meeting';
    
    return { text, type };
  };

  const getStatusBadge = (status?: string, priority?: string, tags?: string[]) => {
    // VIP takes priority
    if (priority === 'high' || tags?.includes('VIP')) {
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs rounded-full px-2 py-0.5">VIP</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-50 text-green-700 border-green-200 text-xs rounded-full px-2 py-0.5">Activo</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200 text-xs rounded-full px-2 py-0.5">Inactivo</Badge>;
    }
  };

  if (contacts.length === 0 && !isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-6">
          <EmptyStateSmall
            icon={<Users className="w-5 h-5 text-primary" />}
            text="No hay contactos que mostrar"
            action={<Button onClick={onCreateContact}>Crear primer contacto</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-500 w-[40%]">Contacto</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-500 w-[25%]">Empresa</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-500 w-[15%]">Estado</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-500 w-[15%]">Actividad</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-500 w-[5%]"></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => {
              const activity = formatActivity(contact);
              const isHovered = hoveredRow === contact.id;
              
              return (
                <tr
                  key={contact.id}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors h-16"
                  onMouseEnter={() => setHoveredRow(contact.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => onContactClick(contact)}
                >
                  {/* Contacto (40%) */}
                  <td className="px-6 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-900 truncate">{contact.name}</div>
                        <div className="text-sm text-slate-500 truncate">
                          {contact.email || 'Sin email'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Empresa (25%) */}
                  <td className="px-6 py-2">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">
                        {contact.company || '—'}
                      </div>
                      <div className="text-sm text-slate-500 truncate">
                        {contact.position || '—'}
                      </div>
                    </div>
                  </td>

                  {/* Estado (15%) */}
                  <td className="px-6 py-2">
                    {getStatusBadge(contact.contact_status, contact.contact_priority, contact.tags_array)}
                  </td>

                  {/* Actividad (15%) */}
                  <td className="px-6 py-2">
                    <div className="text-sm">
                      <div className="text-slate-900">{activity.text}</div>
                      {activity.type && (
                        <div className="text-slate-500">{activity.type}</div>
                      )}
                    </div>
                  </td>

                  {/* Acciones (5%) */}
                  <td className="px-6 py-2" onClick={(e) => e.stopPropagation()}>
                    {isHovered && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                          onClick={() => window.open(`tel:${contact.phone}`, '_blank')}
                          disabled={!contact.phone}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                          onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                          disabled={!contact.email}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};