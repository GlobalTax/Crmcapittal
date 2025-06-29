
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTargetCompanies } from "@/hooks/useTargetCompanies";
import { TargetCompany, CreateTargetCompanyData } from "@/types/TargetCompany";
import {
  Dialog,
  DialogContent,
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

interface EditTargetCompanyDialogProps {
  target: TargetCompany;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditTargetCompanyDialog = ({ target, open, onOpenChange }: EditTargetCompanyDialogProps) => {
  const { updateTargetCompany } = useTargetCompanies();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateTargetCompanyData>({
    defaultValues: {
      name: target.name,
      website: target.website || "",
      industry: target.industry || "",
      description: target.description || "",
      investment_thesis: target.investment_thesis || "",
      fit_score: target.fit_score,
      revenue: target.revenue,
      ebitda: target.ebitda,
      source_notes: target.source_notes || "",
    },
  });

  useEffect(() => {
    form.reset({
      name: target.name,
      website: target.website || "",
      industry: target.industry || "",
      description: target.description || "",
      investment_thesis: target.investment_thesis || "",
      fit_score: target.fit_score,
      revenue: target.revenue,
      ebitda: target.ebitda,
      source_notes: target.source_notes || "",
    });
  }, [target, form]);

  const onSubmit = async (data: CreateTargetCompanyData) => {
    setIsSubmitting(true);
    
    const result = await updateTargetCompany(target.id, data);
    
    if (result.success) {
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Empresa Objetivo</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Empresa *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fit_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fit Score (1-5)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar score" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Bajo</SelectItem>
                        <SelectItem value="2">2 - Medio-Bajo</SelectItem>
                        <SelectItem value="3">3 - Medio</SelectItem>
                        <SelectItem value="4">4 - Alto</SelectItem>
                        <SelectItem value="5">5 - Muy Alto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingresos Anuales (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ebitda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EBITDA (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
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
                    <Textarea className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="investment_thesis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tesis de Inversión</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de Origen</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[60px]" {...field} />
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
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
