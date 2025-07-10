
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Lead } from "@/types/Lead";
import { Building2, User, Briefcase, ArrowRight } from "lucide-react";

interface ConvertLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onConvert: (leadId: string, options: { createCompany: boolean; createDeal: boolean }) => void;
  isConverting: boolean;
}

export const ConvertLeadDialog = ({
  open,
  onOpenChange,
  lead,
  onConvert,
  isConverting
}: ConvertLeadDialogProps) => {
  const [createCompany, setCreateCompany] = useState(true);
  const [createDeal, setCreateDeal] = useState(true);

  const handleConvert = () => {
    if (!lead) return;
    
    onConvert(lead.id, { createCompany, createDeal });
    onOpenChange(false);
    
    // Reset options for next time
    setCreateCompany(true);
    setCreateDeal(true);
  };

  const handleCreateCompanyChange = (checked: boolean | "indeterminate") => {
    setCreateCompany(checked === true);
  };

  const handleCreateDealChange = (checked: boolean | "indeterminate") => {
    setCreateDeal(checked === true);
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="convert-lead-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Convertir Lead
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg" id="convert-lead-description">
            <h4 className="font-medium text-gray-900 mb-2">Lead a convertir:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Nombre:</strong> {lead.name}</p>
              <p><strong>Email:</strong> {lead.email}</p>
              {lead.company_name && <p><strong>Empresa:</strong> {lead.company_name}</p>}
              {lead.phone && <p><strong>Teléfono:</strong> {lead.phone}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">¿Qué quieres crear?</Label>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-blue-50">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Contacto</span>
              <span className="text-xs text-blue-600 ml-auto">(Siempre se crea)</span>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Checkbox
                id="create-company"
                checked={createCompany}
                onCheckedChange={handleCreateCompanyChange}
              />
              <Building2 className="h-4 w-4 text-green-600" />
              <Label htmlFor="create-company" className="text-sm font-medium flex-1">
                Crear Empresa
                {lead.company_name && (
                  <span className="text-gray-500 block text-xs">({lead.company_name})</span>
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Checkbox
                id="create-deal"
                checked={createDeal}
                onCheckedChange={handleCreateDealChange}
              />
              <Briefcase className="h-4 w-4 text-purple-600" />
              <Label htmlFor="create-deal" className="text-sm font-medium">
                Crear Negocio/Deal
              </Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isConverting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConvert}
              disabled={isConverting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isConverting ? 'Convirtiendo...' : 'Convertir Lead'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
