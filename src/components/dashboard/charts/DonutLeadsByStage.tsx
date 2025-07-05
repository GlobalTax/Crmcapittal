import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Target } from 'lucide-react';

const data = [
  { name: 'Prospecto', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Cualificado', value: 28, color: 'hsl(var(--accent))' },
  { name: 'Propuesta', value: 20, color: 'hsl(var(--secondary))' },
  { name: 'Negociación', value: 12, color: 'hsl(var(--muted))' },
  { name: 'Cerrado', value: 5, color: 'hsl(var(--destructive))' },
];

export const DonutLeadsByStage = () => {
  return (
    <DashboardCard title="Leads por Etapa" icon={Target}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend 
              wrapperStyle={{
                fontSize: '12px',
                color: 'hsl(var(--foreground))'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};