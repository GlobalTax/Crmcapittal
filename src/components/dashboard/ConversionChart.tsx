import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

interface ConversionChartProps {
  conversionRate: number;
  totalLeads: number;
  qualifiedLeads: number;
}

export const ConversionChart = memo(({ 
  conversionRate, 
  totalLeads, 
  qualifiedLeads 
}: ConversionChartProps) => {
  const data = useMemo(() => [
    {
      name: 'Leads Totales',
      value: totalLeads,
      fill: 'hsl(var(--muted-foreground))'
    },
    {
      name: 'Cualificados',
      value: qualifiedLeads,
      fill: 'hsl(var(--primary))'
    }
  ], [totalLeads, qualifiedLeads]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-0 p-3 border border-border rounded-lg shadow-sm">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} leads
          </p>
          {label === 'Cualificados' && (
            <p className="text-xs text-success font-medium">
              {conversionRate.toFixed(1)}% de conversión
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card shadow-sm border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <Users className="mr-2 h-5 w-5 text-muted-foreground" />
          Conversión de Leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                stroke="hsl(var(--border))"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {conversionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            Tasa de conversión actual
          </div>
        </div>
      </CardContent>
    </Card>
  );
});