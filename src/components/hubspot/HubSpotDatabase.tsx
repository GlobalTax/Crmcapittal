import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Handshake, ExternalLink, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HubSpotCompany {
  id: string;
  hubspot_id: string;
  name: string;
  domain?: string;
  industry?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  description?: string;
  annual_revenue?: number;
  company_size: string;
  founded_year?: number;
  total_contacts: number;
  total_deals: number;
  created_at: string;
}

interface HubSpotContact {
  id: string;
  hubspot_id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  company?: string;
  company_name?: string;
  company_domain?: string;
  company_industry?: string;
  lifecycle_stage?: string;
  contact_status?: string;
  is_active: boolean;
  last_interaction_date?: string;
  created_at: string;
}

interface HubSpotDeal {
  id: string;
  hubspot_id: string;
  deal_name: string;
  deal_value?: number;
  deal_type: string;
  description?: string;
  contact_name?: string;
  contact_email?: string;
  company_name?: string;
  close_date?: string;
  is_active: boolean;
  created_at: string;
}

export function HubSpotDatabase() {
  const [companies, setCompanies] = useState<HubSpotCompany[]>([]);
  const [contacts, setContacts] = useState<HubSpotContact[]>([]);
  const [deals, setDeals] = useState<HubSpotDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHubSpotData();
  }, []);

  const fetchHubSpotData = async () => {
    try {
      setLoading(true);

      // Fetch companies with stats
      const { data: companiesData, error: companiesError } = await supabase
        .from('hubspot_companies_with_stats')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch contacts with company info
      const { data: contactsData, error: contactsError } = await supabase
        .from('hubspot_contacts_with_company')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch deals with details
      const { data: dealsData, error: dealsError } = await supabase
        .from('hubspot_deals_with_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (companiesError) throw companiesError;
      if (contactsError) throw contactsError;
      if (dealsError) throw dealsError;

      setCompanies(companiesData || []);
      setContacts(contactsData || []);
      setDeals(dealsData || []);
    } catch (error) {
      console.error('Error fetching HubSpot data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de HubSpot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando datos de HubSpot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Base de Datos HubSpot</h1>
          <p className="text-muted-foreground">
            Visualiza todos los datos importados desde HubSpot
          </p>
        </div>
        <Button onClick={fetchHubSpotData} variant="outline">
          Actualizar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">
              Importadas desde HubSpot
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-xs text-muted-foreground">
              Importados desde HubSpot
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.length}</div>
            <p className="text-xs text-muted-foreground">
              Importados desde HubSpot
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="contacts">Contactos</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          <div className="grid gap-4">
            {companies.map((company) => (
              <Card key={company.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {company.name}
                        <Badge variant="secondary" className="text-xs">
                          ID: {company.hubspot_id}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {company.industry && (
                          <span className="inline-flex items-center gap-1">
                            <Badge variant="outline">{company.industry}</Badge>
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{company.total_contacts} contactos</div>
                      <div>{company.total_deals} deals</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {company.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4" />
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {company.website}
                          </a>
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4" />
                          {company.phone}
                        </div>
                      )}
                      {(company.city || company.state || company.country) && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          {[company.city, company.state, company.country].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      {company.annual_revenue && (
                        <div>
                          <strong>Facturación:</strong> {formatCurrency(company.annual_revenue)}
                        </div>
                      )}
                      <div>
                        <strong>Tamaño:</strong> {company.company_size} empleados
                      </div>
                      {company.founded_year && (
                        <div>
                          <strong>Fundada:</strong> {company.founded_year}
                        </div>
                      )}
                      <div>
                        <strong>Importada:</strong> {formatDate(company.created_at)}
                      </div>
                    </div>
                  </div>
                  {company.description && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">{company.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="grid gap-4">
            {contacts.map((contact) => (
              <Card key={contact.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {contact.name}
                        <Badge variant="secondary" className="text-xs">
                          ID: {contact.hubspot_id}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {contact.position && <span>{contact.position}</span>}
                        {contact.company_name && (
                          <span className="ml-2">
                            en <strong>{contact.company_name}</strong>
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      {contact.lifecycle_stage && (
                        <Badge variant="outline">{contact.lifecycle_stage}</Badge>
                      )}
                      {contact.is_active ? (
                        <Badge variant="default">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4" />
                          <a 
                            href={`mailto:${contact.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </div>
                      )}
                      {contact.company_industry && (
                        <div className="text-sm">
                          <strong>Industria:</strong> {contact.company_industry}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      {contact.last_interaction_date && (
                        <div>
                          <strong>Última interacción:</strong> {formatDate(contact.last_interaction_date)}
                        </div>
                      )}
                      <div>
                        <strong>Importado:</strong> {formatDate(contact.created_at)}
                      </div>
                      {contact.company_domain && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <a 
                            href={`https://${contact.company_domain}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {contact.company_domain}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <div className="grid gap-4">
            {deals.map((deal) => (
              <Card key={deal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Handshake className="h-5 w-5" />
                        {deal.deal_name}
                        <Badge variant="secondary" className="text-xs">
                          ID: {deal.hubspot_id}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {deal.contact_name && (
                          <span>Contacto: <strong>{deal.contact_name}</strong></span>
                        )}
                        {deal.company_name && (
                          <span className="ml-2">
                            en <strong>{deal.company_name}</strong>
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      {deal.deal_value && (
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(deal.deal_value)}
                        </div>
                      )}
                      {deal.is_active ? (
                        <Badge variant="default">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>Tipo:</strong> {deal.deal_type}
                      </div>
                      {deal.contact_email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4" />
                          <a 
                            href={`mailto:${deal.contact_email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {deal.contact_email}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      {deal.close_date && (
                        <div>
                          <strong>Fecha de cierre:</strong> {formatDate(deal.close_date)}
                        </div>
                      )}
                      <div>
                        <strong>Importado:</strong> {formatDate(deal.created_at)}
                      </div>
                    </div>
                  </div>
                  {deal.description && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">{deal.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {companies.length === 0 && contacts.length === 0 && deals.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay datos de HubSpot</h3>
            <p className="text-muted-foreground mb-4">
              No se han encontrado datos importados desde HubSpot.
            </p>
            <p className="text-sm text-muted-foreground">
              Utiliza la herramienta de importación para traer datos desde HubSpot.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}