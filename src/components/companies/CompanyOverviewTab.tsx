import { Building2, Users, TrendingUp, Calendar, Globe, MapPin, Database } from 'lucide-react';
import { DealHighlightCard } from '@/components/deals/DealHighlightCard';
import { CompanyProfileScore } from '@/components/companies/CompanyProfileScore';
import { Company } from '@/types/Company';
import { useCompanyStats } from '@/hooks/useCompanyStats';
import { useCompanyProfileScore } from '@/hooks/useCompanyProfileScore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RevealSection } from '@/components/ui/RevealSection';
import { logger } from '@/utils/productionLogger';

interface CompanyOverviewTabProps {
  company: Company;
}

export const CompanyOverviewTab = ({ company }: CompanyOverviewTabProps) => {
  const stats = useCompanyStats(company.id, company.name);
  const profileScore = useCompanyProfileScore(company);
  
  // Check if company has eInforma enrichment data
  const { data: enrichmentData } = useQuery({
    queryKey: ['company-enrichments', company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_enrichments')
        .select('*')
        .eq('company_id', company.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching company enrichment data', { error, companyId: company.id }, 'CompanyOverviewTab');
        return null;
      }

      return data;
    },
  });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConnectionStrength = () => {
    // Mock calculation based on available data
    let strength = 0;
    if (company.website) strength += 20;
    if (company.phone) strength += 20;
    if (company.linkedin_url) strength += 20;
    if (company.description) strength += 20;
    if (company.contacts_count && company.contacts_count > 0) strength += 20;
    
    if (strength >= 80) return { label: 'Fuerte', color: 'text-green-600' };
    if (strength >= 60) return { label: 'Media', color: 'text-yellow-600' };
    if (strength >= 40) return { label: 'Débil', color: 'text-orange-600' };
    return { label: 'Muy débil', color: 'text-red-600' };
  };

  const connectionStrength = getConnectionStrength();

  return (
    <div className="space-y-6">
      {/* Highlight Cards Grid 3x2 (toggle) */}
      <RevealSection storageKey="company/overview-cards" defaultCollapsed={false} collapsedLabel="Mostrar tarjetas" expandedLabel="Ocultar tarjetas" count={6}>
        <div className="grid grid-cols-3 gap-4">
          <DealHighlightCard
            title="Fuerza de Conexión"
            icon={Building2}
            value={
              <span className={connectionStrength.color}>
                {connectionStrength.label}
              </span>
            }
            subtitle={`${company.contacts_count || 0} contactos`}
          />

          <DealHighlightCard
            title="Próxima Interacción"
            icon={Calendar}
            value={company.next_follow_up_date ? 
              new Date(company.next_follow_up_date).toLocaleDateString('es-ES') : 
              "No programada"
            }
            subtitle={company.next_follow_up_date ? "Próximo seguimiento" : "Programar una reunión"}
          />

          <DealHighlightCard
            title="Equipo"
            icon={Users}
            value={`${stats.contactsCount} personas`}
            subtitle={stats.contactsCount > 0 ? "Ver todos los contactos" : "Añadir contactos"}
          />

          <DealHighlightCard
            title="ARR Estimado"
            icon={TrendingUp}
            value={
              <span className="text-success">
                {company.annual_revenue ? formatCurrency(company.annual_revenue) : 'No establecido'}
              </span>
            }
            subtitle={company.annual_revenue ? 'Ingresos anuales recurrentes' : 'Establecer estimación ARR'}
          />

          <DealHighlightCard
            title="Oportunidades Activas"
            icon={Building2}
            value={`${stats.activeDealsCount}`}
            subtitle={`${formatCurrency(stats.totalPipelineValue)} pipeline`}
          />

          <DealHighlightCard
            title="Datos eInforma"
            icon={Database}
            value={enrichmentData ? 'Disponible' : 'No disponible'}
            subtitle={enrichmentData ? 
              `Enriquecido ${new Date(enrichmentData.created_at).toLocaleDateString('es-ES')}` : 
              'Datos no enriquecidos'
            }
          />
        </div>
      </RevealSection>

      {/* Profile Score */}
      <CompanyProfileScore profileScore={profileScore} />

      {/* Recent Activity Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Actividad Reciente</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <div className="flex-1">
              <p className="text-sm">Empresa creada</p>
              <p className="text-xs text-muted-foreground">
                {new Date(company.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {company.updated_at !== company.created_at && (
            <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">Empresa actualizada</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(company.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {company.last_activity_date && (
            <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">Última actividad</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(company.last_activity_date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {(!company.last_activity_date && company.updated_at === company.created_at) && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
              <p className="text-xs text-muted-foreground">La actividad aparecerá aquí cuando ocurra</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};