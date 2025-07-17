import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Import, Search, Users, HandCoins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImportDataDialogProps {
  onImportMandates?: (mandates: any[]) => void;
  onImportLeads?: (leads: any[]) => void;
}

export function ImportDataDialog({ onImportMandates, onImportLeads }: ImportDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [mandates, setMandates] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedMandates, setSelectedMandates] = useState<string[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load buying mandates
      const { data: mandatesData, error: mandatesError } = await supabase
        .from('buying_mandates')
        .select('*')
        .order('created_at', { ascending: false });

      if (mandatesError) throw mandatesError;

      // Load leads from contacts table
      const { data: leadsData, error: leadsError } = await supabase
        .from('contacts')
        .select('*')
        .in('lifecycle_stage', ['lead', 'oportunidad'])
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      setMandates(mandatesData || []);
      setLeads(leadsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const filteredMandates = mandates.filter(mandate =>
    mandate.mandate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mandate.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeads = leads.filter(lead =>
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImportMandates = () => {
    const selected = mandates.filter(m => selectedMandates.includes(m.id));
    const convertedMandates = selected.map(mandate => ({
      companyName: mandate.client_name || 'Empresa Sin Nombre',
      sector: mandate.target_sectors?.[0] || 'No especificado',
      location: mandate.target_locations?.[0] || 'No especificado',
      salesAmount: mandate.min_revenue || 0,
      ebitda: mandate.min_ebitda,
      description: mandate.other_criteria || 'Sin descripción disponible',
      status: mandate.status === 'active' ? 'Disponible' : 'En proceso',
      contactName: mandate.client_contact || 'Contacto desconocido',
      contactEmail: mandate.client_email || '',
      contactPhone: mandate.client_phone || '',
    }));

    onImportMandates?.(convertedMandates);
    toast.success(`${convertedMandates.length} mandatos importados`);
    setSelectedMandates([]);
  };

  const handleImportLeads = () => {
    const selected = leads.filter(l => selectedLeads.includes(l.id));
    const convertedLeads = selected.map(lead => ({
      companyName: lead.name || 'Empresa Sin Nombre',
      sector: 'No especificado',
      estimatedValue: 0,
      leadScore: lead.lead_score || 50,
      leadSource: 'Importado',
      qualificationStatus: lead.lifecycle_stage === 'lead' ? 'Pendiente' : 'Cualificado',
      contactName: lead.name || 'Contacto desconocido',
      contactEmail: lead.email || '',
      contactPhone: lead.phone || '',
      notes: `Importado desde CRM. Ciclo de vida: ${lead.lifecycle_stage}`,
    }));

    onImportLeads?.(convertedLeads);
    toast.success(`${convertedLeads.length} leads importados`);
    setSelectedLeads([]);
  };

  const handleClose = () => {
    setOpen(false);
    setSearchTerm('');
    setSelectedMandates([]);
    setSelectedLeads([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Import className="h-4 w-4" />
          Importar Datos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Importar Datos del CRM
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs defaultValue="mandates" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mandates" className="gap-2">
                <HandCoins className="h-4 w-4" />
                Mandatos ({filteredMandates.length})
              </TabsTrigger>
              <TabsTrigger value="leads" className="gap-2">
                <Users className="h-4 w-4" />
                Leads ({filteredLeads.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mandates" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Selecciona los mandatos que deseas importar
                </p>
                {selectedMandates.length > 0 && (
                  <Button onClick={handleImportMandates} size="sm">
                    Importar {selectedMandates.length} mandatos
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">Cargando mandatos...</div>
                ) : filteredMandates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron mandatos
                  </div>
                ) : (
                  filteredMandates.map((mandate) => (
                    <Card key={mandate.id} className="cursor-pointer hover:bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={selectedMandates.includes(mandate.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMandates([...selectedMandates, mandate.id]);
                              } else {
                                setSelectedMandates(selectedMandates.filter(id => id !== mandate.id));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{mandate.mandate_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Cliente: {mandate.client_name}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">
                                {mandate.status}
                              </Badge>
                              {mandate.target_sectors?.length > 0 && (
                                <Badge variant="secondary">
                                  {mandate.target_sectors[0]}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="leads" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Selecciona los leads que deseas importar
                </p>
                {selectedLeads.length > 0 && (
                  <Button onClick={handleImportLeads} size="sm">
                    Importar {selectedLeads.length} leads
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">Cargando leads...</div>
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron leads
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
                    <Card key={lead.id} className="cursor-pointer hover:bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedLeads([...selectedLeads, lead.id]);
                              } else {
                                setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{lead.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {lead.email}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">
                                {lead.lifecycle_stage}
                              </Badge>
                              {lead.lead_score && (
                                <Badge variant="secondary">
                                  Score: {lead.lead_score}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}