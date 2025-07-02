
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Building2, User, Plus, MapPin, Mail, Phone } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useCompanies } from '@/hooks/useCompanies';
import { usePracticeAreas } from '@/hooks/usePracticeAreas';
import { CreateProposalData } from '@/types/Proposal';

interface ClientInfoStepProps {
  data: CreateProposalData;
  onChange: (data: Partial<CreateProposalData>) => void;
  errors: string[];
}

export const ClientInfoStep: React.FC<ClientInfoStepProps> = ({ data, onChange, errors }) => {
  const [contactSearch, setContactSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const { contacts } = useContacts();
  const { companies } = useCompanies();
  const { practiceAreas } = usePracticeAreas();

  // Filtrar contactos y empresas basado en búsqueda
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.email?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  // Cargar datos seleccionados si ya existen IDs
  useEffect(() => {
    if (data.contact_id && !selectedContact) {
      const contact = contacts.find(c => c.id === data.contact_id);
      if (contact) setSelectedContact(contact);
    }
    if (data.company_id && !selectedCompany) {
      const company = companies.find(c => c.id === data.company_id);
      if (company) setSelectedCompany(company);
    }
  }, [data.contact_id, data.company_id, contacts, companies, selectedContact, selectedCompany]);

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
    onChange({ 
      contact_id: contact.id,
      // Auto-llenar empresa si el contacto tiene una asociada
      company_id: contact.company_id || data.company_id
    });

    // Si el contacto tiene una empresa asociada, seleccionarla también
    if (contact.company_id && companies.length > 0) {
      const associatedCompany = companies.find(c => c.id === contact.company_id);
      if (associatedCompany) {
        setSelectedCompany(associatedCompany);
      }
    }
  };

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company);
    onChange({ company_id: company.id });
  };

  const handleFieldChange = (field: keyof CreateProposalData, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Información Básica de la Propuesta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-1 bg-blue-50 rounded">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <span>Información Básica</span>
          </CardTitle>
          <CardDescription>
            Detalles principales de la propuesta y contexto del proyecto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Propuesta *</Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Ej: Servicios Legales Corporativos - ABC Corp"
                className={errors.some(e => e.includes('título')) ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal_type">Tipo de Propuesta</Label>
              <Select 
                value={data.proposal_type} 
                onValueChange={(value) => handleFieldChange('proposal_type', value as 'punctual' | 'recurring')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="punctual">Proyecto Puntual</SelectItem>
                  <SelectItem value="recurring">Servicios Recurrentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Proyecto</Label>
            <Textarea
              id="description"
              value={data.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Describe brevemente el alcance y objetivos del proyecto..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="practice_area">Área de Práctica</Label>
            <Select 
              value={data.practice_area_id || ''} 
              onValueChange={(value) => handleFieldChange('practice_area_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área de práctica" />
              </SelectTrigger>
              <SelectContent>
                {practiceAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: area.color }}
                      />
                      <span>{area.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Selección de Cliente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-1 bg-green-50 rounded">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <span>Contacto Principal</span>
            </CardTitle>
            <CardDescription>
              Persona de contacto para esta propuesta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedContact ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar contacto por nombre o email..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {contactSearch && (
                  <div className="max-h-48 overflow-y-auto border rounded-lg">
                    {filteredContacts.slice(0, 10).map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleContactSelect(contact)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-gray-500">{contact.email}</p>
                            {contact.company && (
                              <p className="text-xs text-gray-400">{contact.company}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {contact.contact_type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {filteredContacts.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        <p>No se encontraron contactos</p>
                        <Button variant="link" size="sm" className="mt-2">
                          <Plus className="h-4 w-4 mr-1" />
                          Crear nuevo contacto
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-900">{selectedContact.name}</h4>
                    {selectedContact.email && (
                      <div className="flex items-center text-sm text-green-700">
                        <Mail className="h-3 w-3 mr-1" />
                        {selectedContact.email}
                      </div>
                    )}
                    {selectedContact.phone && (
                      <div className="flex items-center text-sm text-green-700">
                        <Phone className="h-3 w-3 mr-1" />
                        {selectedContact.phone}
                      </div>
                    )}
                    {selectedContact.position && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedContact.position}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedContact(null);
                      onChange({ contact_id: undefined });
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-1 bg-purple-50 rounded">
                <Building2 className="h-4 w-4 text-purple-600" />
              </div>
              <span>Empresa Cliente</span>
            </CardTitle>
            <CardDescription>
              Organización que recibirá los servicios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedCompany ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar empresa..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {companySearch && (
                  <div className="max-h-48 overflow-y-auto border rounded-lg">
                    {filteredCompanies.slice(0, 10).map((company) => (
                      <div
                        key={company.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleCompanySelect(company)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{company.name}</p>
                            {company.industry && (
                              <p className="text-sm text-gray-500">{company.industry}</p>
                            )}
                            {company.city && (
                              <div className="flex items-center text-xs text-gray-400 mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {company.city}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {company.company_size}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {filteredCompanies.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        <p>No se encontraron empresas</p>
                        <Button variant="link" size="sm" className="mt-2">
                          <Plus className="h-4 w-4 mr-1" />
                          Crear nueva empresa
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-medium text-purple-900">{selectedCompany.name}</h4>
                    {selectedCompany.industry && (
                      <p className="text-sm text-purple-700">{selectedCompany.industry}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {selectedCompany.city && (
                        <Badge variant="secondary" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {selectedCompany.city}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {selectedCompany.company_size}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCompany(null);
                      onChange({ company_id: undefined });
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Validez de la Propuesta */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Validez</CardTitle>
          <CardDescription>
            Define el período de validez de esta propuesta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valid_until">Válida Hasta</Label>
              <Input
                id="valid_until"
                type="date"
                value={data.valid_until || ''}
                onChange={(e) => handleFieldChange('valid_until', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select 
                value={data.currency || 'EUR'} 
                onValueChange={(value) => handleFieldChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
