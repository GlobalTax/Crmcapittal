import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Clock,
  Users,
  TrendingUp,
  Activity,
  Timer,
  Coffee,
  CheckCircle,
  AlertCircle,
  DollarSign,
  BarChart3,
  Calendar,
  Target,
  Zap
} from 'lucide-react';
import { useTeamTimeTracking } from '@/hooks/useTimeTrackingPro';
import { TeamTimeData } from '@/types/TimeTrackingPro';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const TeamTimeTracking = () => {
  const [selectedView, setSelectedView] = useState<'overview' | 'individual' | 'capacity'>('overview');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');
  const { teamData, isLoading } = useTeamTimeTracking();

  const getStatusColor = (status: TeamTimeData['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'break': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: TeamTimeData['status']) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'break': return 'Descanso';
      case 'offline': return 'Desconectado';
      default: return 'Desconocido';
    }
  };

  const TeamMemberCard = ({ member }: { member: TeamTimeData }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback>
                  {member.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div 
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
              />
            </div>
            <div>
              <h3 className="font-medium">{member.user_name}</h3>
              <p className="text-sm text-muted-foreground">
                {getStatusText(member.status)}
                {member.last_activity && member.status !== 'active' && (
                  <span className="ml-1">
                    · {formatDistanceToNow(new Date(member.last_activity), { locale: es, addSuffix: true })}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
            {member.productivity_score.toFixed(0)}% eficiencia
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Proyecto actual */}
        {member.current_project && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Trabajando en:</span>
            </div>
            <p className="text-sm">{member.current_project.name}</p>
            {member.current_project.rate && (
              <p className="text-xs text-green-600 mt-1">
                €{member.current_project.rate}/hora
              </p>
            )}
          </div>
        )}

        {/* Métricas del día */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Hoy</span>
            </div>
            <p className="font-medium">{member.daily_hours}h</p>
            <Progress value={(member.daily_hours / 8) * 100} className="h-1 mt-1" />
          </div>
          
          <div>
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Facturable</span>
            </div>
            <p className="font-medium">{member.billable_hours}h</p>
            <p className="text-xs text-green-600">
              {member.daily_hours > 0 ? ((member.billable_hours / member.daily_hours) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>

        {/* Timer activo */}
        {member.active_timer && (
          <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Timer activo</p>
                <p className="text-xs text-muted-foreground">
                  {member.active_timer.description || 'Sin descripción'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">
                  {formatDistanceToNow(new Date(member.active_timer.start_time), { locale: es })}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeMembers = teamData?.filter(m => m.status === 'active').length || 0;
  const totalHoursToday = teamData?.reduce((acc, m) => acc + m.daily_hours, 0) || 0;
  const avgProductivity = teamData?.reduce((acc, m) => acc + m.productivity_score, 0) / (teamData?.length || 1) || 0;
  const totalBillableHours = teamData?.reduce((acc, m) => acc + m.billable_hours, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Seguimiento de Equipo</h2>
          <p className="text-muted-foreground">
            Supervisión en tiempo real del rendimiento del equipo
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas generales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              de {teamData?.length || 0} miembros totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Totales Hoy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHoursToday.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {teamData?.length ? (totalHoursToday / teamData.length).toFixed(1) : 0}h por persona
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Facturable</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBillableHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {totalHoursToday > 0 ? ((totalBillableHours / totalHoursToday) * 100).toFixed(0) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productividad Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProductivity.toFixed(0)}%</div>
            <Progress value={avgProductivity} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="capacity">Capacidad</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Estado en tiempo real */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estado del Equipo en Tiempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teamData?.slice(0, 6).map((member) => (
                  <div key={member.user_id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {member.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div 
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${getStatusColor(member.status)}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{member.user_name}</p>
                      <p className="text-xs text-muted-foreground">{member.daily_hours}h hoy</p>
                    </div>
                    {member.active_timer && (
                      <Badge variant="secondary" className="text-xs">
                        <Timer className="h-3 w-3 mr-1" />
                        Activo
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resumen de actividad */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Estados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { status: 'active', label: 'Trabajando', count: activeMembers, color: 'bg-green-500' },
                    { 
                      status: 'break', 
                      label: 'En descanso', 
                      count: teamData?.filter(m => m.status === 'break').length || 0, 
                      color: 'bg-yellow-500' 
                    },
                    { 
                      status: 'offline', 
                      label: 'Desconectado', 
                      count: teamData?.filter(m => m.status === 'offline').length || 0, 
                      color: 'bg-gray-400' 
                    }
                  ].map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.count}</span>
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ 
                              width: `${teamData?.length ? (item.count / teamData.length) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamData
                    ?.sort((a, b) => b.daily_hours - a.daily_hours)
                    .slice(0, 5)
                    .map((member, index) => (
                      <div key={member.user_id} className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                          {index + 1}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {member.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{member.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.daily_hours}h · {member.productivity_score.toFixed(0)}% eficiencia
                          </p>
                        </div>
                        {index === 0 && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Target className="h-3 w-3 mr-1" />
                            Top
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {teamData?.map((member) => (
              <TeamMemberCard key={member.user_id} member={member} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Planificación de Capacidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamData?.map((member) => (
                    <div key={member.user_id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{member.user_name}</span>
                        <span className="text-sm text-muted-foreground">
                          {member.daily_hours}h / 8h
                        </span>
                      </div>
                      <Progress 
                        value={(member.daily_hours / 8) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Carga actual: {((member.daily_hours / 8) * 100).toFixed(0)}%</span>
                        <span>
                          Disponible: {Math.max(0, 8 - member.daily_hours).toFixed(1)}h
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas y Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamData?.filter(m => m.daily_hours > 6).length === 0 ? (
                    <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-green-900">
                          Equipo bien balanceado
                        </p>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        No se detectan sobrecargas de trabajo
                      </p>
                    </div>
                  ) : (
                    teamData?.filter(m => m.daily_hours > 6).map((member) => (
                      <div key={member.user_id} className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <p className="text-sm font-medium text-orange-900">
                            {member.user_name} - Carga alta
                          </p>
                        </div>
                        <p className="text-xs text-orange-700 mt-1">
                          {member.daily_hours}h trabajadas hoy. Considera redistribuir tareas.
                        </p>
                      </div>
                    ))
                  )}

                  {teamData?.filter(m => m.productivity_score < 0.7).map((member) => (
                    <div key={member.user_id} className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm font-medium text-yellow-900">
                          {member.user_name} - Productividad baja
                        </p>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        {(member.productivity_score * 100).toFixed(0)}% de eficiencia. Podría necesitar apoyo.
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};