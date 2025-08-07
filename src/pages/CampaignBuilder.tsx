import React, { useState } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useSubscribers } from '@/hooks/useSubscribers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Users, Send, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SecureHtmlRenderer } from '@/components/security/SecureHtmlRenderer';

export default function CampaignBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createCampaign } = useCampaigns();
  const { subscribers } = useSubscribers();
  
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    audience: 'all' as 'all' | 'investors' | 'sellers' | 'custom',
    selectedSubscribers: [] as string[]
  });
  
  const [isPreview, setIsPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubjectChange = (value: string) => {
    setFormData(prev => ({ ...prev, subject: value }));
  };

  const handleContentChange = (value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleAudienceChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      audience: value as 'all' | 'investors' | 'sellers' | 'custom',
      selectedSubscribers: value !== 'custom' ? [] : prev.selectedSubscribers
    }));
  };

  const handleSubscriberToggle = (subscriberId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubscribers: prev.selectedSubscribers.includes(subscriberId)
        ? prev.selectedSubscribers.filter(id => id !== subscriberId)
        : [...prev.selectedSubscribers, subscriberId]
    }));
  };

  const getSelectedSubscribers = () => {
    if (formData.audience === 'all') {
      return subscribers;
    } else if (formData.audience === 'investors') {
      return subscribers.filter(s => s.segment === 'investor');
    } else if (formData.audience === 'sellers') {
      return subscribers.filter(s => s.segment === 'seller');
    } else {
      return subscribers.filter(s => formData.selectedSubscribers.includes(s.id));
    }
  };

  const handleSendCampaign = async () => {
    if (!formData.subject || !formData.content) {
      toast({
        title: "Error",
        description: "Por favor completa el asunto y contenido del email",
        variant: "destructive",
      });
      return;
    }

    const selectedSubs = getSelectedSubscribers();
    if (selectedSubs.length === 0) {
      toast({
        title: "Error",
        description: "No hay destinatarios seleccionados",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      // Create campaign record
      const campaign = await createCampaign({
        subject: formData.subject,
        html_body: formData.content,
        audience: formData.audience,
        opportunity_ids: [] // Add opportunities if needed
      });

      // Send emails via edge function
      const { error } = await supabase.functions.invoke('send_campaign', {
        body: {
          campaignId: campaign.id,
          subject: formData.subject,
          content: formData.content,
          subscribers: selectedSubs.map(s => ({ email: s.email, name: s.email }))
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "¡Éxito!",
        description: `Campaña enviada a ${selectedSubs.length} destinatarios`,
      });

      navigate('/campaigns');
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: "Error",
        description: "Error al enviar la campaña. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const selectedSubs = getSelectedSubscribers();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/campaigns')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Campañas de Email</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contenido del Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    placeholder="Asunto del email..."
                  />
                </div>

                <div>
                  <Label htmlFor="content">Contenido</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Escribe el contenido del email..."
                    rows={12}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsPreview(!isPreview)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {isPreview ? 'Editar' : 'Vista Previa'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            {isPreview && (
              <Card>
                <CardHeader>
                  <CardTitle>Vista Previa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="border-b pb-2 mb-4">
                      <strong>Asunto:</strong> {formData.subject || 'Sin asunto'}
                    </div>
                    <SecureHtmlRenderer 
                      content={formData.content.replace(/\n/g, '<br>')}
                      className="prose max-w-none"
                      allowBasicFormatting={false}
                      maxLength={10000}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Audiencia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Seleccionar Audiencia</Label>
                  <Select value={formData.audience} onValueChange={handleAudienceChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los suscriptores</SelectItem>
                      <SelectItem value="investors">Solo inversores</SelectItem>
                      <SelectItem value="sellers">Solo vendedores</SelectItem>
                      <SelectItem value="custom">Selección personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.audience === 'custom' && (
                  <div>
                    <Label>Seleccionar Destinatarios</Label>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {subscribers.map((subscriber) => (
                        <div key={subscriber.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={subscriber.id}
                            checked={formData.selectedSubscribers.includes(subscriber.id)}
                            onCheckedChange={() => handleSubscriberToggle(subscriber.id)}
                          />
                          <Label
                            htmlFor={subscriber.id}
                            className="flex-1 text-sm cursor-pointer"
                          >
                            {subscriber.email}
                            <Badge variant="outline" className="ml-2">
                              {subscriber.segment}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-sm font-medium">Destinatarios seleccionados:</p>
                  <Badge variant="secondary" className="mt-1">
                    {selectedSubs.length} destinatarios
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enviar Campaña</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSendCampaign}
                  disabled={isSending || !formData.subject || !formData.content || selectedSubs.length === 0}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? 'Enviando...' : 'Enviar Campaña'}
                </Button>
                {selectedSubs.length === 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    No hay destinatarios seleccionados
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}