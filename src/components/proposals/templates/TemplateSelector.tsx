import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProposalTemplates } from '@/hooks/useProposalTemplates';
import { ProposalTemplate } from '@/types/ProposalTemplate';
import { Contact } from '@/types/Contact';
import { Company } from '@/types/Company';
import { Search, Sparkles, ArrowRight, Users, Building } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: ProposalTemplate, clientData?: any) => void;
  contacts?: Contact[];
  companies?: Company[];
}

const CATEGORY_COLORS = {
  'M&A': 'bg-blue-100 text-blue-800',
  'Valoracion': 'bg-green-100 text-green-800',
  'Consultoria': 'bg-purple-100 text-purple-800',
  'Due Diligence': 'bg-orange-100 text-orange-800',
  'Legal': 'bg-gray-100 text-gray-800'
};

export const TemplateSelector = ({ 
  open, 
  onOpenChange, 
  onSelectTemplate,
  contacts = [],
  companies = []
}: TemplateSelectorProps) => {
  const { templates, loading, incrementUsage } = useProposalTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [step, setStep] = useState<'template' | 'client'>('template');

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularTemplates = templates
    .sort((a, b) => b.usage_count - a.usage_count)
    .slice(0, 3);

  const handleTemplateSelect = (template: ProposalTemplate) => {
    setSelectedTemplate(template);
    if (contacts.length > 0 || companies.length > 0) {
      setStep('client');
    } else {
      handleFinalSelection(template);
    }
  };

  const handleFinalSelection = async (template: ProposalTemplate) => {
    // Increment usage count
    await incrementUsage(template.id);

    // Prepare client data for auto-population
    const clientData: any = {};
    
    if (selectedContact) {
      const contact = contacts.find(c => c.id === selectedContact);
      if (contact) {
        clientData.cliente = {
          nombre: contact.name,
          email: contact.email,
          cargo: contact.position || 'Contacto'
        };
      }
    }

    if (selectedCompany) {
      const company = companies.find(c => c.id === selectedCompany);
      if (company) {
        clientData.empresa = {
          nombre: company.name,
          sector: company.industry || 'No especificado',
          ubicacion: [company.city, company.country].filter(Boolean).join(', ') || 'No especificado'
        };
      }
    }

    // Add current date
    clientData.fecha = {
      hoy: new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };

    onSelectTemplate(template, clientData);
    onOpenChange(false);
    
    // Reset state
    setSelectedTemplate(null);
    setSelectedContact('');
    setSelectedCompany('');
    setStep('template');
  };

  const handleBack = () => {
    setStep('template');
    setSelectedTemplate(null);
  };

  const handleSkipClient = () => {
    if (selectedTemplate) {
      handleFinalSelection(selectedTemplate);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {step === 'template' ? 'Seleccionar Template' : 'Datos del Cliente'}
          </DialogTitle>
        </DialogHeader>

        {step === 'template' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Popular Templates */}
            {!searchQuery && popularTemplates.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Más Populares
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {popularTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className={CATEGORY_COLORS[template.category]}>
                            {template.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {template.usage_count} usos
                          </span>
                        </div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Templates */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {searchQuery ? 'Resultados de Búsqueda' : 'Todos los Templates'}
              </h3>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron templates
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className={CATEGORY_COLORS[template.category]}>
                            {template.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {template.usage_count} usos
                          </span>
                        </div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'client' && selectedTemplate && (
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={CATEGORY_COLORS[selectedTemplate.category]}>
                  {selectedTemplate.category}
                </Badge>
                <span className="font-medium">{selectedTemplate.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedTemplate.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Selection */}
              {contacts.length > 0 && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Cliente (Opcional)
                  </Label>
                  <Select value={selectedContact} onValueChange={setSelectedContact}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar contacto" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          <div>
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {contact.email}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Company Selection */}
              {companies.length > 0 && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Empresa (Opcional)
                  </Label>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          <div>
                            <div className="font-medium">{company.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {company.industry || 'Sin sector'}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Auto-población de datos</h4>
              <p className="text-sm text-blue-700">
                Los datos del cliente y empresa seleccionados se utilizarán para 
                auto-completar los campos de la propuesta, ahorrándote tiempo de escritura.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack}>
                Volver
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSkipClient}
                className="flex-1"
              >
                Continuar sin datos
              </Button>
              <Button 
                onClick={() => handleFinalSelection(selectedTemplate)}
                className="flex-1 bg-primary text-primary-foreground"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Crear Propuesta
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};