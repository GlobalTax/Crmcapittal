import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Operation } from "@/types/Operation";
import { useToast } from "@/hooks/use-toast";

interface AddOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOperation: (operation: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">) => void;
}

const SECTORS = [
  "Tecnología",
  "Salud",
  "Energía",
  "Finanzas",
  "Retail",
  "Inmobiliario",
  "Manufacturero",
  "Alimentación",
  "Turismo",
  "Logística",
  "Educación",
  "Telecomunicaciones",
  "Automoción",
  "Farmacéutico",
  "Construcción"
];

const PROVINCES = [
  "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", 
  "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real",
  "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara", "Gipuzkoa", "Huelva",
  "Huesca", "Jaén", "La Coruña", "La Rioja", "Las Palmas", "León", "Lleida",
  "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Palencia",
  "Pontevedra", "Salamanca", "Segovia", "Sevilla", "Soria", "Tarragona",
  "Santa Cruz de Tenerife", "Teruel", "Toledo", "Valencia", "Valladolid",
  "Bizkaia", "Zamora", "Zaragoza"
];

const formatNumber = (value: string) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Add thousand separators
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseFormattedNumber = (value: string) => {
  // Remove dots and convert to number
  return parseInt(value.replace(/\./g, '')) || 0;
};

const generateRandomProjectName = () => {
  const adjectives = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Nova', 'Apex', 'Prime', 'Elite', 'Ultra'];
  const nouns = ['Ventures', 'Capital', 'Holdings', 'Group', 'Partners', 'Corp', 'Industries', 'Solutions', 'Tech', 'Labs'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 999) + 1;
  
  return `${randomAdjective} ${randomNoun} ${randomNumber}`;
};

export const AddOperationDialog = ({ open, onOpenChange, onAddOperation }: AddOperationDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    project_name: "",
    cif: "",
    sector: "",
    operation_type: "" as Operation["operation_type"],
    revenue: "",
    ebitda: "",
    currency: "EUR",
    date: "",
    buyer: "",
    seller: "",
    status: "available" as Operation["status"],
    description: "",
    location: "",
    contact_email: "",
    contact_phone: ""
  });

  // Generate random project name when dialog opens
  const handleDialogChange = (open: boolean) => {
    if (open && !formData.project_name) {
      setFormData(prev => ({ 
        ...prev, 
        project_name: generateRandomProjectName() 
      }));
    }
    onOpenChange(open);
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setFormData({ ...formData, revenue: formatted });
  };

  const handleEbitdaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setFormData({ ...formData, ebitda: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!formData.company_name || !formData.sector || !formData.operation_type || !formData.revenue || !formData.date) {
      console.error('Missing required fields:', {
        company_name: formData.company_name,
        sector: formData.sector,
        operation_type: formData.operation_type,
        revenue: formData.revenue,
        date: formData.date
      });
      
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa todos los campos obligatorios marcados con *",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const revenueValue = parseFormattedNumber(formData.revenue);
      const ebitdaValue = parseFormattedNumber(formData.ebitda);
      
      console.log('Parsed values:', { revenueValue, ebitdaValue });

      const operationData = {
        company_name: formData.company_name,
        project_name: formData.project_name || generateRandomProjectName(),
        cif: formData.cif,
        sector: formData.sector,
        operation_type: formData.operation_type,
        amount: revenueValue, // Using revenue as main amount
        revenue: revenueValue,
        ebitda: ebitdaValue,
        currency: formData.currency,
        date: formData.date,
        buyer: formData.buyer,
        seller: formData.seller,
        status: formData.status,
        description: formData.description,
        location: formData.location,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone
      };

      console.log('Final operation data to be sent:', operationData);

      await onAddOperation(operationData);
      
      // Reset form
      setFormData({
        company_name: "",
        project_name: "",
        cif: "",
        sector: "",
        operation_type: "" as Operation["operation_type"],
        revenue: "",
        ebitda: "",
        currency: "EUR",
        date: "",
        buyer: "",
        seller: "",
        status: "available",
        description: "",
        location: "",
        contact_email: "",
        contact_phone: ""
      });

      toast({
        title: "Operación añadida",
        description: "La operación se ha creado exitosamente",
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la operación. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showBuyerField = formData.operation_type === "buy_mandate";
  const showSellerField = formData.operation_type === "sale" || formData.operation_type === "partial_sale";

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Añadir Nueva Operación</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nombre de la Empresa *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Ej: TechCorp Solutions"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_name">Nombre del Proyecto</Label>
              <div className="flex space-x-2">
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  placeholder="Ej: Proyecto Alpha"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ ...formData, project_name: generateRandomProjectName() })}
                  className="shrink-0"
                >
                  Generar
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cif">CIF</Label>
            <Input
              id="cif"
              value={formData.cif}
              onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
              placeholder="Ej: A12345678"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sector">Sector *</Label>
              <Select 
                value={formData.sector} 
                onValueChange={(value) => setFormData({ ...formData, sector: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sector) => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operation_type">Tipo de Operación *</Label>
              <Select 
                value={formData.operation_type} 
                onValueChange={(value: Operation["operation_type"]) => 
                  setFormData({ ...formData, operation_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merger">Fusión</SelectItem>
                  <SelectItem value="sale">Venta</SelectItem>
                  <SelectItem value="partial_sale">Venta Parcial</SelectItem>
                  <SelectItem value="buy_mandate">Mandato de Compra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: Operation["status"]) => 
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="in_process">En Proceso</SelectItem>
                <SelectItem value="sold">Vendida</SelectItem>
                <SelectItem value="withdrawn">Retirada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Facturación *</Label>
              <Input
                id="revenue"
                value={formData.revenue}
                onChange={handleRevenueChange}
                placeholder="50.000.000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ebitda">EBITDA</Label>
              <Input
                id="ebitda"
                value={formData.ebitda}
                onChange={handleEbitdaChange}
                placeholder="5.000.000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* Conditional fields based on operation type */}
          {(showBuyerField || showSellerField) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showBuyerField && (
                <div className="space-y-2">
                  <Label htmlFor="buyer">Comprador</Label>
                  <Input
                    id="buyer"
                    value={formData.buyer}
                    onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
                    placeholder="Nombre del comprador"
                  />
                </div>
              )}

              {showSellerField && (
                <div className="space-y-2">
                  <Label htmlFor="seller">Vendedor</Label>
                  <Input
                    id="seller"
                    value={formData.seller}
                    onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                    placeholder="Nombre del vendedor"
                  />
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Select 
              value={formData.location} 
              onValueChange={(value) => setFormData({ ...formData, location: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar provincia" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>{province}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Email de Contacto</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="contacto@empresa.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
            <Input
              id="contact_phone"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="+34 600 000 000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción detallada de la operación..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              style={{ border: '0.5px solid black' }}
              className="rounded-[10px]"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-black hover:bg-gray-800 text-white rounded-[10px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Añadiendo..." : "Añadir Operación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
