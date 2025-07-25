import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Search, Plus, CheckCircle } from 'lucide-react';
import { BuyingMandate, CreateMandateTargetData } from '@/types/BuyingMandate';
import { Company } from '@/types';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { useOptimizedCompanies } from '@/hooks/useOptimizedCompanies';
import { useToast } from '@/hooks/use-toast';

interface AddTargetCompanyDialogProps {
  mandate: BuyingMandate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTargetCompanyDialog = ({ mandate, open, onOpenChange }: AddTargetCompanyDialogProps) => {
  const [activeTab, setActiveTab] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createTarget } = useBuyingMandates();
  const { companies, searchCompanies } = useOptimizedCompanies();
  const { toast } = useToast();

  // Formulario para crear nueva empresa
  const [formData, setFormData] = useState<CreateMandateTargetData>({
    mandate_id: '',
    company_name: '',
    sector: '',
    location: '',
    revenues: undefined,
    ebitda: undefined,
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  });

  useEffect(() => {
    if (mandate?.id && open) {
      setFormData(prev => ({ ...prev, mandate_id: mandate.id }));
    }
  }, [mandate?.id, open]);

  const resetForm = () => {
    setFormData({
      mandate_id: mandate?.id || '',
      company_name: '',
      sector: '',
      location: '',
      revenues: undefined,
      ebitda: undefined,
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      notes: '',
    });
    setSelectedCompanies([]);
    setSearchTerm('');
    setActiveTab('create');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Crear nueva empresa target
  const handleCreateNewTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_name?.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la empresa es requerido",
        variant: "destructive"
      });
      return;
    }
    
    if (!mandate) {
      toast({
        title: "Error", 
        description: "Mandato no encontrado",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createTarget(formData);
      
      if (result.data) {
        toast({
          title: "Empresa añadida",
          description: `${formData.company_name} ha sido añadida como target al mandato`,
        });
        handleClose();
      } else {
        throw new Error('No se pudo crear el target');
      }
    } catch (error) {
      console.error('Error creating target:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir la empresa al mandato",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Añadir empresas existentes seleccionadas
  const handleAddSelectedCompanies = async () => {
    if (selectedCompanies.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos una empresa",
        variant: "destructive"
      });
      return;
    }

    if (!mandate) {
      toast({
        title: "Error",
        description: "Mandato no encontrado", 
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const promises = selectedCompanies.map(company => {
        const targetData: CreateMandateTargetData = {
          mandate_id: mandate.id,
          company_name: company.name,
          sector: company.industry || '',
          location: company.city || '',
          revenues: company.annual_revenue ? Number(company.annual_revenue) : undefined,
          contact_name: '',
          contact_email: '',
          contact_phone: company.phone || '',
          notes: `Importado desde CRM - ${company.description || ''}`,
        };
        return createTarget(targetData);
      });

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.data).length;

      toast({
        title: "Empresas añadidas",
        description: `${successCount} de ${selectedCompanies.length} empresas añadidas al mandato`,
      });

      handleClose();
    } catch (error) {
      console.error('Error adding selected companies:', error);
      toast({
        title: "Error",
        description: "No se pudieron añadir todas las empresas al mandato",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar empresas que coincidan con la búsqueda
  const filteredCompanies = searchCompanies(searchTerm).slice(0, 50); // Limitar resultados

  const toggleCompanySelection = (company: Company) => {
    setSelectedCompanies(prev => {
      const isSelected = prev.find(c => c.id === company.id);
      if (isSelected) {
        return prev.filter(c => c.id !== company.id);
      } else {
        return [...prev, company];
      }
    });
  };

  const isCompanySelected = (company: Company) => {
    return selectedCompanies.some(c => c.id === company.id);
  };

  if (!mandate) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Añadir Empresa al Mandato</DialogTitle>
          <DialogDescription>
            Cliente: {mandate.client_name} - {mandate.mandate_name}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">
              <Plus className="h-4 w-4 mr-2" />
              Crear Nueva Empresa
            </TabsTrigger>
            <TabsTrigger value="select">
              <Building2 className="h-4 w-4 mr-2" />
              Seleccionar Existente
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="overflow-y-auto max-h-[60vh]">
            <form onSubmit={handleCreateNewTarget} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="company_name">Nombre Empresa *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({...prev, company_name: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) => setFormData(prev => ({...prev, sector: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="revenues">Facturación (€)</Label>
                  <Input
                    id="revenues"
                    type="number"
                    value={formData.revenues || ''}
                    onChange={(e) => setFormData(prev => ({...prev, revenues: e.target.value ? Number(e.target.value) : undefined}))}
                  />
                </div>
                <div>
                  <Label htmlFor="ebitda">EBITDA (€)</Label>
                  <Input
                    id="ebitda"
                    type="number"
                    value={formData.ebitda || ''}
                    onChange={(e) => setFormData(prev => ({...prev, ebitda: e.target.value ? Number(e.target.value) : undefined}))}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_name">Contacto</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData(prev => ({...prev, contact_name: e.target.value}))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({...prev, contact_email: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Teléfono</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData(prev => ({...prev, contact_phone: e.target.value}))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || !formData.company_name?.trim()}>
                  {isSubmitting ? 'Creando...' : 'Crear y Añadir'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="select" className="space-y-4 overflow-hidden">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {selectedCompanies.length > 0 && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {selectedCompanies.length} empresa(s) seleccionada(s)
                    </span>
                    <Button
                      size="sm"
                      onClick={handleAddSelectedCompanies}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Añadiendo...' : 'Añadir Seleccionadas'}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompanies.map(company => (
                      <Badge key={company.id} variant="secondary" className="text-xs">
                        {company.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[40vh] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompanies.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            {searchTerm ? 'No se encontraron empresas' : 'Escribe para buscar empresas'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCompanies.map((company) => (
                          <TableRow
                            key={company.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleCompanySelection(company)}
                          >
                            <TableCell>
                              {isCompanySelected(company) && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{company.name}</div>
                                {company.domain && (
                                  <div className="text-sm text-muted-foreground">{company.domain}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {company.industry || 'Sin especificar'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {company.city ? `${company.city}${company.country ? `, ${company.country}` : ''}` : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  company.company_status === 'cliente' ? 'default' :
                                  company.company_status === 'prospecto' ? 'secondary' : 'outline'
                                }
                                className="text-xs"
                              >
                                {company.company_status || 'Sin estado'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};