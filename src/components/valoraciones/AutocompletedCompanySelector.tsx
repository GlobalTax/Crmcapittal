import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Plus, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompanies } from '@/hooks/useCompanies';
import { Company } from '@/types/Company';

interface AutocompletedCompanySelectorProps {
  value?: string;
  onValueChange: (companyId: string | null, company: Company | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onCreateNew?: () => void;
}

export function AutocompletedCompanySelector({
  value,
  onValueChange,
  placeholder = "Seleccionar empresa...",
  disabled = false,
  className,
  onCreateNew
}: AutocompletedCompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { companies, isLoading } = useCompanies({
    searchTerm: searchQuery,
    limit: 50
  });

  const selectedCompany = companies?.find(company => company.id === value);

  const handleSelect = (companyId: string) => {
    const company = companies?.find(c => c.id === companyId);
    onValueChange(companyId === value ? null : companyId, company || null);
    setOpen(false);
  };

  const handleCreateNew = () => {
    setOpen(false);
    onCreateNew?.();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            {selectedCompany ? (
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{selectedCompany.name}</div>
                {selectedCompany.industry && (
                  <div className="text-sm text-muted-foreground truncate">
                    {selectedCompany.industry}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Buscar empresa..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                "Buscando empresas..."
              ) : (
                <div className="text-center py-6">
                  <div className="text-sm text-muted-foreground mb-2">
                    No se encontraron empresas
                  </div>
                  {onCreateNew && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateNew}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Crear nueva empresa
                    </Button>
                  )}
                </div>
              )}
            </CommandEmpty>
            {companies && companies.length > 0 && (
              <CommandGroup>
                {onCreateNew && (
                  <CommandItem
                    value="__create_new__"
                    onSelect={handleCreateNew}
                    className="border-b mb-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <div>
                      <div className="font-medium">Crear nueva empresa</div>
                      <div className="text-sm text-muted-foreground">
                        Agregar una empresa que no está en la lista
                      </div>
                    </div>
                  </CommandItem>
                )}
                {companies.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={company.id}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === company.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{company.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {[company.industry, company.city, company.country]
                          .filter(Boolean)
                          .join(' • ')}
                      </div>
                      {company.lifecycle_stage && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {company.lifecycle_stage}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}