import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface ContactLifecycleFieldProps {
  form: UseFormReturn<any>;
  name?: string;
}

const lifecycleOptions = [
  { value: 'lead', label: 'Lead', description: 'Primer contacto / Captura formulario' },
  { value: 'cliente', label: 'Cliente', description: 'Cierra transacción o firma contrato' },
  { value: 'suscriptor', label: 'Suscriptor', description: 'Solo recibe contenidos' },
  { value: 'proveedor', label: 'Proveedor', description: 'Te vende servicios' }
];

export const ContactLifecycleField = ({ form, name = "lifecycle_stage" }: ContactLifecycleFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Etapa del Ciclo</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || 'lead'}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la etapa" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {lifecycleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};