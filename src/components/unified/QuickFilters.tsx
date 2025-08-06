import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';

type CRMTab = 'leads' | 'companies' | 'mandates' | 'targets';

interface QuickFiltersProps {
  activeTab: CRMTab;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({ activeTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hasFilters, setHasFilters] = useState(false);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setHasFilters(false);
  };

  const getStatusOptions = () => {
    switch (activeTab) {
      case 'leads':
        return [
          { value: 'all', label: 'Todos los estados' },
          { value: 'new', label: 'Nuevos' },
          { value: 'qualified', label: 'Calificados' },
          { value: 'converted', label: 'Convertidos' },
          { value: 'lost', label: 'Perdidos' }
        ];
      case 'companies':
        return [
          { value: 'all', label: 'Todas las empresas' },
          { value: 'prospecto', label: 'Prospectos' },
          { value: 'cliente', label: 'Clientes' },
          { value: 'partner', label: 'Partners' },
          { value: 'inactive', label: 'Inactivos' }
        ];
      case 'mandates':
        return [
          { value: 'all', label: 'Todos los mandatos' },
          { value: 'active', label: 'Activos' },
          { value: 'completed', label: 'Completados' },
          { value: 'paused', label: 'Pausados' },
          { value: 'cancelled', label: 'Cancelados' }
        ];
      case 'targets':
        return [
          { value: 'all', label: 'Todos los targets' },
          { value: 'new', label: 'Nuevos' },
          { value: 'contacted', label: 'Contactados' },
          { value: 'qualified', label: 'Calificados' },
          { value: 'rejected', label: 'Rechazados' }
        ];
      default:
        return [{ value: 'all', label: 'Todos' }];
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={`Buscar ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-9"
        />
      </div>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48 h-9">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {getStatusOptions().map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {(searchTerm || statusFilter !== 'all') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 px-3 gap-1 text-gray-600 hover:text-gray-900"
        >
          <X className="h-4 w-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
};