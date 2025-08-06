import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface PipelineChartProps {
  availableOperations: any[];
  inProcessOperations: any[];
  soldOperations: any[];
}

export const PipelineChart = ({ 
  availableOperations, 
  inProcessOperations, 
  soldOperations 
}: PipelineChartProps) => {
  const data = [
    {
      name: 'Disponibles',
      value: availableOperations.length,
      fill: '#6b7280'
    },
    {
      name: 'En Proceso',
      value: inProcessOperations.length,
      fill: '#9ca3af'
    },
    {
      name: 'Cerradas',
      value: soldOperations.length,
      fill: '#3b82f6'
    }
  ];

  const COLORS = ['#6b7280', '#9ca3af', '#3b82f6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-0 p-3 border border-border rounded-lg shadow-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} operaciones
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-gray-600" />
          Distribución Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};