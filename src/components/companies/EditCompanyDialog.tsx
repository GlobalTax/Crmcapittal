
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Company, UpdateCompanyData, CompanySize, CompanyType, CompanyStatus, LifecycleStage } from "@/types/Company";
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
import { Checkbox } from "@/components/ui/checkbox";

interface EditCompanyDialogProps {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCompany: (id: string, data: UpdateCompanyData) => void;
  isUpdating: boolean;
}

export const EditCompanyDialog = ({ 
  company, 
  open, 
  onOpenChange, 
  onUpdateCompany, 
  isUpdating 
}: EditCompanyDialogProps) => {
  const form = useForm<UpdateCompanyData>({
    defaultValues: {
      name: company.name,
      domain: company.domain || "",
      website: company.website || "",
      description: company.description || "",
      phone: company.phone || "",
      address: company.address || "",
      city: company.city || "",
      state: company.state || "",
      country: company.country || "España",
      postal_code: company.postal_code || "",
      industry: company.industry || "",
      company_size: company.company_size,
      company_type: company.company_type,
      company_status: company.company_status,
      lifecycle_stage: company.lifecycle_stage,
      annual_revenue: company.annual_revenue || undefined,
      founded_year: company.founded_year || undefined,
      is_target_account: company.is_target_account,
      is_key_account: company.is_key_account,
      is_franquicia: company.is_franquicia,
      notes: company.notes || "",
      lead_score: company.lead_score || 0,
      linkedin_url: company.linkedin_url || "",
      twitter_url: company.twitter_url || "",
      facebook_url: company.facebook_url || "",
    },
  });

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        domain: company.domain || "",
        website: company.website || "",
        description: company.description || "",
        phone: company.phone || "",
        address: company.address || "",
        city: company.city || "",
        state: company.state || "",
        country: company.country || "España",
        postal_code: company.postal_code || "",
        industry: company.industry || "",
        company_size: company.company_size,
        company_type: company.company_type,
        company_status: company.company_status,
        lifecycle_stage: company.lifecycle_stage,
        annual_revenue: company.annual_revenue || undefined,
        founded_year: company.founded_year || undefined,
        is_target_account: company.is_target_account,
        is_key_account: company.is_key_account,
        is_franquicia: company.is_franquicia,
        notes: company.notes || "",
        lead_score: company.lead_score || 0,
        linkedin_url: company.linkedin_url || "",
        twitter_url: company.twitter_url || "",
        facebook_url: company.facebook_url || "",
      });
    }
  }, [company, form]);

  const onSubmit = async (data: UpdateCompanyData) => {
    onUpdateCompany(company.id, data);
    if (!isUpdating) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>
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
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dominio</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ejemplo.com" />
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
                      <FormLabel>Sitio Web</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://ejemplo.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
            </div>

            {/* Clasificación */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Clasificación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="company_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="activa">Activa</SelectItem>
                          <SelectItem value="inactiva">Inactiva</SelectItem>
                          <SelectItem value="prospecto">Prospecto</SelectItem>
                          <SelectItem value="cliente">Cliente</SelectItem>
                          <SelectItem value="perdida">Perdida</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="prospect">Prospecto</SelectItem>
                          <SelectItem value="cliente">Cliente</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="franquicia">Franquicia</SelectItem>
                          <SelectItem value="competidor">Competidor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamaño</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="11-50">11-50</SelectItem>
                          <SelectItem value="51-200">51-200</SelectItem>
                          <SelectItem value="201-500">201-500</SelectItem>
                          <SelectItem value="500+">500+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lifecycle_stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etapa del Ciclo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="marketing_qualified_lead">MQL</SelectItem>
                          <SelectItem value="sales_qualified_lead">SQL</SelectItem>
                          <SelectItem value="opportunity">Oportunidad</SelectItem>
                          <SelectItem value="customer">Cliente</SelectItem>
                          <SelectItem value="evangelist">Evangelista</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Ubicación</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provincia/Estado</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Postal</FormLabel>
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
                      <FormLabel>Industria</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Información Financiera */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Financiera</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="annual_revenue"
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
                  name="founded_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Año de Fundación</FormLabel>
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
                  name="lead_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Score</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Clasificaciones Especiales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Clasificaciones Especiales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="is_target_account"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Target Account</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_key_account"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Key Account</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_franquicia"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Franquicia</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Redes Sociales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="linkedin_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://linkedin.com/company/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitter_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://twitter.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="facebook_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://facebook.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
