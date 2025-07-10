import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Building, 
  Search, 
  ExternalLink,
  Trash2,
  Globe
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  company_size?: string;
  city?: string;
  country?: string;
}

interface ContactCompany {
  id: string;
  contact_id: string;
  company_name: string;
  company_website?: string;
  company_sector?: string;
  company_size?: string;
  company_location?: string;
  is_primary: boolean;
  created_at: string;
}

interface ContactCompanyTabProps {
  contactId: string;
  currentUserId: string;
}

export function ContactCompanyTab({ contactId, currentUserId }: ContactCompanyTabProps) {
  const [contactCompanies, setContactCompanies] = useState<ContactCompany[]>([]);
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [newCompany, setNewCompany] = useState({
    name: '',
    website: '',
    industry: '',
    company_size: '',
    city: '',
    country: 'España'
  });

  // Cargar empresas asociadas al contacto
  useEffect(() => {
    fetchContactCompanies();
  }, [contactId]);

  const fetchContactCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_companies')
        .select('*')
        .eq('contact_id', contactId)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      setContactCompanies(data || []);
    } catch (error) {
      console.error('Error fetching contact companies:', error);
    }
  };

  // Buscar empresas existentes
  const searchCompanies = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, website, industry, company_size, city, country')
        .ilike('name', `%${term}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva empresa
  const createCompany = async () => {
    if (!newCompany.name.trim()) return;

    try {
      // Crear empresa en la tabla companies
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: newCompany.name,
          website: newCompany.website || undefined,
          industry: newCompany.industry || undefined,
          company_size: (newCompany.company_size as any) || '11-50',
          city: newCompany.city || undefined,
          country: newCompany.country,
          created_by: currentUserId
        }])
        .select()
        .single();

      if (companyError) throw companyError;

      // Asociar empresa al contacto
      await associateCompanyToContact({
        id: company.id,
        name: company.name,
        website: company.website,
        industry: company.industry,
        company_size: company.company_size,
        city: company.city,
        country: company.country
      });

      setNewCompany({
        name: '',
        website: '',
        industry: '',
        company_size: '',
        city: '',
        country: 'España'
      });
      setShowCreateForm(false);

      toast({
        title: "Empresa creada",
        description: "La empresa ha sido creada y asociada al contacto.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la empresa.",
        variant: "destructive",
      });
    }
  };

  // Asociar empresa existente al contacto
  const associateCompanyToContact = async (company: Company) => {
    try {
      const { error } = await supabase
        .from('contact_companies')
        .insert([{
          contact_id: contactId,
          company_name: company.name,
          company_website: company.website,
          company_sector: company.industry,
          company_size: company.company_size,
          company_location: company.city ? `${company.city}, ${company.country}` : company.country,
          is_primary: contactCompanies.length === 0
        }]);

      if (error) throw error;

      await fetchContactCompanies();
      setSearchTerm('');
      setSearchResults([]);

      toast({
        title: "Empresa asociada",
        description: "La empresa ha sido asociada al contacto.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo asociar la empresa.",
        variant: "destructive",
      });
    }
  };

  // Eliminar asociación de empresa
  const removeCompanyAssociation = async (companyId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta asociación?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

      await fetchContactCompanies();

      toast({
        title: "Asociación eliminada",
        description: "La empresa ha sido desasociada del contacto.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la asociación.",
        variant: "destructive",
      });
    }
  };

  // Establecer como empresa principal
  const setPrimaryCompany = async (companyId: string) => {
    try {
      // Quitar primaria de todas
      await supabase
        .from('contact_companies')
        .update({ is_primary: false })
        .eq('contact_id', contactId);

      // Establecer como primaria
      const { error } = await supabase
        .from('contact_companies')
        .update({ is_primary: true })
        .eq('id', companyId);

      if (error) throw error;

      await fetchContactCompanies();

      toast({
        title: "Empresa principal actualizada",
        description: "La empresa ha sido establecida como principal.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la empresa principal.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Buscador de empresas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Empresas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar empresas existentes..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                searchCompanies(e.target.value);
              }}
            />
            <Button 
              variant="outline" 
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva
            </Button>
          </div>

          {/* Resultados de búsqueda */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Resultados de búsqueda:</h4>
              {searchResults.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium">{company.name}</h5>
                    <div className="text-sm text-muted-foreground">
                      {company.industry && <span>{company.industry}</span>}
                      {company.city && <span> • {company.city}</span>}
                      {company.company_size && <span> • {company.company_size} empleados</span>}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => associateCompanyToContact(company)}
                  >
                    Asociar
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Formulario de crear nueva empresa */}
          {showCreateForm && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium">Crear Nueva Empresa</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Nombre de la empresa *"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                />
                <Input
                  placeholder="Sitio web"
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                />
                <Input
                  placeholder="Industria/Sector"
                  value={newCompany.industry}
                  onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                />
                <Input
                  placeholder="Tamaño (ej: 11-50)"
                  value={newCompany.company_size}
                  onChange={(e) => setNewCompany({ ...newCompany, company_size: e.target.value })}
                />
                <Input
                  placeholder="Ciudad"
                  value={newCompany.city}
                  onChange={(e) => setNewCompany({ ...newCompany, city: e.target.value })}
                />
                <Input
                  placeholder="País"
                  value={newCompany.country}
                  onChange={(e) => setNewCompany({ ...newCompany, country: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createCompany}>
                  Crear y Asociar
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empresas asociadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Empresas Asociadas ({contactCompanies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contactCompanies.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay empresas asociadas
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Busca y asocia empresas usando el buscador de arriba
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contactCompanies.map((company) => (
                <div key={company.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{company.company_name}</h4>
                      {company.is_primary && (
                        <Badge>Principal</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {company.company_sector && (
                        <div>Sector: {company.company_sector}</div>
                      )}
                      {company.company_size && (
                        <div>Tamaño: {company.company_size}</div>
                      )}
                      {company.company_location && (
                        <div>Ubicación: {company.company_location}</div>
                      )}
                      {company.company_website && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <a 
                            href={company.company_website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {company.company_website}
                            <ExternalLink className="h-3 w-3 inline ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    {!company.is_primary && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPrimaryCompany(company.id)}
                      >
                        Hacer Principal
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCompanyAssociation(company.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}