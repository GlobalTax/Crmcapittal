
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCases } from "@/hooks/useCases";
import { useContacts } from "@/hooks/useContacts";
import { useCompanies } from "@/hooks/useCompanies";
import { usePracticeAreas } from "@/hooks/usePracticeAreas";
import { CreateCaseData } from "@/types/Case";

const formSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  contact_id: z.string().min(1, "El contacto es requerido"),
  company_id: z.string().optional(),
  practice_area_id: z.string().min(1, "El área de práctica es requerida"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  estimated_hours: z.number().optional(),
});

interface CreateCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCaseCreated: () => void;
}

export const CreateCaseDialog = ({ open, onOpenChange, onCaseCreated }: CreateCaseDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { createCase } = useCases();
  const { contacts } = useContacts();
  const { companies } = useCompanies();
  const { practiceAreas } = usePracticeAreas();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const caseData: CreateCaseData = {
        ...values,
        estimated_hours: values.estimated_hours || undefined,
      };
      
      await createCase(caseData);
      onCaseCreated();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating case:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Expediente</DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo expediente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Título del Expediente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingresa el título del expediente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name}
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
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
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
                name="practice_area_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área de Práctica</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe los detalles del expediente..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Expediente"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
