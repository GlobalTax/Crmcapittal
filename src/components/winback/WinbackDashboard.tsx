import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Mail, Phone, MessageCircle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useWinbackAttempts } from '@/hooks/useWinbackAttempts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const WinbackDashboard = () => {
  const { attempts, isLoading, markAttemptExecuted, markWinbackResponse } = useWinbackAttempts();
  const [lostLeads, setLostLeads] = useState([]);
  const [winbackStats, setWinbackStats] = useState({
    total_attempts: 0,
    pending_today: 0,
    successful_reopens: 0,
    response_rate: 0
  });

  useEffect(() => {
    fetchLostLeads();
    fetchWinbackStats();
  }, []);

  const fetchLostLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*, assigned_to:assigned_to_id(first_name, last_name)')
        .eq('status', 'LOST' as any)
        .neq('winback_stage', 'irrecuperable')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setLostLeads(data || []);
    } catch (err) {
      toast.error('Error cargando leads perdidos');
    }
  };

  const fetchWinbackStats = async () => {
    try {
      // Get basic stats
      const { data: attemptsData } = await supabase
        .from('winback_attempts')
        .select('status, scheduled_date');

      const today = new Date().toISOString().split('T')[0];
      const pendingToday = attemptsData?.filter(a => 
        a.status === 'pending' && a.scheduled_date <= today
      ).length || 0;

      const { data: reopenedLeads } = await supabase
        .from('leads')
        .select('id')
        .eq('winback_stage', 'reopened');

      setWinbackStats({
        total_attempts: attemptsData?.length || 0,
        pending_today: pendingToday,
        successful_reopens: reopenedLeads?.length || 0,
        response_rate: attemptsData?.length ? 
          (attemptsData.filter(a => a.status === 'responded').length / attemptsData.length * 100) : 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const getChannelIcon = (canal: string) => {
    switch (canal) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'linkedin': return <MessageCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getWinbackStageBadge = (stage: string) => {
    const badges = {
      'cold': { variant: 'secondary', label: 'Sin Contactar' },
      'campaign_sent': { variant: 'default', label: 'En Proceso' },
      'engaging': { variant: 'outline', label: 'Respondiendo' },
      'reopened': { variant: 'default', label: 'Reabierto' },
      'irrecuperable': { variant: 'destructive', label: 'Irrecuperable' }
    };
    
    const badge = badges[stage] || badges.cold;
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const pendingAttempts = attempts.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.status === 'pending' && a.scheduled_date <= today;
  });

  const upcomingAttempts = attempts.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.status === 'pending' && a.scheduled_date > today;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Winback</h2>
        <p className="text-muted-foreground">
          Gestiona y monitorea las campañas de reactivación de leads
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Intentos</p>
                <p className="text-2xl font-bold">{winbackStats.total_attempts}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes Hoy</p>
                <p className="text-2xl font-bold text-orange-600">{winbackStats.pending_today}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reabiertos</p>
                <p className="text-2xl font-bold text-green-600">{winbackStats.successful_reopens}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa Respuesta</p>
                <p className="text-2xl font-bold">{winbackStats.response_rate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pendientes Hoy ({pendingAttempts.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Próximos ({upcomingAttempts.length})
          </TabsTrigger>
          <TabsTrigger value="lost-leads">
            Leads Perdidos ({lostLeads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingAttempts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay intentos pendientes para hoy</h3>
                <p className="text-muted-foreground">Todas las tareas winback están al día</p>
              </CardContent>
            </Card>
          ) : (
            pendingAttempts.map((attempt) => (
              <Card key={attempt.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getChannelIcon(attempt.canal)}
                      <div>
                        <p className="font-medium">Lead ID: {attempt.lead_id.slice(0, 8)}...</p>
                        <p className="text-sm text-muted-foreground">
                          Paso {attempt.step_index + 1} - {attempt.canal}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => markAttemptExecuted(attempt.id, 'sent')}
                      >
                        Marcar Enviado
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAttemptExecuted(attempt.id, 'skipped', 'Saltado manualmente')}
                      >
                        Saltar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAttempts.map((attempt) => (
            <Card key={attempt.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getChannelIcon(attempt.canal)}
                    <div>
                      <p className="font-medium">Lead ID: {attempt.lead_id.slice(0, 8)}...</p>
                      <p className="text-sm text-muted-foreground">
                        Paso {attempt.step_index + 1} - {attempt.canal} - {attempt.scheduled_date}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{attempt.scheduled_date}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="lost-leads" className="space-y-4">
          {lostLeads.map((lead: any) => (
            <Card key={lead.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {lead.company} • Perdido: {lead.lost_reason}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {getWinbackStageBadge(lead.winback_stage)}
                      {lead.last_winback_attempt && (
                        <span className="text-xs text-muted-foreground">
                          Último intento: {lead.last_winback_attempt}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {lead.winback_stage === 'engaging' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => markWinbackResponse(lead.id, 'positive')}
                        >
                          Reabierto
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markWinbackResponse(lead.id, 'negative')}
                        >
                          No Interesado
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};