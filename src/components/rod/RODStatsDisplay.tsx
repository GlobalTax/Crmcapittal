import { TrendingUp, Building, Target, HandCoins, Users, BarChart3 } from 'lucide-react';

interface RODStatsDisplayProps {
  totalItems: number;
  selectedCount: number;
  selectedOperations: number;
  selectedLeads: number;
  totalValue: number;
  totalEbitda: number;
}

export function RODStatsDisplay({
  totalItems,
  selectedCount,
  selectedOperations,
  selectedLeads,
  totalValue,
  totalEbitda
}: RODStatsDisplayProps) {
  const stats = [
    {
      label: 'Total Elementos',
      value: totalItems,
      icon: Target,
      color: 'text-primary-foreground',
      bgColor: 'bg-primary-foreground/20'
    },
    {
      label: 'Seleccionados',
      value: selectedCount,
      icon: BarChart3,
      color: 'text-primary-foreground',
      bgColor: 'bg-primary-foreground/20'
    },
    {
      label: 'Mandatos',
      value: selectedOperations,
      icon: HandCoins,
      color: 'text-primary-foreground',
      bgColor: 'bg-primary-foreground/20'
    },
    {
      label: 'Leads',
      value: selectedLeads,
      icon: Users,
      color: 'text-primary-foreground',
      bgColor: 'bg-primary-foreground/20'
    },
    {
      label: 'Valor Total',
      value: `€${totalValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-primary-foreground',
      bgColor: 'bg-primary-foreground/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="group p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-foreground/80">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-primary-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}