import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Target, DollarSign, Clock, AlertTriangle, Star, Calendar } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Lead } from "@/types/Lead";
import { useLeadAnalytics, useLeadMetrics } from "@/hooks/useLeadAnalytics";
import { Badge } from "@/components/ui/badge";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface LeadAnalyticsDashboardProps {
  leads: Lead[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#FFBB28', '#FF8042', '#8884d8'];

export const LeadAnalyticsDashboard = ({ leads }: LeadAnalyticsDashboardProps) => {
  const analytics = useLeadAnalytics(leads);
  const metrics = useLeadMetrics(leads);

  // ROI Analysis by source
  const roiBySource = useMemo(() => {
    const sourceROI = analytics.topSources.map(source => {
      const sourceLeads = leads.filter(l => l.source === source.source.toLowerCase().replace(' ', '_'));
      const convertedLeads = sourceLeads.filter(l => l.status === 'CONVERTED' || l.status === 'QUALIFIED');
      const totalConversionValue = convertedLeads.reduce((sum, lead) => sum + (lead.conversion_value || 0), 0);
      const estimatedCost = sourceLeads.length * 50; // Estimated cost per lead
      const roi = estimatedCost > 0 ? ((totalConversionValue - estimatedCost) / estimatedCost * 100) : 0;
      
      return {
        source: source.source,
        leads: source.count,
        converted: convertedLeads.length,
        conversionRate: (convertedLeads.length / sourceLeads.length * 100),
        totalValue: totalConversionValue,
        roi: Math.round(roi),
        costPerLead: estimatedCost / sourceLeads.length
      };
    });
    return sourceROI.sort((a, b) => b.roi - a.roi);
  }, [leads, analytics.topSources]);

  // Weekly trends for the last 8 weeks
  const weeklyTrends = useMemo(() => {
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      const weekLeads = leads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= weekStart && leadDate <= weekEnd;
      });
      
      const converted = weekLeads.filter(l => l.status === 'CONVERTED' || l.status === 'QUALIFIED').length;
      
      weeks.push({
        week: format(weekStart, 'dd MMM', { locale: es }),
        leads: weekLeads.length,
        converted,
        conversionRate: weekLeads.length > 0 ? (converted / weekLeads.length * 100) : 0,
        avgScore: weekLeads.length > 0 ? (weekLeads.reduce((sum, l) => sum + l.lead_score, 0) / weekLeads.length) : 0
      });
    }
    return weeks;
  }, [leads]);

  // Lead scoring distribution
  const scoringDistribution = useMemo(() => {
    const ranges = [
      { range: '0-20', min: 0, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 }
    ];
    
    return ranges.map(r => ({
      range: r.range,
      count: leads.filter(l => l.lead_score >= r.min && l.lead_score <= r.max).length,
      converted: leads.filter(l => 
        l.lead_score >= r.min && 
        l.lead_score <= r.max && 
        (l.status === 'CONVERTED' || l.status === 'QUALIFIED')
      ).length
    }));
  }, [leads]);

  // High-opportunity leads (alerts)
  const highOpportunityLeads = useMemo(() => {
    return leads.filter(lead => 
      lead.lead_score >= 70 && 
      (lead.status === 'NEW' || lead.status === 'CONTACTED') &&
      !lead.assigned_to_id
    ).slice(0, 5);
  }, [leads]);

  // Team performance
  const teamPerformance = useMemo(() => {
    const assignedLeads = leads.filter(l => l.assigned_to_id && l.assigned_to);
    const userStats = new Map();
    
    assignedLeads.forEach(lead => {
      const userId = lead.assigned_to_id!;
      const userName = `${lead.assigned_to?.first_name || ''} ${lead.assigned_to?.last_name || ''}`.trim();
      
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          name: userName || 'Sin nombre',
          totalLeads: 0,
          convertedLeads: 0,
          avgScore: 0,
          totalScore: 0
        });
      }
      
      const stats = userStats.get(userId);
      stats.totalLeads++;
      stats.totalScore += lead.lead_score;
      if (lead.status === 'CONVERTED' || lead.status === 'QUALIFIED') {
        stats.convertedLeads++;
      }
    });
    
    return Array.from(userStats.values()).map(stats => ({
      ...stats,
      avgScore: Math.round(stats.totalScore / stats.totalLeads),
      conversionRate: (stats.convertedLeads / stats.totalLeads * 100).toFixed(1)
    })).sort((a, b) => b.convertedLeads - a.convertedLeads);
  }, [leads]);

  const mainStats = [
    {
      title: "Tasa de Conversión",
      value: `${analytics.conversionRate}%`,
      description: "Promedio general",
      icon: Target,
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: "Score Promedio",
      value: analytics.averageLeadScore,
      description: "Calidad de leads",
      icon: Star
    },
    {
      title: "Leads de Alta Prioridad",
      value: metrics.highPriorityLeads,
      description: "Requieren atención urgente",
      icon: AlertTriangle
    },
    {
      title: "Leads Sin Asignar",
      value: metrics.unassignedLeads,
      description: "Esperando asignación",
      icon: Users
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* High Opportunity Alerts */}
      {highOpportunityLeads.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Leads de Alta Oportunidad (Score ≥70)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highOpportunityLeads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <div>
                    <span className="font-medium">{lead.name}</span>
                    <span className="text-sm text-gray-600 ml-2">({lead.company_name})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Score: {lead.lead_score}</Badge>
                    <Badge variant="secondary">{lead.source}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Weekly Trends */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Tendencias Semanales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="leads" fill="hsl(var(--primary))" />
                <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="hsl(var(--accent))" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Fuentes por Conversión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ status, percentage }) => `${status} ${percentage.toFixed(0)}%`}
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ROI by Source */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              ROI por Fuente de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roiBySource} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="source" type="category" width={100} />
                <Tooltip formatter={(value, name) => [
                  name === 'roi' ? `${value}%` : value,
                  name === 'roi' ? 'ROI' : name
                ]} />
                <Bar dataKey="roi" fill="hsl(var(--primary))" />
                <Bar dataKey="conversionRate" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Scoring Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Distribución de Scoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoringDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--muted))" />
                <Bar dataKey="converted" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Performance del Equipo Comercial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Comercial</th>
                  <th className="text-left p-2">Leads Asignados</th>
                  <th className="text-left p-2">Convertidos</th>
                  <th className="text-left p-2">Tasa Conversión</th>
                  <th className="text-left p-2">Score Promedio</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.map((member, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{member.name}</td>
                    <td className="p-2">{member.totalLeads}</td>
                    <td className="p-2">{member.convertedLeads}</td>
                    <td className="p-2">
                      <Badge variant={parseFloat(member.conversionRate) > 20 ? "default" : "secondary"}>
                        {member.conversionRate}%
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant={member.avgScore > 60 ? "default" : "outline"}>
                        {member.avgScore}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Tendencias Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={analytics.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" />
              <Area type="monotone" dataKey="converted" stackId="1" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};