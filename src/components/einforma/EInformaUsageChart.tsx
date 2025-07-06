import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

interface UsageData {
  month: string;
  queries: number;
  cost: number;
  companies: number;
}

interface EInformaUsageChartProps {
  data: UsageData[];
  detailed?: boolean;
}

export const EInformaUsageChart = ({ data, detailed = false }: EInformaUsageChartProps) => {
  if (detailed) {
    return (
      <div className="space-y-6">
        {/* Gráfico de consultas */}
        <Card>
          <CardHeader>
            <CardTitle>Consultas Mensuales</CardTitle>
            <CardDescription>Evolución del número de consultas realizadas a eInforma</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="queries" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.2)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de costes */}
        <Card>
          <CardHeader>
            <CardTitle>Costes Mensuales</CardTitle>
            <CardDescription>Evolución del coste de las consultas a eInforma</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`€${value}`, 'Coste']} />
                <Bar dataKey="cost" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico combinado */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis Combinado</CardTitle>
            <CardDescription>Consultas vs Empresas Enriquecidas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="queries" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Consultas"
                />
                <Line 
                  type="monotone" 
                  dataKey="companies" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="Empresas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="queries" fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  );
};