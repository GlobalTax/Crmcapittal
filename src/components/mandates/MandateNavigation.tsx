import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { useNavigate } from 'react-router-dom';

interface MandateNavigationProps {
  currentMandateId: string;
  mandates: BuyingMandate[];
}

export const MandateNavigation = ({ currentMandateId, mandates }: MandateNavigationProps) => {
  const navigate = useNavigate();
  
  const currentIndex = mandates.findIndex(m => m.id === currentMandateId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < mandates.length - 1;
  const previousMandate = hasPrevious ? mandates[currentIndex - 1] : null;
  const nextMandate = hasNext ? mandates[currentIndex + 1] : null;

  const handlePrevious = () => {
    if (previousMandate) {
      navigate(`/mandatos/${previousMandate.id}`);
    }
  };

  const handleNext = () => {
    if (nextMandate) {
      navigate(`/mandatos/${nextMandate.id}`);
    }
  };

  if (mandates.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
      <Button 
        variant="ghost" 
        onClick={handlePrevious}
        disabled={!hasPrevious}
        className="gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        {previousMandate ? (
          <span className="max-w-32 truncate">
            {previousMandate.client_name || 'Anterior'}
          </span>
        ) : (
          'Anterior'
        )}
      </Button>

      <div className="text-sm text-muted-foreground">
        {currentIndex + 1} de {mandates.length} mandatos
      </div>

      <Button 
        variant="ghost" 
        onClick={handleNext}
        disabled={!hasNext}
        className="gap-2"
      >
        {nextMandate ? (
          <span className="max-w-32 truncate">
            {nextMandate.client_name || 'Siguiente'}
          </span>
        ) : (
          'Siguiente'
        )}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};