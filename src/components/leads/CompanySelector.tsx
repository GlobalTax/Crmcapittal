import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Plus, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyModal } from "@/components/companies/CompanyModal";
import { Company } from "@/types/Company";
import { logger } from "@/utils/productionLogger";

interface CompanySelectorProps {
  value?: string; // company_id
  companyName?: string; // current company_name for fallback display
  onSelect: (company: Company | null) => void;
}

export function CompanySelector({ value, companyName, onSelect }: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { companies, isLoading, createCompany, isCreating } = useCompanies({
    searchTerm,
    limit: 50, // Show more companies in selector
  });

  const selectedCompany = useMemo(() => {
    return companies.find((company) => company.id === value);
  }, [companies, value]);

  const displayValue = selectedCompany?.name || companyName || "";

  const handleSelect = (company: Company) => {
    onSelect(company);
    setOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setOpen(false);
  };

  const handleCreateCompany = async (companyData: any) => {
    try {
      const newCompany = await new Promise<Company>((resolve, reject) => {
        createCompany(companyData, {
          onSuccess: (data) => resolve(data as Company),
          onError: reject,
        });
      });
      
      handleSelect(newCompany);
      setShowCreateDialog(false);
    } catch (error) {
      logger.error("Failed to create company from selector", { error });
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
            size="sm"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">
                {displayValue || "Seleccionar empresa..."}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar empresa..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Cargando..." : "No se encontraron empresas."}
              </CommandEmpty>
              
              {companies.length > 0 && (
                <CommandGroup>
                  {displayValue && (
                    <CommandItem onSelect={handleClear}>
                      <span className="text-muted-foreground">Limpiar selección</span>
                    </CommandItem>
                  )}
                  
                  {companies.map((company) => (
                    <CommandItem
                      key={company.id}
                      value={company.id}
                      onSelect={() => handleSelect(company)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === company.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{company.name}</span>
                        {company.industry && (
                          <span className="text-sm text-muted-foreground">
                            {company.industry}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              <CommandGroup>
                <CommandItem onSelect={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Crear nueva empresa</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CompanyModal
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateCompany={handleCreateCompany}
        isCreating={isCreating}
      />
    </>
  );
}