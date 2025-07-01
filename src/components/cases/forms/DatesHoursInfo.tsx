
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CreateCaseFormData } from "../schemas/createCaseSchema";

interface DatesHoursInfoProps {
  form: UseFormReturn<CreateCaseFormData>;
}

export const DatesHoursInfo = ({ form }: DatesHoursInfoProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="start_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha de Inicio</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="end_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha de Fin (Opcional)</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="estimated_hours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Horas Estimadas</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
