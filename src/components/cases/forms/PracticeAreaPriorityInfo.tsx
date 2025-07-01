
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CreateCaseFormData } from "../schemas/createCaseSchema";
import { usePracticeAreas } from "@/hooks/usePracticeAreas";

interface PracticeAreaPriorityInfoProps {
  form: UseFormReturn<CreateCaseFormData>;
}

export const PracticeAreaPriorityInfo = ({ form }: PracticeAreaPriorityInfoProps) => {
  const { practiceAreas } = usePracticeAreas();

  return (
    <>
      <FormField
        control={form.control}
        name="practice_area_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Área de Práctica</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona área de práctica" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {practiceAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prioridad</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona prioridad" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
