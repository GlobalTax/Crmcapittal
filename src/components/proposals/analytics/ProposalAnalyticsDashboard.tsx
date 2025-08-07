import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Clock, 
  Users, 
  Download, 
  Share2, 
  Mail, 
  MousePointer, 
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';
import { useProposalAnalytics } from '@/hooks/useProposalAnalytics';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProposalAnalyticsDashboardProps {
  proposalId: string;
  proposalTitle?: string;
}

export const ProposalAnalyticsDashboard: React.FC<ProposalAnalyticsDashboardProps> = ({
  proposalId,
  proposalTitle
}) => {
  const { stats, aggregatedStats, emailTracking, analytics, loading } = useProposalAnalytics(proposalId);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const displayStats = stats || aggregatedStats;

  const getStatValue = (key: string, fallback: any = 0) => {
    if (stats) {
      return (stats as any)[key] ?? fallback;
    }
    if (aggregatedStats) {
      const mappedKey = {
        total_views: 'totalViews',
        unique_views: 'uniqueViews',
        avg_duration_seconds: 'avgDuration',
        total_duration_seconds: 'totalDuration',
        email_opens: 'emailOpens',
        email_clicks: 'emailClicks',
        downloads: 'downloads',
        shares: 'shares'
      }[key] || key;
      return (aggregatedStats as any)[mappedKey] ?? fallback;
    }
    return fallback;
  };

  if (!displayStats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No hay datos analíticos disponibles para esta propuesta.</p>
            <p className="text-sm mt-1">Los datos aparecerán cuando la propuesta sea vista por primera vez.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEngagementLevel = (score: number) => {
    if (score >= 0.8) return { label: 'Muy Alto', color: 'bg-green-500', variant: 'default' as const };
    if (score >= 0.6) return { label: 'Alto', color: 'bg-blue-500', variant: 'secondary' as const };
    if (score >= 0.4) return { label: 'Medio', color: 'bg-yellow-500', variant: 'outline' as const };
    return { label: 'Bajo', color: 'bg-red-500', variant: 'destructive' as const };
  };

  const engagement = getEngagementLevel(getStatValue('engagement_score', 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analíticas de Propuesta</h2>
          {proposalTitle && (
            <p className="text-muted-foreground">{proposalTitle}</p>
          )}
        </div>
        <Badge variant={engagement.variant} className="text-sm">
          <Activity className="h-3 w-3 mr-1" />
          Engagement {engagement.label}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizaciones</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatValue('total_views')}</div>
            <p className="text-xs text-muted-foreground">
              {getStatValue('unique_views')} únicas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(getStatValue('avg_duration_seconds') / 60)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {Math.round(getStatValue('total_duration_seconds') / 60)}m
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Abiertos</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatValue('email_opens')}</div>
            <p className="text-xs text-muted-foreground">
              {getStatValue('email_clicks')} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acciones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getStatValue('downloads') + getStatValue('shares')}
            </div>
            <div className="flex space-x-2 text-xs text-muted-foreground">
              <span>{getStatValue('downloads')} descargas</span>
              <span>{getStatValue('shares')} compartidas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Puntuación de Engagement</span>
          </CardTitle>
          <CardDescription>
            Basado en tiempo de visualización, interacciones y acciones realizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Engagement Score</p>
              <p className="text-2xl font-bold">
                {Math.round(getStatValue('engagement_score') * 100)}%
              </p>
            </div>
            <Badge variant={engagement.variant}>{engagement.label}</Badge>
          </div>
          <Progress 
            value={getStatValue('engagement_score') * 100} 
            className="w-full"
          />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Tasa de Rebote</p>
              <p className="font-semibold">{Math.round(getStatValue('bounce_rate') * 100)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tasa de Conversión</p>
              <p className="font-semibold">{Math.round(getStatValue('conversion_rate') * 100)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Actividad Reciente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.slice(0, 5).map((event, index) => (
              <div key={event.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {event.event_type === 'view' && <Eye className="h-4 w-4 text-blue-500" />}
                    {event.event_type === 'download' && <Download className="h-4 w-4 text-green-500" />}
                    {event.event_type === 'share' && <Share2 className="h-4 w-4 text-purple-500" />}
                    {event.event_type === 'email_open' && <Mail className="h-4 w-4 text-orange-500" />}
                    {event.event_type === 'email_click' && <MousePointer className="h-4 w-4 text-red-500" />}
                    <span className="font-medium capitalize">
                      {event.event_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(event.created_at), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                    {event.duration_seconds && (
                      <span className="ml-2">
                        • {Math.round(event.duration_seconds / 60)}m de lectura
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            
            {analytics.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>No hay actividad reciente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Tracking */}
      {emailTracking.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Seguimiento de Emails</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emailTracking.map((email) => (
                <div key={email.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{email.recipient_email}</p>
                    <p className="text-sm text-muted-foreground">
                      Enviado {formatDistanceToNow(new Date(email.sent_at), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      email.status === 'clicked' ? 'default' :
                      email.status === 'opened' ? 'secondary' :
                      email.status === 'bounced' ? 'destructive' : 'outline'
                    }>
                      {email.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {email.open_count} aberturas • {email.click_count} clicks
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Activity */}
      {(stats?.last_viewed_at || aggregatedStats) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Última visualización: {stats?.last_viewed_at ? 
                  formatDistanceToNow(new Date(stats.last_viewed_at), { 
                    addSuffix: true, 
                    locale: es 
                  }) : 'Datos no disponibles'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};