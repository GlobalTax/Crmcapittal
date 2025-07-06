import { useState, useEffect } from 'react';
import { Building2, Users, TrendingUp, Calendar, Euro, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Company } from '@/types/Company';
import { einformaService } from '@/services/einformaService';
import { EmptyState } from '@/components/ui/EmptyState';

interface CompanyEinformaTabProps {
  company: Company;
}

export const CompanyEinformaTab = ({ company }: CompanyEinformaTabProps) => {
  const [enrichmentData, setEnrichmentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEnrichmentData();
  }, [company.id]);

  const loadEnrichmentData = async () => {
    setIsLoading(true);
    try {
      const historyData = await einformaService.getEnrichmentHistory(company.id);
      if (historyData.length > 0) {
        setEnrichmentData(historyData[0].enrichment_data);
      }
    } catch (error) {
      console.error('Error loading enrichment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!enrichmentData) {
    return (
      <EmptyState
        icon={Building2}
        title="Sin datos de eInforma"
        subtitle="Esta empresa aún no ha sido enriquecida con datos de eInforma"
      />
    );
  }

  const companyData = enrichmentData.company_data;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Datos de eInforma</h3>
        <p className="text-sm text-muted-foreground">
          Última actualización: {new Date(enrichmentData.enrichment_date).toLocaleDateString('es-ES')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-xs text-muted-foreground">Razón Social</span>
            <p className="text-sm font-medium">{companyData?.razon_social || 'No disponible'}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Actividad Principal</span>
            <p className="text-sm">{companyData?.actividad_principal || 'No disponible'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};