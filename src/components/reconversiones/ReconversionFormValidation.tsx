import React from 'react';
import { useReconversionAlerts } from '@/hooks/useReconversionAlerts';
import { ReconversionAlertBadge } from './ReconversionAlertBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Reconversion } from '@/types/Reconversion';

interface ReconversionFormValidationProps {
  data: Partial<Reconversion>;
  onValidationChange?: (hasErrors: boolean) => void;
  showSummary?: boolean;
  className?: string;
}

export const ReconversionFormValidation: React.FC<ReconversionFormValidationProps> = ({
  data,
  onValidationChange,
  showSummary = true,
  className
}) => {
  const { validateAndShowAlerts, alerts, hasErrors, hasWarnings } = useReconversionAlerts();

  React.useEffect(() => {
    const validationErrors = validateAndShowAlerts(data, { showToast: false });
    onValidationChange?.(validationErrors.some(e => e.severity === 'error'));
  }, [data, validateAndShowAlerts, onValidationChange]);

  if (!showSummary || alerts.length === 0) {
    return null;
  }

  const errors = alerts.filter(a => a.severity === 'error');
  const warnings = alerts.filter(a => a.severity === 'warning');
  const infos = alerts.filter(a => a.severity === 'info');

  return (
    <Card className={cn("mb-4", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Estado de Validación</h3>
          <ReconversionAlertBadge alerts={alerts} />
        </div>

        <div className="space-y-3">
          {/* Errores */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Errores que deben corregirse:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {errors.map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Advertencias */}
          {warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Advertencias:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {warnings.map((warning, index) => (
                      <li key={index}>{warning.message}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Información */}
          {infos.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Sugerencias para mejorar:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {infos.map((info, index) => (
                      <li key={index}>{info.message}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};