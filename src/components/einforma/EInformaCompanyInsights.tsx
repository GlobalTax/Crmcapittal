import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUpIcon, TrendingDownIcon, BuildingIcon, DollarSignIcon } from 'lucide-react';

interface CompanyInsight {
  sector: string;
  totalCompanies: number;
  averageRevenue: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface EInformaCompanyInsightsProps {
  data: CompanyInsight[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const EInformaCompanyInsights = ({ data }: EInformaCompanyInsightsProps) => {
  const totalCompanies = data.reduce((sum, insight) => sum + insight.totalCompanies, 0);
  const totalRevenue = data.reduce((sum, insight) => sum + (insight.averageRevenue * insight.totalCompanies), 0);
  const averageRevenueOverall = totalRevenue / totalCompanies;

  const riskDistribution = data.reduce((acc, insight) => {
    acc[insight.riskLevel] = (acc[insight.riskLevel] || 0) + insight.totalCompanies;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(riskDistribution).map(([level, count]) => ({
    name: level,
    value: count,
    percentage: (count / totalCompanies) * 100
  }));

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Métricas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BuildingIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{totalCompanies}</div>
                <p className="text-sm text-muted-foreground">Empresas Analizadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">
                  €{Math.round(averageRevenueOverall / 1000)}K
                </div>
                <p className="text-sm text-muted-foreground">Ingresos Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{data.length}</div>
                <p className="text-sm text-muted-foreground">Sectores Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              <div>
                <div className="text-2xl font-bold">
                  {riskDistribution.high || 0}
                </div>
                <p className="text-sm text-muted-foreground">Alto Riesgo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por sector */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Sector</CardTitle>
            <CardDescription>
              Análisis de empresas por sector industrial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="sector" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'totalCompanies' ? `${value} empresas` : `€${Number(value).toLocaleString('es-ES')}`,
                    name === 'totalCompanies' ? 'Empresas' : 'Ingreso Promedio'
                  ]}
                />
                <Bar dataKey="totalCompanies" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de riesgo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Riesgo</CardTitle>
            <CardDescription>
              Análisis del nivel de riesgo por empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {Object.entries(riskDistribution).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${getRiskColor(level)}`}></div>
                    <span className="capitalize text-sm">{level} Risk</span>
                  </div>
                  <span className="text-sm font-medium">{count} empresas</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top sectores detallado */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado por Sector</CardTitle>
          <CardDescription>
            Información detallada de los principales sectores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.slice(0, 10).map((insight, index) => (
              <div key={insight.sector} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-medium">#{index + 1}</span>
                    <h4 className="font-medium">{insight.sector}</h4>
                    <Badge variant={getRiskBadgeVariant(insight.riskLevel)}>
                      {insight.riskLevel} risk
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">{insight.totalCompanies}</span> empresas
                    </div>
                    <div>
                      Ingresos promedio: <span className="font-medium">€{insight.averageRevenue.toLocaleString('es-ES')}</span>
                    </div>
                    <div>
                      Participación: <span className="font-medium">
                        {((insight.totalCompanies / totalCompanies) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-20">
                  <Progress 
                    value={(insight.totalCompanies / Math.max(...data.map(d => d.totalCompanies))) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};