import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useValoraciones } from '@/hooks/useValoraciones';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, ChevronLeft, ChevronRight, Building, User, Settings, Check } from 'lucide-react';
import { ValoracionPriority } from '@/types/Valoracion';
import { AutocompletedCompanySelector } from './AutocompletedCompanySelector';
import { AutocompletedContactSelector } from './AutocompletedContactSelector';
import { Company } from '@/types/Company';
import { Contact } from '@/types/Contact';

interface NewValoracionDialogProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export const NewValoracionDialog = ({ children, onSuccess }: NewValoracionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { createValoracion } = useValoraciones();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Step 1: Company
    company_id: '',
    company: null as Company | null,
    
    // Step 2: Client & Analyst
    client_id: '',
    client: null as Contact | null,
    client_name: '',
    client_email: '',
    assigned_analyst: '',
    
    // Step 3: Valuation Config
    valuation_method: '',
    currency: 'EUR',
    priority: 'medium' as ValoracionPriority,
    estimated_delivery_date: '',
    description: ''
  });

  const steps = [
    { number: 1, title: 'Empresa', icon: Building, description: 'Selecciona la empresa a valorar' },
    { number: 2, title: 'Solicitante', icon: User, description: 'Cliente y analista asignado' },
    { number: 3, title: 'Configuración', icon: Settings, description: 'Método y preferencias' }
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.company_id;
      case 2:
        return !!formData.client_name && !!formData.assigned_analyst;
      case 3:
        return !!formData.valuation_method && !!formData.currency;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const valoracionData = {
        company_name: formData.company?.name || '',
        client_name: formData.client_name,
        priority: formData.priority,
        valoracion_method: formData.valuation_method,
        assigned_to: formData.assigned_analyst,
        company_description: formData.description,
      };

      await createValoracion(valoracionData);
      
      toast({
        title: "Valoración creada",
        description: "Nueva valoración con estado 'requested' y tarea de inputs creada",
      });
      
      // Reset form
      setFormData({
        company_id: '',
        company: null,
        client_id: '',
        client: null,
        client_name: '',
        client_email: '',
        assigned_analyst: '',
        valuation_method: '',
        currency: 'EUR',
        priority: 'medium',
        estimated_delivery_date: '',
        description: ''
      });
      
      setCurrentStep(1);
      setOpen(false);
      onSuccess?.();
      
    } catch (error) {
      console.error('Error creating valoracion:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la valoración. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
            currentStep > step.number 
              ? 'bg-primary border-primary text-primary-foreground' 
              : currentStep === step.number 
                ? 'border-primary text-primary' 
                : 'border-muted-foreground text-muted-foreground'
          }`}>
            {currentStep > step.number ? (
              <Check className="w-5 h-5" />
            ) : (
              <step.icon className="w-5 h-5" />
            )}
          </div>
          
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-2 ${
              currentStep > step.number ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Selecciona la empresa a valorar</h3>
        <p className="text-sm text-muted-foreground">Elige de la base de datos o crea una nueva</p>
      </div>
      
      <div className="space-y-2">
        <Label>Empresa *</Label>
        <AutocompletedCompanySelector
          value={formData.company_id}
          onValueChange={(companyId, company) => {
            setFormData(prev => ({
              ...prev,
              company_id: companyId || '',
              company: company
            }));
          }}
          placeholder="Buscar empresa..."
        />
      </div>
      
      {formData.company && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium">{formData.company.name}</h4>
          {formData.company.industry && (
            <p className="text-sm text-muted-foreground">{formData.company.industry}</p>
          )}
          {formData.company.city && (
            <p className="text-sm text-muted-foreground">{formData.company.city}</p>
          )}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Solicitante y analista</h3>
        <p className="text-sm text-muted-foreground">Define quién solicita y quién realizará la valoración</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cliente (Solicitante) *</Label>
          <AutocompletedContactSelector
            value={formData.client_id}
            companyId={formData.company_id}
            onValueChange={(contactId, contact) => {
              setFormData(prev => ({
                ...prev,
                client_id: contactId || '',
                client: contact,
                client_name: contact?.name || prev.client_name,
                client_email: contact?.email || prev.client_email
              }));
            }}
            placeholder="Buscar contacto..."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="client_name">Nombre del solicitante *</Label>
          <Input
            id="client_name"
            value={formData.client_name}
            onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
            placeholder="Nombre completo"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client_email">Email del solicitante</Label>
          <Input
            id="client_email"
            type="email"
            value={formData.client_email}
            onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
            placeholder="email@empresa.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="assigned_analyst">Analista asignado *</Label>
          <Input
            id="assigned_analyst"
            value={formData.assigned_analyst}
            onChange={(e) => setFormData(prev => ({ ...prev, assigned_analyst: e.target.value }))}
            placeholder="Nombre del analista"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Configuración de valoración</h3>
        <p className="text-sm text-muted-foreground">Define el método y preferencias</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="valuation_method">Método preferente *</Label>
          <Select 
            value={formData.valuation_method} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, valuation_method: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DCF">DCF (Discounted Cash Flow)</SelectItem>
              <SelectItem value="Multiplos">Múltiplos de mercado</SelectItem>
              <SelectItem value="Patrimonio">Valor patrimonial</SelectItem>
              <SelectItem value="Mixto">Método mixto</SelectItem>
              <SelectItem value="Otro">Otro método</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currency">Moneda *</Label>
          <Select 
            value={formData.currency} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value: ValoracionPriority) => setFormData(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">🟢 Baja</SelectItem>
              <SelectItem value="medium">🟡 Media</SelectItem>
              <SelectItem value="high">🟠 Alta</SelectItem>
              <SelectItem value="urgent">🔴 Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="estimated_delivery_date">Fecha estimada de entrega</Label>
          <Input
            id="estimated_delivery_date"
            type="date"
            value={formData.estimated_delivery_date}
            onChange={(e) => setFormData(prev => ({ ...prev, estimated_delivery_date: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Notas adicionales</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Información adicional sobre la valoración..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Valoración
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Valoración</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStepIndicator()}
          
          <div className="min-h-[400px]">
            {renderCurrentStep()}
          </div>
          
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Paso {currentStep} de {steps.length}
            </div>
            
            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="gap-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || !validateStep(1) || !validateStep(2) || !validateStep(3)}
                className="gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear Valoración
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};