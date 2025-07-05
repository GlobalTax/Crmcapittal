import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, StarOff, Mail, ChevronLeft, ChevronRight, User, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Deal } from '@/types/Deal';
import { toast } from 'sonner';

interface DealHeaderProps {
  deal: Deal;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const DealHeader = ({ 
  deal, 
  onPrevious, 
  onNext, 
  hasPrevious, 
  hasNext 
}: DealHeaderProps) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showComposeEmail, setShowComposeEmail] = useState(false);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Lead': return 'hsl(213, 94%, 68%)';
      case 'In Progress': return 'hsl(45, 93%, 47%)';
      case 'Won': return 'hsl(158, 100%, 38%)';
      case 'Lost': return 'hsl(4, 86%, 63%)';
      default: return 'hsl(210, 11%, 71%)';
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
      contact: 'Quick convert to contact',
      negocio: 'Create M&A transaction',
      proposal: 'Generate proposal'
    };
    toast.info(messages[type] + ' - Feature coming soon');
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
            Compose email
          </Button>
        </div>
      </div>

      {/* Compose Email Modal */}
      {showComposeEmail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Compose Email</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowComposeEmail(false)}>
                ×
              </Button>
            </div>
            <p className="text-muted-foreground mb-4">
              Email integration coming soon. This will open your default email client.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowComposeEmail(false)}>
                Close
              </Button>
              <Button onClick={() => {
                window.location.href = `mailto:`;
                setShowComposeEmail(false);
              }}>
                Open Email Client
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};