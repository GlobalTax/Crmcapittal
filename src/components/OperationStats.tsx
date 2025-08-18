
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Building2, Eye, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface OperationStatsProps {
  stats: {
    total: number;
    available: number;
    filtered: number;
    totalValue: number;
    avgValue: number;
  };
  isFiltered: boolean;
}

export const OperationStats = ({ stats, isFiltered }: OperationStatsProps) => {

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {isFiltered ? 'Mostradas' : 'Total Operaciones'}
          </CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-bold">
            {isFiltered ? stats.filtered : stats.total}
          </div>
          {isFiltered && (
            <p className="text-xs text-muted-foreground">
              de {stats.total} totales
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-bold">{stats.available}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.available / stats.total) * 100).toFixed(1)}% del total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-bold">
            €{formatLargeNumber(stats.totalValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(stats.totalValue)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-bold">
            €{formatLargeNumber(stats.avgValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(stats.avgValue)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
