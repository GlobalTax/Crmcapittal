
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Send, Mail, Users, Shield } from 'lucide-react';
import { CampaignSecurityGuard } from '@/components/campaigns/CampaignSecurityGuard';
import { SecureCampaignForm } from '@/components/campaigns/SecureCampaignForm';
import { useSecureCampaigns } from '@/hooks/useSecureCampaigns';

const CampaignBuilder = () => {
  const { campaigns } = useSecureCampaigns();
  const [showForm, setShowForm] = React.useState(false);

  const campaignStats = {
    active: campaigns.filter(c => c.sent_at).length,
    totalEmails: campaigns.reduce((sum, c) => sum + (c.opportunity_ids?.length || 0), 0),
    recipients: new Set(campaigns.map(c => c.audience)).size
  };

  return (
    <CampaignSecurityGuard requiredAction="manage_campaigns">
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-8 w-8 text-green-600" />
                Constructor de Campañas Seguro
              </h1>
              <p className="text-muted-foreground mt-1">
                Crea y gestiona campañas de email con protección avanzada
              </p>
            </div>
            <Button 
              className="gap-2" 
              onClick={() => setShowForm(!showForm)}
            >
              <Plus className="h-4 w-4" />
              {showForm ? 'Ver Campañas' : 'Nueva Campaña'}
            </Button>
          </div>

          {showForm ? (
            <SecureCampaignForm onSuccess={() => setShowForm(false)} />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Campañas Enviadas
                    </CardTitle>
                    <Send className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{campaignStats.active}</div>
                    <p className="text-xs text-muted-foreground">
                      Campañas completadas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Emails Enviados
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{campaignStats.totalEmails}</div>
                    <p className="text-xs text-muted-foreground">
                      Total de mensajes
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Audiencias
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{campaignStats.recipients}</div>
                    <p className="text-xs text-muted-foreground">
                      Segmentos activos
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Campaigns List */}
              {campaigns.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Sistema Listo</h3>
                    <p className="text-muted-foreground mb-6">
                      El sistema de campañas seguras está configurado y listo para usar
                    </p>
                    <Button 
                      className="gap-2"
                      onClick={() => setShowForm(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Crear Primera Campaña
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Campañas Recientes</h2>
                  <div className="grid gap-4">
                    {campaigns.slice(0, 5).map((campaign) => (
                      <Card key={campaign.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{campaign.subject}</h3>
                              <p className="text-sm text-muted-foreground">
                                Audiencia: {campaign.audience} • 
                                Enviado: {new Date(campaign.sent_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">Segura</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </CampaignSecurityGuard>
  );
};

export default CampaignBuilder;
