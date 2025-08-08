import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

interface UltraDenseContactsHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCreateContact: () => void;
}

export const UltraDenseContactsHeader = ({
  searchValue,
  onSearchChange,
  onCreateContact
}: UltraDenseContactsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
      
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar contactos..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* New Contact Button */}
        <Button onClick={onCreateContact} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Contacto
        </Button>
      </div>
    </div>
  );
};