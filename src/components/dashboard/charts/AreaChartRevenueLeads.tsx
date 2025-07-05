import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { TrendingUp } from 'lucide-react';

// Mock data for last 6 months
const data = [
  { month: 'Jul', revenue: 12000 },
  { month: 'Ago', revenue: 19000 },
  { month: 'Sep', revenue: 15000 },
  { month: 'Oct', revenue: 22000 },
  { month: 'Nov', revenue: 28000 },
  { month: 'Dic', revenue: 35000 },
];

export const AreaChartRevenueLeads = () => {
  return (
    <DashboardCard title="Ingresos Leads - Últimos 6 Meses" icon={TrendingUp}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `€${value / 1000}K`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`€${value.toLocaleString()}`, 'Ingresos']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#leadsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};