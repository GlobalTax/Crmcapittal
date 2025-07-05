import { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

interface ContactRolesFieldProps {
  form: UseFormReturn<any>;
  name?: string;
}

const defaultRoleOptions = [
  { value: 'colaborador', label: 'Colaborador', description: 'Empleado interno' },
  { value: 'inversor', label: 'Inversor', description: 'Socio capital' },
  { value: 'board', label: 'Board', description: 'Miembro consejo' },
  { value: 'advisor', label: 'Advisor', description: 'Mentor externo' },
  { value: 'proveedor', label: 'Proveedor', description: 'Presta servicios' },
  { value: 'cliente', label: 'Cliente', description: 'Compra servicios' }
];

export const ContactRolesField = ({ form, name = "roles" }: ContactRolesFieldProps) => {
  const [open, setOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [customRoles, setCustomRoles] = useState<string[]>([]);

  const allRoleOptions = [
    ...defaultRoleOptions,
    ...customRoles.map(role => ({ value: role, label: role, description: 'Rol personalizado' }))
  ];

  const addCustomRole = () => {
    if (newRole.trim() && !allRoleOptions.find(r => r.value === newRole.trim())) {
      setCustomRoles(prev => [...prev, newRole.trim()]);
      const currentRoles = form.getValues(name) || [];
      form.setValue(name, [...currentRoles, newRole.trim()]);
      setNewRole("");
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Roles</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {field.value?.length > 0 
                    ? `${field.value.length} rol(es) seleccionado(s)`
                    : "Seleccionar roles..."
                  }
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar roles..." />
                <CommandList>
                  <CommandEmpty>No se encontraron roles.</CommandEmpty>
                  <CommandGroup>
                    {allRoleOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => {
                          const currentRoles = field.value || [];
                          const isSelected = currentRoles.includes(option.value);
                          
                          if (isSelected) {
                            field.onChange(currentRoles.filter((role: string) => role !== option.value));
                          } else {
                            field.onChange([...currentRoles, option.value]);
                          }
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value?.includes(option.value) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <div className="border-t p-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Agregar rol personalizado..."
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomRole()}
                      />
                      <Button size="sm" onClick={addCustomRole}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          {/* Display selected roles as chips */}
          {field.value?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {field.value.map((role: string) => (
                <Badge key={role} variant="secondary" className="pr-1">
                  {role}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      const currentRoles = field.value || [];
                      field.onChange(currentRoles.filter((r: string) => r !== role));
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};