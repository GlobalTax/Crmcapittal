
import { useParams } from 'react-router-dom';
import { useLead } from '@/hooks/useLeads';
import { PipedriveLayout } from './pipedrive/PipedriveLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { SEO } from '@/components/seo/SEO';

export const PipedriveStyleLeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { lead, isLoading, error } = useLead(id!);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando lead...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Lead no encontrado</h2>
              <p className="text-muted-foreground">
                El lead que buscas no existe o no tienes permisos para verlo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${lead.company_name || lead.name || 'Lead'} — Lead CRM`}
        description={`Detalle del lead ${lead.company_name || lead.name || ''}. Estado: ${lead.status || 'N/A'}.`}
      />
      <PipedriveLayout lead={lead} />
    </>
  );
};
