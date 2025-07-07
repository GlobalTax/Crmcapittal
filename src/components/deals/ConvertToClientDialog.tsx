import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, User, Building2, FileText, Crown } from 'lucide-react';
import { useClientConversion, ConversionValidation } from '@/hooks/useClientConversion';
import type { Deal } from '@/types/Deal';

interface ConvertToClientDialogProps {
  deal: Deal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ConvertToClientDialog = ({ 
  deal, 
  open, 
  onOpenChange, 
  onSuccess 
}: ConvertToClientDialogProps) => {
  const { validateConversion, convertToClient, validating, converting } = useClientConversion(deal);
  const [validation, setValidation] = useState<ConversionValidation | null>(null);

  // Load validation when dialog opens
  useEffect(() => {
    if (open) {
      validateConversion().then(setValidation);
    }
  }, [open]);

  const handleConvert = async () => {
    const success = await convertToClient();
    if (success) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '€0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Convertir a Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Deal Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{deal.title}</h3>
                  <p className="text-sm text-muted-foreground">{deal.company?.name}</p>
                  <p className="text-sm text-muted-foreground">{deal.contact?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(deal.amount)}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {deal.stage}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Status */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Validación de Requisitos
            </h4>

            {validating ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Validando requisitos...</p>
              </div>
            ) : validation ? (
              <div className="space-y-3">
                {/* NDA Validation */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">NDA firmado</span>
                  </div>
                  {validation.hasSignedNDA ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>

                {/* Proposal/Mandate Validation */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Propuesta o Mandato presente</span>
                  </div>
                  {validation.hasProposalOrMandate ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>

                {/* Overall Status */}
                <Card className={validation.isValid ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {validation.isValid ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <p className="font-medium">
                          {validation.isValid ? 'Listo para conversión' : 'Requisitos faltantes'}
                        </p>
                        {!validation.isValid && (
                          <p className="text-sm text-muted-foreground">
                            {validation.missingRequirements.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>

          {/* Conversion Preview */}
          {validation?.isValid && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Cambios que se realizarán:</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Oportunidad → </span>
                    <Badge variant="default" className="bg-success text-success-foreground">
                      Cerrada - Ganada
                    </Badge>
                  </div>
                  
                  {deal.contact?.name && (
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-primary" />
                      <span>Contacto ({deal.contact.name}) → </span>
                      <Badge variant="outline" className="border-success text-success">
                        Cliente
                      </Badge>
                    </div>
                  )}
                  
                  {deal.company?.name && (
                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span>Empresa ({deal.company.name}) → </span>
                      <Badge variant="outline" className="border-success text-success">
                        Cliente Activo
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={converting}>
            Cancelar
          </Button>
          
          <Button 
            onClick={handleConvert} 
            disabled={!validation?.isValid || converting}
            className="min-w-[160px]"
          >
            {converting ? (
              'Convirtiendo...'
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Convertir a Cliente
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};