
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Users, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { useToast } from '@/hooks/use-toast';

interface ImportFromCRMDialogProps {
  mandateId: string;
  onImported?: () => void;
  trigger?: React.ReactNode;
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  contact_type: string;
}

interface Company {
  id: string;
  name: string;
  industry?: string;
  city?: string;
  country?: string;
  annual_revenue?: number;
  company_size: string;
}

export const ImportFromCRMDialog = ({ 
  mandateId, 
  onImported = () => {},
  trigger 
}: ImportFromCRMDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');
  
  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  
  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  
  const { importFromContacts, importFromCompanies } = useBuyingMandates();
  const { toast } = useToast();

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email, phone, company, position, contact_type')
        .limit(100);
      
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, industry, city, country, annual_revenue, company_size')
        .limit(100);
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchContacts();
      fetchCompanies();
    }
  }, [open]);

  const handleImport = async () => {
    if (selectedContacts.length === 0 && selectedCompanies.length === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona al menos un elemento para importar',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    try {
      if (selectedContacts.length > 0) {
        await importFromContacts(mandateId, selectedContacts);
      }
      if (selectedCompanies.length > 0) {
        await importFromCompanies(mandateId, selectedCompanies);
      }
      
      setOpen(false);
      setSelectedContacts([]);
      setSelectedCompanies([]);
      onImported();
    } catch (error) {
      console.error('Error importing:', error);
    } finally {
      setIsImporting(false);
    }
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.company?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.email?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  // Filter companies
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(companySearch.toLowerCase()) ||
    company.industry?.toLowerCase().includes(companySearch.toLowerCase())
  );

  const formatRevenue = (revenue?: number) => {
    if (!revenue) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(revenue);
  };

  const dialogContent = (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Importar desde CRM</DialogTitle>
        <DialogDescription>
          Selecciona contactos o empresas existentes para añadir como targets a este mandato
        </DialogDescription>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contactos ({filteredContacts.length})
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Empresas ({filteredCompanies.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contactos..."
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredContacts.map((contact) => (
              <Card key={contact.id}>
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedContacts([...selectedContacts, contact.id]);
                        } else {
                          setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{contact.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {contact.company && (
                          <Badge variant="outline" className="text-xs">
                            {contact.company}
                          </Badge>
                        )}
                        {contact.position && (
                          <Badge variant="secondary" className="text-xs">
                            {contact.position}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {contact.contact_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {contact.email && <div>📧 {contact.email}</div>}
                        {contact.phone && <div>📞 {contact.phone}</div>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedContacts.length > 0 && (
            <Badge variant="secondary">
              {selectedContacts.length} contactos seleccionados
            </Badge>
          )}
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresas..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredCompanies.map((company) => (
              <Card key={company.id}>
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedCompanies.includes(company.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCompanies([...selectedCompanies, company.id]);
                        } else {
                          setSelectedCompanies(selectedCompanies.filter(id => id !== company.id));
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{company.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {company.industry && (
                          <Badge variant="outline" className="text-xs">
                            {company.industry}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {company.company_size}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {company.city && company.country && (
                          <div>📍 {company.city}, {company.country}</div>
                        )}
                        {company.annual_revenue && (
                          <div>💰 {formatRevenue(company.annual_revenue)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedCompanies.length > 0 && (
            <Badge variant="secondary">
              {selectedCompanies.length} empresas seleccionadas
            </Badge>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Total seleccionados: {selectedContacts.length + selectedCompanies.length}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={isImporting || (selectedContacts.length === 0 && selectedCompanies.length === 0)}
          >
            {isImporting ? 'Importando...' : 'Importar Seleccionados'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {dialogContent}
    </Dialog>
  );
};
