import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

interface ConversionChartProps {
  conversionRate: number;
  totalLeads: number;
  qualifiedLeads: number;
}

export const ConversionChart = ({ 
  conversionRate, 
  totalLeads, 
  qualifiedLeads 
}: ConversionChartProps) => {
  const data = [
    {
      name: 'Leads Totales',
      value: totalLeads,
      fill: '#E5E7EB'
    },
    {
      name: 'Cualificados',
      value: qualifiedLeads,
      fill: '#10B981'
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-slate-600">
            {payload[0].value} leads
          </p>
          {label === 'Cualificados' && (
            <p className="text-xs text-green-600 font-medium">
              {conversionRate.toFixed(1)}% de conversión
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
          <Users className="mr-2 h-5 w-5 text-green-600" />
          Conversión de Leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                stroke="#E2E8F0"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {conversionRate.toFixed(1)}%
          </div>
          <div className="text-sm text-slate-600">
            Tasa de conversión actual
          </div>
        </div>
      </CardContent>
    </Card>
  );
};