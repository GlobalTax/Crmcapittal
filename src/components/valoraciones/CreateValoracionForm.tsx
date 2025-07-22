import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, User, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { AutocompletedCompanySelector } from './AutocompletedCompanySelector';
import { AutocompletedContactSelector } from './AutocompletedContactSelector';
import { Company } from '@/types/Company';
import { Contact } from '@/types/Contact';
import { toast } from 'sonner';

interface CreateValoracionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateValoracionData) => Promise<void>;
  isSubmitting?: boolean;
}

interface CreateValoracionData {
  company_id: string;
  contact_id: string;
  company_name: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  valuation_type: string;
  urgency?: string;
  notes?: string;
  status: 'requested';
}

type FormStep = 'company' | 'contact' | 'details';

export function CreateValoracionForm({ open, onOpenChange, onSubmit, isSubmitting = false }: CreateValoracionFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('company');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    valuation_type: 'empresa_completa',
    urgency: 'normal',
    notes: '',
    client_email: '',
    client_phone: ''
  });

  const handleCompanyChange = (companyId: string | null, company: Company | null) => {
    setSelectedCompany(company);
    setSelectedContact(null); // Reset contact when company changes
  };

  const handleContactChange = (contactId: string | null, contact: Contact | null) => {
    setSelectedContact(contact);
    if (contact) {
      setFormData(prev => ({
        ...prev,
        client_email: contact.email || '',
        client_phone: contact.phone || ''
      }));
    }
  };

  const canProceedToContact = selectedCompany !== null;
  const canProceedToDetails = selectedCompany !== null && selectedContact !== null;
  const canSubmit = canProceedToDetails && formData.valuation_type;

  const handleNext = () => {
    if (currentStep === 'company' && canProceedToContact) {
      setCurrentStep('contact');
    } else if (currentStep === 'contact' && canProceedToDetails) {
      setCurrentStep('details');
    }
  };

  const handleBack = () => {
    if (currentStep === 'contact') {
      setCurrentStep('company');
    } else if (currentStep === 'details') {
      setCurrentStep('contact');
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !selectedCompany || !selectedContact) {
      toast.error('Faltan datos requeridos');
      return;
    }

    try {
      await onSubmit({
        company_id: selectedCompany.id,
        contact_id: selectedContact.id,
        company_name: selectedCompany.name,
        client_name: selectedContact.name,
        client_email: formData.client_email || selectedContact.email,
        client_phone: formData.client_phone || selectedContact.phone,
        valuation_type: formData.valuation_type,
        urgency: formData.urgency,
        notes: formData.notes,
        status: 'requested'
      });
      
      // Reset form
      setCurrentStep('company');
      setSelectedCompany(null);
      setSelectedContact(null);
      setFormData({
        valuation_type: 'empresa_completa',
        urgency: 'normal',
        notes: '',
        client_email: '',
        client_phone: ''
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating valoración:', error);
    }
  };

  const stepTitles = {
    company: '1. Seleccionar Empresa',
    contact: '2. Seleccionar Contacto',
    details: '3. Detalles de Valoración'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nueva Valoración - {stepTitles[currentStep]}
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {(['company', 'contact', 'details'] as FormStep[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep === step 
                  ? 'bg-primary text-primary-foreground' 
                  : index < ['company', 'contact', 'details'].indexOf(currentStep)
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }
              `}>
                {index + 1}
              </div>
              {index < 2 && (
                <div className={`
                  w-12 h-0.5 mx-2
                  ${index < ['company', 'contact', 'details'].indexOf(currentStep)
                    ? 'bg-primary/20'
                    : 'bg-muted'
                  }
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 'company' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Empresa a Valorar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company">Empresa *</Label>
                <AutocompletedCompanySelector
                  value={selectedCompany?.id}
                  onValueChange={handleCompanyChange}
                  placeholder="Buscar empresa a valorar..."
                  className="mt-1"
                />
              </div>
              
              {selectedCompany && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Empresa seleccionada:</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nombre:</strong> {selectedCompany.name}</p>
                    {selectedCompany.industry && (
                      <p><strong>Sector:</strong> {selectedCompany.industry}</p>
                    )}
                    {selectedCompany.city && (
                      <p><strong>Ubicación:</strong> {selectedCompany.city}</p>
                    )}
                    {selectedCompany.annual_revenue && (
                      <p><strong>Facturación:</strong> €{selectedCompany.annual_revenue.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 'contact' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contacto Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contact">Contacto *</Label>
                <AutocompletedContactSelector
                  value={selectedContact?.id}
                  onValueChange={handleContactChange}
                  companyId={selectedCompany?.id}
                  placeholder="Seleccionar contacto de la empresa..."
                  className="mt-1"
                />
              </div>

              {selectedContact && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Contacto seleccionado:</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nombre:</strong> {selectedContact.name}</p>
                    {selectedContact.position && (
                      <p><strong>Cargo:</strong> {selectedContact.position}</p>
                    )}
                    {selectedContact.email && (
                      <p><strong>Email:</strong> {selectedContact.email}</p>
                    )}
                    {selectedContact.phone && (
                      <p><strong>Teléfono:</strong> {selectedContact.phone}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalles de la Valoración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="valuation_type">Tipo de Valoración *</Label>
                <select
                  id="valuation_type"
                  value={formData.valuation_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, valuation_type: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                >
                  <option value="empresa_completa">Valoración Empresa Completa</option>
                  <option value="activos_especificos">Activos Específicos</option>
                  <option value="participaciones">Participaciones</option>
                  <option value="marca">Valoración de Marca</option>
                </select>
              </div>

              <div>
                <Label htmlFor="urgency">Urgencia</Label>
                <select
                  id="urgency"
                  value={formData.urgency}
                  onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                >
                  <option value="baja">Baja (30+ días)</option>
                  <option value="normal">Normal (15-30 días)</option>
                  <option value="alta">Alta (7-15 días)</option>
                  <option value="urgente">Urgente (1-7 días)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_email">Email del Cliente</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                    placeholder="Actualizar email si es necesario"
                  />
                </div>
                <div>
                  <Label htmlFor="client_phone">Teléfono del Cliente</Label>
                  <Input
                    id="client_phone"
                    type="tel"
                    value={formData.client_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                    placeholder="Actualizar teléfono si es necesario"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Información adicional relevante para la valoración..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 'company'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          
          {currentStep !== 'details' ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 'company' && !canProceedToContact) ||
                (currentStep === 'contact' && !canProceedToDetails)
              }
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Valoración'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}