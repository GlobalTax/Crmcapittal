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
      color: '#3B82F6',
      fill: '#3B82F6'
    },
    {
      name: 'En Proceso',
      value: inProcessOperations.length,
      color: '#F59E0B',
      fill: '#F59E0B'
    },
    {
      name: 'Cerradas',
      value: soldOperations.length,
      color: '#10B981',
      fill: '#10B981'
    }
  ];

  const COLORS = ['#3B82F6', '#F59E0B', '#10B981'];

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
    <Card className="bg-neutral-0 shadow-sm border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
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
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};