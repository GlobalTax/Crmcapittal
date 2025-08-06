import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lead } from '@/types/Lead';
import { 
  Building2, 
  Calendar, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  Globe,
  User,
  Tag,
  Star,
  Edit,
  Send
} from 'lucide-react';

interface LeadOverviewTabProps {
  lead: Lead;
}

export const LeadOverviewTab = ({ lead }: LeadOverviewTabProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 76) return 'hsl(158, 100%, 38%)'; // Verde
    if (score >= 51) return 'hsl(42, 100%, 50%)';  // Amarillo
    if (score >= 26) return 'hsl(30, 100%, 50%)';  // Naranja
    return 'hsl(4, 86%, 63%)'; // Rojo
  };

  const getScoreLabel = (score: number) => {
    if (score >= 76) return 'Alto';
    if (score >= 51) return 'Medio';
    if (score >= 26) return 'Bajo';
    return 'Muy Bajo';
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No definido';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No definido';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const scoreValue = lead.lead_score || 0;
  const probabilityValue = lead.prob_conversion ? Math.round(lead.prob_conversion * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Score y Probability Chips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5" />
            Puntuación y Probabilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">Score del Lead</label>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: getScoreColor(scoreValue),
                    color: getScoreColor(scoreValue),
                    backgroundColor: `${getScoreColor(scoreValue)}10`
                  }}
                >
                  {scoreValue} - {getScoreLabel(scoreValue)}
                </Badge>
              </div>
              <div className="text-center">
                <div 
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full text-white font-bold text-xl"
                  style={{ backgroundColor: getScoreColor(scoreValue) }}
                >
                  {scoreValue}
                </div>
              </div>
            </div>

            {/* Probability */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">Probabilidad de Conversión</label>
                <span className="text-sm font-medium">{probabilityValue}%</span>
              </div>
              <Progress value={probabilityValue} className="h-3 mb-2" />
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">{probabilityValue}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del Lead */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Lead
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
              <p className="text-sm mt-1 font-medium">{lead.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {lead.email}
              </p>
            </div>
            {lead.phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                <p className="text-sm mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {lead.phone}
                </p>
              </div>
            )}
            {lead.position && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cargo</label>
                <p className="text-sm mt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {lead.position}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información de la Empresa */}
      {lead.company_name && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nombre de la Empresa</label>
                <p className="text-sm mt-1 font-medium">{lead.company_name}</p>
              </div>
              {lead.service_type && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Servicio</label>
                  <p className="text-sm mt-1">{lead.service_type}</p>
                </div>
              )}
              {lead.industry && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Industria</label>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {lead.industry}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalles del Lead */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Detalles del Lead
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fuente</label>
              <Badge variant="outline" className="mt-1">
                {lead.source || 'No definida'}
              </Badge>
            </div>
            {lead.lead_origin && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Origen</label>
                <Badge variant="outline" className="mt-1">
                  {lead.lead_origin}
                </Badge>
              </div>
            )}
            {lead.priority && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Prioridad</label>
                <Badge 
                  variant="outline" 
                  className="mt-1"
                  style={{
                    borderColor: lead.priority === 'HIGH' ? 'hsl(4, 86%, 63%)' :
                                lead.priority === 'MEDIUM' ? 'hsl(42, 100%, 50%)' :
                                'hsl(213, 94%, 68%)',
                    color: lead.priority === 'HIGH' ? 'hsl(4, 86%, 63%)' :
                           lead.priority === 'MEDIUM' ? 'hsl(42, 100%, 50%)' :
                           'hsl(213, 94%, 68%)'
                  }}
                >
                  {lead.priority}
                </Badge>
              </div>
            )}
            {lead.valor_estimado && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Valor Estimado</label>
                <p className="text-sm mt-1 font-medium text-success">
                  {formatCurrency(lead.valor_estimado)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métricas del Lead */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">{scoreValue}</p>
              <p className="text-sm text-muted-foreground">Score</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">{probabilityValue}%</p>
              <p className="text-sm text-muted-foreground">Probabilidad</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">
                {Math.ceil((new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24))}
              </p>
              <p className="text-sm text-muted-foreground">Días Activo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Enviar Email
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Llamar
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Programar Reunión
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editar Lead
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Convertir a Oportunidad
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};