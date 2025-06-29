
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';
import { Building2, TrendingUp, Activity } from "lucide-react";

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  operation_type: "merger" | "sale" | "partial_sale" | "buy_mandate";
  amount: number;
  status: "available" | "pending_review" | "approved" | "rejected" | "in_process" | "sold" | "withdrawn";
  date: string;
}

interface OperationsChartProps {
  operations: Operation[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const OperationsChart = ({ operations }: OperationsChartProps) => {
  // Prepare data for charts
  const sectorData = operations.reduce((acc, op) => {
    const sector = op.sector || 'Otros';
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(sectorData).map(([name, value]) => ({
    name,
    value,
  }));

  const statusData = operations.reduce((acc, op) => {
    const status = op.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(statusData).map(([name, value]) => ({
    name: name === 'available' ? 'Disponible' : 
          name === 'in_process' ? 'En Proceso' : 
          name === 'sold' ? 'Vendida' : 
          name === 'pending_review' ? 'Pendiente' : name,
    value,
  }));

  const typeData = operations.reduce((acc, op) => {
    const type = op.operation_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeBarData = Object.entries(typeData).map(([name, value]) => ({
    name: name === 'merger' ? 'Fusión' : 
          name === 'sale' ? 'Venta' : 
          name === 'partial_sale' ? 'Venta Parcial' : 
          name === 'buy_mandate' ? 'Mandato Compra' : name,
    value,
  }));

  // Monthly trend data (mock data for demonstration)
  const monthlyData = [
    { month: 'Ene', operaciones: 8, valor: 12.5 },
    { month: 'Feb', operaciones: 12, valor: 18.2 },
    { month: 'Mar', operaciones: 10, valor: 15.8 },
    { month: 'Abr', operaciones: 15, valor: 22.3 },
    { month: 'May', operaciones: 18, valor: 28.7 },
    { month: 'Jun', operaciones: 14, valor: 20.1 },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {/* Sector Distribution */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-800">
            <Building2 className="mr-2 h-5 w-5 text-blue-600" />
            Distribución por Sector
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-800">
            <Activity className="mr-2 h-5 w-5 text-green-600" />
            Estado de Operaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Operation Types */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-800">
            <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
            Tipos de Operación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={typeBarData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm lg:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-800">
            <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
            Tendencia Mensual - Operaciones y Valor (€M)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="operaciones" fill="#0088FE" />
              <Line yAxisId="right" type="monotone" dataKey="valor" stroke="#FF8042" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
