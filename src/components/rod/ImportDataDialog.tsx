import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  Import, 
  Search, 
  Users, 
  HandCoins, 
  Building2, 
  MapPin, 
  Euro, 
  User, 
  Mail, 
  Phone,
  Target,
  TrendingUp,
  Calendar,
  Briefcase,
  Store,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImportDataDialogProps {
  onImportMandates?: (mandates: any[]) => void;
  onImportLeads?: (leads: any[]) => void;
}

// Helper function to format currency
const formatCurrency = (amount: number, currency = 'EUR') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800 border-green-200';
    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'in_process': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'sold': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

export function ImportDataDialog({ onImportMandates, onImportLeads }: ImportDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [buyingMandates, setBuyingMandates] = useState<any[]>([]);
  const [operations, setOperations] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedBuyingMandates, setSelectedBuyingMandates] = useState<string[]>([]);
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
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
      const { data: buyingMandatesData, error: buyingMandatesError } = await supabase
        .from('buying_mandates')
        .select('*')
        .order('created_at', { ascending: false });

      if (buyingMandatesError) throw buyingMandatesError;

      // Load operations (sales mandates)
      const { data: operationsData, error: operationsError } = await supabase
        .from('operations')
        .select('*')
        .order('created_at', { ascending: false });

      if (operationsError) throw operationsError;

      // Load leads from contacts table
      const { data: leadsData, error: leadsError } = await supabase
        .from('contacts')
        .select('*')
        .in('lifecycle_stage', ['lead', 'oportunidad'])
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      setBuyingMandates(buyingMandatesData || []);
      setOperations(operationsData || []);
      setLeads(leadsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Filtered data
  const filteredBuyingMandates = buyingMandates.filter(mandate =>
    mandate.mandate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mandate.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOperations = operations.filter(operation =>
    operation.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operation.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeads = leads.filter(lead =>
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Import handlers
  const handleImportBuyingMandates = () => {
    const selected = buyingMandates.filter(m => selectedBuyingMandates.includes(m.id));
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
    toast.success(`${convertedMandates.length} mandatos de compra importados`);
    setSelectedBuyingMandates([]);
  };

  const handleImportOperations = () => {
    const selected = operations.filter(o => selectedOperations.includes(o.id));
    const convertedOperations = selected.map(operation => ({
      companyName: operation.company_name || 'Empresa Sin Nombre',
      sector: operation.sector || 'No especificado',
      location: operation.location || 'No especificado',
      salesAmount: operation.amount || 0,
      ebitda: operation.ebitda,
      description: operation.description || 'Sin descripción disponible',
      status: operation.status === 'available' ? 'Disponible' : 'En proceso',
      contactName: operation.seller || 'Contacto desconocido',
      contactEmail: operation.contact_email || '',
      contactPhone: operation.contact_phone || '',
    }));

    onImportMandates?.(convertedOperations);
    toast.success(`${convertedOperations.length} mandatos de venta importados`);
    setSelectedOperations([]);
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
    setSelectedBuyingMandates([]);
    setSelectedOperations([]);
    setSelectedLeads([]);
  };

  // Card components
  const BuyingMandateCard = ({ mandate }: { mandate: any }) => (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={selectedBuyingMandates.includes(mandate.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedBuyingMandates([...selectedBuyingMandates, mandate.id]);
                } else {
                  setSelectedBuyingMandates(selectedBuyingMandates.filter(id => id !== mandate.id));
                }
              }}
            />
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                {mandate.mandate_name}
              </CardTitle>
              <Badge className={`mt-1 ${getStatusColor(mandate.status)}`}>
                {mandate.status === 'active' ? 'Activo' : mandate.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Cliente:</span>
            <span>{mandate.client_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Contacto:</span>
            <span>{mandate.client_contact}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Sectores:</span>
            <span>{mandate.target_sectors?.slice(0, 2).join(', ') || 'No especificado'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Ubicaciones:</span>
            <span>{mandate.target_locations?.slice(0, 2).join(', ') || 'No especificado'}</span>
          </div>
        </div>
        
        <Separator className="my-3" />
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          {mandate.min_revenue && (
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-green-600" />
              <span className="font-medium">Rev. mín:</span>
              <span className="text-green-600 font-medium">{formatCurrency(mandate.min_revenue)}</span>
            </div>
          )}
          {mandate.min_ebitda && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium">EBITDA mín:</span>
              <span className="text-green-600 font-medium">{formatCurrency(mandate.min_ebitda)}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {mandate.client_email || 'Sin email'}
          </div>
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {mandate.client_phone || 'Sin teléfono'}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OperationCard = ({ operation }: { operation: any }) => (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={selectedOperations.includes(operation.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedOperations([...selectedOperations, operation.id]);
                } else {
                  setSelectedOperations(selectedOperations.filter(id => id !== operation.id));
                }
              }}
            />
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="h-4 w-4 text-orange-600" />
                {operation.company_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{operation.project_name}</p>
              <Badge className={`mt-2 ${getStatusColor(operation.status)}`}>
                {operation.status === 'available' ? 'Disponible' : 
                 operation.status === 'in_process' ? 'En proceso' : operation.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Sector:</span>
            <span>{operation.sector}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Ubicación:</span>
            <span>{operation.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Vendedor:</span>
            <span>{operation.seller || 'No especificado'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Fecha:</span>
            <span>{new Date(operation.date).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
        
        <Separator className="my-3" />
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-green-600" />
            <span className="font-medium">Importe:</span>
            <span className="text-green-600 font-semibold">{formatCurrency(operation.amount, operation.currency)}</span>
          </div>
          {operation.ebitda && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium">EBITDA:</span>
              <span className="text-green-600 font-medium">{formatCurrency(operation.ebitda)}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {operation.contact_email || 'Sin email'}
          </div>
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {operation.contact_phone || 'Sin teléfono'}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const LeadCard = ({ lead }: { lead: any }) => (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
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
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                {lead.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{lead.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge className={`${getStatusColor(lead.lifecycle_stage)}`}>
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
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Empresa:</span>
            <span>{lead.company || 'No especificado'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Posición:</span>
            <span>{lead.position || 'No especificado'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Teléfono:</span>
            <span>{lead.phone || 'Sin teléfono'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Creado:</span>
            <span>{new Date(lead.created_at).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
        
        {lead.sectors_of_interest && lead.sectors_of_interest.length > 0 && (
          <>
            <Separator className="my-3" />
            <div className="text-sm">
              <span className="font-medium">Sectores de interés:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {lead.sectors_of_interest.slice(0, 3).map((sector: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {lead.notes && (
          <div className="mt-3 text-xs text-muted-foreground">
            <p className="line-clamp-2">{lead.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Import className="h-4 w-4" />
          Importar Datos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
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
              placeholder="Buscar por nombre, empresa o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs defaultValue="buying-mandates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="buying-mandates" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Mandatos Compra ({filteredBuyingMandates.length})
              </TabsTrigger>
              <TabsTrigger value="operations" className="gap-2">
                <Store className="h-4 w-4" />
                Mandatos Venta ({filteredOperations.length})
              </TabsTrigger>
              <TabsTrigger value="leads" className="gap-2">
                <Users className="h-4 w-4" />
                Leads ({filteredLeads.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buying-mandates" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Selecciona los mandatos de compra que deseas importar
                </p>
                {selectedBuyingMandates.length > 0 && (
                  <Button onClick={handleImportBuyingMandates} size="sm">
                    Importar {selectedBuyingMandates.length} mandatos
                  </Button>
                )}
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">Cargando mandatos de compra...</div>
                ) : filteredBuyingMandates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron mandatos de compra
                  </div>
                ) : (
                  filteredBuyingMandates.map((mandate) => (
                    <BuyingMandateCard key={mandate.id} mandate={mandate} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="operations" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Selecciona los mandatos de venta que deseas importar
                </p>
                {selectedOperations.length > 0 && (
                  <Button onClick={handleImportOperations} size="sm">
                    Importar {selectedOperations.length} operaciones
                  </Button>
                )}
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">Cargando operaciones...</div>
                ) : filteredOperations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron operaciones
                  </div>
                ) : (
                  filteredOperations.map((operation) => (
                    <OperationCard key={operation.id} operation={operation} />
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

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">Cargando leads...</div>
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron leads
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
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