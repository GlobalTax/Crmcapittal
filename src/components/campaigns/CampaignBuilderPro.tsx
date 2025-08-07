import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSubscriberSegments } from '@/hooks/useSubscriberSegments';
import { useCampaigns } from '@/hooks/useCampaigns';
import { 
  Send, 
  Users, 
  Target, 
  Clock, 
  BarChart3, 
  Sparkles,
  Eye,
  MousePointer,
  TrendingUp,
  Calendar,
  TestTube
} from 'lucide-react';

interface CampaignBuilderProProps {
  onClose: () => void;
}

export function CampaignBuilderPro({ onClose }: CampaignBuilderProProps) {
  const { segments } = useSubscriberSegments();
  const { sendCampaign, isSending } = useCampaigns();
  
  const [campaignData, setCampaignData] = useState({
    subject: '',
    content: '',
    audience: '',
    targeting_config: {
      segments: [] as string[],
      engagement_level: '',
      behavior_score_min: 0,
      exclude_recent_campaigns: true,
      send_time_optimization: false
    },
    ab_test_config: {
      enabled: false,
      test_type: 'subject',
      variant_b_subject: '',
      split_percentage: 50
    },
    send_schedule: {
      send_now: true,
      scheduled_date: '',
      timezone: 'Europe/Madrid'
    }
  });

  const handleTargetingChange = (key: string, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      targeting_config: {
        ...prev.targeting_config,
        [key]: value
      }
    }));
  };

  const handleABTestChange = (key: string, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      ab_test_config: {
        ...prev.ab_test_config,
        [key]: value
      }
    }));
  };

  const handleScheduleChange = (key: string, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      send_schedule: {
        ...prev.send_schedule,
        [key]: value
      }
    }));
  };

  const handleSendCampaign = async () => {
    try {
      await sendCampaign({
        opportunity_ids: [], // This would be populated from selected RODs
        audience: campaignData.audience || 'general',
        subject: campaignData.subject,
        html_body: campaignData.content
      });
      onClose();
    } catch (error) {
      console.error('Error sending campaign:', error);
    }
  };

  const estimatedReach = segments
    ?.filter(s => campaignData.targeting_config.segments.includes(s.id))
    .reduce((total, segment) => total + segment.subscriber_count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Campaign Builder Pro
          </h2>
          <p className="text-muted-foreground">
            Crea campañas profesionales con targeting avanzado y A/B testing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSendCampaign} disabled={isSending}>
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Enviando...' : 'Enviar Campaña'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
          <TabsTrigger value="testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="schedule">Programación</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Contenido de la Campaña
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Asunto del Email</Label>
                <Input
                  id="subject"
                  value={campaignData.subject}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Ej: Nuevas oportunidades M&A - Sector Tech"
                />
                <p className="text-sm text-muted-foreground">
                  Tip: Usa palabras específicas como "exclusivo", "nuevo", o el sector para mejorar apertura
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido HTML</Label>
                <Textarea
                  id="content"
                  value={campaignData.content}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Contenido HTML de tu campaña..."
                  rows={12}
                />
              </div>

              {/* Template Suggestions */}
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Templates Sugeridos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Button variant="outline" size="sm">
                      Newsletter Semanal
                    </Button>
                    <Button variant="outline" size="sm">
                      Oportunidad Exclusiva
                    </Button>
                    <Button variant="outline" size="sm">
                      Market Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Targeting Tab */}
        <TabsContent value="targeting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Targeting Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Segment Selection */}
              <div className="space-y-3">
                <Label>Segmentos de Audiencia</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {segments?.map((segment) => (
                    <div 
                      key={segment.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        campaignData.targeting_config.segments.includes(segment.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground'
                      }`}
                      onClick={() => {
                        const segments = campaignData.targeting_config.segments;
                        const newSegments = segments.includes(segment.id)
                          ? segments.filter(id => id !== segment.id)
                          : [...segments, segment.id];
                        handleTargetingChange('segments', newSegments);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{segment.name}</h4>
                          <p className="text-sm text-muted-foreground">{segment.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={segment.segment_type === 'behavioral' ? 'default' : 'secondary'}>
                            {segment.subscriber_count}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{segment.segment_type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="engagement">Nivel de Engagement</Label>
                  <Select 
                    value={campaignData.targeting_config.engagement_level}
                    onValueChange={(value) => handleTargetingChange('engagement_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los niveles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los niveles</SelectItem>
                      <SelectItem value="high">Alto engagement</SelectItem>
                      <SelectItem value="medium">Engagement medio</SelectItem>
                      <SelectItem value="low">Bajo engagement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="behavior_score">Score Mínimo de Comportamiento</Label>
                  <Input
                    id="behavior_score"
                    type="number"
                    min="0"
                    max="100"
                    value={campaignData.targeting_config.behavior_score_min}
                    onChange={(e) => handleTargetingChange('behavior_score_min', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Smart Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Excluir Campañas Recientes</Label>
                    <p className="text-sm text-muted-foreground">
                      No enviar a usuarios que recibieron campañas en los últimos 3 días
                    </p>
                  </div>
                  <Switch
                    checked={campaignData.targeting_config.exclude_recent_campaigns}
                    onCheckedChange={(checked) => handleTargetingChange('exclude_recent_campaigns', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Optimización de Horario</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar en el horario óptimo de cada suscriptor
                    </p>
                  </div>
                  <Switch
                    checked={campaignData.targeting_config.send_time_optimization}
                    onCheckedChange={(checked) => handleTargetingChange('send_time_optimization', checked)}
                  />
                </div>
              </div>

              {/* Estimated Reach */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium">Alcance Estimado</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{estimatedReach}</div>
                      <p className="text-sm text-muted-foreground">suscriptores</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                A/B Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Habilitar A/B Testing</Label>
                  <p className="text-sm text-muted-foreground">
                    Prueba diferentes versiones para optimizar rendimiento
                  </p>
                </div>
                <Switch
                  checked={campaignData.ab_test_config.enabled}
                  onCheckedChange={(checked) => handleABTestChange('enabled', checked)}
                />
              </div>

              {campaignData.ab_test_config.enabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Test</Label>
                    <Select 
                      value={campaignData.ab_test_config.test_type}
                      onValueChange={(value) => handleABTestChange('test_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subject">Línea de Asunto</SelectItem>
                        <SelectItem value="content">Contenido</SelectItem>
                        <SelectItem value="send_time">Horario de Envío</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {campaignData.ab_test_config.test_type === 'subject' && (
                    <div className="space-y-2">
                      <Label>Asunto Variante B</Label>
                      <Input
                        value={campaignData.ab_test_config.variant_b_subject}
                        onChange={(e) => handleABTestChange('variant_b_subject', e.target.value)}
                        placeholder="Asunto alternativo para la variante B"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Porcentaje de Split (Variante A)</Label>
                    <Input
                      type="number"
                      min="10"
                      max="90"
                      value={campaignData.ab_test_config.split_percentage}
                      onChange={(e) => handleABTestChange('split_percentage', parseInt(e.target.value))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Variante B recibirá el {100 - campaignData.ab_test_config.split_percentage}% restante
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Programación de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="send_now"
                    name="schedule_type"
                    checked={campaignData.send_schedule.send_now}
                    onChange={() => handleScheduleChange('send_now', true)}
                  />
                  <Label htmlFor="send_now">Enviar Ahora</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="send_later"
                    name="schedule_type"
                    checked={!campaignData.send_schedule.send_now}
                    onChange={() => handleScheduleChange('send_now', false)}
                  />
                  <Label htmlFor="send_later">Programar Envío</Label>
                </div>

                {!campaignData.send_schedule.send_now && (
                  <div className="ml-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Fecha y Hora</Label>
                      <Input
                        type="datetime-local"
                        value={campaignData.send_schedule.scheduled_date}
                        onChange={(e) => handleScheduleChange('scheduled_date', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Zona Horaria</Label>
                      <Select 
                        value={campaignData.send_schedule.timezone}
                        onValueChange={(value) => handleScheduleChange('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Madrid">España (CET)</SelectItem>
                          <SelectItem value="Europe/London">Reino Unido (GMT)</SelectItem>
                          <SelectItem value="America/New_York">Nueva York (EST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Send Time Recommendations */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Recomendaciones de Horario
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>• <strong>Martes y Miércoles:</strong> Mejor tasa de apertura (34% promedio)</p>
                    <p>• <strong>10:00 - 11:00:</strong> Horario óptimo para B2B</p>
                    <p>• <strong>Evitar viernes:</strong> 15% menos engagement</p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}