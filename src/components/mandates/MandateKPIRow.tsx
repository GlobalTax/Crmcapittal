import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Users, TrendingUp, FileText, CheckCircle, Award } from 'lucide-react';
import { MandateTarget } from '@/types/BuyingMandate';

interface MandateKPIRowProps {
  totalTargets: number;
  contactedTargets: number;
  interestedTargets: number;
  documentsCount: number;
  targets: MandateTarget[];
}

export const MandateKPIRow = ({
  totalTargets,
  contactedTargets,
  interestedTargets,
  documentsCount,
  targets
}: MandateKPIRowProps) => {
  const contactRate = totalTargets > 0 ? Math.round((contactedTargets / totalTargets) * 100) : 0;
  const conversionRate = contactedTargets > 0 ? Math.round((interestedTargets / contactedTargets) * 100) : 0;
  const ndaTargets = targets.filter(t => t.status === 'nda_signed').length;
  
  // Calculate total value of pipeline
  const totalValue = targets.reduce((sum, target) => {
    return sum + (target.revenues || target.ebitda || 0);
  }, 0);

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(amount);
  };

  const kpis = [
    {
      title: 'Total Targets',
      value: totalTargets,
      subtitle: 'empresas identificadas',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Contactados',
      value: contactedTargets,
      subtitle: `${contactRate}% del total`,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      progress: contactRate,
    },
    {
      title: 'Interesados',
      value: interestedTargets,
      subtitle: `${conversionRate}% conversión`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      progress: conversionRate,
    },
    {
      title: 'NDAs Firmados',
      value: ndaTargets,
      subtitle: 'en proceso avanzado',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Documentos',
      value: documentsCount,
      subtitle: 'archivos gestionados',
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Valor Pipeline',
      value: formatCurrency(totalValue),
      subtitle: 'valor total estimado',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      isMonetary: true,
    },
  ];

  return (
    <div className="px-6 py-4 bg-muted/50">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${kpi.color}`}>
                  {kpi.isMonetary ? kpi.value : kpi.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.subtitle}
                </p>
                {kpi.progress !== undefined && (
                  <div className="mt-2">
                    <Progress value={kpi.progress} className="h-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};