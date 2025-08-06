import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, StarOff, Mail, ChevronLeft, ChevronRight, User, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Deal } from '@/types/Deal';
import { toast } from 'sonner';
import { ClientConversionButton } from './ClientConversionButton';

interface DealHeaderProps {
  deal: Deal;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onUpdate?: () => void;
}

export const DealHeader = ({ 
  deal, 
  onPrevious, 
  onNext, 
  hasPrevious, 
  hasNext,
  onUpdate 
}: DealHeaderProps) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showComposeEmail, setShowComposeEmail] = useState(false);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Lead': return '#6b7280';        // Professional gray
      case 'In Progress': return '#f59e0b'; // Soft orange
      case 'Won': return '#059669';         // Professional green
      case 'Lost': return '#dc2626';        // Soft red
      default: return '#6b7280';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const handleComposeEmail = () => {
    setShowComposeEmail(true);
  };

  const handleBackToDeals = () => {
    navigate('/deals');
  };

  const handleQuickAction = (type: 'contact' | 'negocio' | 'proposal') => {
    const messages = {
      contact: 'Conversión rápida a contacto',
      negocio: 'Crear transacción M&A',
      proposal: 'Generar propuesta'
    };
    toast.info(messages[type] + ' - Funcionalidad próximamente');
  };

  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDeals}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getStageColor(deal.stage) }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{deal.title}</h1>
                <Badge 
                  variant="outline" 
                  style={{ 
                    borderColor: getStageColor(deal.stage),
                    color: getStageColor(deal.stage)
                  }}
                >
                  {deal.stage}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {deal.company && (
                  <span>{deal.company.name}</span>
                )}
                {deal.amount && (
                  <span className="font-medium text-success">
                    {formatCurrency(deal.amount)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFavorite(!isFavorite)}
            className="h-8 w-8 p-0"
          >
            {isFavorite ? (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Client Conversion Button */}
          <ClientConversionButton 
            deal={deal} 
            variant="default"
            size="sm"
            onSuccess={onUpdate}
          />

          {/* Navigation arrows */}
          {(hasPrevious || hasNext) && (
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                disabled={!hasNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex items-center gap-1 mr-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('contact')}
              title="Convert to contact"
              className="px-2"
            >
              <User className="h-4 w-4" />
            </Button>
            {deal.stage === 'Won' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('negocio')}
                title="Create M&A transaction"
                className="px-2"
              >
                <Building2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('proposal')}
              title="Generate proposal"
              className="px-2"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handleComposeEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Escribir email
          </Button>
        </div>
      </div>

      {/* Compose Email Modal */}
      {showComposeEmail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Escribir Email</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowComposeEmail(false)}>
                ×
              </Button>
            </div>
            <p className="text-muted-foreground mb-4">
              Integración de email próximamente. Esto abrirá tu cliente de email predeterminado.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowComposeEmail(false)}>
                Cerrar
              </Button>
              <Button onClick={() => {
                window.location.href = `mailto:`;
                setShowComposeEmail(false);
              }}>
                Abrir Cliente de Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};