import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Filter, X } from 'lucide-react';
import { ContactRole, ContactStatus } from '@/types/Contact';

interface ContactFilters {
  roles: ContactRole[];
  status: ContactStatus[];
  source_table: string[];
}

interface ContactsUnifiedFiltersProps {
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
  className?: string;
}

const roleLabels: Record<ContactRole, string> = {
  owner: 'Propietario',
  buyer: 'Comprador', 
  advisor: 'Asesor',
  investor: 'Inversor',
  target: 'Target',
  client: 'Cliente',
  prospect: 'Prospecto',
  lead: 'Lead',
  other: 'Otro',
  decision_maker: 'Tomador de Decisiones',
  influencer: 'Influenciador',
  gatekeeper: 'Guardián',
  champion: 'Champion',
  ceo: 'CEO',
  cfo: 'CFO',
  board_member: 'Miembro del Consejo',
  broker: 'Intermediario'
};

const statusLabels: Record<ContactStatus, string> = {
  active: 'Activo',
  blocked: 'Bloqueado',
  archived: 'Archivado'
};

const sourceLabels: Record<string, string> = {
  mandate_targets: 'Mandate Targets',
  leads: 'Leads',
  manual: 'Manual'
};

export const ContactsUnifiedFilters = ({ 
  filters, 
  onFiltersChange, 
  className 
}: ContactsUnifiedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleRole = (role: ContactRole) => {
    const newRoles = filters.roles.includes(role)
      ? filters.roles.filter(r => r !== role)
      : [...filters.roles, role];
    
    onFiltersChange({ ...filters, roles: newRoles });
  };

  const toggleStatus = (status: ContactStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    
    onFiltersChange({ ...filters, status: newStatus });
  };

  const toggleSource = (source: string) => {
    const newSources = filters.source_table.includes(source)
      ? filters.source_table.filter(s => s !== source)
      : [...filters.source_table, source];
    
    onFiltersChange({ ...filters, source_table: newSources });
  };

  const clearFilters = () => {
    onFiltersChange({ roles: [], status: [], source_table: [] });
  };

  const totalActiveFilters = filters.roles.length + filters.status.length + filters.source_table.length;

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-1" />
            Filtros
            {totalActiveFilters > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 min-w-5 px-1 text-xs"
              >
                {totalActiveFilters}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros de Contactos</h4>
              {totalActiveFilters > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
            
            <Separator />
            
            {/* Roles Filter */}
            <div>
              <h5 className="text-sm font-medium mb-2">Roles</h5>
              <div className="flex flex-wrap gap-2">
                {Object.entries(roleLabels).map(([role, label]) => (
                  <Button
                    key={role}
                    variant={filters.roles.includes(role as ContactRole) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleRole(role as ContactRole)}
                    className="text-xs h-7"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Status Filter */}
            <div>
              <h5 className="text-sm font-medium mb-2">Estado</h5>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusLabels).map(([status, label]) => (
                  <Button
                    key={status}
                    variant={filters.status.includes(status as ContactStatus) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleStatus(status as ContactStatus)}
                    className="text-xs h-7"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Source Filter */}
            <div>
              <h5 className="text-sm font-medium mb-2">Origen</h5>
              <div className="flex flex-wrap gap-2">
                {Object.entries(sourceLabels).map(([source, label]) => (
                  <Button
                    key={source}
                    variant={filters.source_table.includes(source) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSource(source)}
                    className="text-xs h-7"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filters display */}
      {totalActiveFilters > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.roles.map(role => (
            <Badge key={`role-${role}`} variant="secondary" className="text-xs">
              {roleLabels[role]}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => toggleRole(role)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filters.status.map(status => (
            <Badge key={`status-${status}`} variant="secondary" className="text-xs">
              {statusLabels[status]}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => toggleStatus(status)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filters.source_table.map(source => (
            <Badge key={`source-${source}`} variant="secondary" className="text-xs">
              {sourceLabels[source] || source}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => toggleSource(source)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};