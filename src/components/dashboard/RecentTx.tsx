import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Badge } from '@/components/ui/minimal/Badge';
import { Button } from '@/components/ui/minimal/Button';
import { TrendingUp, FileText, Calendar } from 'lucide-react';

// Mock data
const recentTx = [
  {
    id: '1',
    name: 'Adquisición MetalTech',
    type: 'Compra',
    value: 2500000,
    stage: 'Due Diligence',
    lastActivity: '1 hora',
    priority: 'high'
  },
  {
    id: '2',
    name: 'Venta Participación Logística SA',
    type: 'Venta',
    value: 1800000,
    stage: 'Valoración',
    lastActivity: '4 horas',
    priority: 'medium'
  },
  {
    id: '3',
    name: 'Fusión Empresas Construcción',
    type: 'Fusión',
    value: 5200000,
    stage: 'Negociación',
    lastActivity: '2 días',
    priority: 'high'
  },
  {
    id: '4',  
    name: 'Joint Venture TechSolutions',
    type: 'JV',
    value: 950000,
    stage: 'Documentación',
    lastActivity: '6 horas',
    priority: 'medium'
  },
  {
    id: '5',
    name: 'Reestructuración Industrial Corp',
    type: 'Consultoria',
    value: 650000,
    stage: 'Cierre',
    lastActivity: '1 día',
    priority: 'low'
  }
];

export const RecentTx = () => {
  return (
    <DashboardCard title="Transacciones Recientes" icon={TrendingUp}>
      <div className="space-y-4">
        {recentTx.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate">
                {tx.name}
              </h4>
              <p className="text-xs text-muted-foreground">
                {tx.type} • €{(tx.value / 1000000).toFixed(1)}M
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  color={tx.priority === 'high' ? 'red' : tx.priority === 'medium' ? 'yellow' : 'gray'}
                >
                  {tx.stage}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Hace {tx.lastActivity}
                </span>
              </div>
            </div>
            <div className="flex gap-1 ml-2">
              <Button variant="ghost" size="sm">
                <FileText className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm">
                <Calendar className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};