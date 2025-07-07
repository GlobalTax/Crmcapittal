import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Crown, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useClientConversion, ConversionValidation } from '@/hooks/useClientConversion';
import { ConvertToClientDialog } from './ConvertToClientDialog';
import type { Deal } from '@/types/Deal';

interface ClientConversionButtonProps {
  deal: Deal;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  showBadge?: boolean;
  onSuccess?: () => void;
}

export const ClientConversionButton = ({ 
  deal, 
  variant = 'default',
  size = 'default',
  showBadge = false,
  onSuccess 
}: ClientConversionButtonProps) => {
  const { validateConversion, validating, canConvert } = useClientConversion(deal);
  const [validation, setValidation] = useState<ConversionValidation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load validation on mount
  useEffect(() => {
    if (canConvert) {
      validateConversion().then(setValidation);
    }
  }, [canConvert]);

  // Don't show button if deal is already won
  if (!canConvert) {
    return showBadge ? (
      <Badge variant="outline" className="border-success text-success">
        <Crown className="h-3 w-3 mr-1" />
        Cliente
      </Badge>
    ) : null;
  }

  const getButtonState = () => {
    if (validating) {
      return {
        disabled: true,
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        text: 'Validando...',
        tooltip: 'Validando requisitos para conversión'
      };
    }

    if (!validation) {
      return {
        disabled: true,
        icon: <Crown className="h-4 w-4" />,
        text: 'Convertir a Cliente',
        tooltip: 'Cargando validación...'
      };
    }

    if (validation.isValid) {
      return {
        disabled: false,
        icon: <Crown className="h-4 w-4" />,
        text: 'Convertir a Cliente',
        tooltip: '¡Listo! Todos los requisitos están cumplidos'
      };
    }

    return {
      disabled: true,
      icon: <AlertCircle className="h-4 w-4" />,
      text: 'Convertir a Cliente',
      tooltip: `Requisitos faltantes: ${validation.missingRequirements.join(', ')}`
    };
  };

  const buttonState = getButtonState();

  const buttonContent = (
    <Button
      variant={validation?.isValid ? 'default' : variant}
      size={size}
      disabled={buttonState.disabled}
      onClick={() => setDialogOpen(true)}
      className={validation?.isValid ? 'bg-success hover:bg-success/90 text-success-foreground' : ''}
    >
      {buttonState.icon}
      {size !== 'sm' && <span className="ml-2">{buttonState.text}</span>}
    </Button>
  );

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent>
            <p>{buttonState.tooltip}</p>
          </TooltipContent>
        </Tooltip>

        {showBadge && validation && (
          <Badge 
            variant="outline" 
            className={validation.isValid ? 'border-success text-success' : 'border-destructive text-destructive'}
          >
            {validation.isValid ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            {validation.isValid ? 'Listo' : `${validation.missingRequirements.length} pendiente(s)`}
          </Badge>
        )}
      </div>

      <ConvertToClientDialog
        deal={deal}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={onSuccess}
      />
    </TooltipProvider>
  );
};