import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { OpportunityDetailView } from '@/components/opportunities/OpportunityDetailView';
import { useOpportunities } from '@/hooks/useOpportunities';
import { OpportunityWithContacts } from '@/types/Opportunity';

const OpportunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { opportunities, isLoading, updateOpportunity } = useOpportunities();
  const [opportunity, setOpportunity] = useState<OpportunityWithContacts | null>(null);

  useEffect(() => {
    if (opportunities.length > 0 && id) {
      const foundOpportunity = opportunities.find(o => o.id === id);
      setOpportunity(foundOpportunity || null);
    }
  }, [opportunities, id]);

  const handleUpdateStage = (newStage: string) => {
    if (opportunity) {
      updateOpportunity({
        id: opportunity.id,
        stage: newStage as any,
      });
    }
  };

  const handleUpdateOpportunity = (updates: Partial<OpportunityWithContacts>) => {
    if (opportunity) {
      updateOpportunity({
        id: opportunity.id,
        ...updates,
      });
      // Update local state optimistically
      setOpportunity({ ...opportunity, ...updates });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando oportunidad...</span>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-foreground">Oportunidad no encontrada</h2>
          <p className="text-muted-foreground mt-2">
            La oportunidad que buscas no existe o no tienes permisos para verla.
          </p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/deals')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Oportunidades
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/deals')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {opportunity.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestión detallada de la oportunidad
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <OpportunityDetailView
        opportunity={opportunity}
        onUpdateStage={handleUpdateStage}
        onUpdateOpportunity={handleUpdateOpportunity}
      />
    </div>
  );
};

export default OpportunityDetail;